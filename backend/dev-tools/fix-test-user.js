const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function fixTestUser() {
  try {
    console.log('=== FIXING TEST USER ===\n');

    // Get the Managing Director user
    const user = await prisma.user.findFirst({
      where: { role: 'MANAGING_DIRECTOR' }
    });

    if (!user) {
      console.log('❌ No Managing Director user found');
      return;
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);

    // Update password to a known value
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    console.log('✅ Updated password to: password123');

    // Test the login
    const validPassword = await bcrypt.compare('password123', user.password);
    console.log(`✅ Password verification: ${validPassword ? 'PASSED' : 'FAILED'}`);

    // Create a test token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET || 'your-secret-key-fallback', 
      { expiresIn: '7d' }
    );

    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log(`📧 Email: ${user.email}`);
    console.log('🔑 Password: password123');
    console.log(`🎫 Role: ${user.role}`);
    console.log(`🔐 Token: ${token.substring(0, 50)}...`);

    console.log('\n=== INSTRUCTIONS ===');
    console.log('1. Go to http://localhost:5179/login');
    console.log('2. Use the credentials above to login');
    console.log('3. Navigate to Automation page');
    console.log('4. Should see the 5 demo automation rules');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTestUser();
