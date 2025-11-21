import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { config } from '../config';

// Create a PostgreSQL connection pool
const pool = new Pool({
  // We use the full URL because it contains all the details correctly
  connectionString: config.DATABASE_URL,
  
  // ✅ THIS IS THE FIX: Render requires SSL
  ssl: {
    rejectUnauthorized: false,
  },
  
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Increased timeout slightly
});

// Create drizzle instance
export const db = drizzle(pool);

// Test database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully!');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Close database connection
export async function closeConnection() {
  await pool.end();
}