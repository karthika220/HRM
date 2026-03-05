const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEmail() {
  try {
    // Check current users
    const users = await prisma.user.findMany({
      select: { email: true, name: true, role: true }
    });
    console.log('📋 Users in database:');
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.name}, ${user.role})`);
    });

    // Try to find admin user
    const adminUser = users.find(u => u.email.includes('admin'));
    if (adminUser && adminUser.email !== 'admin@workforce.io') {
      console.log(`\n🔧 Updating admin email from ${adminUser.email} to admin@workforce.io`);
      
      const updated = await prisma.user.update({
        where: { email: adminUser.email },
        data: { email: 'admin@workforce.io' }
      });
      
      console.log('✅ Updated admin email to:', updated.email);
    } else if (adminUser && adminUser.email === 'admin@workforce.io') {
      console.log('\n✅ Admin email is already correct');
    } else {
      console.log('\n❌ No admin user found');
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixEmail();
