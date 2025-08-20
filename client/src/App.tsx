import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import { MusicPlayer } from "@/components/music-player";
import Home from "./pages/home";
import Search from "./pages/search";
import Favorites from "./pages/favorites";
import Trending from "./pages/trending";
import NotFound from "./pages/not-found";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/trending" component={Trending} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Enable dark mode by default for Spotify-like theme
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-spotify-black text-white font-inter overflow-hidden">
          <Sidebar />
          
          <div className="flex-1 flex flex-col bg-gradient-to-b from-purple-900/20 to-spotify-black">
            <main className="flex-1 overflow-y-auto pb-32">
              <Router />
            </main>
          </div>
          
          <MusicPlayer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
