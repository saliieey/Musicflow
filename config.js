// Configuration file for the MusicFlow app
export const config = {
  // Jamendo API Configuration
  JAMENDO_CLIENT_ID: "6853ac8d",
  
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // Database Configuration (you'll need to set this up)
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://username:password@localhost:5432/musicapp"
}; 