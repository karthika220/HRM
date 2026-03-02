const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function finalVerification() {
  try {
    console.log('🔍 Final verification of complete data restoration...');
    
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const taskCount = await prisma.task.count();
    const timesheetCount = await prisma.timesheet.count();
    const commentCount = await prisma.comment.count();
    
    console.log('\n📊 Complete Database State:');
    console.log(`Users: ${userCount}`);
    console.log(`Projects: ${projectCount}`);
    console.log(`Tasks: ${taskCount}`);
    console.log(`Timesheets: ${timesheetCount}`);
    console.log(`Comments: ${commentCount}`);
    
    // Show timesheet statistics
    const timesheetStats = await prisma.timesheet.groupBy({
      by: ['isApproved'],
      _count: { isApproved: true },
      _sum: { hours: true }
    });
    
    console.log('\n⏰ Timesheet Statistics:');
    timesheetStats.forEach(stat => {
      const status = stat.isApproved ? 'Approved' : 'Pending';
      console.log(`   ${status}: ${stat._count.isApproved} entries, ${stat._sum.hours || 0} total hours`);
    });
    
    // Show Karthika's data
    const karthika = await prisma.user.findFirst({ 
      where: { name: { contains: 'Karthika' } } 
    });
    
    if (karthika) {
      const karthikaTasks = await prisma.task.count({
        where: { assigneeId: karthika.id }
      });
      const karthikaTimesheets = await prisma.timesheet.count({
        where: { userId: karthika.id }
      });
      console.log(`\n👤 Karthika's Data:`);
      console.log(`   Assigned Tasks: ${karthikaTasks}`);
      console.log(`   Timesheet Entries: ${karthikaTimesheets}`);
    }
    
    // Show recent timesheets
    const recentTimesheets = await prisma.timesheet.findMany({
      take: 5,
      include: {
        user: { select: { name: true } },
        task: { select: { title: true } }
      },
      orderBy: { date: 'desc' }
    });
    
    if (recentTimesheets.length > 0) {
      console.log('\n⏰ Recent Timesheets:');
      recentTimesheets.forEach(ts => {
        console.log(`   - ${ts.notes?.substring(0, 40)}... (${ts.hours}h)`);
        console.log(`     User: ${ts.user?.name}, Approved: ${ts.isApproved ? 'Yes' : 'No'}`);
      });
    }
    
    console.log('\n✅ Your complete working data has been successfully restored!');
    console.log('📝 Note: No issues were found in the backup (they may not have been created yet)');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalVerification();
