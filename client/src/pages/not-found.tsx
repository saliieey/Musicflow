import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-spotify-black">
      <Card className="w-full max-w-md mx-4 bg-spotify-gray/30 border-spotify-dark-gray">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2 mb-4 text-center sm:text-left">
            <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500 flex-shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-spotify-light-gray text-center sm:text-left">
            The page you're looking for doesn't exist. Let's get you back to the music!
          </p>

          <div className="mt-6 flex justify-center sm:justify-start">
            <Link href="/">
              <Button className="bg-spotify-green text-black hover:bg-spotify-green/90">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
