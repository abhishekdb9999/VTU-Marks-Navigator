
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { gradePoints, marksRange } from "@/lib/vtuUtils";
import type { Grade } from "@/types/vtuCalculator";
import { GRADE_OPTIONS } from "@/types/vtuCalculator";

export function GradePointTable() {
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
              <TableHead className="text-center">Grade</TableHead>
              <TableHead className="text-center">Grade Point</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {GRADE_OPTIONS.map((grade) => (
              <TableRow key={grade}>
                <TableCell className="text-center font-medium">{marksRange[grade as Grade]}</TableCell>
                <TableCell className="text-center font-medium">{grade}</TableCell>
                <TableCell className="text-center">{gradePoints[grade as Grade]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
