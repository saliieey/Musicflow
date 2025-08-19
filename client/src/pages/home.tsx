import { useQuery } from "@tanstack/react-query";
import { jamendoApi } from "@/lib/jamendo-api";
import { TrackCard } from "@/components/track-card";
import { ApiError } from "@/components/api-error";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { JamendoTrack } from "@/types/music";
import { ChevronLeft, ChevronRight } from "lucide-react";

const genres = [
  { name: "Rock", gradient: "from-red-500 to-red-700", icon: "🎸" },
  { name: "Electronic", gradient: "from-blue-500 to-blue-700", icon: "⚡" },
  { name: "Jazz", gradient: "from-green-500 to-green-700", icon: "🎷" },
  { name: "Classical", gradient: "from-purple-500 to-purple-700", icon: "🎼" },
];

export default function Home() {
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();

  const { data: trendingData, isLoading: trendingLoading, error: trendingError } = useQuery({
    queryKey: ["trending-tracks"],
    queryFn: () => jamendoApi.getTrending(12),
  });

  const { data: popularData, isLoading: popularLoading, error: popularError } = useQuery({
    queryKey: ["popular-tracks"],
    queryFn: () => jamendoApi.getTrending(6),
  });

  const trendingTracks = trendingData?.results || [];
  const popularTracks = popularData?.results || [];

  const handlePlayTrack = (track: JamendoTrack) => {
    playTrack(track, trendingTracks);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-spotify-dark-gray/30 -mx-6 -mt-6 px-6 py-6">
        <div className="flex items-center gap-4">
          {/* Navigation buttons */}
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="w-8 h-8 rounded-full bg-spotify-dark-gray/50 text-spotify-light-gray hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="w-8 h-8 rounded-full bg-spotify-dark-gray/50 text-spotify-light-gray hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
              G
            </div>
            <span className="text-sm font-medium">Guest User</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section>
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-2">Welcome to MusicFlow</h2>
            <p className="text-lg opacity-90 mb-6">Discover amazing free music from talented artists worldwide</p>
            <Button className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Start Listening
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Trending Now</h2>
          <Button variant="ghost" className="text-spotify-light-gray hover:text-white text-sm font-medium">
            View All
          </Button>
        </div>
        
        {trendingLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-spotify-gray/30 p-4 rounded-lg animate-pulse">
                <div className="aspect-square bg-spotify-dark-gray rounded-md mb-3"></div>
                <div className="h-4 bg-spotify-dark-gray rounded mb-2"></div>
                <div className="h-3 bg-spotify-dark-gray rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : trendingError ? (
          <ApiError 
            title="Unable to Load Trending Music"
            message="Check your Jamendo API key configuration to load music"
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {trendingTracks.slice(0, 6).map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onPlay={handlePlayTrack}
                isPlaying={isPlaying && currentTrack?.id === track.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recently Played */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Popular Tracks</h2>
          <Button variant="ghost" className="text-spotify-light-gray hover:text-white text-sm font-medium">
            View All
          </Button>
        </div>
        
        {popularLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 bg-spotify-gray/20 rounded-lg p-3 animate-pulse">
                <div className="w-12 h-12 bg-spotify-dark-gray rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-spotify-dark-gray rounded mb-2"></div>
                  <div className="h-3 bg-spotify-dark-gray rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : popularError ? (
          <div className="text-center py-8">
            <p className="text-spotify-light-gray">Unable to load popular tracks</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularTracks.slice(0, 4).map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-4 bg-spotify-gray/20 backdrop-blur-sm rounded-lg p-3 hover:bg-spotify-gray/40 transition-all cursor-pointer group"
                onClick={() => handlePlayTrack(track)}
              >
                <img
                  src={track.album_image || track.image || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80`}
                  alt={track.album_name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-white truncate">{track.name}</h3>
                  <p className="text-spotify-light-gray text-xs truncate">{track.artist_name}</p>
                </div>
                <Button
                  size="icon"
                  className="w-8 h-8 bg-spotify-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="text-black text-xs">▶</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Browse by Genre */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Browse by Genre</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {genres.map((genre) => (
            <div
              key={genre.name}
              className={`bg-gradient-to-br ${genre.gradient} rounded-lg p-6 cursor-pointer hover:scale-105 transition-transform relative overflow-hidden`}
            >
              <h3 className="text-xl font-bold">{genre.name}</h3>
              <div className="absolute bottom-4 right-4 text-4xl opacity-30">
                {genre.icon}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
