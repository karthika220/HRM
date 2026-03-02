const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

async function testLoginFlow() {
  try {
    console.log('=== TESTING LOGIN FLOW ===\n');

    // Get or create a Managing Director user
    let user = await prisma.user.findFirst({
      where: { role: 'MANAGING_DIRECTOR' }
    });

    if (!user) {
      console.log('Creating Managing Director user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await prisma.user.create({
        data: {
          email: 'md@projectflow.com',
          password: hashedPassword,
          name: 'Managing Director',
          role: 'MANAGING_DIRECTOR',
          department: 'Management'
        }
      });
      console.log('✅ Created MD user:', user.email);
    } else {
      console.log('✅ Found existing MD user:', user.email);
    }

    // Test login (same as frontend would do)
    console.log('\n🔐 Testing login...');
    
    // Verify password
    const validPassword = await bcrypt.compare('password123', user.password);
    if (!validPassword) {
      console.log('❌ Password verification failed');
      return;
    }

    // Create token exactly like the auth route does
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET || 'your-secret-key-fallback', 
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful');
    console.log(`🔑 Token: ${token.substring(0, 30)}...`);

    // Test the automation API with this token
    console.log('\n🔄 Testing automation API with valid token...');
    
    const AutomationService = require('./src/services/AutomationService');
    
    // Simulate the auth middleware
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-fallback');
    console.log('✅ Token decoded successfully');
    console.log(`👤 User ID: ${decoded.userId}`);

    // Get the user from database
    const authUser = await prisma.user.findUnique({ 
      where: { id: decoded.userId } 
    });

    if (!authUser || !authUser.isActive) {
      console.log('❌ User not found or inactive');
      return;
    }

    console.log('✅ User authenticated:', authUser.name, authUser.role);

    // Test automation service with authenticated user
    const rules = await AutomationService.getAllRules();
    console.log(`✅ Automation rules accessible: ${rules.length} rules found`);

    // Test role-based access
    if (['MANAGING_DIRECTOR', 'HR'].includes(authUser.role)) {
      console.log('✅ User has automation access rights');
    } else {
      console.log('❌ User lacks automation access rights');
    }

    console.log('\n=== FRONTEND SETUP INSTRUCTIONS ===');
    console.log('1. Login with these credentials:');
    console.log(`   Email: ${user.email}`);
    console.log('   Password: password123');
    console.log('2. The frontend should receive this token format:');
    console.log(`   {"token": "${token.substring(0, 30)}...", "user": {...}}`);
    console.log('3. The frontend stores token in localStorage and sends it in Authorization header');
    console.log('4. The automation API should then work correctly');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLoginFlow();
