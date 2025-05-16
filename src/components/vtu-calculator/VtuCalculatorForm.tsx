
"use client";

import type * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalculatorFormSchema, GRADE_OPTIONS } from "@/types/vtuCalculator";
import type { CalculatorFormData, Subject, Semester, SemesterResult, OverallResult, Grade } from "@/types/vtuCalculator";
import { calculateSGPA, calculateCGPA, gradePoints } from "@/lib/vtuUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle, Trash2, Info, RotateCcw, CalculatorIcon, TrendingUp, PieChartIcon } from "lucide-react";
import { GradePointTable } from "./GradePointTable";
import { Separator } from "@/components/ui/separator";
import { CgpaTrendChart } from "./CgpaTrendChart";
import { GradeDistributionChart } from "./GradeDistributionChart";

export default function VtuCalculatorForm() {
  const [calculatedSGPAs, setCalculatedSGPAs] = useState<SemesterResult[]>([]);
  const [calculatedCGPA, setCalculatedCGPA] = useState<OverallResult | null>(null);
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>("semester-0");
  const [allSemestersDataForChart, setAllSemestersDataForChart] = useState<Semester[]>([]);


  const form = useForm<CalculatorFormData>({
    resolver: zodResolver(CalculatorFormSchema),
    defaultValues: {
      numberOfSemesters: 1,
      semesters: [{ subjects: [{ credits: 4, grade: "S" }] }],
    },
    mode: "onChange", // Validate on change for better feedback
  });

  const { fields: semesterFields, append: appendSemester, remove: removeSemester, update: updateSemester } = useFieldArray({
    control: form.control,
    name: "semesters",
    keyName: "semesterId" // Use a different key name to avoid conflict with subject id
  });

  const numberOfSemestersWatched = form.watch("numberOfSemesters");
  const semestersWatched = form.watch("semesters");

  useEffect(() => {
    const currentLength = semesterFields.length;
    const targetLength = numberOfSemestersWatched || 0;

    if (currentLength < targetLength) {
      for (let i = currentLength; i < targetLength; i++) {
        appendSemester({ subjects: [{ credits: 4, grade: "S" }] });
      }
      // Open the last added semester
      if (targetLength > 0) {
        setActiveAccordionItem(`semester-${targetLength - 1}`);
      }
    } else if (currentLength > targetLength) {
      for (let i = currentLength; i > targetLength; i--) {
        removeSemester(i - 1);
      }
       // If current open semester is removed, open the new last one or none
      if (activeAccordionItem && parseInt(activeAccordionItem.split('-')[1]) >= targetLength) {
        setActiveAccordionItem(targetLength > 0 ? `semester-${targetLength - 1}` : undefined);
      }
    }
  }, [numberOfSemestersWatched, appendSemester, removeSemester, semesterFields.length, activeAccordionItem]);


  const handleCalculateResults = () => {
    const formData = form.getValues();
    if (!formData.semesters || formData.semesters.length === 0) {
      setCalculatedSGPAs([]);
      setCalculatedCGPA(null);
      setAllSemestersDataForChart([]);
      return;
    }
    
    const { cgpa, totalOverallCredits, semesterSGPAs: sgpas } = calculateCGPA(formData.semesters);
    setCalculatedSGPAs(sgpas.map(s => ({ ...s, sgpa: parseFloat(s.sgpa.toFixed(2)) })));
    setCalculatedCGPA({ cgpa: parseFloat(cgpa.toFixed(2)), totalOverallCredits });
    setAllSemestersDataForChart(formData.semesters);
  };

  const semesterSGPAsMemo = useMemo(() => {
    return semestersWatched.map((semester, index) => {
      const { sgpa, totalCredits } = calculateSGPA(semester.subjects);
      return { semesterIndex: index, sgpa, totalCredits };
    });
  }, [semestersWatched]);

  const overallCGPAMemo = useMemo(() => {
    if (semesterSGPAsMemo.length === 0) return { cgpa: 0, totalOverallCredits: 0};
    
    let totalWeightedSGPA = 0;
    let totalCreditsOverall = 0;

    semesterSGPAsMemo.forEach(sem => {
      totalWeightedSGPA += sem.sgpa * sem.totalCredits;
      totalCreditsOverall += sem.totalCredits;
    });
    
    if (totalCreditsOverall === 0) return { cgpa: 0, totalOverallCredits: 0};
    
    return { 
      cgpa: parseFloat((totalWeightedSGPA / totalCreditsOverall).toFixed(2)), 
      totalOverallCredits: totalCreditsOverall
    };
  }, [semesterSGPAsMemo]);


  const resetForm = () => {
    form.reset({
      numberOfSemesters: 1,
      semesters: [{ subjects: [{ credits: 4, grade: "S" }] }],
    });
    setCalculatedSGPAs([]);
    setCalculatedCGPA(null);
    setAllSemestersDataForChart([]);
    setActiveAccordionItem("semester-0");
  };
  
  // Update accordion when number of semesters changes via input
  const onNumSemestersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >=0 && value <= 10 ) { // Max 10 semesters
        form.setValue('numberOfSemesters', value, { shouldValidate: true });
    } else if (e.target.value === "") {
        form.setValue('numberOfSemesters', 0); // Allow empty to be 0
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleCalculateResults)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="numberOfSemesters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="numberOfSemesters">Number of Semesters</FormLabel>
                  <FormControl>
                    <Input
                      id="numberOfSemesters"
                      type="number"
                      min="0" // Allow 0 to clear, effectively
                      max="10"
                      placeholder="e.g., 8"
                      {...field}
                      onChange={onNumSemestersChange} // Use custom handler
                      value={field.value === 0 && numberOfSemestersWatched === 0 ? "" : field.value} // Show empty if 0
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {numberOfSemestersWatched > 0 && (
          <Accordion 
            type="single" 
            collapsible 
            className="w-full" 
            value={activeAccordionItem}
            onValueChange={setActiveAccordionItem}
          >
            {semesterFields.map((semesterField, semesterIndex) => (
              <SemesterAccordionItem
                key={semesterField.semesterId}
                form={form}
                semesterIndex={semesterIndex}
                sgpaInfo={semesterSGPAsMemo[semesterIndex]}
              />
            ))}
          </Accordion>
        )}
        
        {numberOfSemestersWatched > 0 && (
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
             <Button type="button" onClick={resetForm} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset All
            </Button>
            <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <CalculatorIcon className="mr-2 h-5 w-5" /> Calculate CGPA
            </Button>
          </div>
        )}

        {(calculatedSGPAs.length > 0 || calculatedCGPA) && (
          <ResultsDisplay 
            sgpas={calculatedSGPAs} 
            cgpa={calculatedCGPA} 
            allSemestersData={allSemestersDataForChart} 
          />
        )}
        
        <GradePointTable />
      </form>
    </Form>
  );
}


interface SemesterAccordionItemProps {
  form: any; // React Hook Form's form object
  semesterIndex: number;
  sgpaInfo: { sgpa: number; totalCredits: number } | undefined;
}

function SemesterAccordionItem({ form, semesterIndex, sgpaInfo }: SemesterAccordionItemProps) {
  const { fields: subjectFields, append: appendSubject, remove: removeSubject } = useFieldArray({
    control: form.control,
    name: `semesters.${semesterIndex}.subjects`,
    keyName: "subjectId"
  });

  const semesterSGPA = sgpaInfo?.sgpa ?? 0;
  const semesterCredits = sgpaInfo?.totalCredits ?? 0;

  return (
    <AccordionItem value={`semester-${semesterIndex}`} className="bg-card rounded-lg mb-4 shadow">
      <AccordionTrigger className="px-6 py-4 text-lg hover:no-underline">
        <div className="flex justify-between w-full items-center">
          <span>Semester {semesterIndex + 1}</span>
          {semesterCredits > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              SGPA: <strong className="text-primary">{semesterSGPA.toFixed(2)}</strong> ({semesterCredits} Credits)
            </span>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-0">
        <div className="space-y-4">
          {subjectFields.map((subjectField, subjectIndex) => (
            <Card key={subjectField.subjectId} className="p-4 bg-background/50">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                <FormField
                  control={form.control}
                  name={`semesters.${semesterIndex}.subjects.${subjectIndex}.credits`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credits</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="6" placeholder="e.g., 4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`semesters.${semesterIndex}.subjects.${subjectIndex}.grade`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GRADE_OPTIONS.map(grade => (
                            <SelectItem key={grade} value={grade}>{grade} ({gradePoints[grade as Grade]})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSubject(subjectIndex)}
                  className="text-destructive hover:bg-destructive/10"
                  aria-label="Remove subject"
                  disabled={subjectFields.length <= 1}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <Button
          type="button"
          onClick={() => appendSubject({ credits: 4, grade: "S" })}
          variant="outline"
          className="mt-4"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
        </Button>
      </AccordionContent>
    </AccordionItem>
  );
}

interface ResultsDisplayProps {
  sgpas: SemesterResult[];
  cgpa: OverallResult | null;
  allSemestersData: Semester[];
}

function ResultsDisplay({ sgpas, cgpa, allSemestersData }: ResultsDisplayProps) {
  if (sgpas.length === 0 && !cgpa) return null;

  return (
    <Card className="mt-8 shadow-lg border-accent border-2">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-accent">Calculation Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-3 text-center">Semester GPAs (SGPA)</h3>
          {sgpas.length > 0 ? (
            <ul className="space-y-2">
              {sgpas.map(item => (
                <li key={item.semesterIndex} className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
                  <span className="font-medium">Semester {item.semesterIndex + 1}:</span>
                  <span className="text-primary font-bold text-lg">{item.sgpa.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center">No SGPA data to display. Add subjects and calculate.</p>
          )}
        </div>
        
        <Separator />

        {cgpa && (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Overall CGPA</h3>
            <p className="text-4xl font-bold text-accent">{cgpa.cgpa.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Based on {cgpa.totalOverallCredits} total credits</p>
          </div>
        )}
        
        {sgpas.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-center flex items-center justify-center"><TrendingUp className="mr-2 h-5 w-5 text-primary" />CGPA Trend</h3>
              <CgpaTrendChart semesterResults={sgpas} />
            </div>
          </>
        )}

        {allSemestersData.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-center flex items-center justify-center"><PieChartIcon className="mr-2 h-5 w-5 text-primary" />Overall Grade Distribution</h3>
              <GradeDistributionChart allSemestersData={allSemestersData} />
            </div>
          </>
        )}

      </CardContent>
    </Card>
  );
}
