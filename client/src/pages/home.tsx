import { useQuery } from "@tanstack/react-query";
import { jamendoApi } from "@/lib/jamendo-api";
import { TrackCard } from "@/components/track-card";
import { ApiError } from "@/components/api-error";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useAuth } from "@/contexts/auth-context";
import { JamendoTrack } from "@/types/music";
import { useState } from "react";

const genres = [
  { name: "Rock", gradient: "from-red-500 to-red-700", icon: "🎸", searchTerms: ["rock", "guitar", "electric", "band"] },
  { name: "Electronic", gradient: "from-blue-500 to-blue-700", icon: "⚡", searchTerms: ["electronic", "dance", "techno", "synth"] },
  { name: "Jazz", gradient: "from-green-500 to-green-700", icon: "🎷", searchTerms: ["jazz", "smooth", "saxophone", "piano"] },
  { name: "Classical", gradient: "from-purple-500 to-purple-700", icon: "🎼", searchTerms: ["classical", "orchestra", "piano", "violin"] },
];

export default function Home() {
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
  const { user, isAuthenticated } = useAuth();
  const [showAllTrending, setShowAllTrending] = useState(false);
  const [showAllPopular, setShowAllPopular] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const { data: trendingData, isLoading: trendingLoading, error: trendingError } = useQuery({
    queryKey: ["trending-tracks"],
    queryFn: () => jamendoApi.getTrending(12),
  });

  const { data: popularData, isLoading: popularLoading, error: popularError } = useQuery({
    queryKey: ["popular-tracks"],
    queryFn: () => jamendoApi.getTrending(6),
  });

  // Genre-specific music query
  const { data: genreMusic, isLoading: genreLoading, error: genreError } = useQuery({
    queryKey: ["genre-music", selectedGenre],
    queryFn: () => {
      if (!selectedGenre) return null;
      const genre = genres.find(g => g.name === selectedGenre);
      if (!genre) return null;
      // Search for music using genre-specific terms
      return jamendoApi.search(genre.searchTerms.join(" "), 20);
    },
    enabled: !!selectedGenre,
  });

  const trendingTracks = trendingData?.results || [];
  const popularTracks = popularData?.results || [];
  const genreTracks = genreMusic?.results || [];

  const handlePlayTrack = (track: JamendoTrack) => {
    playTrack(track, trendingTracks);
  };

  const handleGenreClick = (genreName: string) => {
    if (selectedGenre === genreName) {
      // If same genre clicked again, deselect it
      setSelectedGenre(null);
    } else {
      // Select new genre
      setSelectedGenre(genreName);
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-spotify-dark-gray/30 -mx-3 sm:-mx-4 md:-mx-6 -mt-3 sm:-mt-4 md:-mt-6 px-3 sm:px-4 md:px-6 py-4 md:py-6">
        <div className="flex items-center justify-end">
          {/* User Profile */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user.username}</span>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                  G
                </div>
                <span className="text-sm font-medium">Guest User</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = "/login"}
                  className="ml-2 text-spotify-light-gray hover:text-white transition-all duration-200"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section>
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 sm:p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Welcome to MusicFlow</h2>
            <p className="text-base sm:text-lg opacity-90 mb-4 md:mb-6">Discover amazing free music from talented artists worldwide</p>
            <div className="flex justify-center sm:justify-start">
              <Button 
                className="bg-white text-purple-600 px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
                onClick={() => {
                  const trendingSection = document.querySelector('section:nth-child(3)');
                  if (trendingSection) {
                    trendingSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Start Listening
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Trending Now</h2>
          <Button 
            variant="ghost" 
            className="text-spotify-light-gray hover:text-white text-sm font-medium"
            onClick={() => setShowAllTrending(!showAllTrending)}
          >
            {showAllTrending ? "Show Less" : "View All"}
          </Button>
        </div>
        
        {trendingLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-spotify-gray/30 p-3 sm:p-4 rounded-lg animate-pulse">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {trendingTracks.slice(0, showAllTrending ? trendingTracks.length : 6).map((track) => (
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

      {/* Popular Tracks Section */}
      <section>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Popular Tracks</h2>
          <Button 
            variant="ghost" 
            className="text-spotify-light-gray hover:text-white text-sm font-medium"
            onClick={() => setShowAllPopular(!showAllPopular)}
          >
            {showAllPopular ? "Show Less" : "View All"}
          </Button>
        </div>
        
        {popularLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 bg-spotify-gray/20 rounded-lg p-3 animate-pulse">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-spotify-dark-gray rounded"></div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {popularTracks.slice(0, showAllPopular ? popularTracks.length : 4).map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-3 sm:gap-4 bg-spotify-gray/20 backdrop-blur-sm rounded-lg p-3 hover:bg-spotify-gray/40 transition-all cursor-pointer group"
                onClick={() => handlePlayTrack(track)}
              >
                <img
                  src={track.album_image || track.image || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80`}
                  alt={track.album_name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover"
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
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Browse by Genre</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {genres.map((genre) => (
            <div
              key={genre.name}
              className={`bg-gradient-to-br ${genre.gradient} rounded-lg p-4 sm:p-6 cursor-pointer hover:scale-105 transition-transform relative overflow-hidden group ${
                selectedGenre === genre.name ? 'ring-4 ring-white ring-opacity-50 scale-105' : ''
              }`}
              onClick={() => handleGenreClick(genre.name)}
            >
              <h3 className="text-lg sm:text-xl font-bold text-white">{genre.name}</h3>
              <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 text-2xl sm:text-4xl opacity-30 group-hover:opacity-50 transition-opacity">
                {genre.icon}
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
            </div>
          ))}
        </div>

        {/* Genre-specific music display */}
        {selectedGenre && (
          <div className="mt-6 md:mt-8">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                <span className={`bg-gradient-to-r ${genres.find(g => g.name === selectedGenre)?.gradient} bg-clip-text text-transparent`}>
                  {selectedGenre} Music
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedGenre(null)}
                  className="text-spotify-light-gray hover:text-white"
                >
                  ✕ Close
                </Button>
              </h3>
            </div>

            {genreLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-spotify-gray/30 p-3 sm:p-4 rounded-lg animate-pulse">
                    <div className="aspect-square bg-spotify-dark-gray rounded-md mb-3"></div>
                    <div className="h-4 bg-spotify-dark-gray rounded mb-2"></div>
                    <div className="h-3 bg-spotify-dark-gray rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : genreError ? (
              <div className="text-center py-8">
                <p className="text-spotify-light-gray">Unable to load {selectedGenre} music</p>
              </div>
            ) : genreTracks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {genreTracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    onPlay={handlePlayTrack}
                    isPlaying={isPlaying && currentTrack?.id === track.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-spotify-light-gray">No {selectedGenre} music found</p>
                <p className="text-spotify-light-gray text-sm mt-2">Try a different genre</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
