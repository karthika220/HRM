// Test admin login functionality
const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('🔐 Testing admin login...');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@workforce.io',
      password: 'password'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Admin login successful!');
    console.log('Status:', response.status);
    console.log('Token:', response.data.token ? 'Received' : 'Missing');
    console.log('User:', response.data.user ? response.data.user.email : 'Missing');
    console.log('User Role:', response.data.user ? response.data.user.role : 'Missing');
    console.log('Full response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Admin login failed:');
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

testAdminLogin();
