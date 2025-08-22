import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlaylistDialog({ open, onOpenChange }: PlaylistDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [userId] = useLocalStorage("userId", "guest");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPlaylistMutation = useMutation({
    mutationFn: async () => {
      console.log("Creating playlist with userId:", userId);
      const result = await apiRequest("POST", "/api/playlists", {
        userId,
        name,
        description,
        tracks: [],
      });
      console.log("Playlist creation result:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Playlist created successfully:", data);
      
      // Invalidate ALL playlist queries to ensure proper sync
      queryClient.invalidateQueries({ 
        queryKey: ["/api/playlists"],
        exact: false 
      });
      
      // Also invalidate the specific query key used by the sidebar
      queryClient.invalidateQueries({ 
        queryKey: ["/api/playlists", "user", userId],
        exact: true 
      });
      
      // Force refetch the sidebar playlists
      queryClient.refetchQueries({ 
        queryKey: ["/api/playlists", "user", userId],
        exact: true 
      });
      
      toast({
        title: "Playlist created",
        description: `"${name}" has been added to your library.`,
      });
      setName("");
      setDescription("");
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Playlist creation error:", error);
      toast({
        title: "Failed to create playlist",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createPlaylistMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[400px] mx-auto bg-spotify-gray border-spotify-dark-gray rounded-lg p-4 sm:p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-white text-lg sm:text-xl font-semibold">Create New Playlist</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-spotify-light-gray text-sm font-medium">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Playlist #1"
              className="bg-spotify-dark-gray border-spotify-dark-gray text-white placeholder-spotify-light-gray h-10 sm:h-11 text-sm sm:text-base"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-spotify-light-gray text-sm font-medium">
              Description (optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="bg-spotify-dark-gray border-spotify-dark-gray text-white placeholder-spotify-light-gray text-sm sm:text-base resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-spotify-light-gray hover:text-white h-10 sm:h-9 order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || createPlaylistMutation.isPending}
              className="bg-spotify-green hover:bg-spotify-green/90 text-black h-10 sm:h-9 order-1 sm:order-2 flex-1 sm:flex-none"
            >
              {createPlaylistMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
