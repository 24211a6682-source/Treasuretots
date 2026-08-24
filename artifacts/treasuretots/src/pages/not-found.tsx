import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md text-center border-orange-100 shadow-lg rounded-3xl">
        <CardContent className="pt-10 pb-8 px-6 flex flex-col items-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-5">
            <Compass className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Page not found</h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            The page you're looking for has wandered off. Let's get you back to the
            treasures.
          </p>
          <Button asChild size="lg" className="w-full sm:w-auto gap-2">
            <Link href="/">
              <Home className="w-4 h-4" /> Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
