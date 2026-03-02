const axios = require('axios');

async function createTestUser() {
  console.log('👤 Creating test user...');
  
  try {
    const response = await axios.post('http://localhost:3001/api/auth/register', {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'MANAGING_DIRECTOR',
      department: 'Management'
    });
    
    console.log('✅ User created successfully:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Test login
    console.log('\n🔐 Testing login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful:');
    console.log('Token:', loginResponse.data.token.substring(0, 50) + '...');
    
    return loginResponse.data.token;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

createTestUser();
