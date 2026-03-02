const http = require('http');

// Test all critical API endpoints
const testEndpoints = [
  { name: 'Attendance Status', path: '/api/attendance/status/1', method: 'GET' },
  { name: 'Check-in', path: '/api/attendance/checkin', method: 'POST', body: '{"employeeId":"1"}' },
  { name: 'Check-out', path: '/api/attendance/checkout', method: 'POST', body: '{"employeeId":"1"}' },
  { name: 'Dashboard Stats', path: '/api/dashboard/stats', method: 'GET' },
  { name: 'Projects', path: '/api/projects', method: 'GET' },
  { name: 'Tasks', path: '/api/tasks', method: 'GET' },
  { name: 'Issues', path: '/api/issues', method: 'GET' },
  { name: 'Timesheets', path: '/api/timesheets', method: 'GET' },
  { name: 'Team Members', path: '/api/users/team', method: 'GET' },
  { name: 'Calendar Events', path: '/api/calendar/events', method: 'GET' },
  { name: 'Automation Rules', path: '/api/automation', method: 'GET' },
  { name: 'Reports', path: '/api/reports', method: 'GET' },
  { name: 'Admin Settings', path: '/api/admin/settings', method: 'GET' }
];

console.log('🔍 TESTING APPLICATION ENDPOINTS');
console.log('=====================================');

let successCount = 0;
let errorCount = 0;

testEndpoints.forEach((endpoint, index) => {
  setTimeout(() => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: endpoint.path,
      method: endpoint.method,
      headers: endpoint.body ? { 'Content-Type': 'application/json' } : {}
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ ${endpoint.name}: ${res.statusCode}`);
          successCount++;
        } else {
          console.log(`❌ ${endpoint.name}: ${res.statusCode}`);
          errorCount++;
        }
        
        if (index === testEndpoints.length - 1) {
          console.log('\n📊 SUMMARY');
          console.log('=====================================');
          console.log(`✅ Working: ${successCount}/${testEndpoints.length}`);
          console.log(`❌ Errors: ${errorCount}/${testEndpoints.length}`);
          console.log(`📈 Success Rate: ${Math.round((successCount / testEndpoints.length) * 100)}%`);
          
          if (successCount === testEndpoints.length) {
            console.log('\n🎉 ALL ENDPOINTS WORKING!');
          } else {
            console.log('\n⚠️  Some endpoints need attention');
          }
        }
      });
    });

    req.on('error', (e) => {
      console.log(`❌ ${endpoint.name}: Connection Error - ${e.message}`);
      errorCount++;
      
      if (index === testEndpoints.length - 1) {
        console.log('\n📊 SUMMARY');
        console.log('=====================================');
        console.log(`✅ Working: ${successCount}/${testEndpoints.length}`);
        console.log(`❌ Errors: ${errorCount}/${testEndpoints.length}`);
        console.log(`📈 Success Rate: ${Math.round((successCount / testEndpoints.length) * 100)}%`);
      }
    });

    if (endpoint.body) {
      req.write(endpoint.body);
    }
    req.end();
  }, index * 200); // Stagger requests to avoid overwhelming
});
