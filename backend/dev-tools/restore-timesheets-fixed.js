const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreTimesheetsFixed() {
  try {
    console.log('🔄 Restoring timesheets data with correct schema...');
    
    // Read backup.sql file
    const backupPath = path.join(__dirname, 'backup.sql');
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    
    console.log('📥 Processing timesheet data...');
    
    // Extract timesheet data
    const timesheetInserts = backupContent.match(/INSERT INTO Timesheet \([^)]+\) VALUES \([^)]+\);/g) || [];
    
    console.log(`Found ${timesheetInserts.length} timesheet entries`);
    
    // Restore Timesheets
    for (const insert of timesheetInserts) {
      try {
        const valuesMatch = insert.match(/VALUES \((.*?)\);/);
        if (!valuesMatch) continue;
        
        const values = valuesMatch[1].split(',').map(v => v.trim().replace(/'/g, ''));
        
        const timesheetData = {
          id: values[0],
          date: new Date(parseInt(values[1])),
          startTime: values[2] === 'NULL' ? null : values[2],
          endTime: values[3] === 'NULL' ? null : values[3],
          hours: parseFloat(values[4]),
          workType: values[5] === 'NULL' ? 'BILLABLE' : values[5],
          notes: values[6] === 'NULL' ? null : values[6],
          isApproved: values[7] === '1',
          taskId: values[8] === 'NULL' ? null : values[8],
          userId: values[9] === 'NULL' ? null : values[9],
          createdAt: new Date(parseInt(values[10]))
        };
        
        await prisma.timesheet.create({ data: timesheetData });
        console.log(`✅ Created timesheet: ${timesheetData.notes?.substring(0, 40)}... (${timesheetData.hours}h)`);
        
      } catch (error) {
        console.log('⚠️ Skipping timesheet:', error.message);
      }
    }
    
    console.log('✅ Timesheets restoration finished!');
    
    // Verify restoration
    const timesheetCount = await prisma.timesheet.count();
    
    console.log(`\n📊 Timesheet Restoration Summary:`);
    console.log(`Timesheets: ${timesheetCount}`);
    
    // Show sample timesheets
    const sampleTimesheets = await prisma.timesheet.findMany({
      take: 5,
      include: {
        user: { select: { name: true } },
        task: { select: { title: true } }
      }
    });
    
    if (sampleTimesheets.length > 0) {
      console.log(`\n⏰ Sample Timesheets:`);
      sampleTimesheets.forEach(ts => {
        console.log(`   - ${ts.notes?.substring(0, 50)}... (${ts.hours}h)`);
        console.log(`     User: ${ts.user?.name}, Task: ${ts.task?.title?.substring(0, 30)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error restoring timesheets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreTimesheetsFixed();
