const { Pool } = require('pg');
const { randomUUID } = require('crypto');

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres.ulapsnjzjtmzdysmello',
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  database: 'postgres',
  password: 'Profitcast@2026',
  port: 5432,
  max: 3, // Further reduced to prevent pool exhaustion
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Connection timeout
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  }
}

// Simple user operations
const db = {
  async query(text, params) {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  },

  async createUser(userData) {
    const { name, email, password, role, department } = userData;
    const id = randomUUID();
    const query = `
      INSERT INTO users (id, name, email, password, role, department, createdat, updatedat)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, name, email, role, department, createdat as "createdAt"
    `;
    const result = await this.query(query, [id, name, email, password, role, department]);
    return result.rows[0];
  },

  async findUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.query(query, [email]);
    return result.rows[0];
  },

  async getAllUsers() {
    const query = 'SELECT id, name, email, role, department, createdat as "createdAt" FROM users ORDER BY createdat DESC';
    const result = await this.query(query);
    return result.rows;
  }
};

module.exports = { pool, testConnection, db };
