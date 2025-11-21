// Configuration file for the MusicFlow app
export const config = {
  // Jamendo API Configuration
  JAMENDO_CLIENT_ID: "6853ac8d",
  
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // ✅ FIX: Added "?ssl=true" at the end so Render accepts the connection
  DATABASE_URL: "postgresql://musicflow_db_user:2lvEtEzCPEWXTE3Q2wrhmLb813CvvQCe@dpg-d4g8vd24d50c73f9qbj0-a.oregon-postgres.render.com/musicflow_db?ssl=true",
  
  // Database connection settings
  DB_HOST: "dpg-d4g8vd24d50c73f9qbj0-a.oregon-postgres.render.com",
  DB_PORT: 5432,
  DB_NAME: "musicflow_db",
  DB_USER: "musicflow_db_user",
  DB_PASSWORD: "2lvEtEzCPEWXTE3Q2wrhmLb813CvvQCe",
  
  // Session configuration
  SESSION_SECRET: process.env.SESSION_SECRET || "your-secret-key-change-this-in-production"
};