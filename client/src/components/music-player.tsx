import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX,
  Heart,
  List,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { apiRequest } from "@/lib/queryClient";
import { useEffect } from "react";

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function MusicPlayer() {
  const {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    togglePlayPause,
    handleNext,
    handlePrevious,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    debugState,
  } = useAudioPlayer();

  // Debug logging
  console.log('MusicPlayer render:', { 
    isPlaying, 
    currentTrack: currentTrack?.name, 
    currentTime, 
    duration,
    currentTrackId: currentTrack?.id,
    currentTrackArtist: currentTrack?.artist_name
  });

  useEffect(() => {
    console.log('MusicPlayer component mounted!');
  }, []);

  // Force re-render when state changes
  useEffect(() => {
    console.log('MusicPlayer state changed:', { 
      isPlaying, 
      currentTrack: currentTrack?.name, 
      currentTime, 
      duration 
    });
  }, [isPlaying, currentTrack, currentTime, duration]);

  const [userId] = useLocalStorage("userId", "guest");
  const queryClient = useQueryClient();

  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites", { userId }],
    enabled: !!userId && !!currentTrack,
  });

  const isFavorite = currentTrack && (favorites as any[]).some((fav: any) => fav.trackId === currentTrack.id);

  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      if (!currentTrack) return;
      return apiRequest("POST", "/api/favorites", {
        userId,
        trackId: currentTrack.id,
        trackData: {
          id: currentTrack.id,
          name: currentTrack.name,
          artist_name: currentTrack.artist_name,
          album_name: currentTrack.album_name,
          album_image: currentTrack.album_image,
          audio: currentTrack.audio,
          duration: currentTrack.duration,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  const removeFromFavoritesMutation = useMutation({
    mutationFn: async () => {
      if (!currentTrack) return;
      return apiRequest("DELETE", `/api/favorites/${currentTrack.id}?userId=${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  const handleFavoriteToggle = () => {
    if (!currentTrack) return;
    
    if (isFavorite) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };

  const handleSeek = (value: number[]) => {
    seekTo((value[0] / 100) * duration);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  // Show player only if there's a real current track
  if (!currentTrack) {
    return null;
  }

  console.log('MusicPlayer: Showing player');

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercentage = isMuted ? 0 : volume * 100;

  // Use the actual current track data
  const displayTrack = currentTrack;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-spotify-black border-t border-spotify-dark-gray/30 z-50">
        {/* Main Player Bar */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left Section - Track Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={displayTrack.album_image || displayTrack.image || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=56&h=56`}
              alt={displayTrack.album_name}
              className="w-14 h-14 rounded object-cover"
            />
            <div className="min-w-0">
              <h4 className="font-medium text-sm truncate text-white hover:underline cursor-pointer">
                {displayTrack.name}
              </h4>
              <p className="text-spotify-light-gray text-xs truncate hover:underline cursor-pointer">
                {displayTrack.artist_name}
              </p>
            </div>
            {currentTrack && (
              <Button
                size="icon"
                variant="ghost"
                className="text-spotify-light-gray hover:text-spotify-green transition-colors"
                onClick={handleFavoriteToggle}
              >
                <Heart
                  className={cn(
                    "w-4 h-4",
                    isFavorite ? "fill-spotify-green text-spotify-green" : ""
                  )}
                />
              </Button>
            )}
          </div>

          {/* Center Section - Player Controls */}
          <div className="flex flex-col items-center flex-1 max-w-md">
            <div className="flex items-center gap-4 mb-2">
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "text-spotify-light-gray hover:text-white transition-colors",
                  isShuffled && "text-spotify-green"
                )}
                onClick={toggleShuffle}
              >
                <Shuffle className="w-4 h-4" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className="text-spotify-light-gray hover:text-white transition-colors"
                onClick={handlePrevious}
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              
              <Button
                size="icon"
                className="w-10 h-10 bg-white hover:bg-gray-100 rounded-full text-black hover:scale-105 transition-transform"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black" />
                )}
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className="text-spotify-light-gray hover:text-white transition-colors"
                onClick={handleNext}
              >
                <SkipForward className="w-5 h-5" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "text-spotify-light-gray hover:text-white transition-colors",
                  repeatMode !== 'off' && "text-spotify-green"
                )}
                onClick={toggleRepeat}
              >
                <Repeat className="w-4 h-4" />
                {repeatMode === 'one' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-spotify-green rounded-full" />
                )}
              </Button>
            </div>

            {/* Progress Bar with Time Display */}
            <div className="flex items-center gap-2 w-full text-xs text-spotify-light-gray">
              <span className="w-10 text-right font-mono">{formatTime(currentTime)}</span>
              <div className="flex-1 relative">
                <div 
                  className="w-full bg-spotify-dark-gray/50 rounded-full h-1 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = (clickX / rect.width) * 100;
                    const newTime = (percentage / 100) * duration;
                    seekTo(newTime);
                  }}
                >
                  <div 
                    className="bg-spotify-green h-1 rounded-full transition-all duration-100 ease-out relative"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div 
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 hover:opacity-100 transition-opacity"
                      style={{ right: '-6px' }}
                    />
                  </div>
                </div>
              </div>
              <span className="w-10 font-mono">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Section - Volume and Additional Controls */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <Button
              size="icon"
              variant="ghost"
              className="text-spotify-light-gray hover:text-white transition-colors"
            >
              <List className="w-4 h-4" />
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              className="text-spotify-light-gray hover:text-white transition-colors"
            >
              <Monitor className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-spotify-light-gray hover:text-white transition-colors"
                onClick={toggleMute}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <Slider
                value={[volumePercentage]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-20"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
