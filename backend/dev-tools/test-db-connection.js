const { Pool } = require('pg');

async function testConnection() {
  console.log('🔍 Testing different connection formats...\n');

  const connectionOptions = [
    {
      name: 'Connection String Format',
      config: {
        connectionString: 'postgresql://postgres.fIUHOiqkQSzl_6k_KH2n3g_2kbFWCgB@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
        ssl: { rejectUnauthorized: false }
      }
    },
    {
      name: 'Explicit Parameters',
      config: {
        user: 'postgres',
        host: 'aws-0-us-east-1.pooler.supabase.com',
        database: 'postgres',
        password: 'fIUHOiqkQSzl_6k_KH2n3g_2kbFWCgB',
        port: 6543,
        ssl: { rejectUnauthorized: false }
      }
    },
    {
      name: 'Alternative Host',
      config: {
        user: 'postgres',
        host: 'db.ulapsnjzjtmzdysmello.supabase.co',
        database: 'postgres',
        password: 'fIUHOiqkQSzl_6k_KH2n3g_2kbFWCgB',
        port: 5432,
        ssl: { rejectUnauthorized: false }
      }
    }
  ];

  for (const option of connectionOptions) {
    console.log(`Testing: ${option.name}`);
    try {
      const pool = new Pool(option.config);
      const client = await pool.connect();
      console.log('✅ SUCCESS: Connected successfully');
      
      // Test a simple query
      const result = await client.query('SELECT NOW() as current_time, version() as version');
      console.log('📊 Query result:', result.rows[0]);
      
      client.release();
      await pool.end();
      console.log('✅ Connection closed\n');
      return true;
      
    } catch (error) {
      console.log('❌ FAILED:', error.message);
      console.log('');
    }
  }
  
  return false;
}

testConnection().then(success => {
  if (success) {
    console.log('🎉 Found working connection!');
  } else {
    console.log('❌ All connection attempts failed');
    console.log('\n📝 Please check:');
    console.log('1. Supabase project is active');
    console.log('2. Database credentials are correct');
    console.log('3. Connection pooling is enabled in Supabase');
    console.log('4. IP whitelisting (if applicable)');
  }
});
