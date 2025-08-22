import { Link, useLocation } from "wouter";
import { Home, Search, Heart, TrendingUp, Plus, List, Menu, X, LogIn, LogOut, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import { PlaylistDialog } from "@/components/playlist-dialog";
import { useMobile } from "@/hooks/use-mobile";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: "/search", icon: Search },
  { name: "Favorites", href: "/favorites", icon: Heart },
  { name: "Trending", href: "/trending", icon: TrendingUp },
];

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const [userId] = useLocalStorage("userId", "guest");
  const { user, isAuthenticated, logout } = useAuth();
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useMobile();

  const { data: playlists = [] } = useQuery({
    queryKey: ["/api/playlists", userId],
    enabled: !!userId,
  });

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [location, isMobile]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isMobileMenuOpen) {
        const sidebar = document.getElementById('mobile-sidebar');
        const menuButton = document.getElementById('mobile-menu-button');
        if (sidebar && !sidebar.contains(event.target as Node) && 
            menuButton && !menuButton.contains(event.target as Node)) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isMobileMenuOpen]);

  // Mobile menu button
  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button - Fixed positioning with proper z-index */}
        <div className="lg:hidden fixed top-3 left-3 z-[9999]">
          <Button
            id="mobile-menu-button"
            size="icon"
            variant="ghost"
            className="w-10 h-10 bg-spotify-dark-gray/95 border border-spotify-dark-gray/50 text-white hover:bg-spotify-dark-gray hover:scale-105 transition-all duration-200 shadow-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" />
        )}

        {/* Mobile Sidebar */}
        <div
          id="mobile-sidebar"
          className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-spotify-black border-r border-spotify-dark-gray z-[9999] transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-spotify-green flex items-center gap-2">
                <span>🎵</span>
                MusicFlow
              </h1>
              <Button
                size="icon"
                variant="ghost"
                className="text-spotify-light-gray hover:text-white hover:bg-spotify-dark-gray/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
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
                        className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
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
                          className={`flex items-center gap-3 px-3 py-3 text-spotify-light-gray hover:text-white transition-colors rounded-md hover:bg-spotify-dark-gray cursor-pointer ${
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
                onClick={() => {
                  setShowPlaylistDialog(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-3 text-spotify-light-gray hover:text-white transition-colors rounded-md hover:bg-spotify-dark-gray w-full justify-start mt-2"
              >
                <Plus className="w-5 h-5" />
                Create Playlist
              </Button>
            </div>

            {/* Authentication Section */}
            <div className="mt-8 border-t border-spotify-dark-gray/30 pt-6">
              {isAuthenticated && user ? (
                <div className="px-3 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{user.username}</p>
                      <p className="text-spotify-light-gray text-xs">Signed in</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors rounded-md w-full justify-start"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="px-3 space-y-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setLocation("/login");
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-3 text-spotify-light-gray hover:text-white transition-colors rounded-md hover:bg-spotify-dark-gray w-full justify-start"
                  >
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setLocation("/signup");
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-3 text-spotify-light-gray hover:text-white transition-colors rounded-md hover:bg-spotify-dark-gray w-full justify-start"
                  >
                    <User className="w-5 h-5" />
                    Create Account
                  </Button>
                </div>
              )}
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

  // Desktop Sidebar (unchanged)
  return (
    <>
      <div className="hidden lg:flex w-64 bg-spotify-black border-r border-spotify-dark-gray flex-col h-full">
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

          {/* Authentication Section */}
          <div className="mt-8 border-t border-spotify-dark-gray/30 pt-6">
            {isAuthenticated && user ? (
              <div className="px-3 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{user.username}</p>
                    <p className="text-spotify-light-gray text-xs">Signed in</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors rounded-md w-full justify-start"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="px-3 space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => setLocation("/login")}
                  className="flex items-center gap-3 px-3 py-2 text-spotify-light-gray hover:text-white transition-colors rounded-md hover:bg-spotify-dark-gray w-full justify-start"
                >
                  <LogIn className="w-5 h-5" />
                  Sign In
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setLocation("/signup")}
                  className="flex items-center gap-3 px-3 py-2 text-spotify-light-gray hover:text-white transition-colors rounded-md hover:bg-spotify-dark-gray w-full justify-start"
                >
                    <User className="w-5 h-5" />
                    Create Account
                  </Button>
              </div>
            )}
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
