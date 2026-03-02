const axios = require('axios');

async function testAdminLogin() {
  console.log('🧪 Testing admin login...');
  
  try {
    // Test with hardcoded admin credentials from login page
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@projectflow.io',
      password: 'password123'
    });
    
    console.log('✅ Login Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.token) {
      console.log('✅ Admin login successful!');
      console.log('Token:', response.data.token.substring(0, 50) + '...');
      
      // Test accessing protected route with admin token
      const testResponse = await axios.get('http://localhost:3001/api/users', {
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      });
      
      console.log('✅ Protected route access:', testResponse.status);
      console.log('Users data length:', testResponse.data.length);
    }
    
  } catch (error) {
    console.error('❌ Admin login failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testAdminLogin();
