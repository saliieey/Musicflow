// Configuration file for the MusicFlow app
export const config = {
  // Jamendo API Configuration
  JAMENDO_CLIENT_ID: "6853ac8d",
  
  // Server Configuration
  PORT: process.env.PORT || 10000,
  NODE_ENV: process.env.NODE_ENV || "production",
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://musicflow_user:yQgtZP9SkpuMda6X0wGd0fftNOHHP66R@dpg-d2m6ac95pdvs73be0t40-a/musicflow_3txx",
  
  // Database connection settings
  DB_HOST: process.env.DB_HOST || "dpg-d2m6ac95pdvs73be0t40-a",
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || "musicflow_3txx",
  DB_USER: process.env.DB_USER || "musicflow_user",
  DB_PASSWORD: process.env.DB_PASSWORD || "yQgtZP9SkpuMda6X0wGd0fftNOHHP66R",
  
  // Session configuration
  SESSION_SECRET: process.env.SESSION_SECRET || "musicflow-secret-key-2024"
}; 

