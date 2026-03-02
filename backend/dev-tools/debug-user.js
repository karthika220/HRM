const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function debugUser() {
  try {
    console.log('=== DEBUGGING USER DATA ===\n');

    // Get the Managing Director user
    const user = await prisma.user.findFirst({
      where: { role: 'MANAGING_DIRECTOR' }
    });

    if (!user) {
      console.log('❌ No Managing Director user found');
      return;
    }

    console.log('👤 User Details:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password Hash: ${user.password.substring(0, 30)}...`);
    console.log(`   Active: ${user.isActive}`);

    // Test different passwords
    const passwords = ['password123', 'password', 'admin', '123456'];
    
    console.log('\n🔐 Testing Passwords:');
    for (const pwd of passwords) {
      try {
        const isValid = await bcrypt.compare(pwd, user.password);
        console.log(`   "${pwd}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      } catch (err) {
        console.log(`   "${pwd}": ❌ ERROR - ${err.message}`);
      }
    }

    // Create a new password hash
    console.log('\n🔧 Creating new password hash...');
    const newHash = await bcrypt.hash('password123', 10);
    console.log(`   New Hash: ${newHash.substring(0, 30)}...`);

    // Update user with new hash
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHash }
    });

    // Test new password
    const newValid = await bcrypt.compare('password123', newHash);
    console.log(`   New password test: ${newValid ? '✅ VALID' : '❌ INVALID'}`);

    // Verify in database
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    const dbValid = await bcrypt.compare('password123', updatedUser.password);
    console.log(`   Database password test: ${dbValid ? '✅ VALID' : '❌ INVALID'}`);

    console.log('\n=== FINAL CREDENTIALS ===');
    console.log(`📧 Email: ${user.email}`);
    console.log('🔑 Password: password123');
    console.log(`🎫 Role: ${user.role}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUser();
