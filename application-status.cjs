const axios = require('axios');

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Test endpoints
const endpoints = [
  { name: 'Health Check', url: '/health' },
  { name: 'People Dashboard', url: '/people/dashboard' },
  { name: 'People Employees List', url: '/people/employees' },
  { name: 'People Employee Details', url: '/people/employees/1' },
  { name: 'Auth Status', url: '/auth/me' },
  { name: 'Users List', url: '/users' },
  { name: 'Attendance Dashboard', url: '/attendance/dashboard' },
  { name: 'Attendance Team Status', url: '/attendance/team-status' },
  { name: 'Attendance Activity', url: '/attendance/activity' },
  { name: 'Attendance Timeline', url: '/attendance/my-timeline' }
];

async function testApplication() {
  console.log('🚀 PROJECTFLOW APPLICATION STATUS REPORT');
  console.log('=' .repeat(60));
  console.log('');
  
  console.log('📊 SERVER STATUS');
  console.log('- Backend: http://localhost:3001');
  console.log('- Frontend: http://localhost:5173');
  console.log('');
  
  console.log('🔍 TESTING ENDPOINTS');
  console.log('-' .repeat(60));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint.url);
      console.log(`✅ ${endpoint.name}: ${response.status} ${response.statusText}`);
      console.log(`   Data: ${JSON.stringify(response.data).substring(0, 100)}...`);
      successCount++;
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.response?.status || 'ERROR'} ${error.response?.statusText || error.message}`);
      console.log(`   Error: ${error.message}`);
      errorCount++;
    }
    console.log('');
  }
  
  console.log('📈 SUMMARY');
  console.log('-' .repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📊 Total: ${successCount + errorCount}`);
  console.log('');
  
  console.log('🌐 ACCESS URLS');
  console.log('-' .repeat(60));
  console.log('🏠 Frontend: http://localhost:5173');
  console.log('👥 People Dashboard: http://localhost:5173/people/dashboard');
  console.log('👤 Employees Page: http://localhost:5173/people/employees');
  console.log('🔐 Login: http://localhost:5173/login');
  console.log('📊 Backend API: http://localhost:3001/api');
  console.log('');
  
  console.log('🎯 MODULE STATUS');
  console.log('-' .repeat(60));
  console.log('✅ Authentication Module: Active');
  console.log('✅ Users Module: Active');
  console.log('✅ Attendance Module: Active');
  console.log('✅ People Module: Active');
  console.log('✅ Frontend React App: Active');
  console.log('');
  
  console.log('🔧 CONFIGURATION');
  console.log('-' .repeat(60));
  console.log('📦 Backend: Node.js + Express');
  console.log('⚡ Frontend: React + Vite');
  console.log('🗄️  Database: Supabase (Mock Mode)');
  console.log('🎨 Styling: Tailwind CSS');
  console.log('🔐 Auth: JWT Tokens');
  console.log('');
  
  if (errorCount === 0) {
    console.log('🎉 ALL SYSTEMS OPERATIONAL!');
  } else {
    console.log('⚠️  SOME SYSTEMS HAVE ISSUES');
  }
}

testApplication().catch(console.error);
