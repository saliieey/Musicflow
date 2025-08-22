import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { Sidebar } from "@/components/sidebar";
import { MusicPlayer } from "@/components/music-player";
import Home from "./pages/home";
import Search from "./pages/search";
import Favorites from "./pages/favorites";
import Trending from "./pages/trending";
import PlaylistPage from "./pages/playlist";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import NotFound from "./pages/not-found";
import { useEffect } from "react";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/trending" component={Trending} />
      <Route path="/playlist/:id" component={PlaylistPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const [location] = useLocation();
  
  // Check if we're on an authentication page
  const isAuthPage = location === "/login" || location === "/signup";
  
  // Enable dark mode by default for Spotify-like theme
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  
  return (
    <div className="flex h-screen bg-spotify-black text-white font-inter overflow-hidden">
      {/* Sidebar - hidden on auth pages */}
      {!isAuthPage && <Sidebar />}
      
      {/* Main Content - full width on auth pages, adjusted on other pages */}
      <div className={`flex-1 flex flex-col bg-gradient-to-b from-purple-900/20 to-spotify-black ${!isAuthPage ? 'lg:ml-0' : ''}`}>
        <main className={`flex-1 overflow-y-auto ${!isAuthPage ? 'pb-32 lg:pb-32' : ''}`}>
          <Router />
        </main>
      </div>
      
      {/* Music Player - hidden on auth pages */}
      {!isAuthPage && <MusicPlayer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppLayout />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
