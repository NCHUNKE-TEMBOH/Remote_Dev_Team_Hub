import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'remote_dev_hub',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Database query helper function
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
};

// Get a client from the pool for transactions
export const getClient = async () => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('❌ Error getting database client:', error);
    throw error;
  }
};

// Initialize database tables
export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database tables...');
    
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        firebase_uid VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        display_name VARCHAR(255),
        photo_url TEXT,
        role VARCHAR(50) DEFAULT 'team_member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create projects table
    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        color VARCHAR(7) DEFAULT '#1f2937',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create project_members table
    await query(`
      CREATE TABLE IF NOT EXISTS project_members (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, user_id)
      )
    `);

    // Create tasks table
    await query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'todo',
        priority VARCHAR(20) DEFAULT 'medium',
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        assigned_to INTEGER REFERENCES users(id),
        created_by INTEGER REFERENCES users(id),
        due_date TIMESTAMP,
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create code_snippets table
    await query(`
      CREATE TABLE IF NOT EXISTS code_snippets (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        language VARCHAR(50),
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        created_by INTEGER REFERENCES users(id),
        version INTEGER DEFAULT 1,
        parent_snippet_id INTEGER REFERENCES code_snippets(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create retrospectives table
    await query(`
      CREATE TABLE IF NOT EXISTS retrospectives (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        created_by INTEGER REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create retrospective_items table
    await query(`
      CREATE TABLE IF NOT EXISTS retrospective_items (
        id SERIAL PRIMARY KEY,
        retrospective_id INTEGER REFERENCES retrospectives(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        created_by INTEGER REFERENCES users(id),
        votes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create notifications table
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        type VARCHAR(50) NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

export default pool;
