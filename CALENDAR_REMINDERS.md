# Calendar Event Reminder System

## Overview
A comprehensive reminder notification system for calendar events that automatically sends notifications to users before their events start.

## Features Implemented

### ✅ Backend Components
- **Calendar Reminder Job** - Background job that checks for upcoming reminders
- **Database Schema** - Added `reminderSentAt` field to track sent notifications
- **Notification Type** - New `CALENDAR_REMINDER` notification type
- **Smart Timing** - Checks for events with reminders in the next 5 minutes
- **Duplicate Prevention** - Won't send multiple reminders for the same event

### ✅ Frontend Components
- **Notification Service** - Added `createCalendarReminderNotification` method
- **UI Integration** - Clock icon with orange color for calendar reminders
- **Real-time Updates** - Reminders appear in notification bell and page

## How It Works

### 1. Event Creation/Update
When users create or update calendar events with reminders:
- Frontend calculates `reminderAt` from selected reminder minutes
- Backend stores `reminderAt` timestamp and `reminderSentAt: null`
- Example: Event at 2:00 PM with 15-minute reminder → `reminderAt: 1:45 PM`

### 2. Background Job Process
The reminder job runs every 5 minutes and:
```javascript
// Find events with reminders in the next 5 minutes
const upcomingEvents = await prisma.calendarEvent.findMany({
  where: {
    reminderAt: {
      gte: now,                    // After current time
      lte: fiveMinutesFromNow      // Within next 5 minutes
    },
    OR: [
      { reminderSentAt: null },    // Never sent
      { reminderSentAt: { lt: oneHourAgo } } // Or sent >1 hour ago
    ]
  }
})
```

### 3. Notification Creation
For each upcoming event:
- Creates `CALENDAR_REMINDER` notification
- Updates `reminderSentAt` timestamp
- Logs the reminder creation

### 4. User Experience
- Users see notification in their notification bell
- Shows event title and start time
- Orange clock icon for visual distinction
- Can mark as read like other notifications

## Setup Instructions

### 1. Database Migration
```bash
cd backend
npm run db:push  # Adds reminderSentAt field to CalendarEvent
```

### 2. Manual Testing
```bash
# Test the reminder job manually
npm run notifications:check-reminders
```

### 3. Production Setup
Set up a cron job to run the reminder job every 5 minutes:
```bash
# Add to crontab (crontab -e)
*/5 * * * * cd /path/to/backend && npm run notifications:check-reminders
```

## API Changes

### Calendar Event Update Endpoint
- Now handles `reminderSentAt` field
- Resets `reminderSentAt` when `reminderAt` is updated
- Ensures new reminders trigger notifications

### Notification Types
Added `CALENDAR_REMINDER` to the notification system:
```typescript
type: 'TASK_OVERDUE' | 'TIMESHEET_SUBMITTED' | 'MENTION' | 'PROJECT_UPDATE' | 'TASK_ASSIGNED' | 'INFO' | 'CALENDAR_REMINDER'
```

## Frontend Integration

### Notification Service
```typescript
// Available method for manual reminder creation
await notificationService.createCalendarReminderNotification(
  userId,
  "Team Meeting",
  "2:00 PM"
)
```

### UI Components
- **Clock Icon**: Orange color for calendar reminders
- **Notification Page**: Displays with proper formatting
- **Real-time Updates**: Auto-refresh every 30 seconds

## Example Scenarios

### Scenario 1: Meeting Reminder
1. User creates event "Team Meeting" at 2:00 PM
2. Sets 15-minute reminder → `reminderAt: 1:45 PM`
3. At 1:45 PM, background job creates notification
4. User sees: "Your event 'Team Meeting' is starting at 2:00 PM"

### Scenario 2: Event Update
1. User updates event time from 2:00 PM to 3:00 PM
2. `reminderSentAt` is reset to `null`
3. New reminder will be sent at updated time

### Scenario 3: No Duplicate Reminders
1. Event reminder sent at 1:45 PM
2. Job runs again at 1:47 PM
3. Won't send duplicate because `reminderSentAt` is set

## Configuration

### Reminder Timing
- **Check Interval**: Every 5 minutes (configurable)
- **Lookahead Window**: Next 5 minutes
- **Duplicate Prevention**: 1-hour cooldown

### Notification Content
- **Title**: "Event Reminder"
- **Message**: "Your event '{title}' is starting at {time}."
- **Icon**: Clock with orange color

## Troubleshooting

### Reminders Not Sending
1. Check if background job is running
2. Verify `reminderAt` is set correctly
3. Check database for `reminderSentAt` values
4. Run manual test: `npm run notifications:check-reminders`

### Duplicate Reminders
1. Check if `reminderSentAt` is being updated
2. Verify job isn't running too frequently
3. Check database constraints

### Time Zone Issues
1. Ensure server timezone is correct
2. Verify frontend time calculations
3. Check database timestamp formats

## Future Enhancements

- **Multiple Reminders**: Support for multiple reminder times per event
- **Email Notifications**: Integrate with email service
- **Push Notifications**: Browser push notifications
- **Snooze Function**: Allow users to snooze reminders
- **Custom Messages**: User-defined reminder messages

## Database Schema Changes

```sql
-- Added to CalendarEvent model
reminderSentAt DateTime?
```

## File Structure

```
backend/
├── src/
│   ├── routes/
│   │   └── calendar.js          # Updated with reminderSentAt handling
│   └── utils/
│       └── calendarReminderJobs.js  # New background job
├── prisma/
│   └── schema.prisma            # Updated with reminderSentAt field
└── package.json                 # Added reminder job script

frontend/
├── src/
│   ├── pages/
│   │   └── NotificationsPage.tsx  # Added CALENDAR_REMINDER icon
│   └── utils/
│       └── notifications.ts       # Added calendar reminder method
```
