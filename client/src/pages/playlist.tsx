import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Play, Heart, MoreHorizontal, Clock, Trash2, Edit, Share2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackList } from "@/components/track-list";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { JamendoTrack } from "@/types/music";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function PlaylistPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/playlist/:id");
  const [userId] = useLocalStorage("userId", "guest");
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // State for edit dialog
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Get playlist ID from URL params
  const playlistId = params?.id;

  const { data: playlist, isLoading } = useQuery({
    queryKey: ["/api/playlists", playlistId],
    enabled: !!playlistId,
  });

  const tracks: JamendoTrack[] = (playlist?.tracks as any[]) || [];

  // Initialize edit form when playlist data loads
  useEffect(() => {
    if (playlist) {
      setEditName(playlist.name || "");
      setEditDescription(playlist.description || "");
    }
  }, [playlist]);

  const handlePlayTrack = (track: JamendoTrack, queue?: JamendoTrack[]) => {
    playTrack(track, queue || tracks);
  };

  // Edit playlist mutation
  const editPlaylistMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", `/api/playlists/${playlistId}`, {
        name: editName,
        description: editDescription,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/playlists"],
        exact: false 
      });
      
      toast({
        title: "Playlist updated",
        description: "Playlist details have been updated successfully",
      });
      setIsEditOpen(false);
    },
    onError: () => {
      toast({
        title: "Failed to update playlist",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Delete playlist mutation
  const deletePlaylistMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/playlists/${playlistId}?userId=${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/playlists"],
        exact: false 
      });
      
      toast({
        title: "Playlist deleted",
        description: "Playlist has been deleted successfully",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Failed to delete playlist",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Share playlist
  const handleSharePlaylist = async () => {
    try {
      const shareInfo = await apiRequest("GET", `/api/playlists/${playlistId}/share`);
      
      // Copy playlist URL to clipboard
      await navigator.clipboard.writeText(shareInfo.shareUrl);
      
      toast({
        title: "Playlist link copied!",
        description: "Share this link with your friends",
      });
    } catch (error) {
      toast({
        title: "Failed to share playlist",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const removeTrackMutation = useMutation({
    mutationFn: async (trackId: string) => {
      return apiRequest("DELETE", `/api/playlists/${playlistId}/tracks/${trackId}`, {});
    },
    onSuccess: (_, trackId) => {
      // Invalidate ALL playlist queries to ensure proper sync
      queryClient.invalidateQueries({ 
        queryKey: ["/api/playlists"],
        exact: false 
      });
      
      toast({
        title: "Track removed",
        description: "Track has been removed from playlist",
      });
    },
    onError: () => {
      toast({
        title: "Failed to remove track",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleRemoveTrack = (trackId: string) => {
    removeTrackMutation.mutate(trackId);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-64 bg-spotify-gray/30 rounded-lg mb-6"></div>
          <div className="space-y-4">
            <div className="h-8 bg-spotify-gray/30 rounded w-1/3"></div>
            <div className="h-4 bg-spotify-gray/30 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="p-6 text-center">
        <p className="text-spotify-light-gray">Playlist not found</p>
        <Button 
          onClick={() => setLocation("/")}
          className="mt-4"
        >
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          className="text-spotify-light-gray hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Playlist Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSharePlaylist}
            className="text-spotify-light-gray hover:text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-spotify-light-gray hover:text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Playlist</DialogTitle>
                <DialogDescription>
                  Update your playlist name and description.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Playlist name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Playlist description (optional)"
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => editPlaylistMutation.mutate()}
                  disabled={!editName.trim()}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{playlist.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deletePlaylistMutation.mutate()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Playlist
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Playlist Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-lg opacity-90 mb-4">{playlist.description}</p>
          )}
          <p className="text-lg opacity-90 mb-6">
            {tracks.length} {tracks.length === 1 ? 'song' : 'songs'}
          </p>
          <div className="flex gap-3">
            <Button 
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              onClick={() => tracks.length > 0 && handlePlayTrack(tracks[0], tracks)}
            >
              <Play className="w-5 h-5 mr-2" />
              Play All
            </Button>
            
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-purple-600 px-6 py-3 rounded-full font-semibold transition-colors"
              onClick={() => setLocation("/")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Songs
            </Button>
          </div>
        </div>
      </div>

      {/* Tracks */}
      {tracks.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Tracks</h2>
            <p className="text-spotify-light-gray">{tracks.length} songs</p>
          </div>
          
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-spotify-light-gray text-sm font-medium border-b border-spotify-dark-gray/30">
              <div className="col-span-1">#</div>
              <div className="col-span-6">Title</div>
              <div className="col-span-3">Album</div>
              <div className="col-span-1">
                <Clock className="w-4 h-4" />
              </div>
              <div className="col-span-1"></div>
            </div>
            
            {/* Track List */}
            {tracks.map((track, index) => {
              const isCurrentTrack = currentTrack?.id === track.id;
               
              return (
                <div
                  key={track.id}
                  className={cn(
                    "grid grid-cols-12 gap-4 px-4 py-2 rounded-md transition-colors cursor-pointer group",
                    "hover:bg-spotify-gray/30",
                    isCurrentTrack && "bg-spotify-gray/50"
                  )}
                  onClick={() => handlePlayTrack(track, tracks)}
                >
                  <div className="col-span-1 flex items-center">
                    <div className="relative">
                      <span className={cn(
                        "text-spotify-light-gray text-sm group-hover:opacity-0 transition-opacity",
                        isCurrentTrack && isPlaying && "opacity-0"
                      )}>
                        {index + 1}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                          "absolute inset-0 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity",
                          isCurrentTrack && isPlaying && "opacity-100"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayTrack(track, tracks);
                        }}
                      >
                        <Play className="w-3 h-3 fill-white" />
                      </Button>
                    </div>
                  </div>
                   
                  <div className="col-span-6 flex items-center gap-3 min-w-0">
                    <img
                      src={track.album_image || track.image || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50`}
                      alt={track.album_name}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="min-w-0">
                      <p className={cn(
                        "font-medium text-sm truncate",
                        isCurrentTrack ? "text-spotify-green" : "text-white"
                      )}>
                        {track.name}
                      </p>
                      <p className="text-spotify-light-gray text-xs truncate">
                        {track.artist_name}
                      </p>
                    </div>
                  </div>
                   
                  <div className="col-span-3 flex items-center">
                    <p className="text-spotify-light-gray text-sm truncate">
                      {track.album_name}
                    </p>
                  </div>
                   
                  <div className="col-span-1 flex items-center">
                    <p className="text-spotify-light-gray text-sm">
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                   
                  <div className="col-span-1 flex items-center justify-end">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-6 h-6 text-spotify-light-gray hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTrack(track.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-spotify-light-gray">No tracks in this playlist yet</p>
          <p className="text-spotify-light-gray text-sm mt-2">Add some songs to get started</p>
          <Button
            onClick={() => setLocation("/")}
            className="mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Songs
          </Button>
        </div>
      )}
    </div>
  );
} 