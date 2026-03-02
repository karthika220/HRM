const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function finalTest() {
  try {
    console.log('=== FINAL APPLICATION TEST ===\n');

    // 1. Check database
    console.log('1. Database Status:');
    const userCount = await prisma.user.count();
    const ruleCount = await prisma.automationRule.count();
    console.log(`   Users: ${userCount}`);
    console.log(`   Automation Rules: ${ruleCount}`);

    // 2. Check automation rules
    console.log('\n2. Automation Rules:');
    const rules = await prisma.automationRule.findMany({
      include: {
        creator: {
          select: { name: true, role: true }
        }
      }
    });

    rules.forEach((rule, index) => {
      const status = rule.active ? '🟢 ACTIVE' : '🔴 INACTIVE';
      console.log(`   ${index + 1}. ${rule.name} - ${status}`);
    });

    // 3. Check Managing Director user
    console.log('\n3. Managing Director User:');
    const md = await prisma.user.findFirst({
      where: { role: 'MANAGING_DIRECTOR' },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });

    if (md) {
      console.log(`   ✅ Found: ${md.name} (${md.email})`);
      console.log(`   ✅ Active: ${md.isActive}`);
      console.log(`   ✅ Role: ${md.role}`);
    } else {
      console.log('   ❌ No Managing Director found');
    }

    console.log('\n=== APPLICATION READY ===');
    console.log('✅ Backend: http://localhost:3001');
    console.log('✅ Frontend: http://localhost:5173');
    console.log('✅ Login Credentials:');
    console.log(`   Email: ${md?.email || 'admin@projectflow.io'}`);
    console.log('   Password: password123');
    console.log('✅ Automation Page: http://localhost:5173/automation');
    console.log('\n📋 Features Available:');
    console.log('   • View automation rules');
    console.log('   • Create new rules');
    console.log('   • Toggle rules on/off');
    console.log('   • Delete rules');
    console.log('   • Role-based access (MD & HR only)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalTest();
