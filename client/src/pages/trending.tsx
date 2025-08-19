import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { TrackList } from "@/components/track-list";
import { TrackCard } from "@/components/track-card";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { jamendoApi } from "@/lib/jamendo-api";
import { JamendoTrack } from "@/types/music";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Trending() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();

  const { data: trendingData, isLoading } = useQuery({
    queryKey: ["trending-tracks-full"],
    queryFn: () => jamendoApi.getTrending(100),
  });

  const tracks = trendingData?.results || [];

  const handlePlayTrack = (track: JamendoTrack, queue?: JamendoTrack[]) => {
    playTrack(track, queue || tracks);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Trending</h1>
            <p className="text-spotify-light-gray">Popular tracks right now</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-spotify-green text-black hover:bg-spotify-green/90' : ''}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-spotify-green text-black hover:bg-spotify-green/90' : ''}
          >
            List
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-4 py-2 animate-pulse">
              <div className="col-span-1">
                <div className="w-6 h-6 bg-spotify-dark-gray rounded"></div>
              </div>
              <div className="col-span-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-spotify-dark-gray rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-spotify-dark-gray rounded w-32"></div>
                  <div className="h-3 bg-spotify-dark-gray rounded w-24"></div>
                </div>
              </div>
              <div className="col-span-3">
                <div className="h-4 bg-spotify-dark-gray rounded w-24"></div>
              </div>
              <div className="col-span-1">
                <div className="h-4 bg-spotify-dark-gray rounded w-8"></div>
              </div>
              <div className="col-span-1"></div>
            </div>
          ))}
        </div>
      ) : tracks.length > 0 ? (
        viewMode === 'list' ? (
          <TrackList
            tracks={tracks}
            onPlay={handlePlayTrack}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-spotify-light-gray mx-auto mb-4 opacity-50" />
          <p className="text-spotify-light-gray">No trending tracks available</p>
          <p className="text-spotify-light-gray text-sm mt-2">Check back later for updates</p>
        </div>
      )}
    </div>
  );
}
