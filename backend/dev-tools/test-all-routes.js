const axios = require('axios');

async function testAllRoutes() {
  const baseURL = 'http://localhost:3001';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5Mjg0MjFkOS1kNGU2LTQyYmQtOTJjNS0xYmQ0OWFjZjAzZTAiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwicm9sZSI6IkVNUExPWUVFIiwiaWF0IjoxNzcyMTkzMTMzLCJleHAiOjE3NzIyNzk1MzN9.I0_56f0EwUelkYCnkJp7ULai_DQnyyaPlP0uN2h_MeI';

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

  console.log('🧪 Testing All API Routes...\n');

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

  console.log('🎯 Route Testing Complete!');
}

testAllRoutes();
