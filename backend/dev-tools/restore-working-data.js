const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreWorkingData() {
  try {
    console.log('🔄 Clearing current database...');
    
    // Clear all existing data
    await prisma.activity.deleteMany();
    await prisma.timesheet.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.task.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.projectMember.deleteMany();
    await prisma.project.deleteMany();
    await prisma.notificationPreferences.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ Database cleared');
    
    // Read the backup.sql file
    const backupPath = path.join(__dirname, 'backup.sql');
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    
    console.log('📥 Processing backup data...');
    
    // Extract user data specifically
    const userInserts = backupContent.match(/INSERT INTO User \([^)]+\) VALUES \([^)]+\);/g) || [];
    const projectInserts = backupContent.match(/INSERT INTO Project \([^)]+\) VALUES \([^)]+\);/g) || [];
    
    console.log(`Found ${userInserts.length} users and ${projectInserts.length} projects`);
    
    // Restore Users first
    for (const insert of userInserts) {
      try {
        // Parse the INSERT statement
        const valuesMatch = insert.match(/VALUES \((.*?)\);/);
        if (!valuesMatch) continue;
        
        const values = valuesMatch[1].split(',').map(v => v.trim().replace(/'/g, ''));
        
        const userData = {
          id: values[0],
          email: values[1],
          password: values[2],
          name: values[3],
          role: values[4],
          avatar: values[5] === 'NULL' ? null : values[5],
          department: values[6] === 'NULL' ? null : values[6],
          isActive: values[7] === '1',
          createdAt: new Date(parseInt(values[8])),
          updatedAt: new Date(parseInt(values[9])),
          avatarUrl: values[10] === 'NULL' ? null : values[10],
          phone: values[11] === 'NULL' ? null : values[11]
        };
        
        await prisma.user.create({ data: userData });
        console.log(`✅ Created user: ${userData.name}`);
        
      } catch (error) {
        console.log('⚠️ Skipping user:', error.message);
      }
    }
    
    // Restore Projects
    for (const insert of projectInserts) {
      try {
        const valuesMatch = insert.match(/VALUES \((.*?)\);/);
        if (!valuesMatch) continue;
        
        const values = valuesMatch[1].split(',').map(v => v.trim().replace(/'/g, ''));
        
        const projectData = {
          id: values[0],
          name: values[1],
          description: values[2] === 'NULL' ? null : values[2],
          status: values[3] === 'NULL' ? null : values[3],
          startDate: values[4] === 'NULL' ? null : new Date(parseInt(values[4])),
          endDate: values[5] === 'NULL' ? null : new Date(parseInt(values[5])),
          budget: values[6] === 'NULL' ? null : values[6],
          color: values[7] === 'NULL' ? null : values[7],
          tags: values[8] === 'NULL' ? null : values[8],
          ownerId: values[9] === 'NULL' ? null : values[9],
          createdAt: new Date(parseInt(values[10])),
          updatedAt: new Date(parseInt(values[11]))
        };
        
        await prisma.project.create({ data: projectData });
        console.log(`✅ Created project: ${projectData.name}`);
        
      } catch (error) {
        console.log('⚠️ Skipping project:', error.message);
      }
    }
    
    console.log('✅ Working data restoration complete!');
    
    // Verify restoration
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    
    console.log(`\n📊 Restoration Summary:`);
    console.log(`Users: ${userCount}`);
    console.log(`Projects: ${projectCount}`);
    
    // Show key users
    const karthika = await prisma.user.findFirst({ where: { name: { contains: 'Karthika' } } });
    const managers = await prisma.user.findMany({ where: { role: 'MANAGER' } });
    const allUsers = await prisma.user.findMany({ select: { name: true, email: true, role: true } });
    
    console.log(`\n👥 All Users:`);
    allUsers.forEach(u => console.log(`   - ${u.name} (${u.email}) - ${u.role}`));
    
    if (karthika) {
      console.log(`\n✅ Found Karthika: ${karthika.name} (${karthika.email})`);
    }
    
    if (managers.length > 0) {
      console.log(`\n✅ Found ${managers.length} managers:`);
      managers.forEach(m => console.log(`   - ${m.name} (${m.email})`));
    }
    
  } catch (error) {
    console.error('❌ Error restoring data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreWorkingData();
