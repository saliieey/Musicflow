import { AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiErrorProps {
  message?: string;
  title?: string;
}

export function ApiError({ 
  title = "Music Service Unavailable", 
  message = "Unable to load music from Jamendo API" 
}: ApiErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-spotify-light-gray mb-6 max-w-md">{message}</p>
      
      <div className="space-y-3">
        <p className="text-sm text-spotify-light-gray">
          Need a Jamendo API key? Get one for free:
        </p>
        <Button
          variant="outline"
          className="border-spotify-green text-spotify-green hover:bg-spotify-green hover:text-black"
          onClick={() => window.open('https://developer.jamendo.com/', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Get Free API Key
        </Button>
      </div>
    </div>
  );
}