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
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Heart className="w-8 h-4 text-white fill-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Liked Songs</h1>
          <p className="text-spotify-light-gray">{tracks.length} songs</p>
        </div>
      </div>

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
          <Heart className="w-16 h-16 text-spotify-light-gray mx-auto mb-4 opacity-50" />
          <p className="text-spotify-light-gray">No liked songs yet</p>
          <p className="text-spotify-light-gray text-sm mt-2">Songs you like will appear here</p>
        </div>
      )}
    </div>
  );
}
