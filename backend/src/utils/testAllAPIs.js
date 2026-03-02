const http = require('http');

// Test dashboard API
console.log('🧪 Testing Core API Endpoints...\n');

const endpoints = [
  { path: '/api/health', name: 'Health Check' },
  { path: '/api/dashboard', name: 'Dashboard' },
  { path: '/api/tasks', name: 'Tasks' },
  { path: '/api/projects', name: 'Projects' },
  { path: '/api/users', name: 'Users' },
  { path: '/api/notifications', name: 'Notifications' },
  { path: '/api/v1/automation', name: 'Automation' }
];

endpoints.forEach((endpoint, index) => {
  setTimeout(() => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: endpoint.path,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ ${endpoint.name}: ${res.statusCode} ${res.statusMessage}`);
        if (endpoint.path === '/api/dashboard' && res.statusCode === 200) {
          try {
            const dashboardData = JSON.parse(data);
            console.log(`   📊 Dashboard Data: ${JSON.stringify(dashboardData).substring(0, 100)}...`);
          } catch (e) {
            console.log(`   📊 Dashboard Data: [Binary data]`);
          }
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${endpoint.name}: ${err.message}`);
    });

    req.end();
  }, index * 200); // Stagger requests
});
