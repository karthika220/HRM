const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProject() {
  try {
    const project = await prisma.project.findFirst();
    console.log('📁 Project Sample:');
    console.log(JSON.stringify(project, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProject();
