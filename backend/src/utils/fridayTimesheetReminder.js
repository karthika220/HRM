const AutomationService = require('../services/AutomationService');

// Cron job for Friday 5PM timesheet reminder
async function runFridayTimesheetReminder() {
  try {
    console.log('📅 Running Friday Timesheet Reminder automation...');
    
    // Check if it's Friday (day 5)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 5 = Friday
    const hour = now.getHours(); // 17 = 5PM

    if (dayOfWeek !== 5 || hour !== 17) {
      console.log('⏰ Not Friday 5PM. Skipping reminder.');
      console.log(`Current time: ${now.toLocaleString()}`);
      return;
    }

    // Execute the scheduled automation rule (passive, non-blocking)
    AutomationService.evaluate('SCHEDULED', {
      ruleName: 'Friday Timesheet Reminder',
      timestamp: now
    });

    console.log('✅ Friday Timesheet Reminder triggered (passive mode)!');
    
  } catch (error) {
    console.error('❌ Error in Friday Timesheet Reminder:', error);
  }
}

// Run the job
runFridayTimesheetReminder()
  .then(() => {
    console.log('Friday Timesheet Reminder job completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Friday Timesheet Reminder job failed:', error);
    process.exit(1);
  });
