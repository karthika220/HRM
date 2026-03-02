const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAutomationRules() {
  try {
    console.log('🤖 Current Automation Rules:');
    
    const rules = await prisma.automationRule.findMany({
      include: { 
        creator: { 
          select: { name: true, role: true } 
        } 
      }
    });
    
    if (rules.length === 0) {
      console.log('❌ No automation rules found');
      return;
    }
    
    rules.forEach(rule => {
      console.log(`- ${rule.name}`);
      console.log(`  Trigger: ${rule.trigger}`);
      console.log(`  Action: ${rule.action}`);
      console.log(`  Status: ${rule.active ? '✅ Active' : '❌ Inactive'}`);
      console.log(`  Created by: ${rule.creator.name} (${rule.creator.role})`);
      console.log(`  Created: ${rule.createdAt.toLocaleString()}`);
      console.log('');
    });
    
    console.log(`📊 Total Rules: ${rules.length}`);
    console.log(`✅ Active: ${rules.filter(r => r.active).length}`);
    console.log(`❌ Inactive: ${rules.filter(r => !r.active).length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAutomationRules();
