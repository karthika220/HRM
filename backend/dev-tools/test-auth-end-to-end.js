const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const express = require('express');

const prisma = new PrismaClient();

async function testAuthEndToEnd() {
  try {
    console.log('=== AUTH END-TO-END TEST ===\n');

    // 1. Check environment
    console.log('1. Environment Check:');
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET || 'using fallback'}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

    // 2. Get or create test user
    console.log('\n2. User Setup:');
    let user = await prisma.user.findFirst({
      where: { role: 'MANAGING_DIRECTOR' }
    });

    if (!user) {
      console.log('   Creating new MD user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await prisma.user.create({
        data: {
          email: 'md@projectflow.com',
          password: hashedPassword,
          name: 'Managing Director',
          role: 'MANAGING_DIRECTOR',
          department: 'Management',
          isActive: true
        }
      });
    } else {
      console.log(`   Found existing user: ${user.email}`);
    }

    // 3. Test login route directly
    console.log('\n3. Testing Login Route:');
    const app = express();
    app.use(express.json());
    
    // Import auth routes
    const authRoutes = require('./src/routes/auth');
    app.use('/api/auth', authRoutes);

    // Test login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: 'password123'
      });

    console.log(`   Login Status: ${loginResponse.status}`);
    if (loginResponse.status === 200) {
      console.log('   ✅ Login successful');
      console.log(`   Token received: ${loginResponse.body.token ? 'YES' : 'NO'}`);
      console.log(`   User data: ${loginResponse.body.user ? 'YES' : 'NO'}`);
      
      const token = loginResponse.body.token;
      
      // 4. Test automation API with the token
      console.log('\n4. Testing Automation API:');
      const automationApp = express();
      automationApp.use(express.json());
      
      // Import automation routes
      const automationRoutes = require('./src/routes/automation');
      automationApp.use('/api/automation', automationRoutes);
      
      const autoResponse = await request(automationApp)
        .get('/api/automation')
        .set('Authorization', `Bearer ${token}`);

      console.log(`   Automation API Status: ${autoResponse.status}`);
      if (autoResponse.status === 200) {
        console.log(`   ✅ Rules found: ${autoResponse.body.length}`);
        autoResponse.body.forEach((rule, index) => {
          console.log(`     ${index + 1}. ${rule.name} (${rule.active ? 'ACTIVE' : 'INACTIVE'})`);
        });
      } else {
        console.log(`   ❌ Error: ${autoResponse.body.error || autoResponse.body.message}`);
      }

    } else {
      console.log(`   ❌ Login failed: ${loginResponse.body.message}`);
    }

    // 5. Manual token test
    console.log('\n5. Manual Token Test:');
    const manualToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key-fallback',
      { expiresIn: '7d' }
    );

    try {
      const decoded = jwt.verify(manualToken, process.env.JWT_SECRET || 'your-secret-key-fallback');
      console.log(`   ✅ Token verification: SUCCESS`);
      console.log(`   User ID in token: ${decoded.userId}`);
      
      const dbUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
      console.log(`   ✅ User found in DB: ${dbUser ? dbUser.name : 'NO'}`);
      
    } catch (err) {
      console.log(`   ❌ Token verification: FAILED - ${err.message}`);
    }

    console.log('\n=== RECOMMENDATIONS ===');
    console.log('1. Use these credentials to login:');
    console.log(`   Email: ${user.email}`);
    console.log('   Password: password123');
    console.log('2. Make sure frontend is pointing to correct backend URL');
    console.log('3. Check browser console for CORS or network errors');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Install supertest if needed
try {
  require('supertest');
  testAuthEndToEnd();
} catch (err) {
  console.log('Installing supertest...');
  const { execSync } = require('child_process');
  execSync('npm install supertest', { stdio: 'inherit', cwd: process.cwd() });
  testAuthEndToEnd();
}
