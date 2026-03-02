const { prisma, testConnection } = require('./src/prisma');

async function testPrismaConnection() {
  console.log('🔍 Testing Prisma database connection...');
  
  try {
    // Test basic connection
    const isConnected = await testConnection();
    console.log('✅ Connection test result:', isConnected);
    
    if (isConnected) {
      // Test querying users
      console.log('🔍 Testing user query...');
      const users = await prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true
        }
      });
      
      console.log('✅ Users found:', users.length);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.role}) - Active: ${user.isActive}`);
      });
      
      // Test specific admin user
      console.log('🔍 Testing admin user query...');
      const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@projectflow.io' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true
        }
      });
      
      if (adminUser) {
        console.log('✅ Admin user found:', adminUser);
      } else {
        console.log('❌ Admin user NOT found');
      }
    }
    
  } catch (error) {
    console.error('❌ Prisma connection test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection();
