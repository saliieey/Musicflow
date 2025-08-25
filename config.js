// Configuration file for the MusicFlow app
export const config = {
  // Jamendo API Configuration
  JAMENDO_CLIENT_ID: "6853ac8d",
  
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:your_password@localhost:5432/musicflow",
  
  // Database connection settings
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || "musicflow",
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "salihck0987%",
  
  // Session configuration
  SESSION_SECRET: process.env.SESSION_SECRET || "your-secret-key-change-this-in-production"
}; 