import { PostgresStorage } from './postgres-storage.js';
import { MemStorage, type IStorage } from './storage.js';
import { testConnection } from './database.js';

// Storage wrapper that falls back to MemStorage when database is unavailable
export class StorageWrapper implements IStorage {
  private postgresStorage: PostgresStorage;
  private memStorage: MemStorage;
  private usePostgres: boolean = false;
  private connectionCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.postgresStorage = new PostgresStorage();
    this.memStorage = new MemStorage();
    // Start with memory storage by default (safer)
    // Will switch to PostgreSQL if connection test succeeds
    this.usePostgres = false;
    console.log('📦 Storage wrapper initialized, checking database connection...');
    this.initializeStorage().catch((error) => {
      console.error('❌ Storage initialization error:', error);
      this.usePostgres = false;
    });
  }

  private async initializeStorage() {
    try {
      // Check database connection on startup with a timeout
      const dbConnected = await Promise.race([
        testConnection(),
        new Promise<boolean>((resolve) => {
          setTimeout(() => {
            console.warn('⏱️  Database connection check timed out');
            resolve(false);
          }, 5000); // 5 second timeout
        })
      ]);
      
      this.usePostgres = dbConnected;
      
      if (dbConnected) {
        console.log('✅ Database connected - using PostgreSQL storage');
      } else {
        console.log('⚠️  Database unavailable - using in-memory storage (fallback mode)');
        console.log('   Favorites will work but data will be lost on server restart');
      }
    } catch (error: any) {
      console.warn('⚠️  Database connection check failed, using in-memory storage');
      console.warn(`   Error: ${error?.message || 'Unknown error'}`);
      this.usePostgres = false;
    }

    // Periodically check database connection (every 30 seconds)
    // Only check if we're not using PostgreSQL (to avoid unnecessary checks)
    this.connectionCheckInterval = setInterval(async () => {
      if (!this.usePostgres) {
        try {
          // Use silent mode to avoid spamming errors in the terminal
          const connected = await Promise.race([
            testConnection(true), // silent = true to avoid error logs
            new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 3000))
          ]);
          if (connected) {
            console.log('✅ Database reconnected, switching to PostgreSQL storage');
            this.usePostgres = true;
          }
        } catch (error: any) {
          // Silently fail - we're already using memory storage
          // Don't log errors from periodic checks to avoid terminal spam
        }
      }
    }, 30000);
  }

  private async executeWithFallback<T>(
    operation: (storage: IStorage) => Promise<T>,
    operationName: string
  ): Promise<T> {
    // Always try PostgreSQL first if we think it's available
    // But catch ANY errors and fall back to memory (safer approach)
    if (this.usePostgres) {
      try {
        return await operation(this.postgresStorage);
      } catch (error: any) {
        // Log the error for debugging
        const errorMessage = error?.message || String(error);
        const errorCode = error?.code || '';
        const errorName = error?.name || '';
        
        console.warn(`⚠️  Database operation failed for ${operationName}, falling back to memory storage`);
        console.warn(`   Error: ${errorName} ${errorCode} - ${errorMessage}`);
        
        // Mark PostgreSQL as unavailable
        this.usePostgres = false;
        
        // Always fall back to memory storage for any error
        // This ensures the app continues working even with database issues
        try {
          const result = await operation(this.memStorage);
          console.log(`✅ Successfully used memory storage for ${operationName}`);
          return result;
        } catch (fallbackError: any) {
          console.error(`❌ Fallback to memory storage also failed for ${operationName}:`, fallbackError);
          // If even memory storage fails, that's a real problem
          throw fallbackError;
        }
      }
    } else {
      // Use memory storage directly
      try {
        return await operation(this.memStorage);
      } catch (error: any) {
        console.error(`❌ Memory storage operation failed for ${operationName}:`, error);
        throw error;
      }
    }
  }

  // User operations
  async getUser(id: string) {
    return this.executeWithFallback(
      (storage) => storage.getUser(id),
      'getUser'
    );
  }

  async getUserByUsername(username: string) {
    return this.executeWithFallback(
      (storage) => storage.getUserByUsername(username),
      'getUserByUsername'
    );
  }

  async createUser(user: any) {
    return this.executeWithFallback(
      (storage) => storage.createUser(user),
      'createUser'
    );
  }

  // Playlist operations
  async getUserPlaylists(userId: string) {
    return this.executeWithFallback(
      (storage) => storage.getUserPlaylists(userId),
      'getUserPlaylists'
    );
  }

  async getPlaylist(id: string) {
    return this.executeWithFallback(
      (storage) => storage.getPlaylist(id),
      'getPlaylist'
    );
  }

  async createPlaylist(userId: string, playlist: any) {
    return this.executeWithFallback(
      (storage) => storage.createPlaylist(userId, playlist),
      'createPlaylist'
    );
  }

  async updatePlaylist(id: string, updates: any) {
    return this.executeWithFallback(
      (storage) => storage.updatePlaylist(id, updates),
      'updatePlaylist'
    );
  }

  async deletePlaylist(id: string, userId: string) {
    return this.executeWithFallback(
      (storage) => storage.deletePlaylist(id, userId),
      'deletePlaylist'
    );
  }

  async addTrackToPlaylist(playlistId: string, track: any) {
    return this.executeWithFallback(
      (storage) => storage.addTrackToPlaylist(playlistId, track),
      'addTrackToPlaylist'
    );
  }

  async removeTrackFromPlaylist(playlistId: string, trackId: string) {
    return this.executeWithFallback(
      (storage) => storage.removeTrackFromPlaylist(playlistId, trackId),
      'removeTrackFromPlaylist'
    );
  }

  // Favorite operations
  async getUserFavorites(userId: string) {
    return this.executeWithFallback(
      (storage) => storage.getUserFavorites(userId),
      'getUserFavorites'
    );
  }

  async addFavorite(userId: string, favorite: any) {
    return this.executeWithFallback(
      (storage) => storage.addFavorite(userId, favorite),
      'addFavorite'
    );
  }

  async removeFavorite(userId: string, trackId: string) {
    return this.executeWithFallback(
      (storage) => storage.removeFavorite(userId, trackId),
      'removeFavorite'
    );
  }

  async isFavorite(userId: string, trackId: string) {
    return this.executeWithFallback(
      (storage) => storage.isFavorite(userId, trackId),
      'isFavorite'
    );
  }

  async cleanupDuplicateFavorites(): Promise<void> {
    // This is a no-op for the wrapper - cleanup is handled by individual storage implementations
    if (this.usePostgres) {
      try {
        await (this.postgresStorage as any).cleanupDuplicateFavorites();
      } catch (error) {
        // Ignore errors
      }
    }
  }

  // Cleanup
  destroy() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
  }
}

