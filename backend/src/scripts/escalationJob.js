/**
 * HRM & PMS - Task Escalation Background Job
 * Project: Human Resource Management & Project Management System
 * 
 * Background job script for automatic task escalation
 * Can be run as a standalone process or integrated into the main application
 */

require('dotenv').config();
const { startEscalationScheduler } = require('../services/escalationService');

/**
 * Start the escalation background job
 */
console.log('🚀 Starting HRM & PMS Task Escalation Background Job...');
console.log('📅 This job will run every hour to check for overdue tasks and escalate them');

try {
  // Start the scheduler
  startEscalationScheduler();
  
  console.log('✅ Escalation job started successfully');
  console.log('🔄 The job will run automatically every hour');
  console.log('📊 Check the logs for escalation activity');
  
  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping escalation job...');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping escalation job...');
    process.exit(0);
  });
  
} catch (error) {
  console.error('❌ Failed to start escalation job:', error);
  process.exit(1);
}
