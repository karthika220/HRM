const axios = require('axios');

async function createAndTestUser() {
  console.log('👤 Creating new test user...');
  
  try {
    // Create new user
    const registerResponse = await axios.post('http://localhost:3001/api/auth/register', {
      name: 'Test Manager',
      email: 'manager@example.com',
      password: 'manager123',
      role: 'HR_MANAGER',
      department: 'Human Resources'
    });
    
    console.log('✅ User created successfully');
    
    // Test login
    console.log('\n🔐 Testing login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'manager@example.com',
      password: 'manager123'
    });
    
    console.log('✅ Login successful');
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

createAndTestUser();
