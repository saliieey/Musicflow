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
  } = useAudioPlayer();

  const [userId] = useLocalStorage("userId", "guest");
  const queryClient = useQueryClient();

  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites", { userId }],
    enabled: !!userId && !!currentTrack,
  });

  const isFavorite = currentTrack && favorites.some((fav: any) => fav.trackId === currentTrack.id);

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

  if (!currentTrack) {
    return null;
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercentage = isMuted ? 0 : volume * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-spotify-gray/95 backdrop-blur-xl border-t border-spotify-dark-gray/30 p-4 z-50">
      <div className="flex items-center gap-4">
        
        {/* Currently Playing Song Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img
            src={currentTrack.album_image || currentTrack.image || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60`}
            alt={currentTrack.album_name}
            className="w-14 h-14 rounded object-cover"
          />
          <div className="min-w-0">
            <h4 className="font-medium text-sm truncate text-white">
              {currentTrack.name}
            </h4>
            <p className="text-spotify-light-gray text-xs truncate">
              {currentTrack.artist_name}
            </p>
          </div>
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
        </div>

        {/* Player Controls */}
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

          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-full text-xs text-spotify-light-gray">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <Slider
              value={[progressPercentage]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="flex-1"
            />
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume and Additional Controls */}
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
  );
}
