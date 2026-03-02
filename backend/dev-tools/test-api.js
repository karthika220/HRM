const axios = require('axios');

async function testAPI() {
  console.log('🧪 Testing ProjectFlow API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing Health Endpoint:');
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Health Check:', JSON.stringify(healthResponse.data, null, 2));
    console.log('');

    // Test user registration
    console.log('2. Testing User Registration:');
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
      role: 'EMPLOYEE'
    };

    const registerResponse = await axios.post('http://localhost:3001/api/auth/register', userData);
    console.log('✅ Registration Successful:', JSON.stringify(registerResponse.data, null, 2));
    console.log('');

    // Test user login
    console.log('3. Testing User Login:');
    const loginData = {
      email: 'test@example.com',
      password: 'password'
    };

    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', loginData);
    console.log('✅ Login Successful:', JSON.stringify(loginResponse.data, null, 2));
    console.log('');

    // Test getting users (if token exists)
    if (loginResponse.data.token) {
      console.log('4. Testing Get Users:');
      const usersResponse = await axios.get('http://localhost:3001/api/users', {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      console.log('✅ Users Retrieved:', JSON.stringify(usersResponse.data, null, 2));
    }

    console.log('\n🎉 All API tests completed successfully!');

  } catch (error) {
    console.error('❌ API Test Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

testAPI();
