import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { config } from '../config';

// Create a PostgreSQL connection pool with optimized settings for Render
const pool = new Pool({
  // We use the full URL because it contains all the details correctly
  connectionString: config.DATABASE_URL,
  
  // ✅ Render requires SSL
  ssl: {
    rejectUnauthorized: false,
  },
  
  // Connection pool settings optimized for Render PostgreSQL
  max: 10, // Reduced from 20 to avoid connection limits
  min: 2, // Keep minimum connections alive
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  
  // Keep connections alive to prevent termination
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  
  // Statement timeout to prevent hanging queries
  statement_timeout: 30000,
  
  // Query timeout
  query_timeout: 30000,
});

// Handle pool errors to prevent crashes
pool.on('error', (err, client) => {
  console.error('⚠️  Database pool error:', err.message);
  // Don't exit the process, just log the error
  // The storage wrapper will handle fallback
});

// Handle connection events
pool.on('connect', (client) => {
  console.log('✅ New database client connected');
});

pool.on('remove', (client) => {
  console.log('⚠️  Database client removed from pool');
});

// Create drizzle instance
export const db = drizzle(pool);

// Test database connection
// silent: if true, don't log errors (useful for periodic checks)
export async function testConnection(silent: boolean = false) {
  try {
    const client = await pool.connect();
    if (!silent) {
      console.log('✅ Database connected successfully!');
    }
    client.release();
    return true;
  } catch (error: any) {
    // Only log errors if not silent (for initial connection check)
    if (!silent) {
      console.error('❌ Database connection failed:', error?.message || error);
    }
    return false;
  }
}

// Close database connection
export async function closeConnection() {
  await pool.end();
}