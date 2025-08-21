import { Play, Heart, MoreHorizontal, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { JamendoTrack } from "@/types/music";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient, useQuery } from "@tanstack/react-query";
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

  // Fetch user favorites to check status
  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites", userId],
    enabled: !!userId,
  });

  console.log('TrackList - Favorites data:', favorites);
  console.log('TrackList - User ID:', userId);

  const handleFavoriteToggle = async (track: JamendoTrack) => {
    try {
      // Check if track is currently favorited
      const isCurrentlyFavorite = (favorites as any[]).some((fav: any) => fav.trackId === track.id);
      
      console.log('Toggling favorite for track:', track.name, 'Currently favorite:', isCurrentlyFavorite);
      
      if (isCurrentlyFavorite) {
        // Remove from favorites
        console.log('Removing from favorites...');
        const response = await apiRequest("DELETE", `/api/favorites/${track.id}?userId=${userId}`);
        console.log('Remove response:', response);
        toast({
          title: "Removed from favorites",
          description: `${track.name} has been removed from your liked songs`,
        });
      } else {
        // Add to favorites
        console.log('Adding to favorites...');
        const response = await apiRequest("POST", "/api/favorites", {
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
        console.log('Add response:', response);
        toast({
          title: "Added to favorites",
          description: `${track.name} has been added to your liked songs`,
        });
      }
      
      // Invalidate favorites queries to refresh the UI
      queryClient.invalidateQueries({ 
        queryKey: ["/api/favorites", userId],
        exact: false 
      });
    } catch (error) {
      console.error('Favorite toggle error:', error);
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
    <div className="space-y-1 pr-0">
      {showHeader && (
        <div className="relative grid grid-cols-12 gap-3 sm:gap-4 pl-4 sm:pl-6 pr-0 py-4 sm:py-5 text-spotify-light-gray text-xs sm:text-sm font-medium border-b border-spotify-dark-gray/30 bg-spotify-dark-gray/20 rounded-t-lg">
          <div className="col-span-1 text-center font-semibold">#</div>
          <div className="col-span-7 sm:col-span-6 text-left font-semibold">Title</div>
          <div className="col-span-3 hidden sm:block text-left font-semibold">Album</div>
          <div className="col-span-1 hidden sm:block text-center font-semibold">
            <Clock className="w-4 h-4" />
          </div>
          <div className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 text-center font-semibold -translate-x-1/2">Actions</div>
        </div>
      )}
      
      {tracks.map((track, index) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        
        return (
          <div
            key={track.id}
            className={cn(
              "relative grid grid-cols-12 gap-3 sm:gap-4 pl-4 sm:pl-6 pr-0 py-4 sm:py-5 rounded-lg transition-all duration-200 cursor-pointer group",
              "hover:bg-spotify-gray/30 hover:scale-[1.01]",
              isCurrentTrack && "bg-spotify-gray/50 ring-1 ring-spotify-green/30"
            )}
            onClick={() => onPlay(track, tracks)}
          >
            {/* Track Number / Play Button */}
            <div className="col-span-1 flex items-center justify-center">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                <span className={cn(
                  "text-spotify-light-gray text-sm sm:text-base group-hover:opacity-0 transition-opacity text-center font-semibold",
                  isCurrentTrack && isPlaying && "opacity-0"
                )}>
                  {index + 1}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 opacity-0 group-hover:opacity-100 transition-opacity bg-spotify-green/20 hover:bg-spotify-green/30",
                    isCurrentTrack && isPlaying && "opacity-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlay(track, tracks);
                  }}
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 fill-white" />
                </Button>
              </div>
            </div>
            
            {/* Track Info */}
            <div className="col-span-7 sm:col-span-6 flex items-center gap-3 sm:gap-4 min-w-0">
              <img
                src={track.album_image || track.image || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50`}
                alt={track.album_name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0 shadow-md"
              />
              <div className="min-w-0 flex-1">
                <p className={cn(
                  "font-semibold text-sm sm:text-base truncate leading-tight",
                  isCurrentTrack ? "text-spotify-green" : "text-white"
                )}>
                  {track.name}
                </p>
                <p className="text-spotify-light-gray text-xs sm:text-sm truncate leading-tight mt-1">
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
            
            {/* Actions - Positioned with same margin as track numbers */}
            <div className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 flex items-center gap-1 sm:gap-2 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 sm:w-7 sm:h-7 text-spotify-light-gray hover:text-white touch-manipulation hover:bg-spotify-dark-gray/50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavoriteToggle(track);
                }}
              >
                <Heart
                  className={cn(
                    "w-4 h-4 sm:w-4 sm:h-4",
                    // Check if track is in favorites
                    (favorites as any[]).some((fav: any) => fav.trackId === track.id) 
                      ? "fill-spotify-green text-spotify-green" 
                      : ""
                  )}
                />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 sm:w-7 sm:h-7 text-spotify-light-gray hover:text-white touch-manipulation hover:bg-spotify-dark-gray/50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4 sm:w-4 sm:h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-spotify-gray border-spotify-dark-gray">
                  <DropdownMenuItem onClick={() => onPlay(track, tracks)} className="text-white hover:bg-spotify-dark-gray">
                    Play
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFavoriteToggle(track)} className="text-white hover:bg-spotify-dark-gray">
                    Add to Favorites
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-spotify-dark-gray">
                    Add to Playlist
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}
