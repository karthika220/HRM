const axios = require('axios');

async function checkUsers() {
  console.log('🔍 Checking existing users in database...');
  
  try {
    // First login with a test user to get token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'test1772195038052@example.com',
      password: 'test123'
    });
    
    if (loginResponse.data.token) {
      console.log('✅ Got token, fetching users...');
      
      const usersResponse = await axios.get('http://localhost:3001/api/users', {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      
      console.log('✅ Existing users:');
      usersResponse.data.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}, Name: ${user.name}, Role: ${user.role}`);
      });
      
      // Check if admin user exists
      const adminUser = usersResponse.data.find(u => u.email === 'admin@projectflow.io');
      if (adminUser) {
        console.log('✅ Admin user found in database');
      } else {
        console.log('❌ Admin user NOT found in database');
        console.log('Available emails:', usersResponse.data.map(u => u.email));
      }
      
    } else {
      console.log('❌ Failed to get token for user check');
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  }
}

checkUsers();
