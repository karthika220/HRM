const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Create Prisma client with explicit database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.fIUHOiqkQSzl_6k_KH2n3g_2kbFWCgB@aws-0-us-east-1.pooler.supabase.com:6543/postgres'
    }
  }
});

async function main() {
  console.log('Seeding database...');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Create admin/Managing Director
    const hashedPassword = await bcrypt.hash('password', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@projectflow.io' },
      update: {},
      create: {
        email: 'admin@projectflow.io',
        password: hashedPassword,
        name: 'Admin Director',
        role: 'MANAGING_DIRECTOR',
        department: 'Executive',
      },
    });

    console.log('✅ Created admin user:', admin.email);

    const hrManager = await prisma.user.upsert({
      where: { email: 'hr@projectflow.io' },
      update: {},
      create: {
        email: 'hr@projectflow.io',
        password: hashedPassword,
        name: 'Sarah HR',
        role: 'HR_MANAGER',
        department: 'Human Resources',
      },
    });

    console.log('✅ Created HR manager:', hrManager.email);

    const teamLead = await prisma.user.upsert({
      where: { email: 'lead@projectflow.io' },
      update: {},
      create: {
        email: 'lead@projectflow.io',
        password: hashedPassword,
        name: 'Mike Lead',
        role: 'TEAM_LEAD',
        department: 'Engineering',
      },
    });

    console.log('✅ Created team lead:', teamLead.email);

    const employee = await prisma.user.upsert({
      where: { email: 'employee@projectflow.io' },
      update: {},
      create: {
        email: 'employee@projectflow.io',
        password: hashedPassword,
        name: 'John Employee',
        role: 'EMPLOYEE',
        department: 'Engineering',
      },
    });

    console.log('✅ Created employee:', employee.email);

    console.log('🎉 Database seeded successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('┌─────────────────────────────┬──────────┬─────────────────────┐');
    console.log('│ Email                       │ Password │ Role                │');
    console.log('├─────────────────────────────┼──────────┼─────────────────────┤');
    console.log('│ admin@projectflow.io        │ password │ Managing Director   │');
    console.log('│ hr@projectflow.io          │ password │ HR Manager          │');
    console.log('│ lead@projectflow.io        │ password │ Team Lead           │');
    console.log('│ employee@projectflow.io   │ password │ Employee            │');
    console.log('└─────────────────────────────┴──────────┴─────────────────────┘');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
