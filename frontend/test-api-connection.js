// Test API connection from frontend perspective
import api from './src/utils/api.js';

async function testConnection() {
  console.log('🔍 Testing API connection...');
  
  try {
    // Test health endpoint
    console.log('🌐 Testing health endpoint...');
    const healthResponse = await api.get('/health');
    console.log('✅ Health check successful:', healthResponse.data);
    
    // Test login endpoint
    console.log('🔐 Testing login endpoint...');
    const loginResponse = await api.post('/auth/login', {
      email: 'admin@workforce.io',
      password: 'password'
    });
    console.log('✅ Login test successful:', loginResponse.data);
    
  } catch (error) {
    console.error('❌ API connection test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      config: error.config
    });
  }
}

testConnection();
