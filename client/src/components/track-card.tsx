import { useState } from "react";
import { Play, Heart, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JamendoTrack } from "@/types/music";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TrackCardProps {
  track: JamendoTrack;
  onPlay: (track: JamendoTrack) => void;
  isPlaying?: boolean;
  className?: string;
}

export function TrackCard({ track, onPlay, isPlaying, className }: TrackCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [localUserId] = useLocalStorage("userId", "guest");
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Use authenticated user ID if available, otherwise fall back to local storage
  const userId = isAuthenticated && user ? user.id : localUserId;

  // Use the main favorites list to check if this track is favorited
  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites", userId],
    enabled: !!userId,
  });

  // Fetch database playlists for registered users
  const { data: dbPlaylists = [] } = useQuery({
    queryKey: ["/api/playlists", "user", userId],
    enabled: !!userId && userId !== "guest" && isAuthenticated,
  });

  // Fetch guest playlists from local storage
  const { data: guestPlaylists = [] } = useQuery({
    queryKey: ["guestPlaylists"],
    enabled: userId === "guest",
    queryFn: () => {
      try {
        const stored = localStorage.getItem('guestPlaylists');
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('Error reading guest playlists:', error);
        return [];
      }
    },
  });

  // Combine playlists based on user type
  const playlists = userId === "guest" ? guestPlaylists : dbPlaylists;

  // Check if this track is in the favorites list
  const isFavorite = (favorites as any[]).some((fav: any) => fav.trackId === track.id);

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
      // Invalidate all favorites queries for this user
      queryClient.invalidateQueries({ 
        queryKey: ["/api/favorites", userId],
        exact: false 
      });
      
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
      return apiRequest("DELETE", `/api/favorites/${track.id}?userId=${userId}`);
    },
    onSuccess: () => {
      // Invalidate all favorites queries for this user
      queryClient.invalidateQueries({ 
        queryKey: ["/api/favorites", userId],
        exact: false 
      });
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

  const addToPlaylistMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      if (userId === "guest") {
        // For guest users, add to local storage playlist
        const existingPlaylists = JSON.parse(localStorage.getItem('guestPlaylists') || '[]');
        const playlistIndex = existingPlaylists.findIndex((p: any) => p.id === playlistId);
        
        if (playlistIndex === -1) {
          throw new Error('Playlist not found');
        }
        
        const playlist = existingPlaylists[playlistIndex];
        const trackData = {
          id: track.id,
          name: track.name,
          artist_name: track.artist_name,
          album_name: track.album_name,
          album_image: track.album_image,
          audio: track.audio,
          duration: track.duration,
        };
        
        // Check if track already exists
        const trackExists = playlist.tracks.some((t: any) => t.id === track.id);
        if (trackExists) {
          return { alreadyExists: true };
        }
        
        // Add track to playlist
        playlist.tracks.push(trackData);
        existingPlaylists[playlistIndex] = playlist;
        localStorage.setItem('guestPlaylists', JSON.stringify(existingPlaylists));
        
        return { success: true };
      } else {
        // For registered users, add to database playlist
        const response = await apiRequest("POST", `/api/playlists/${playlistId}/tracks`, {
          track: {
            id: track.id,
            name: track.name,
            artist_name: track.artist_name,
            album_name: track.album_name,
            album_image: track.album_image,
            audio: track.audio,
            duration: track.duration,
          },
        });
        return response;
      }
    },
    onSuccess: (response, playlistId) => {
      if (userId === "guest") {
        // For guest users, invalidate the guest playlists query
        queryClient.invalidateQueries({ 
          queryKey: ["guestPlaylists"],
          exact: true 
        });
        
        if (response.alreadyExists) {
          toast({
            title: "Already in playlist",
            description: `${track.name} is already in this playlist`,
            variant: "default",
          });
        } else {
          toast({
            title: "Added to playlist",
            description: `${track.name} was added successfully`,
          });
        }
      } else {
        // For registered users, invalidate database playlists
        queryClient.invalidateQueries({ 
          queryKey: ["/api/playlists"],
          exact: false 
        });
        
        // Show appropriate message based on response
        if (response.alreadyExists) {
          toast({
            title: "Already in playlist",
            description: `${track.name} is already in this playlist`,
            variant: "default",
          });
        } else {
          toast({
            title: "Added to playlist",
            description: `${track.name} was added successfully`,
          });
        }
      }
    },
    onError: () => {
      toast({
        title: "Failed to add to playlist",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
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
      <div className="bg-spotify-gray/30 backdrop-blur-sm p-3 sm:p-4 rounded-lg hover:bg-spotify-gray/50 transition-all duration-300 group-hover:scale-105">
        <div className="relative">
          <img
            src={track.album_image || track.image || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300`}
            alt={`${track.album_name} by ${track.artist_name}`}
            className="w-full aspect-square object-cover rounded-md mb-2 sm:mb-3"
          />
          <Button
            size="icon"
            className={cn(
              "absolute -bottom-1 sm:-bottom-2 right-1 sm:right-2 w-8 h-8 sm:w-10 sm:h-10 bg-spotify-green rounded-full shadow-lg transition-all duration-300",
              "hover:bg-spotify-green hover:scale-110",
              isHovered || isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onPlay(track);
            }}
          >
            <Play className="w-3 h-3 sm:w-4 sm:h-4 text-black fill-black" />
          </Button>
        </div>
        
        <div className="space-y-1">
          <h3 className="font-semibold text-xs sm:text-sm text-white truncate">
            {track.name}
          </h3>
          <p className="text-spotify-light-gray text-xs truncate">
            {track.artist_name}
          </p>
        </div>

        {/* Mobile: Always show controls, Desktop: Show on hover */}
        <div className={cn(
          "flex items-center justify-between mt-3 sm:mt-2 transition-opacity",
          "sm:opacity-0 sm:group-hover:opacity-100" // Hidden on desktop until hover, always visible on mobile
        )}>
          <Button
            size="icon"
            variant="ghost"
            className="w-7 h-7 sm:w-6 sm:h-6 text-spotify-light-gray hover:text-white touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              handleFavoriteToggle();
            }}
          >
            <Heart
              className={cn(
                "w-4 h-4 sm:w-4 sm:h-4",
                isFavorite ? "fill-spotify-green text-spotify-green" : ""
              )}
            />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="w-7 h-7 sm:w-6 sm:h-6 text-spotify-light-gray hover:text-white touch-manipulation"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4 sm:w-4 sm:h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-spotify-gray border-spotify-dark-gray">
              <DropdownMenuLabel className="text-spotify-light-gray">Add to playlist</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(playlists as any[]).length === 0 ? (
                <DropdownMenuItem className="text-spotify-light-gray">
                  No playlists yet
                </DropdownMenuItem>
              ) : (
                (playlists as any[]).map((pl: any) => (
                  <DropdownMenuItem
                    key={pl.id}
                    className="text-white hover:bg-spotify-dark-gray"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToPlaylistMutation.mutate(pl.id);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" /> {pl.name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
