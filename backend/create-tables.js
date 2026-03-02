const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres.ulapsnjzjtmzdysmello',
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  database: 'postgres',
  password: 'Profitcast@2026',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTables() {
  console.log('🔨 Creating database tables...');

  try {
    const client = await pool.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'EMPLOYEE',
        avatar TEXT,
        avatarUrl TEXT,
        phone TEXT,
        "managerId" TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Users table created');

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_isActive ON users(isActive);');

    console.log('✅ Indexes created');

    // Test the table
    const result = await client.query('SELECT COUNT(*) FROM users');
    console.log(`📊 Users table count: ${result.rows[0].count}`);

    client.release();
    console.log('🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await pool.end();
  }
}

createTables();
