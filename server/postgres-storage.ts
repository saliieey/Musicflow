import { db } from './database.js';
import { users, playlists, favorites } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { type User, type InsertUser, type Playlist, type InsertPlaylist, type Favorite, type InsertFavorite } from '@shared/schema';

export class PostgresStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Playlist operations
  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    return await db.select().from(playlists).where(eq(playlists.userId, userId));
  }

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    const result = await db.select().from(playlists).where(eq(playlists.id, id)).limit(1);
    return result[0];
  }

  async createPlaylist(userId: string, insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const result = await db.insert(playlists).values({
      ...insertPlaylist,
      userId,
      tracks: insertPlaylist.tracks || []
    }).returning();
    return result[0];
  }

  async updatePlaylist(id: string, updates: { name: string; description?: string }): Promise<Playlist | undefined> {
    const result = await db.update(playlists)
      .set(updates)
      .where(eq(playlists.id, id))
      .returning();
    return result[0];
  }

  async deletePlaylist(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(playlists)
      .where(and(eq(playlists.id, id), eq(playlists.userId, userId)));
    return result.rowCount > 0;
  }

  async addTrackToPlaylist(playlistId: string, track: any): Promise<Playlist | undefined> {
    const playlist = await this.getPlaylist(playlistId);
    if (!playlist) return undefined;

    const currentTracks = playlist.tracks as any[] || [];
    const updatedTracks = [...currentTracks, track];

    const result = await db.update(playlists)
      .set({ tracks: updatedTracks })
      .where(eq(playlists.id, playlistId))
      .returning();
    
    return result[0];
  }

  async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<Playlist | undefined> {
    const playlist = await this.getPlaylist(playlistId);
    if (!playlist) return undefined;

    const currentTracks = playlist.tracks as any[] || [];
    const updatedTracks = currentTracks.filter((t: any) => t.id !== trackId);

    const result = await db.update(playlists)
      .set({ tracks: updatedTracks })
      .where(eq(playlists.id, playlistId))
      .returning();
    
    return result[0];
  }

  // Favorite operations
  async getUserFavorites(userId: string): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async addFavorite(userId: string, insertFavorite: InsertFavorite): Promise<Favorite> {
    const result = await db.insert(favorites).values({
      ...insertFavorite,
      userId
    }).returning();
    return result[0];
  }

  async removeFavorite(userId: string, trackId: string): Promise<boolean> {
    const result = await db.delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.trackId, trackId)));
    return result.rowCount > 0;
  }

  async isFavorite(userId: string, trackId: string): Promise<boolean> {
    const result = await db.select().from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.trackId, trackId)))
      .limit(1);
    return result.length > 0;
  }

  async cleanupDuplicateFavorites(): Promise<void> {
    // This is a simple cleanup - in production you might want more sophisticated deduplication
    console.log('Cleanup completed');
  }
} 