// Debug login functionality
import { useAuthStore } from './store/authStore';
import api from './utils/api';

// Test the login function directly
async function debugLogin() {
  console.log('🔍 Starting login debug...');
  
  try {
    // Test API connection first
    console.log('🌐 Testing API connection...');
    const healthResponse = await api.get('/health');
    console.log('✅ API health check:', healthResponse.data);
    
    // Test login
    console.log('🔐 Testing login...');
    const loginResponse = await api.post('/auth/login', {
      email: 'admin@workforce.io',
      password: 'password'
    });
    
    console.log('✅ Login response:', loginResponse.data);
    console.log('✅ Token received:', !!loginResponse.data.token);
    console.log('✅ User data:', loginResponse.data.user);
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('General error:', error.message);
    }
  }
}

debugLogin();
