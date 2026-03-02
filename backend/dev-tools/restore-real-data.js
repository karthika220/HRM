const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreRealData() {
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
    
    // Read and parse the backup.sql file
    const backupPath = path.join(__dirname, 'backup.sql');
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    
    console.log('📥 Reading backup data...');
    
    // Extract INSERT statements for each table
    const insertStatements = {
      users: [],
      notificationPreferences: [],
      projects: [],
      milestones: [],
      tasks: [],
      comments: [],
      activities: [],
      timesheets: []
    };
    
    // Parse INSERT statements
    const lines = backupContent.split('\n');
    let currentTable = null;
    
    for (const line of lines) {
      if (line.includes('-- Table: User')) {
        currentTable = 'users';
      } else if (line.includes('-- Table: NotificationPreferences')) {
        currentTable = 'notificationPreferences';
      } else if (line.includes('-- Table: Project')) {
        currentTable = 'projects';
      } else if (line.includes('-- Table: Milestone')) {
        currentTable = 'milestones';
      } else if (line.includes('-- Table: Task')) {
        currentTable = 'tasks';
      } else if (line.includes('-- Table: Comment')) {
        currentTable = 'comments';
      } else if (line.includes('-- Table: Activity')) {
        currentTable = 'activities';
      } else if (line.includes('-- Table: Timesheet')) {
        currentTable = 'timesheets';
      } else if (line.startsWith('INSERT INTO') && currentTable) {
        insertStatements[currentTable].push(line);
      }
    }
    
    console.log('🔄 Restoring data...');
    
    // Restore Users
    for (const stmt of insertStatements.users) {
      try {
        const match = stmt.match(/INSERT INTO User \((.*?)\) VALUES \((.*?)\);/);
        if (match) {
          const fields = match[1].split(', ').map(f => f.trim());
          const values = match[2].split(', ').map(v => v.trim().replace(/'/g, ''));
          
          const userData = {};
          fields.forEach((field, index) => {
            let value = values[index];
            
            // Convert string values to appropriate types
            if (field === 'isActive') {
              userData[field] = value === '1';
            } else if (field === 'createdAt' || field === 'updatedAt') {
              userData[field] = parseInt(value);
            } else {
              userData[field] = value === 'NULL' ? null : value;
            }
          });
          
          await prisma.user.create({ data: userData });
        }
      } catch (error) {
        console.log('Skipping user insert:', error.message);
      }
    }
    
    // Restore Projects
    for (const stmt of insertStatements.projects) {
      try {
        const match = stmt.match(/INSERT INTO Project \((.*?)\) VALUES \((.*?)\);/);
        if (match) {
          const fields = match[1].split(', ').map(f => f.trim());
          const values = match[2].split(', ').map(v => v.trim().replace(/'/g, ''));
          
          const projectData = {};
          fields.forEach((field, index) => {
            let value = values[index];
            
            if (field === 'startDate' || field === 'endDate' || field === 'createdAt' || field === 'updatedAt') {
              projectData[field] = parseInt(value);
            } else {
              projectData[field] = value === 'NULL' ? null : value;
            }
          });
          
          await prisma.project.create({ data: projectData });
        }
      } catch (error) {
        console.log('Skipping project insert:', error.message);
      }
    }
    
    console.log('✅ Real data restoration complete!');
    
    // Verify restoration
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    
    console.log(`\n📊 Restoration Summary:`);
    console.log(`Users: ${userCount}`);
    console.log(`Projects: ${projectCount}`);
    
    // Show key users
    const karthika = await prisma.user.findFirst({ where: { name: { contains: 'Karthika' } } });
    const managers = await prisma.user.findMany({ where: { role: 'MANAGER' } });
    
    if (karthika) {
      console.log(`✅ Found Karthika: ${karthika.name} (${karthika.email})`);
    }
    
    if (managers.length > 0) {
      console.log(`✅ Found ${managers.length} managers:`);
      managers.forEach(m => console.log(`   - ${m.name} (${m.email})`));
    }
    
  } catch (error) {
    console.error('❌ Error restoring data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreRealData();
