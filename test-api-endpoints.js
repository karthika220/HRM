const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');
  
  const tests = [
    { name: 'Health Check', url: `${API_BASE}/health`, method: 'GET' },
    { name: 'Auth Route', url: `${API_BASE}/auth`, method: 'GET' },
    { name: 'Users List', url: `${API_BASE}/users`, method: 'GET' },
    { name: 'Projects', url: `${API_BASE}/projects`, method: 'GET' },
    { name: 'Tasks', url: `${API_BASE}/tasks`, method: 'GET' },
    { name: 'Dashboard', url: `${API_BASE}/dashboard/stats`, method: 'GET' },
    { name: 'Reports', url: `${API_BASE}/reports`, method: 'GET' },
    { name: 'Notifications', url: `${API_BASE}/notifications`, method: 'GET' },
    { name: 'Calendar', url: `${API_BASE}/calendar`, method: 'GET' },
    { name: 'Attendance', url: `${API_BASE}/attendance`, method: 'GET' },
    { name: 'Timesheets', url: `${API_BASE}/timesheets`, method: 'GET' },
    { name: 'Issues', url: `${API_BASE}/issues`, method: 'GET' },
    { name: 'HR', url: `${API_BASE}/hr`, method: 'GET' },
    { name: 'Automation', url: `${API_BASE}/automation`, method: 'GET' },
    { name: 'Holidays', url: `${API_BASE}/holidays`, method: 'GET' },
    { name: 'Escalations', url: `${API_BASE}/escalations`, method: 'GET' },
    { name: 'Centralized', url: `${API_BASE}/centralized`, method: 'GET' },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 5000
      });
      
      results.push({
        name: test.name,
        status: '✅ PASS',
        statusCode: response.status,
        message: 'Endpoint responding'
      });
      
    } catch (error) {
      const status = error.response ? error.response.status : 'No Response';
      const message = error.response ? error.response.data?.message || error.message : error.message;
      
      results.push({
        name: test.name,
        status: status === 401 ? '⚠️ AUTH' : status === 404 ? '❌ NOT FOUND' : '❌ FAIL',
        statusCode: status,
        message: message
      });
    }
  }

  // Print results
  console.log('📊 Test Results:');
  console.log('================');
  
  let passed = 0, failed = 0, auth = 0;
  
  results.forEach(result => {
    console.log(`${result.status} ${result.name.padEnd(15)} (${result.statusCode}) - ${result.message}`);
    
    if (result.status.includes('PASS')) passed++;
    else if (result.status.includes('AUTH')) auth++;
    else failed++;
  });
  
  console.log('\n📈 Summary:');
  console.log(`✅ Working: ${passed}`);
  console.log(`⚠️ Need Auth: ${auth}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All core endpoints are accessible!');
  }
}

testEndpoints().catch(console.error);
