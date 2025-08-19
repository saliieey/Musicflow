import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TrackList } from "@/components/track-list";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { jamendoApi } from "@/lib/jamendo-api";
import { JamendoTrack } from "@/types/music";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();

  const { data: searchData, isLoading } = useQuery({
    queryKey: ["search-tracks", searchQuery],
    queryFn: () => jamendoApi.search(searchQuery, 50),
    enabled: searchQuery.length > 2,
  });

  const tracks = searchData?.results || [];

  const handlePlayTrack = (track: JamendoTrack, queue?: JamendoTrack[]) => {
    playTrack(track, queue || tracks);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Search</h1>
        
        <div className="relative max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-spotify-light-gray w-4 h-4" />
          <Input
            type="text"
            placeholder="Search songs, artists, or albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-spotify-dark-gray/80 backdrop-blur-sm border-spotify-dark-gray text-white placeholder-spotify-light-gray focus:ring-spotify-green focus:border-transparent"
          />
        </div>
      </div>

      {searchQuery.length > 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {isLoading ? "Searching..." : `Results for "${searchQuery}"`}
          </h2>
          
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
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
            <TrackList
              tracks={tracks}
              onPlay={handlePlayTrack}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-spotify-light-gray">No results found for "{searchQuery}"</p>
              <p className="text-spotify-light-gray text-sm mt-2">Try different keywords or check your spelling</p>
            </div>
          )}
        </div>
      )}

      {searchQuery.length <= 2 && (
        <div className="text-center py-12">
          <SearchIcon className="w-16 h-16 text-spotify-light-gray mx-auto mb-4 opacity-50" />
          <p className="text-spotify-light-gray">Start typing to search for music</p>
          <p className="text-spotify-light-gray text-sm mt-2">Find songs, artists, and albums</p>
        </div>
      )}
    </div>
  );
}
