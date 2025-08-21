import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { TrackList } from "@/components/track-list";
import { TrackCard } from "@/components/track-card";
import { ApiError } from "@/components/api-error";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { jamendoApi } from "@/lib/jamendo-api";
import { JamendoTrack } from "@/types/music";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Trending() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();

  const { data: trendingData, isLoading, error } = useQuery({
    queryKey: ["trending-tracks-full"],
    queryFn: () => jamendoApi.getTrending(100),
  });

  const tracks = trendingData?.results || [];

  const handlePlayTrack = (track: JamendoTrack, queue?: JamendoTrack[]) => {
    playTrack(track, queue || tracks);
  };

  // Debug logging
  console.log('Trending component render - viewMode:', viewMode, 'tracks count:', tracks.length);

  // Track view mode changes
  useEffect(() => {
    console.log('View mode changed to:', viewMode);
  }, [viewMode]);

  return (
    <div className="p-3 sm:p-4 md:p-6 pl-3 sm:pl-4 md:pl-6 pr-0 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Trending</h1>
            <p className="text-spotify-light-gray text-sm sm:text-base">Popular tracks right now</p>
          </div>
        </div>

        <div className="flex gap-2 justify-center sm:justify-end">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              console.log('Setting viewMode to grid');
              setViewMode('grid');
            }}
            className={cn(
              "transition-all duration-200",
              viewMode === 'grid' 
                ? 'bg-spotify-green text-black hover:bg-spotify-green/90 shadow-lg' 
                : 'text-spotify-light-gray hover:text-white hover:bg-spotify-dark-gray/50'
            )}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              console.log('Setting viewMode to list');
              setViewMode('list');
            }}
            className={cn(
              "transition-all duration-200",
              viewMode === 'list' 
                ? 'bg-spotify-green text-black hover:bg-spotify-green/90 shadow-lg' 
                : 'text-spotify-light-gray hover:text-white hover:bg-spotify-dark-gray/50'
            )}
          >
            List
          </Button>
        </div>
      </div>

      {isLoading ? (
        viewMode === 'list' ? (
          <div className="space-y-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 animate-pulse">
                <div className="col-span-1 flex items-center justify-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-spotify-dark-gray rounded"></div>
                </div>
                <div className="col-span-7 sm:col-span-6 flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-spotify-dark-gray rounded-lg flex-shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-spotify-dark-gray rounded w-24 sm:w-32"></div>
                    <div className="h-3 bg-spotify-dark-gray rounded w-20 sm:w-24"></div>
                  </div>
                </div>
                <div className="col-span-3 hidden sm:block">
                  <div className="h-4 bg-spotify-dark-gray rounded w-20 sm:w-24"></div>
                </div>
                <div className="col-span-1 hidden sm:block">
                  <div className="h-4 bg-spotify-dark-gray rounded w-8"></div>
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  <div className="flex gap-1 sm:gap-2">
                    <div className="w-8 h-8 sm:w-7 sm:h-7 bg-spotify-dark-gray rounded"></div>
                    <div className="w-8 h-8 sm:w-7 sm:h-7 bg-spotify-dark-gray rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-spotify-gray/30 p-3 sm:p-4 rounded-lg animate-pulse">
                <div className="aspect-square bg-spotify-dark-gray rounded-md mb-3"></div>
                <div className="h-4 bg-spotify-dark-gray rounded mb-2"></div>
                <div className="h-3 bg-spotify-dark-gray rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )
      ) : error ? (
        <ApiError 
          title="Trending Music Unavailable"
          message="Unable to load trending tracks. Please check your API configuration."
        />
      ) : tracks.length > 0 ? (
        viewMode === 'list' ? (
          <TrackList
            key={`list-${tracks.length}`}
            tracks={tracks}
            onPlay={handlePlayTrack}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
          />
        ) : (
          <div key={`grid-${tracks.length}`} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onPlay={handlePlayTrack}
                isPlaying={isPlaying && currentTrack?.id === track.id}
              />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-8 sm:py-12">
          <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 text-spotify-light-gray mx-auto mb-4 opacity-50" />
          <p className="text-spotify-light-gray">No trending tracks available</p>
          <p className="text-spotify-light-gray text-sm mt-2">Check back later for updates</p>
        </div>
      )}
    </div>
  );
}
