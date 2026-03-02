const { Pool } = require('pg');
const { randomUUID } = require('crypto');

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

async function testInsert() {
  console.log('🧪 Testing database insert...');
  
  try {
    const client = await pool.connect();
    
    // First, let's see the table structure
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Table structure:');
    tableInfo.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable})`);
    });
    
    // Test simple insert
    const id = randomUUID();
    const query = `
      INSERT INTO users (id, name, email, password, role, department, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, name, email, role, department, "createdAt"
    `;
    
    console.log('🔍 Query:', query);
    console.log('🔍 Params:', [id, 'Test User', 'test@example.com', 'hashedpassword', 'EMPLOYEE', 'General']);
    
    const result = await client.query(query, [id, 'Test User', 'test@example.com', 'hashedpassword', 'EMPLOYEE', 'General']);
    
    console.log('✅ Insert successful:', result.rows[0]);
    
    client.release();
    
  } catch (error) {
    console.error('❌ Insert error:', error.message);
    console.error('Error details:', error);
  } finally {
    await pool.end();
  }
}

testInsert();
