const axios = require('axios');

async function testAuthRoot() {
  try {
    console.log('🧪 Testing GET /api/auth route...');
    
    const response = await axios.get('http://localhost:3001/api/auth');
    
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

testAuthRoot();
