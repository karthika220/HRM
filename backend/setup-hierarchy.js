const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupHierarchy() {
  console.log('Setting up organization hierarchy...');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        managerId: true
      }
    });

    console.log(`Found ${users.length} users`);

    // Find the Managing Director
    const managingDirector = users.find(u => u.role === 'MANAGING_DIRECTOR');
    if (!managingDirector) {
      console.log('No Managing Director found');
      return;
    }

    console.log('Managing Director:', managingDirector.name);

    // Find Managers
    const managers = users.filter(u => u.role === 'MANAGER');
    console.log('Managers found:', managers.map(m => m.name));

    // Set Managing Director as manager for all managers
    for (const manager of managers) {
      await prisma.user.update({
        where: { id: manager.id },
        data: { managerId: managingDirector.id }
      });
      console.log(`Set ${managingDirector.name} as manager for ${manager.name}`);
    }

    // Find Team Leads
    const teamLeads = users.filter(u => u.role === 'TEAM_LEAD');
    console.log('Team Leads found:', teamLeads.map(tl => tl.name));

    // Assign Team Leads to managers
    for (const teamLead of teamLeads) {
      // Assign to first manager by default, you can customize this
      const assignedManager = managers[0]; // John Manager
      if (assignedManager) {
        await prisma.user.update({
          where: { id: teamLead.id },
          data: { managerId: assignedManager.id }
        });
        console.log(`Assigned ${teamLead.name} to manager ${assignedManager.name}`);
      }
    }

    // Assign some employees to Team Leads
    const employees = users.filter(u => u.role === 'EMPLOYEE').slice(0, 5);
    for (let i = 0; i < Math.min(employees.length, teamLeads.length); i++) {
      const employee = employees[i];
      const teamLead = teamLeads[i % teamLeads.length];
      await prisma.user.update({
        where: { id: employee.id },
        data: { managerId: teamLead.id }
      });
      console.log(`Assigned ${employee.name} to team lead ${teamLead.name}`);
    }

    console.log('Hierarchy setup complete!');

  } catch (error) {
    console.error('Error setting up hierarchy:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupHierarchy();
