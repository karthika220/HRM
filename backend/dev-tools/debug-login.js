const axios = require('axios');

async function debugLogin() {
  console.log('🔍 Debugging login endpoint...');
  
  try {
    // Test with different credentials to see error messages
    const testCases = [
      { email: '', password: '' },
      { email: 'test@test.com', password: 'wrong' },
      { email: 'admin@projectflow.io', password: 'wrong' },
      { email: 'admin@projectflow.io', password: 'password' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🧪 Testing: ${testCase.email || 'empty'} / ${testCase.password || 'empty'}`);
      
      try {
        const response = await axios.post('http://localhost:3001/api/auth/login', {
          email: testCase.email,
          password: testCase.password
        });
        
        console.log(`Status: ${response.status}`);
        console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
        
        if (response.status === 200) {
          console.log('✅ SUCCESS!');
        } else {
          console.log('❌ FAILED');
        }
        
      } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        if (error.response) {
          console.log(`Status: ${error.response.status}`);
          console.log(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Debug script error:', error.message);
  }
}

debugLogin();
