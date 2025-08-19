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
import { useEffect, useState } from "react";

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

  // Debug: Log values received from hook
  console.log('MusicPlayer Component Values:', {
    currentTime,
    duration,
    progressPercentage: duration > 0 ? (currentTime / duration) * 100 : 0,
    isPlaying,
    currentTrack: currentTrack?.name
  });

  // Force re-render when values change
  useEffect(() => {
    console.log('MusicPlayer useEffect - Values changed:', { currentTime, duration });
  }, [currentTime, duration]);

  // Test: Add a simple counter to see if component re-renders
  const [testCounter, setTestCounter] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTestCounter(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
          <div className="flex items-center gap-2 w-full text-xs text-spotify-light-gray mb-2">
            <span className="w-10 text-right font-mono">{formatTime(currentTime)}</span>
            <div className="flex-1 relative border-2 border-red-500 p-2">
              {/* Working Progress Bar */}
              <div className="mb-2">
                <div className="text-xs text-green-400 mb-1">Progress Bar:</div>
                <div className="w-full bg-gray-700 rounded-full h-3 relative">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-300 relative"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    {/* Progress thumb */}
                    <div 
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-green-500 shadow-lg"
                      style={{ right: '-8px' }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Clickable Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-3 relative cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = (clickX / rect.width) * 100;
                const newTime = (percentage / 100) * duration;
                seekTo(newTime);
              }}>
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300 relative"
                  style={{ width: `${progressPercentage}%` }}
                >
                  {/* Progress thumb */}
                  <div 
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-green-500 shadow-lg"
                    style={{ right: '-8px' }}
                  ></div>
                </div>
              </div>
              
              {/* Debug info */}
              <div className="text-xs text-red-400 mt-1">
                Debug: {progressPercentage.toFixed(1)}% | Time: {currentTime.toFixed(1)}s | Duration: {duration.toFixed(1)}s
              </div>
              <div className="text-xs text-yellow-400 mt-1">
                Raw Values: currentTime={currentTime}, duration={duration}, progressPercentage={progressPercentage}
              </div>
              <div className="text-xs text-blue-400 mt-1">
                Test Counter: {testCounter} | Hook Values: currentTime={currentTime}, duration={duration}
              </div>
            </div>
            <span className="w-10 font-mono">{formatTime(duration)}</span>
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
