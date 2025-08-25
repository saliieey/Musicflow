#!/usr/bin/env node

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { config } from './config.js';

console.log('🚀 Setting up MusicFlow database...\n');

async function setupDatabase() {
  try {
    // First, connect to default postgres database to create our database
    const defaultPool = new Pool({
      host: config.DB_HOST,
      port: config.DB_PORT,
      database: 'postgres',
      user: config.DB_USER,
      password: config.DB_PASSWORD,
    });

    console.log('📡 Connecting to PostgreSQL...');
    
    // Check if our database exists
    const dbExists = await defaultPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [config.DB_NAME]
    );

    if (dbExists.rows.length === 0) {
      console.log(`📝 Creating database '${config.DB_NAME}'...`);
      await defaultPool.query(`CREATE DATABASE ${config.DB_NAME}`);
      console.log('✅ Database created successfully!');
    } else {
      console.log(`✅ Database '${config.DB_NAME}' already exists`);
    }

    await defaultPool.end();

    // Now connect to our database and run migrations
    const pool = new Pool({
      host: config.DB_HOST,
      port: config.DB_PORT,
      database: config.DB_NAME,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
    });

    const db = drizzle(pool);

    console.log('🔧 Running database migrations...');
    
    // Create tables if they don't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS playlists (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        tracks JSONB DEFAULT '[]'::jsonb NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        track_id TEXT NOT NULL,
        track_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    console.log('✅ Database tables created successfully!');
    console.log('🎉 Database setup complete!');
    console.log('\n📋 Database Details:');
    console.log(`   Host: ${config.DB_HOST}`);
    console.log(`   Port: ${config.DB_PORT}`);
    console.log(`   Database: ${config.DB_NAME}`);
    console.log(`   User: ${config.DB_USER}`);
    
    await pool.end();

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check your password in config.js');
    console.log('   3. Ensure PostgreSQL user has permission to create databases');
    process.exit(1);
  }
}

setupDatabase(); 