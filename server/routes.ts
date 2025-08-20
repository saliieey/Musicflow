import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlaylistSchema, insertFavoriteSchema } from "@shared/schema";
import { config } from "../config.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Playlists API
  app.get("/api/playlists", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const playlists = await storage.getUserPlaylists(userId);
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch playlists" });
    }
  });

  app.post("/api/playlists", async (req, res) => {
    try {
      const userId = req.body.userId;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const validatedData = insertPlaylistSchema.parse(req.body);
      const playlist = await storage.createPlaylist(userId, validatedData);
      res.status(201).json(playlist);
    } catch (error) {
      res.status(400).json({ error: "Invalid playlist data" });
    }
  });

  app.put("/api/playlists/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertPlaylistSchema.partial().parse(req.body);
      const playlist = await storage.updatePlaylist(id, validatedData);
      
      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      
      res.json(playlist);
    } catch (error) {
      res.status(400).json({ error: "Invalid playlist data" });
    }
  });

  app.delete("/api/playlists/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePlaylist(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete playlist" });
    }
  });

  // Favorites API
  app.get("/api/favorites", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const favorites = await storage.getUserFavorites(userId);
      
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const userId = req.body.userId;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const validatedData = insertFavoriteSchema.parse(req.body);
      
      // Check if already exists
      const existingFavorite = await storage.isFavorite(userId, validatedData.trackId);
      if (existingFavorite) {
        // Return success but indicate it was already favorited
        return res.status(200).json({ 
          message: "Track already in favorites",
          alreadyExists: true 
        });
      }
      
      const favorite = await storage.addFavorite(userId, validatedData);
      
      res.status(201).json(favorite);
    } catch (error) {
      res.status(400).json({ error: "Invalid favorite data" });
    }
  });

  app.delete("/api/favorites/:trackId", async (req, res) => {
    try {
      const { trackId } = req.params;
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      // Check if favorite exists before trying to remove
      const exists = await storage.isFavorite(userId, trackId);
      
      if (!exists) {
        return res.status(404).json({ error: "Favorite not found" });
      }
      
      const removed = await storage.removeFavorite(userId, trackId);
      
      if (!removed) {
        return res.status(404).json({ error: "Favorite not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  app.get("/api/favorites/:trackId/check", async (req, res) => {
    try {
      const { trackId } = req.params;
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const isFavorite = await storage.isFavorite(userId, trackId);
      
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ error: "Failed to check favorite status" });
    }
  });

  // Cleanup duplicate favorites endpoint
  app.post("/api/favorites/cleanup", async (req, res) => {
    try {
      await storage.cleanupDuplicateFavorites();
      res.json({ message: "Duplicate favorites cleaned up successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to cleanup duplicate favorites" });
    }
  });

  // Jamendo API proxy endpoints
  app.get("/api/jamendo/search", async (req, res) => {
    try {
      const { q, limit = 20 } = req.query;
      const clientId = config.JAMENDO_CLIENT_ID;
      
      if (!q) {
        return res.status(400).json({ error: "Search query is required" });
      }

      if (!clientId) {
        return res.status(503).json({ 
          error: "Jamendo API key required",
          message: "Please provide a JAMENDO_CLIENT_ID environment variable"
        });
      }

      const response = await fetch(
        `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&search=${encodeURIComponent(q as string)}&limit=${limit}&include=musicinfo&audioformat=mp32`
      );
      
      if (!response.ok) {
        throw new Error("Jamendo API request failed");
      }
      
      const data = await response.json();
      
      if (data.headers?.status === "failed") {
        return res.status(503).json({
          error: "Jamendo API Error",
          message: data.headers.error_message || "API request failed"
        });
      }
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to search tracks" });
    }
  });

  app.get("/api/jamendo/trending", async (req, res) => {
    try {
      const { limit = 20 } = req.query;
      const clientId = config.JAMENDO_CLIENT_ID;
      
      if (!clientId) {
        return res.status(503).json({ 
          error: "Jamendo API key required",
          message: "Please provide a valid JAMENDO_CLIENT_ID. Go to https://developer.jamendo.com/ to get a free API key."
        });
      }
      
      const response = await fetch(
        `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&order=popularity_total&limit=${limit}&include=musicinfo&audioformat=mp32`
      );
      
      if (!response.ok) {
        throw new Error("Jamendo API request failed");
      }
      
      const data = await response.json();
      
      if (data.headers?.status === "failed") {
        return res.status(503).json({
          error: "Jamendo API Error", 
          message: `${data.headers.error_message}. Please check your API key at https://developer.jamendo.com/`
        });
      }
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trending tracks" });
    }
  });

  app.get("/api/jamendo/genres", async (req, res) => {
    try {
      const { genre, limit = 20 } = req.query;
      const clientId = config.JAMENDO_CLIENT_ID;
      
      if (!genre) {
        return res.status(400).json({ error: "Genre is required" });
      }

      if (!clientId) {
        return res.status(503).json({ 
          error: "Jamendo API key required",
          message: "Please provide a JAMENDO_CLIENT_ID environment variable"
        });
      }

      const response = await fetch(
        `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&tags=${encodeURIComponent(genre as string)}&limit=${limit}&include=musicinfo&audioformat=mp32`
      );
      
      if (!response.ok) {
        throw new Error("Jamendo API request failed");
      }
      
      const data = await response.json();
      
      if (data.headers?.status === "failed") {
        return res.status(503).json({
          error: "Jamendo API Error",
          message: data.headers.error_message || "API request failed"
        });
      }
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch genre tracks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
