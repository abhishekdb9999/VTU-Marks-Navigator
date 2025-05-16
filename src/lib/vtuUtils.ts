
import type { Subject, Semester, Grade } from '@/types/vtuCalculator';

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
  D: '50 – 59',
  E: '45 – 49',
  F: '40 – 44',
  FAIL: '< 40',
  AB: 'Absent',
};

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
    if (subject.credits > 0 && subject.grade) {
      if (subject.grade in gradePoints) {
        totalCreditPoints += gradePoints[subject.grade] * subject.credits;
        totalCredits += subject.credits;
      }
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
      const { sgpa, totalCredits: semesterTotalCredits } = calculateSGPA(semester.subjects);
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
