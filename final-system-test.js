const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:5173';

async function runFinalSystemTest() {
  console.log('🚀 HRM & PMS - Final System Test');
  console.log('==================================\n');
  
  const results = [];
  
  // Test Backend API
  console.log('📡 Backend API Tests:');
  const backendTests = [
    { name: 'Health Check', url: `${API_BASE}/health`, method: 'GET' },
    { name: 'Auth Module', url: `${API_BASE}/auth`, method: 'GET' },
    { name: 'Holidays', url: `${API_BASE}/holidays`, method: 'GET' },
    { name: 'Users (Auth Required)', url: `${API_BASE}/users`, method: 'GET' },
    { name: 'Projects (Auth Required)', url: `${API_BASE}/projects`, method: 'GET' },
    { name: 'Dashboard (Auth Required)', url: `${API_BASE}/dashboard/stats`, method: 'GET' },
  ];
  
  for (const test of backendTests) {
    try {
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 3000
      });
      
      results.push({
        component: 'Backend API',
        name: test.name,
        status: '✅ WORKING',
        details: `Status: ${response.status}`
      });
      
    } catch (error) {
      const status = error.response ? error.response.status : 'No Response';
      const isExpected = status === 401; // Auth required is expected
      
      results.push({
        component: 'Backend API',
        name: test.name,
        status: isExpected ? '⚠️ EXPECTED' : '❌ FAILED',
        details: `Status: ${status} - ${error.response?.data?.message || error.message}`
      });
    }
  }
  
  // Test Frontend
  console.log('🌐 Frontend Tests:');
  try {
    const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 3000 });
    results.push({
      component: 'Frontend',
      name: 'React App',
      status: '✅ WORKING',
      details: `Status: ${frontendResponse.status}`
    });
  } catch (error) {
    results.push({
      component: 'Frontend',
      name: 'React App',
      status: '❌ FAILED',
      details: error.message
    });
  }
  
  // Test Database
  console.log('🗄️ Database Tests:');
  try {
    const { prisma } = require('./backend/src/prisma');
    await prisma.$connect();
    const userCount = await prisma.user.count();
    await prisma.$disconnect();
    
    results.push({
      component: 'Database',
      name: 'PostgreSQL Connection',
      status: '✅ WORKING',
      details: `${userCount} users found`
    });
  } catch (error) {
    results.push({
      component: 'Database',
      name: 'PostgreSQL Connection',
      status: '❌ FAILED',
      details: error.message
    });
  }
  
  // Print Results
  console.log('\n📊 Final Test Results:');
  console.log('======================');
  
  const summary = {
    working: 0,
    expected: 0,
    failed: 0
  };
  
  results.forEach(result => {
    console.log(`${result.status} ${result.component.padEnd(15)} | ${result.name.padEnd(25)} | ${result.details}`);
    
    if (result.status.includes('WORKING')) summary.working++;
    else if (result.status.includes('EXPECTED')) summary.expected++;
    else summary.failed++;
  });
  
  console.log('\n📈 System Summary:');
  console.log(`✅ Fully Working: ${summary.working}`);
  console.log(`⚠️ Expected Behavior: ${summary.expected}`);
  console.log(`❌ Failed: ${summary.failed}`);
  console.log(`📊 Total Tests: ${results.length}`);
  
  const successRate = ((summary.working + summary.expected) / results.length * 100).toFixed(1);
  console.log(`🎯 Success Rate: ${successRate}%`);
  
  if (summary.failed === 0) {
    console.log('\n🎉 ALL SYSTEMS OPERATIONAL!');
    console.log('✅ Backend API is running');
    console.log('✅ Frontend is accessible');
    console.log('✅ Database is connected');
    console.log('✅ All routes are loaded');
    console.log('\n🚀 HRM & PMS is ready for use!');
  } else {
    console.log('\n⚠️ Some issues need attention before full deployment.');
  }
}

runFinalSystemTest().catch(console.error);
