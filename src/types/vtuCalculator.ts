
import { z } from 'zod';

export const GRADE_OPTIONS = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'FAIL', 'AB'] as const;
export const GradeSchema = z.enum(GRADE_OPTIONS);
export type Grade = z.infer<typeof GradeSchema>;

export const SubjectSchema = z.object({
  id: z.string().optional(), // For useFieldArray key
  credits: z.coerce
    .number({ invalid_type_error: "Credits must be a number" })
    .min(1, "Credits must be at least 1")
    .max(6, "Credits cannot exceed 6"),
  grade: GradeSchema,
});
export type Subject = z.infer<typeof SubjectSchema>;

export const SemesterSchema = z.object({
  id: z.string().optional(), // For useFieldArray key
  subjects: z.array(SubjectSchema).min(1, "Add at least one subject"),
});
export type Semester = z.infer<typeof SemesterSchema>;

export const CalculatorFormSchema = z.object({
  numberOfSemesters: z.coerce
    .number()
    .min(1, "Enter at least 1 semester")
    .max(10, "Maximum 10 semesters allowed"),
  semesters: z.array(SemesterSchema),
});
export type CalculatorFormData = z.infer<typeof CalculatorFormSchema>;

export interface SemesterResult {
  semesterIndex: number;
  sgpa: number;
  totalCredits: number;
}

export interface OverallResult {
  cgpa: number;
  totalOverallCredits: number;
}
