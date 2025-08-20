import { Play, Heart, MoreHorizontal, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { JamendoTrack } from "@/types/music";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface TrackListProps {
  tracks: JamendoTrack[];
  onPlay: (track: JamendoTrack, queue?: JamendoTrack[]) => void;
  currentTrack?: JamendoTrack | null;
  isPlaying?: boolean;
  showHeader?: boolean;
  showActions?: boolean;
}

export function TrackList({ 
  tracks, 
  onPlay, 
  currentTrack, 
  isPlaying, 
  showHeader = true,
  showActions = true 
}: TrackListProps) {
  const [userId] = useLocalStorage("userId", "guest");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleFavoriteToggle = async (track: JamendoTrack) => {
    try {
      const isFavorite = await apiRequest("GET", `/api/favorites/check?trackId=${track.id}&userId=${userId}`);
      
      if (isFavorite.exists) {
        await apiRequest("DELETE", `/api/favorites/${track.id}?userId=${userId}`);
        toast({
          title: "Removed from favorites",
          description: `${track.name} has been removed from your liked songs`,
        });
      } else {
        await apiRequest("POST", "/api/favorites", {
          trackId: track.id,
          userId,
          trackData: track,
        });
        toast({
          title: "Added to favorites",
          description: `${track.name} has been added to your liked songs`,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (tracks.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <p className="text-spotify-light-gray">No tracks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showHeader && (
        <div className="grid grid-cols-12 gap-2 sm:gap-4 px-2 sm:px-4 py-2 text-spotify-light-gray text-xs sm:text-sm font-medium border-b border-spotify-dark-gray/30">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6 sm:col-span-6 text-left">Title</div>
          <div className="col-span-3 hidden sm:block text-left">Album</div>
          <div className="col-span-1 hidden sm:block text-center">
            <Clock className="w-4 h-4" />
          </div>
          <div className="col-span-1 sm:col-span-1 text-center"></div>
        </div>
      )}
      
      {tracks.map((track, index) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        
        return (
          <div
            key={track.id}
            className={cn(
              "grid grid-cols-12 gap-2 sm:gap-4 px-2 sm:px-4 py-2 rounded-md transition-colors cursor-pointer group",
              "hover:bg-spotify-gray/30",
              isCurrentTrack && "bg-spotify-gray/50"
            )}
            onClick={() => onPlay(track, tracks)}
          >
            {/* Track Number / Play Button */}
            <div className="col-span-1 flex items-center justify-center">
              <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                <span className={cn(
                  "text-spotify-light-gray text-xs sm:text-sm group-hover:opacity-0 transition-opacity text-center",
                  isCurrentTrack && isPlaying && "opacity-0"
                )}>
                  {index + 1}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "absolute inset-0 w-6 h-6 sm:w-8 sm:h-8 opacity-0 group-hover:opacity-100 transition-opacity",
                    isCurrentTrack && isPlaying && "opacity-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlay(track, tracks);
                  }}
                >
                  <Play className="w-2 h-2 sm:w-3 sm:h-3 fill-white" />
                </Button>
              </div>
            </div>
            
            {/* Track Info */}
            <div className="col-span-6 sm:col-span-6 flex items-center gap-2 sm:gap-3 min-w-0">
              <img
                src={track.album_image || track.image || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50`}
                alt={track.album_name}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className={cn(
                  "font-medium text-xs sm:text-sm truncate leading-tight",
                  isCurrentTrack ? "text-spotify-green" : "text-white"
                )}>
                  {track.name}
                </p>
                <p className="text-spotify-light-gray text-xs truncate leading-tight">
                  {track.artist_name}
                </p>
              </div>
            </div>
            
            {/* Album - Hidden on mobile */}
            <div className="col-span-3 hidden sm:flex items-center">
              <p className="text-spotify-light-gray text-sm truncate">
                {track.album_name}
              </p>
            </div>
            
            {/* Duration - Hidden on mobile */}
            <div className="col-span-1 hidden sm:flex items-center">
              <p className="text-spotify-light-gray text-sm">
                {formatDuration(track.duration)}
              </p>
            </div>
            
            {/* Actions */}
            <div className="col-span-1 sm:col-span-1 flex items-center justify-end">
              {/* Mobile: Always show controls, Desktop: Show on hover */}
              <div className={cn(
                "flex items-center gap-1 sm:gap-2 transition-opacity",
                "sm:opacity-0 sm:group-hover:opacity-100" // Hidden on desktop until hover, always visible on mobile
              )}>
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-5 h-5 sm:w-6 sm:h-6 text-spotify-light-gray hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteToggle(track);
                  }}
                >
                  <Heart
                    className={cn(
                      "w-3 h-3 sm:w-4 sm:h-4",
                      // Check if track is in favorites (you might need to implement this)
                      false ? "fill-spotify-green text-spotify-green" : ""
                    )}
                  />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-5 h-5 sm:w-6 sm:h-6 text-spotify-light-gray hover:text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onPlay(track, tracks)}>
                      Play
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFavoriteToggle(track)}>
                      Add to Favorites
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Add to Playlist
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
