const axios = require('axios');

async function testLoginPage() {
  console.log('🧪 Testing login page functionality...');
  
  try {
    // Test accessing login page
    const response = await axios.get('http://localhost:5173');
    console.log('✅ Frontend accessible:', response.status);
    
    // Test login with correct admin credentials
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@projectflow.io',
      password: 'password'
    });
    
    console.log('✅ Login test:', loginResponse.status);
    console.log('Token received:', !!loginResponse.data.token);
    
    if (loginResponse.data.token) {
      console.log('🎉 Login is working correctly!');
    } else {
      console.log('❌ Login failed:', loginResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing login:', error.message);
  }
}

testLoginPage();
