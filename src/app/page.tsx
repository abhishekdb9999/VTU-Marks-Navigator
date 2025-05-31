
import VtuCalculatorForm from '@/components/vtu-calculator/VtuCalculatorForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Leaf } from 'lucide-react'; // Using a generic icon

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 py-6 flex flex-col justify-center sm:py-12 print:py-0 print:bg-white">
      <main className="container mx-auto px-4 print:px-0">
        <Card className="w-full max-w-3xl mx-auto shadow-2xl rounded-xl overflow-hidden print:shadow-none print:border-none print:rounded-none">
          <CardHeader className="bg-primary text-primary-foreground text-center p-8 print:bg-transparent print:text-foreground print:p-4 print:border-b">
            <div className="flex justify-center items-center mb-3 print:hidden">
              {/* Using an SVG as a placeholder for a more specific university/calculator icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-primary-foreground/80">
                <path d="M12 2L1 9l3 2.5V19a2 2 0 002 2h12a2 2 0 002-2v-7.5L23 9l-4-3.17V4h-2v2.62L12 2zm0 14.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zM5 11.38l7 4.38 7-4.38V17H5v-5.62z"/>
              </svg>
            </div>
            <CardTitle className="text-4xl font-extrabold print:text-2xl">VTU Marks Navigator</CardTitle>
            <CardDescription className="text-lg text-primary-foreground/90 mt-2 print:hidden">
              Calculate your SGPA and CGPA with precision for Visvesvaraya Technological University.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-10 bg-card print:p-0">
            <VtuCalculatorForm />
          </CardContent>
        </Card>
        <footer className="text-center mt-10 text-muted-foreground text-sm print:hidden">
          <p>&copy; {new Date().getFullYear()} VTU Marks Navigator. Simplify Your Academic Tracking.</p>
        </footer>
      </main>
    </div>
  );
}
