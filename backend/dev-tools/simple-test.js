const axios = require('axios');

async function simpleTest() {
  try {
    console.log('🧪 Testing registration...');
    const response = await axios.post('http://localhost:3001/api/auth/register', {
      name: 'Test User',
      email: 'test123@example.com',
      password: 'test123',
      role: 'EMPLOYEE',
      department: 'General'
    });
    
    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

simpleTest();
