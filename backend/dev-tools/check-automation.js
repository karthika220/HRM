const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRules() {
  try {
    const rules = await prisma.automationRule.findMany({
      include: {
        creator: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
    
    console.log('=== AUTOMATION RULES IN DATABASE ===');
    console.log(`Total rules found: ${rules.length}`);
    console.log('');
    
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.name}`);
      console.log(`   ID: ${rule.id}`);
      console.log(`   Trigger: ${rule.trigger}`);
      console.log(`   Action: ${rule.action}`);
      console.log(`   Active: ${rule.active}`);
      console.log(`   Created By: ${rule.creator.name} (${rule.creator.role})`);
      console.log(`   Created At: ${rule.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error checking rules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRules();
