const axios = require('axios');

async function finalTest() {
  try {
    console.log('🧪 Testing API with new user...');
    
    // Create new user
    const registerResponse = await axios.post('http://localhost:3001/api/auth/register', {
      name: 'Final Test User',
      email: 'finaltest@example.com',
      password: 'test123',
      role: 'EMPLOYEE',
      department: 'Testing'
    });
    
    console.log('✅ User registered successfully!');
    
    // Login
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'finaltest@example.com',
      password: 'test123'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', loginResponse.data.token.substring(0, 50) + '...');
    
    // Test protected route
    const usersResponse = await axios.get('http://localhost:3001/api/users', {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('✅ Protected route working!');
    console.log('Users count:', usersResponse.data.length);
    
    console.log('\n🎉 All tests passed! API is fully functional!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

finalTest();
