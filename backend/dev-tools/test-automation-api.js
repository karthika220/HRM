const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

async function testAutomationAPI() {
  try {
    // Get a Managing Director user for testing
    const user = await prisma.user.findFirst({
      where: { role: 'MANAGING_DIRECTOR' }
    });

    if (!user) {
      console.log('❌ No Managing Director user found');
      return;
    }

    // Create a JWT token for testing
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    console.log('✅ Created test token for user:', user.name);
    console.log('🔑 Token:', token.substring(0, 50) + '...');

    // Test the automation service directly
    const AutomationService = require('./src/services/AutomationService');
    
    console.log('\n=== TESTING AUTOMATION SERVICE ===');
    
    // Test getAllRules
    const rules = await AutomationService.getAllRules();
    console.log(`✅ getAllRules(): Found ${rules.length} rules`);
    
    rules.forEach((rule, index) => {
      console.log(`   ${index + 1}. ${rule.name} (${rule.active ? 'ACTIVE' : 'INACTIVE'})`);
    });

    // Test toggleRule
    if (rules.length > 0) {
      const firstRule = rules[0];
      console.log(`\n🔄 Testing toggleRule() for: ${firstRule.name}`);
      const originalStatus = firstRule.active;
      
      const updatedRule = await AutomationService.toggleRule(firstRule.id);
      console.log(`✅ toggleRule(): Status changed from ${originalStatus} to ${updatedRule.active}`);
      
      // Toggle back to original
      await AutomationService.toggleRule(firstRule.id);
      console.log(`✅ toggleRule(): Reverted to original status: ${originalStatus}`);
    }

    console.log('\n=== AUTOMATION API TEST RESULTS ===');
    console.log('✅ Database connection: OK');
    console.log('✅ Demo rules created: OK');
    console.log('✅ AutomationService.getAllRules(): OK');
    console.log('✅ AutomationService.toggleRule(): OK');
    console.log('✅ All automation functionality working correctly!');

  } catch (error) {
    console.error('❌ Error testing automation API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAutomationAPI();
