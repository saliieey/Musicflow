import { Play, Heart, MoreHorizontal, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JamendoTrack } from "@/types/music";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TrackListProps {
  tracks: JamendoTrack[];
  onPlay: (track: JamendoTrack, queue?: JamendoTrack[]) => void;
  currentTrack?: JamendoTrack | null;
  isPlaying?: boolean;
  showHeader?: boolean;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function TrackList({ 
  tracks, 
  onPlay, 
  currentTrack, 
  isPlaying, 
  showHeader = true 
}: TrackListProps) {
  const [userId] = useLocalStorage("userId", "guest");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites", userId],
    enabled: !!userId,
  });

  const favoriteTrackIds = (favorites as any[]).map((fav: any) => fav.trackId);

  const addToFavoritesMutation = useMutation({
    mutationFn: async (track: JamendoTrack) => {
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
    onSuccess: (response, track) => {
      // Invalidate all favorites queries for this user
      queryClient.invalidateQueries({ 
        queryKey: ["/api/favorites", userId],
        exact: false 
      });
      
      // Check if the song was already in favorites
      if (response.status === 200) {
        // Song was already in favorites
        toast({
          title: "Already in favorites",
          description: `${track.name} is already in your favorites`,
        });
      } else {
        // Song was added to favorites
        toast({
          title: "Added to favorites",
          description: `${track.name} by ${track.artist_name}`,
        });
      }
    },
  });

  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (trackId: string) => {
      return apiRequest("DELETE", `/api/favorites/${trackId}?userId=${userId}`, {});
    },
    onSuccess: (_, trackId) => {
      const track = tracks.find(t => t.id === trackId);
      // Invalidate all favorites queries for this user
      queryClient.invalidateQueries({ 
        queryKey: ["/api/favorites", userId],
        exact: false 
      });
      if (track) {
        toast({
          title: "Removed from favorites",
          description: `${track.name} by ${track.artist_name}`,
        });
      }
    },
  });

  const handleFavoriteToggle = (track: JamendoTrack) => {
    const isFavorite = favoriteTrackIds.includes(track.id);
    if (isFavorite) {
      removeFromFavoritesMutation.mutate(track.id);
    } else {
      addToFavoritesMutation.mutate(track);
    }
  };

  if (tracks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-spotify-light-gray">No tracks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showHeader && (
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-spotify-light-gray text-sm font-medium border-b border-spotify-dark-gray/30">
          <div className="col-span-1">#</div>
          <div className="col-span-6">Title</div>
          <div className="col-span-3">Album</div>
          <div className="col-span-1">
            <Clock className="w-4 h-4" />
          </div>
          <div className="col-span-1"></div>
        </div>
      )}
      
      {tracks.map((track, index) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const isFavorite = favoriteTrackIds.includes(track.id);
        
        return (
          <div
            key={track.id}
            className={cn(
              "grid grid-cols-12 gap-4 px-4 py-2 rounded-md transition-colors cursor-pointer group",
              "hover:bg-spotify-gray/30",
              isCurrentTrack && "bg-spotify-gray/50"
            )}
            onClick={() => onPlay(track, tracks)}
          >
            <div className="col-span-1 flex items-center">
              <div className="relative">
                <span className={cn(
                  "text-spotify-light-gray text-sm group-hover:opacity-0 transition-opacity",
                  isCurrentTrack && isPlaying && "opacity-0"
                )}>
                  {index + 1}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "absolute inset-0 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity",
                    isCurrentTrack && isPlaying && "opacity-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlay(track, tracks);
                  }}
                >
                  <Play className="w-3 h-3 fill-white" />
                </Button>
              </div>
            </div>
            
            <div className="col-span-6 flex items-center gap-3 min-w-0">
              <img
                src={track.album_image || track.image || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50`}
                alt={track.album_name}
                className="w-10 h-10 rounded object-cover"
              />
              <div className="min-w-0">
                <p className={cn(
                  "font-medium text-sm truncate",
                  isCurrentTrack ? "text-spotify-green" : "text-white"
                )}>
                  {track.name}
                </p>
                <p className="text-spotify-light-gray text-xs truncate">
                  {track.artist_name}
                </p>
              </div>
            </div>
            
            <div className="col-span-3 flex items-center">
              <p className="text-spotify-light-gray text-sm truncate">
                {track.album_name}
              </p>
            </div>
            
            <div className="col-span-1 flex items-center">
              <p className="text-spotify-light-gray text-sm">
                {formatDuration(track.duration)}
              </p>
            </div>
            
            <div className="col-span-1 flex items-center justify-end">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-6 h-6 text-spotify-light-gray hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteToggle(track);
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
      })}
    </div>
  );
}
