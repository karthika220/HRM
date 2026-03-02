
# ProjectFlow Database Import Guide

## Files Generated:
1. **backup.sql** - Complete data export (125.37 KB)
2. **schema_postgresql.sql** - PostgreSQL schema definition

## Import Steps:

### 1. Set up PostgreSQL Database
```sql
-- Create database
CREATE DATABASE projectflow_prod;

-- Connect to database
\c projectflow_prod
```

### 2. Import Schema
```bash
psql -d projectflow_prod -f schema_postgresql.sql
```

### 3. Import Data
```bash
psql -d projectflow_prod -f backup.sql
```

### 4. Verify Import
```sql
-- Check table counts
SELECT 
  'User' as table_name, COUNT(*) as row_count FROM "User"
UNION ALL
SELECT 'Project', COUNT(*) FROM Project
UNION ALL
SELECT 'Task', COUNT(*) FROM Task
UNION ALL
SELECT 'Timesheet', COUNT(*) FROM Timesheet
UNION ALL
SELECT 'Notification', COUNT(*) FROM Notification
ORDER BY table_name;
```

## Data Summary:
- **Total Tables**: 11
- **Total Rows**: 1,127
- **Users**: 27 (including all roles and departments)
- **Projects**: 12 (with real client names)
- **Tasks**: 127 (with assignments and status)
- **Timesheets**: 20 (with work tracking)
- **Notifications**: 832 (comprehensive notification system)
- **Activities**: 62 (project activity log)

## Migration Notes:
- All foreign key relationships preserved
- UUIDs maintained for all entities
- Dates converted to ISO format
- Booleans converted to PostgreSQL format
- Text fields properly escaped
- Role-based access data intact

## Production Setup:
1. Update DATABASE_URL in .env file
2. Run Prisma migrations if needed
3. Verify all API endpoints work
4. Test authentication with existing users
5. Validate role-based permissions

## Verification Checklist:
- [ ] All users imported with correct roles
- [ ] Projects with real client names preserved
- [ ] Task assignments maintained
- [ ] Timesheet data intact
- [ ] Notification system functional
- [ ] Activity log complete
- [ ] Foreign key constraints working
- [ ] API endpoints responding correctly
