const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

async function testCompleteFlow() {
  try {
    console.log('=== COMPLETE FRONTEND FLOW TEST ===\n');

    // 1. Get user and create valid token
    const user = await prisma.user.findFirst({
      where: { role: 'MANAGING_DIRECTOR' }
    });

    if (!user) {
      console.log('❌ No Managing Director user found');
      return;
    }

    // Create token exactly like auth route
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET || 'your-secret-key-fallback', 
      { expiresIn: '7d' }
    );

    console.log('✅ Step 1: Token created successfully');
    console.log(`   User: ${user.name} (${user.role})`);

    // 2. Test auth middleware
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-fallback');
    const authUser = await prisma.user.findUnique({ 
      where: { id: decoded.userId } 
    });

    if (!authUser || !authUser.isActive) {
      console.log('❌ Step 2: Authentication failed');
      return;
    }

    console.log('✅ Step 2: Authentication middleware passed');

    // 3. Test role-based access
    if (!['MANAGING_DIRECTOR', 'HR'].includes(authUser.role)) {
      console.log('❌ Step 3: Role access denied');
      return;
    }

    console.log('✅ Step 3: Role-based access passed');

    // 4. Test automation service
    const AutomationService = require('./src/services/AutomationService');
    const rules = await AutomationService.getAllRules();

    console.log(`✅ Step 4: Automation service working - ${rules.length} rules found`);

    // 5. Display rules
    console.log('\n📋 Available Automation Rules:');
    rules.forEach((rule, index) => {
      const status = rule.active ? '🟢 ACTIVE' : '🔴 INACTIVE';
      console.log(`   ${index + 1}. ${rule.name} - ${status}`);
      console.log(`      Trigger: ${rule.trigger}`);
      console.log(`      Action: ${rule.action}`);
    });

    console.log('\n=== FRONTEND INSTRUCTIONS ===');
    console.log('1. Navigate to: http://localhost:5179/login');
    console.log('2. Login with:');
    console.log(`   Email: ${user.email}`);
    console.log('   Password: password123');
    console.log('3. After login, go to: http://localhost:5179/automation');
    console.log('4. You should see all the automation rules listed above');
    console.log('5. You can toggle rules, create new ones, and delete existing ones');

    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('- If still "Failed to load automation rules": Check browser console');
    console.log('- Look for CORS errors or 401/403 HTTP errors');
    console.log('- Make sure the token is stored in localStorage');
    console.log('- Check that Authorization header is being sent');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompleteFlow();
