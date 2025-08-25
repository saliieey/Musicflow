import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { config } from '../config.js';

// Create a PostgreSQL connection pool
const pool = new Pool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
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