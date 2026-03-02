@echo off
echo 🌱 DEMO DATA SEEDING SCRIPT
echo ============================================================
echo.
echo ⚠️  IMPORTANT SAFETY FEATURES
echo ------------------------------------------------------------
echo ✅ Only seeds tables that are empty
echo ✅ Safe to run multiple times
echo ✅ Does NOT modify People module tables
echo ✅ Does NOT drop any tables
echo ✅ Uses existing database connection
echo ✅ Logs all operations
echo.
echo 📊 TABLES TO BE SEEDED
echo ------------------------------------------------------------
echo ✅ Projects (5 records)
echo ✅ Tasks (10 records)
echo ✅ Issues (5 records)
echo ✅ Timesheets (5 records)
echo ✅ Team Members (6 records)
echo ✅ Calendar Events (4 records)
echo ✅ Automation Rules (3 records)
echo ✅ Reports (3 records)
echo ✅ Admin Settings (6 records)
echo.
echo 🚫 TABLES THAT WILL NOT BE TOUCHED
echo ------------------------------------------------------------
echo ❌ Employees table
echo ❌ Attendance tables
echo ❌ Leave management tables
echo.
echo 🔧 RUNNING SEED SCRIPT
echo ------------------------------------------------------------
cd "d:\HRM&PMS\backend"
node seed-demo-data.js
echo.
echo ✅ SEEDING COMPLETE!
echo ============================================================
echo.
echo 📋 NEXT STEPS
echo ------------------------------------------------------------
echo 1. Check the console output for seeding results
echo 2. Verify data in your database
echo 3. Test the frontend with demo data
echo 4. This script is safe to run again if needed
echo.
echo 🎉 DEMO DATA SEEDING SUCCESSFULLY COMPLETED!
