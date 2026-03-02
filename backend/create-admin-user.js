const axios = require('axios');

async function createAdminUser() {
  console.log('👤 Creating admin user with correct credentials...');
  
  try {
    // Create admin user with correct password
    const response = await axios.post('http://localhost:3001/api/auth/register', {
      name: 'Admin Director',
      email: 'admin@projectflow.io',
      password: 'password', // Correct password from seed file
      role: 'MANAGING_DIRECTOR',
      department: 'Executive'
    });
    
    console.log('✅ Admin user created:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    // Now test login
    console.log('\n🔐 Testing admin login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@projectflow.io',
      password: 'password'
    });
    
    console.log('✅ Login Response:');
    console.log('Status:', loginResponse.status);
    console.log('Data:', JSON.stringify(loginResponse.data, null, 2));
    
    if (loginResponse.data.token) {
      console.log('🎉 Admin login successful!');
      
      // Test accessing protected route
      const testResponse = await axios.get('http://localhost:3001/api/users', {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      
      console.log('✅ Protected route access:', testResponse.status);
      console.log('Users retrieved:', testResponse.data.length);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

createAdminUser();
