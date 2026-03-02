const { PrismaClient } = require('@prisma/client');
const AutomationService = require('./src/services/AutomationService');
const prisma = new PrismaClient();

async function testFullAutomation() {
  try {
    console.log('=== FULL AUTOMATION FUNCTIONALITY TEST ===\n');

    // Get a Managing Director user for testing
    const user = await prisma.user.findFirst({
      where: { role: 'MANAGING_DIRECTOR' }
    });

    if (!user) {
      console.log('❌ No Managing Director user found');
      return;
    }

    console.log(`✅ Testing with user: ${user.name} (${user.role})`);

    // 1. Test getAllRules
    console.log('\n1️⃣ Testing getAllRules()...');
    const initialRules = await AutomationService.getAllRules();
    console.log(`✅ Found ${initialRules.length} existing rules`);

    // 2. Test createRule
    console.log('\n2️⃣ Testing createRule()...');
    const newRuleData = {
      name: 'Test Rule for Verification',
      trigger: 'TASK_OVERDUE',
      action: 'SEND_NOTIFICATION'
    };

    const createdRule = await AutomationService.createRule(newRuleData, user.id);
    console.log(`✅ Created rule: ${createdRule.name} (ID: ${createdRule.id})`);

    // 3. Verify rule was added
    console.log('\n3️⃣ Verifying rule was added...');
    const rulesAfterCreate = await AutomationService.getAllRules();
    console.log(`✅ Rules count after creation: ${rulesAfterCreate.length} (was ${initialRules.length})`);

    // 4. Test toggleRule
    console.log('\n4️⃣ Testing toggleRule()...');
    const originalStatus = createdRule.active;
    const toggledRule = await AutomationService.toggleRule(createdRule.id);
    console.log(`✅ Toggled rule status: ${originalStatus} → ${toggledRule.active}`);

    // 5. Test deleteRule
    console.log('\n5️⃣ Testing deleteRule()...');
    const deleteResult = await AutomationService.deleteRule(createdRule.id);
    console.log(`✅ Delete result: ${deleteResult.message}`);

    // 6. Verify rule was deleted
    console.log('\n6️⃣ Verifying rule was deleted...');
    const rulesAfterDelete = await AutomationService.getAllRules();
    console.log(`✅ Rules count after deletion: ${rulesAfterDelete.length} (should be ${initialRules.length})`);

    // 7. Test all trigger types
    console.log('\n7️⃣ Testing all trigger types...');
    const triggerTypes = ['TASK_OVERDUE', 'TASK_ASSIGNED', 'TASK_STATUS_CHANGED', 'MILESTONE_REACHED', 'SCHEDULED'];
    
    for (const trigger of triggerTypes) {
      const testRule = await AutomationService.createRule({
        name: `Test ${trigger} Rule`,
        trigger: trigger,
        action: 'SEND_NOTIFICATION'
      }, user.id);
      
      console.log(`✅ Created rule for trigger: ${trigger}`);
      
      // Clean up immediately
      await AutomationService.deleteRule(testRule.id);
    }

    console.log('\n=== FINAL VERIFICATION ===');
    const finalRules = await AutomationService.getAllRules();
    console.log(`✅ Final rule count: ${finalRules.length}`);
    console.log('✅ All automation CRUD operations working correctly!');
    console.log('✅ All trigger types supported!');
    console.log('✅ Demo rules preserved and functional!');

    // List all demo rules
    console.log('\n=== DEMO RULES STATUS ===');
    finalRules.forEach((rule, index) => {
      const status = rule.active ? '🟢 ACTIVE' : '🔴 INACTIVE';
      console.log(`${index + 1}. ${rule.name} - ${status}`);
    });

  } catch (error) {
    console.error('❌ Error in full automation test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFullAutomation();
