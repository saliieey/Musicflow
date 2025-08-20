import { Link, useLocation } from "wouter";
import { Home, Search, Heart, TrendingUp, Plus, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useState } from "react";
import { PlaylistDialog } from "@/components/playlist-dialog";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: "/search", icon: Search },
  { name: "Favorites", href: "/favorites", icon: Heart },
  { name: "Trending", href: "/trending", icon: TrendingUp },
];

export function Sidebar() {
  const [location] = useLocation();
  const [userId] = useLocalStorage("userId", "guest");
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);

  const { data: playlists = [] } = useQuery({
    queryKey: ["/api/playlists", userId],
    enabled: !!userId,
  });

  return (
    <>
      <div className="w-64 bg-spotify-black border-r border-spotify-dark-gray flex flex-col h-full">
        {/* Logo */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-spotify-green flex items-center gap-2">
            <span>🎵</span>
            MusicFlow
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <a
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActive
                          ? "text-white bg-spotify-dark-gray"
                          : "text-spotify-light-gray hover:text-white hover:bg-spotify-dark-gray"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Playlists Section */}
          <div className="mt-8">
            <h3 className="text-spotify-light-gray font-semibold mb-4 px-3">
              Your Playlists
            </h3>
            <ul className="space-y-2">
              {(playlists as any[]).map((playlist: any) => {
                const isActive = location === `/playlist/${playlist.id}`;
                return (
                  <li key={playlist.id}>
                    <Link href={`/playlist/${playlist.id}`}>
                      <a
                        className={`flex items-center gap-3 px-3 py-2 text-spotify-light-gray hover:text-white transition-colors rounded-md hover:bg-spotify-dark-gray cursor-pointer ${
                          isActive ? "text-white bg-spotify-dark-gray" : ""
                        }`}
                      >
                        <List className="w-5 h-5" />
                        <span className="truncate">{playlist.name}</span>
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Button
              variant="ghost"
              onClick={() => setShowPlaylistDialog(true)}
              className="flex items-center gap-3 px-3 py-2 text-spotify-light-gray hover:text-white transition-colors rounded-md hover:bg-spotify-dark-gray w-full justify-start mt-2"
            >
              <Plus className="w-5 h-5" />
              Create Playlist
            </Button>
          </div>
        </nav>
      </div>

      <PlaylistDialog
        open={showPlaylistDialog}
        onOpenChange={setShowPlaylistDialog}
      />
    </>
  );
}
