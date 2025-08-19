import { JamendoApiResponse } from "@/types/music";

const BASE_URL = "/api/jamendo";

export const jamendoApi = {
  async search(query: string, limit = 20): Promise<JamendoApiResponse> {
    const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) {
      throw new Error("Failed to search tracks");
    }
    return response.json();
  },

  async getTrending(limit = 20): Promise<JamendoApiResponse> {
    const response = await fetch(`${BASE_URL}/trending?limit=${limit}`);
    if (!response.ok) {
      throw new Error("Failed to fetch trending tracks");
    }
    return response.json();
  },

  async getByGenre(genre: string, limit = 20): Promise<JamendoApiResponse> {
    const response = await fetch(`${BASE_URL}/genres?genre=${encodeURIComponent(genre)}&limit=${limit}`);
    if (!response.ok) {
      throw new Error("Failed to fetch genre tracks");
    }
    return response.json();
  },
};
