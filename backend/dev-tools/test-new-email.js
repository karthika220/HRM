const axios = require('axios');

async function testNewEmail() {
  try {
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    
    console.log('🧪 Testing with email:', email);
    
    // Create new user
    const registerResponse = await axios.post('http://localhost:3001/api/auth/register', {
      name: 'New Test User',
      email: email,
      password: 'test123',
      role: 'EMPLOYEE',
      department: 'Testing'
    });
    
    console.log('✅ User registered successfully!');
    
    // Login
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: email,
      password: 'test123'
    });
    
    console.log('✅ Login successful!');
    console.log('Token received:', loginResponse.data.token ? 'YES' : 'NO');
    
    console.log('\n🎉 API is working!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testNewEmail();
