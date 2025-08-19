import { useState } from "react";
import { Play, Heart, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JamendoTrack } from "@/types/music";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TrackCardProps {
  track: JamendoTrack;
  onPlay: (track: JamendoTrack) => void;
  isPlaying?: boolean;
  className?: string;
}

export function TrackCard({ track, onPlay, isPlaying, className }: TrackCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [userId] = useLocalStorage("userId", "guest");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: favoriteCheck } = useQuery({
    queryKey: ["/api/favorites", track.id, "check", { userId }],
    enabled: !!userId,
  });

  const isFavorite = (favoriteCheck as any)?.isFavorite || false;

  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/favorites", {
        userId,
        trackId: track.id,
        trackData: {
          id: track.id,
          name: track.name,
          artist_name: track.artist_name,
          album_name: track.album_name,
          album_image: track.album_image,
          audio: track.audio,
          duration: track.duration,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Added to favorites",
        description: `${track.name} by ${track.artist_name}`,
      });
    },
    onError: () => {
      toast({
        title: "Failed to add to favorites",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const removeFromFavoritesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/favorites/${track.id}?userId=${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from favorites",
        description: `${track.name} by ${track.artist_name}`,
      });
    },
    onError: () => {
      toast({
        title: "Failed to remove from favorites",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };

  return (
    <div
      className={cn(
        "group cursor-pointer transition-all duration-300",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPlay(track)}
    >
      <div className="bg-spotify-gray/30 backdrop-blur-sm p-4 rounded-lg hover:bg-spotify-gray/50 transition-all duration-300 group-hover:scale-105">
        <div className="relative">
          <img
            src={track.album_image || track.image || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300`}
            alt={`${track.album_name} by ${track.artist_name}`}
            className="w-full aspect-square object-cover rounded-md mb-3"
          />
          <Button
            size="icon"
            className={cn(
              "absolute -bottom-2 right-2 w-10 h-10 bg-spotify-green rounded-full shadow-lg transition-all duration-300",
              "hover:bg-spotify-green hover:scale-110",
              isHovered || isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onPlay(track);
            }}
          >
            <Play className="w-4 h-4 text-black fill-black" />
          </Button>
        </div>
        
        <div className="space-y-1">
          <h3 className="font-semibold text-sm text-white truncate">
            {track.name}
          </h3>
          <p className="text-spotify-light-gray text-xs truncate">
            {track.artist_name}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="w-6 h-6 text-spotify-light-gray hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              handleFavoriteToggle();
            }}
          >
            <Heart
              className={cn(
                "w-4 h-4",
                isFavorite ? "fill-spotify-green text-spotify-green" : ""
              )}
            />
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            className="w-6 h-6 text-spotify-light-gray hover:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
