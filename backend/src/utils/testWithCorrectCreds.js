const http = require('http');

console.log('🔑 Testing with Correct Credentials...\n');

// Login with correct password
const loginOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const loginData = JSON.stringify({
  email: 'admin@projectflow.io',
  password: 'password'
});

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('🔐 Login Response:', res.statusCode);
    if (res.statusCode === 200) {
      try {
        const loginResult = JSON.parse(data);
        const token = loginResult.token;
        console.log('✅ Token obtained!');
        console.log('👤 User:', loginResult.user.name, '-', loginResult.user.role);
        
        // Test all endpoints with real token
        testAllEndpoints(token);
      } catch (e) {
        console.log('❌ Login Parse Error:', e.message);
      }
    } else {
      console.log('❌ Login Failed:', data);
    }
  });
});

loginReq.on('error', (err) => {
  console.log('❌ Login Error:', err.message);
});

loginReq.write(loginData);
loginReq.end();

function testAllEndpoints(token) {
  const endpoints = [
    { path: '/api/dashboard/stats', name: 'Dashboard' },
    { path: '/api/tasks', name: 'Tasks' },
    { path: '/api/projects', name: 'Projects' },
    { path: '/api/users', name: 'Users' },
    { path: '/api/notifications', name: 'Notifications' },
    { path: '/api/v1/automation', name: 'Automation' }
  ];

  console.log('\n🧪 Testing All Endpoints:');
  
  endpoints.forEach((endpoint, index) => {
    setTimeout(() => {
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: endpoint.path,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`✅ ${endpoint.name}: ${res.statusCode} ${res.statusMessage}`);
          if (endpoint.name === 'Dashboard' && res.statusCode === 200) {
            try {
              const dashboardData = JSON.parse(data);
              console.log(`   📊 Projects: ${dashboardData.totalProjects}, Tasks: ${dashboardData.totalTasks}, Users: ${dashboardData.totalUsers}`);
              console.log(`   🔔 Unread Notifications: ${dashboardData.unreadNotifications}`);
            } catch (e) {
              console.log('   📊 [Data parse error]');
            }
          }
          if (endpoint.name === 'Tasks' && res.statusCode === 200) {
            try {
              const tasksData = JSON.parse(data);
              console.log(`   📋 Tasks Count: ${tasksData.length}`);
            } catch (e) {
              console.log('   📋 [Tasks parse error]');
            }
          }
          if (endpoint.name === 'Notifications' && res.statusCode === 200) {
            try {
              const notifData = JSON.parse(data);
              console.log(`   🔔 Notifications Count: ${notifData.length}`);
            } catch (e) {
              console.log('   🔔 [Notifications parse error]');
            }
          }
        });
      });

      req.on('error', (err) => {
        console.log(`❌ ${endpoint.name}: ${err.message}`);
      });

      req.end();
    }, index * 300); // Stagger requests
  });
}
