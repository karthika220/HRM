const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getUsers() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true }
  });
  
  console.log('👥 Available Users:');
  users.forEach(user => {
    console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
  });
  
  await prisma.$disconnect();
}

getUsers().catch(console.error);
