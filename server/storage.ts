import { type User, type InsertUser, type Playlist, type InsertPlaylist, type Favorite, type InsertFavorite } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getUserPlaylists(userId: string): Promise<Playlist[]>;
  getPlaylist(id: string): Promise<Playlist | undefined>;
  createPlaylist(userId: string, playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: string, playlist: Partial<InsertPlaylist>): Promise<Playlist | undefined>;
  deletePlaylist(id: string): Promise<boolean>;
  addTrackToPlaylist(playlistId: string, track: any): Promise<Playlist | undefined>;
  removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<Playlist | undefined>;
  
  getUserFavorites(userId: string): Promise<Favorite[]>;
  addFavorite(userId: string, favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, trackId: string): Promise<boolean>;
  isFavorite(userId: string, trackId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private playlists: Map<string, Playlist>;
  private favorites: Map<string, Favorite>;

  constructor() {
    this.users = new Map();
    this.playlists = new Map();
    this.favorites = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    return Array.from(this.playlists.values()).filter(
      (playlist) => playlist.userId === userId
    );
  }

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    const playlist = this.playlists.get(id);
    
    return playlist;
  }

  async createPlaylist(userId: string, insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = randomUUID();
    const playlist: Playlist = {
      id,
      userId,
      name: insertPlaylist.name,
      description: insertPlaylist.description || null,
      tracks: insertPlaylist.tracks || [],
      createdAt: new Date(),
    };
    this.playlists.set(id, playlist);
    return playlist;
  }

  async updatePlaylist(id: string, updates: { name: string; description?: string }): Promise<Playlist | undefined> {
    const playlist = this.playlists.get(id);
    if (!playlist) return undefined;
    
    const updatedPlaylist = { ...playlist, ...updates } as Playlist;
    this.playlists.set(id, updatedPlaylist);
    return updatedPlaylist;
  }

  async deletePlaylist(id: string, userId: string): Promise<boolean> {
    const playlist = this.playlists.get(id);
    
    if (!playlist || playlist.userId !== userId) {
      return false;
    }

    this.playlists.delete(id);
    return true;
  }

  async addTrackToPlaylist(playlistId: string, track: any): Promise<Playlist | undefined> {
    const playlist = this.playlists.get(playlistId);
    
    if (!playlist) return undefined;

    // Add the track (duplicate check is handled in the route)
    const updated = { ...playlist, tracks: [...(playlist.tracks as any[]), track] } as Playlist;
    
    this.playlists.set(playlistId, updated);
    return updated;
  }

  async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<Playlist | undefined> {
    const playlist = this.playlists.get(playlistId);
    if (!playlist) return undefined;

    const updated = { ...playlist, tracks: (playlist.tracks as any[]).filter((t: any) => t.id !== trackId) } as Playlist;
    this.playlists.set(playlistId, updated);
    return updated;
  }

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter(
      (favorite) => favorite.userId === userId
    );
  }

  async addFavorite(userId: string, insertFavorite: InsertFavorite): Promise<Favorite> {
    // Check if this track is already in favorites for this user
    const existingFavorite = Array.from(this.favorites.values()).find(
      (fav) => fav.userId === userId && fav.trackId === insertFavorite.trackId
    );
    
    if (existingFavorite) {
      // If already exists, return the existing favorite instead of creating a duplicate
      return existingFavorite;
    }
    
    const id = randomUUID();
    const favorite: Favorite = {
      ...insertFavorite,
      id,
      userId,
      createdAt: new Date(),
    };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFavorite(userId: string, trackId: string): Promise<boolean> {
    const favorite = Array.from(this.favorites.values()).find(
      (fav) => fav.userId === userId && fav.trackId === trackId
    );
    
    if (!favorite) {
      return false;
    }
    
    const deleted = this.favorites.delete(favorite.id);
    
    return deleted;
  }

  async isFavorite(userId: string, trackId: string): Promise<boolean> {
    const result = Array.from(this.favorites.values()).some(
      (fav) => fav.userId === userId && fav.trackId === trackId
    );
    return result;
  }
}

export const storage = new MemStorage();
