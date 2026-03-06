// Check admin user in database
const { prisma } = require('./src/prisma');

async function checkAdminUser() {
  try {
    console.log('🔍 Checking admin user in database...');
    
    // Find admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@workforce.io' }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log('  ID:', adminUser.id);
      console.log('  Email:', adminUser.email);
      console.log('  Name:', adminUser.name);
      console.log('  Role:', adminUser.role);
      console.log('  Active:', adminUser.isActive);
      console.log('  Created:', adminUser.createdAt);
      
      if (!adminUser.isActive) {
        console.log('⚠️ WARNING: Admin user is INACTIVE!');
        console.log('🔧 Attempting to activate admin user...');
        
        // Activate admin user
        const updatedUser = await prisma.user.update({
          where: { id: adminUser.id },
          data: { isActive: true }
        });
        
        console.log('✅ Admin user activated successfully');
        console.log('  Updated Active:', updatedUser.isActive);
      } else {
        console.log('✅ Admin user is already active');
      }
      
    } else {
      console.log('❌ Admin user NOT found in database!');
      console.log('🔧 Creating admin user...');
      
      // Create admin user
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@workforce.io',
          name: 'Alex Johnson',
          password: '$2b$12$6hE8k4rPqG0f9', // This is 'password' hashed
          role: 'MANAGING_DIRECTOR',
          department: 'Executive',
          isActive: true
        }
      });
      
      console.log('✅ Admin user created successfully');
      console.log('  ID:', newAdmin.id);
      console.log('  Email:', newAdmin.email);
      console.log('  Name:', newAdmin.name);
      console.log('  Role:', newAdmin.role);
    }
    
  } catch (error) {
    console.error('❌ Error checking/creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
