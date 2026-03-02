const { PrismaClient } = require('@prisma/client');

async function testIssues() {
  const client = new PrismaClient();
  
  try {
    console.log('Testing Issue model...');
    
    // Test basic Issue query
    const issues = await client.issue.findMany({
      take: 1
    });
    console.log(`✅ Issue model working, found ${issues.length} issues`);
    
    // Test with OR condition
    const userId = '09bc1d76-a602-44ce-aae9-09ce825b9a88';
    const userIssues = await client.issue.findMany({
      where: {
        OR: [
          { reporterId: userId },
          { assignedTo: userId }
        ]
      },
      select: {
        id: true,
        title: true,
        severity: true,
        status: true
      },
      take: 3
    });
    console.log(`✅ User issues working, found ${userIssues.length} issues`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.$disconnect();
  }
}

testIssues();
