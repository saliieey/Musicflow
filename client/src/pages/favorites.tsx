import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { TrackList } from "@/components/track-list";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { JamendoTrack } from "@/types/music";

export default function Favorites() {
  const [userId] = useLocalStorage("userId", "guest");
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["/api/favorites", userId],
    enabled: !!userId,
  });

  const tracks: JamendoTrack[] = (favorites as any[]).map((fav: any) => fav.trackData);

  const handlePlayTrack = (track: JamendoTrack, queue?: JamendoTrack[]) => {
    playTrack(track, queue || tracks);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Liked Songs</h1>
          <p className="text-spotify-light-gray text-sm sm:text-base">{tracks.length} songs</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 sm:gap-4 px-2 sm:px-4 py-2 animate-pulse">
              <div className="col-span-1 flex items-center justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-spotify-dark-gray rounded"></div>
              </div>
              <div className="col-span-6 flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-spotify-dark-gray rounded flex-shrink-0"></div>
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
              <div className="col-span-1 sm:col-span-1"></div>
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
        <div className="text-center py-8 sm:py-12">
          <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-spotify-light-gray mx-auto mb-4 opacity-50" />
          <p className="text-spotify-light-gray">No liked songs yet</p>
          <p className="text-spotify-light-gray text-sm mt-2">Songs you like will appear here</p>
        </div>
      )}
    </div>
  );
}
