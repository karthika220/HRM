const { PrismaClient } = require('@prisma/client');

async function debugCalendar() {
  const client = new PrismaClient();
  
  try {
    console.log('1. Testing database connection...');
    await client.$connect();
    console.log('✅ Database connected');
    
    console.log('2. Testing User model...');
    const users = await client.user.findMany({ take: 1 });
    console.log(`✅ User model working, found ${users.length} users`);
    
    console.log('3. Testing CalendarEvent model...');
    const events = await client.calendarEvent.findMany();
    console.log(`✅ CalendarEvent model working, found ${events.length} events`);
    
    console.log('4. Testing calendarEvent.create...');
    const testEvent = await client.calendarEvent.create({
      data: {
        title: 'Debug Test Event',
        startTime: new Date(),
        userId: users[0].id
      }
    });
    console.log(`✅ Event created: ${testEvent.id}`);
    
    console.log('5. Testing calendarEvent.findMany with include...');
    const eventsWithIncludes = await client.calendarEvent.findMany({
      include: {
        linkedTask: true,
        linkedIssue: true
      },
      take: 1
    });
    console.log(`✅ Events with includes working: ${eventsWithIncludes.length}`);
    
    // Clean up
    await client.calendarEvent.delete({
      where: { id: testEvent.id }
    });
    console.log('✅ Test event deleted');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.$disconnect();
  }
}

debugCalendar();
