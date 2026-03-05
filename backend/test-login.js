// Test login from Node.js to simulate frontend behavior
const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔐 Testing login with admin@workforce.io...');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@workforce.io',
      password: 'password'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', response.data.token ? 'Received' : 'Missing');
    console.log('User:', response.data.user ? response.data.user.email : 'Missing');
    console.log('Full response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Login failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      console.log('Network error - no response received');
      console.log('Request:', error.request);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLogin();
