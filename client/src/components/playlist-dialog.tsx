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
      return apiRequest("POST", "/api/playlists", {
        userId,
        name,
        description,
        tracks: [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      toast({
        title: "Playlist created",
        description: `"${name}" has been added to your library.`,
      });
      setName("");
      setDescription("");
      onOpenChange(false);
    },
    onError: () => {
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
      <DialogContent className="sm:max-w-md bg-spotify-gray border-spotify-dark-gray">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Playlist</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-spotify-light-gray">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Playlist #1"
              className="bg-spotify-dark-gray border-spotify-dark-gray text-white placeholder-spotify-light-gray"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-spotify-light-gray">
              Description (optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="bg-spotify-dark-gray border-spotify-dark-gray text-white placeholder-spotify-light-gray"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-spotify-light-gray hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || createPlaylistMutation.isPending}
              className="bg-spotify-green hover:bg-spotify-green/90 text-black"
            >
              {createPlaylistMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
