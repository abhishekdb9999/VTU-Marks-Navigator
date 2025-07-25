
import type { Subject, Semester, Grade } from '@/types/vtuCalculator';
import { GRADE_OPTIONS } from '@/types/vtuCalculator';

export const gradePoints: Record<Grade, number> = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 5,
  F: 4,
  FAIL: 0,
  AB: 0,
};

export const marksRange: Record<Grade, string> = {
  S: '90 – 100',
  A: '80 – 89',
  B: '70 – 79',
  C: '60 – 69',
  D: '55 – 59',
  E: '50 – 54',
  F: '40 – 49',
  FAIL: '0 – 39',
  AB: 'Absent',
};

export function getGradeFromMarks(marks: number): Grade {
  if (marks >= 90 && marks <= 100) return 'S';
  if (marks >= 80 && marks <= 89) return 'A';
  if (marks >= 70 && marks <= 79) return 'B';
  if (marks >= 60 && marks <= 69) return 'C';
  if (marks >= 55 && marks <= 59) return 'D';
  if (marks >= 50 && marks <= 54) return 'E';
  if (marks >= 40 && marks <= 49) return 'F';
  if (marks >= 0 && marks <= 39) return 'FAIL';
  return 'FAIL'; 
}


export interface CalculatedSemester {
  sgpa: number;
  totalCredits: number;
  semesterIndex: number;
}

export function calculateSGPA(subjects: Subject[]): { sgpa: number; totalCredits: number } {
  if (!subjects || subjects.length === 0) {
    return { sgpa: 0, totalCredits: 0 };
  }

  let totalCreditPoints = 0;
  let totalCredits = 0;

  subjects.forEach(subject => {
    const currentGrade = getGradeFromMarks(subject.marksObtained); 

    if (subject.credits > 0 && currentGrade && currentGrade in gradePoints) {
      totalCreditPoints += gradePoints[currentGrade] * subject.credits;
      totalCredits += subject.credits;
    }
  });

  if (totalCredits === 0) {
    return { sgpa: 0, totalCredits: 0 };
  }

  return { sgpa: parseFloat((totalCreditPoints / totalCredits).toFixed(2)), totalCredits };
}

export function calculateCGPA(semesters: Semester[]): { cgpa: number; totalOverallCredits: number, semesterSGPAs: CalculatedSemester[] } {
  if (!semesters || semesters.length === 0) {
    return { cgpa: 0, totalOverallCredits: 0, semesterSGPAs: [] };
  }

  let overallTotalCreditPoints = 0;
  let overallTotalCreditsCalculated = 0;
  const semesterSGPAs: CalculatedSemester[] = [];

  semesters.forEach((semester, index) => {
    if (semester.subjects && semester.subjects.length > 0) {
      const subjectsWithDerivedGrades = semester.subjects.map(sub => ({
        ...sub,
        grade: getGradeFromMarks(sub.marksObtained) 
      }));
      const { sgpa, totalCredits: semesterTotalCredits } = calculateSGPA(subjectsWithDerivedGrades);
      
      semesterSGPAs.push({ sgpa, totalCredits: semesterTotalCredits, semesterIndex: index });
      if (semesterTotalCredits > 0) {
        overallTotalCreditPoints += sgpa * semesterTotalCredits;
        overallTotalCreditsCalculated += semesterTotalCredits;
      }
    } else {
       semesterSGPAs.push({ sgpa: 0, totalCredits: 0, semesterIndex: index });
    }
  });

  if (overallTotalCreditsCalculated === 0) {
    return { cgpa: 0, totalOverallCredits: overallTotalCreditsCalculated, semesterSGPAs };
  }

  return {
    cgpa: parseFloat((overallTotalCreditPoints / overallTotalCreditsCalculated).toFixed(2)),
    totalOverallCredits: overallTotalCreditsCalculated,
    semesterSGPAs
  };
}

