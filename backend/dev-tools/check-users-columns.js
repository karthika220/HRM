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

async function checkUsersColumns() {
  console.log('🔍 Checking users table columns...');
  
  try {
    const client = await pool.connect();
    
    // Get exact column info for users table
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Users table columns:');
    columns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable}) Default: ${row.column_default || 'None'}`);
    });
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error checking columns:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsersColumns();
