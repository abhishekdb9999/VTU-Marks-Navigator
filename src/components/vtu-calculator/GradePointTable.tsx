
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { gradePoints, marksRange } from "@/lib/vtuUtils";
import type { Grade } from "@/types/vtuCalculator";
import { GRADE_OPTIONS } from "@/types/vtuCalculator";

export function GradePointTable() {
  // Filter out 'AB' and 'FAIL' grades for display in this table, as their marks range can be ambiguous or 0.
  // Or, if you want to keep them, ensure marksRange has appropriate values.
  // For now, let's display all defined grades for completeness of the VTU system.
  const gradesToDisplay = GRADE_OPTIONS;

  return (
    <Card className="mt-6 mb-4 print:hidden">
      <CardHeader>
        <CardTitle className="text-lg text-center">VTU Grade Point System</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Marks Range</TableHead>
              <TableHead className="text-center">Grade Point</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gradesToDisplay.map((grade) => (
              <TableRow key={grade}>
                <TableCell className="text-center font-medium">{marksRange[grade as Grade]}</TableCell>
                <TableCell className="text-center">{gradePoints[grade as Grade]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
