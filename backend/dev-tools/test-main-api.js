const axios = require('axios');

async function testMainAPI() {
  const baseURL = 'http://localhost:3001';
  
  console.log('🧪 Testing Main API with Fresh Login...\n');

  try {
    // Step 1: Login to get fresh token
    console.log('1. Getting fresh token...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'john.doe@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    console.log('');

    // Step 2: Test all routes with fresh token
    const routes = [
      // Health Check
      { method: 'GET', path: '/api/health', auth: false },
      
      // Auth Routes
      { method: 'GET', path: '/api/auth/me', auth: true },
      
      // User Routes  
      { method: 'GET', path: '/api/users', auth: true },
      { method: 'GET', path: '/api/user/me', auth: true },
      
      // Project Routes
      { method: 'GET', path: '/api/projects', auth: true },
      
      // Task Routes
      { method: 'GET', path: '/api/tasks', auth: true },
      
      // Timesheet Routes
      { method: 'GET', path: '/api/timesheets', auth: true },
      
      // Dashboard Routes
      { method: 'GET', path: '/api/dashboard/stats', auth: true },
      
      // Issue Routes
      { method: 'GET', path: '/api/issues', auth: true },
      
      // Notification Routes
      { method: 'GET', path: '/api/notifications', auth: true },
      
      // Calendar Routes
      { method: 'GET', path: '/api/calendar/events', auth: true },
      
      // Report Routes
      { method: 'GET', path: '/api/reports', auth: true },
      
      // Automation Routes
      { method: 'GET', path: '/api/automation', auth: true },
    ];

    console.log('2. Testing all routes...\n');

    for (const route of routes) {
      try {
        const config = {
          method: route.method,
          url: `${baseURL}${route.path}`,
        };
        
        if (route.auth) {
          config.headers = {
            'Authorization': `Bearer ${token}`
          };
        }

        const response = await axios(config);
        
        console.log(`✅ ${route.method} ${route.path}`);
        if (typeof response.data === 'object' && response.data !== null) {
          console.log(`   Status: ${response.status} | Data: ${JSON.stringify(response.data).substring(0, 100)}...`);
        } else {
          console.log(`   Status: ${response.status} | Data: ${response.data}`);
        }
        
      } catch (error) {
        if (error.response) {
          console.log(`❌ ${route.method} ${route.path}`);
          console.log(`   Status: ${error.response.status} | Error: ${error.response.data?.message || error.response.data}`);
        } else {
          console.log(`❌ ${route.method} ${route.path}`);
          console.log(`   Error: ${error.message}`);
        }
      }
      console.log('');
    }

    console.log('🎉 Main API Testing Complete!');

  } catch (error) {
    console.error('❌ Login failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testMainAPI();
