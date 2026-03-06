// Test frontend login functionality
import api from './src/utils/api.ts';

async function testFrontendLogin() {
  try {
    console.log('🔐 Testing frontend login...');
    
    // Test health endpoint first
    console.log('🌐 Testing health endpoint...');
    const healthResponse = await api.get('/health');
    console.log('✅ Health check successful:', healthResponse.data);
    
    // Test login endpoint
    console.log('🔐 Testing login endpoint...');
    const loginResponse = await api.post('/auth/login', {
      email: 'admin@workforce.io',
      password: 'password'
    });
    
    console.log('✅ Frontend login successful!');
    console.log('Status:', loginResponse.status);
    console.log('Token:', loginResponse.data.token ? 'Received' : 'Missing');
    console.log('User:', loginResponse.data.user ? loginResponse.data.user.email : 'Missing');
    console.log('User Role:', loginResponse.data.user ? loginResponse.data.user.role : 'Missing');
    console.log('Full response:', JSON.stringify(loginResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Frontend login failed:');
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
  }
}

testFrontendLogin();
