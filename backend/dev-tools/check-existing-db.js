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

async function checkExistingDatabase() {
  console.log('🔍 Checking existing database structure...');
  
  try {
    const client = await pool.connect();
    
    // Check all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Existing tables:');
    if (tables.rows.length === 0) {
      console.log('  No tables found');
    } else {
      tables.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    
    // Check if users table exists and show its structure
    if (tables.rows.some(row => row.table_name === 'users')) {
      console.log('\n👤 Users table structure:');
      const userColumns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `);
      
      userColumns.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable}) ${row.column_default || ''}`);
      });
      
      // Check existing data
      const userCount = await client.query('SELECT COUNT(*) as count FROM users');
      console.log(`\n📊 Users count: ${userCount.rows[0].count}`);
      
      if (parseInt(userCount.rows[0].count) > 0) {
        const sampleUsers = await client.query('SELECT id, name, email, role, "createdAt" FROM users LIMIT 5');
        console.log('\n👥 Sample users:');
        sampleUsers.rows.forEach(row => {
          console.log(`  - ${row.name} (${row.email}) - ${row.role}`);
        });
      }
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await pool.end();
  }
}

checkExistingDatabase();
