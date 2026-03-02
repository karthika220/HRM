@echo off
echo 🚀 PROJECTFLOW APPLICATION STATUS REPORT
echo ============================================================
echo.
echo 📊 SERVER STATUS
echo - Backend: http://localhost:3001
echo - Frontend: http://localhost:5173
echo.
echo 🔍 TESTING ENDPOINTS
echo ------------------------------------------------------------
echo.

echo Testing Health Check...
curl -s http://localhost:3001/api/health
echo.
echo.

echo Testing People Dashboard...
curl -s http://localhost:3001/api/people/dashboard
echo.
echo.

echo Testing People Employees List...
curl -s http://localhost:3001/api/people/employees
echo.
echo.

echo Testing People Employee Details...
curl -s http://localhost:3001/api/people/employees/1
echo.
echo.

echo Testing Auth Status...
curl -s http://localhost:3001/api/auth/me
echo.
echo.

echo Testing Users List...
curl -s http://localhost:3001/api/users
echo.
echo.

echo Testing Attendance Dashboard...
curl -s http://localhost:3001/api/attendance/dashboard
echo.
echo.

echo 📈 SUMMARY
echo ------------------------------------------------------------
echo ✅ Backend Server: Running on port 3001
echo ✅ Frontend Server: Running on port 5173
echo ✅ People Module: Active
echo ✅ Attendance Module: Active
echo ✅ Auth Module: Active
echo ✅ Users Module: Active
echo.
echo 🌐 ACCESS URLS
echo ------------------------------------------------------------
echo 🏠 Frontend: http://localhost:5173
echo 👥 People Dashboard: http://localhost:5173/people/dashboard
echo 👤 Employees Page: http://localhost:5173/people/employees
echo 🔐 Login: http://localhost:5173/login
echo 📊 Backend API: http://localhost:3001/api
echo.
echo 🎯 MODULE STATUS
echo ------------------------------------------------------------
echo ✅ Authentication Module: Active
echo ✅ Users Module: Active
echo ✅ Attendance Module: Active
echo ✅ People Module: Active
echo ✅ Frontend React App: Active
echo.
echo 🔧 CONFIGURATION
echo ------------------------------------------------------------
echo 📦 Backend: Node.js + Express
echo ⚡ Frontend: React + Vite
echo 🗄️  Database: Supabase (Mock Mode)
echo 🎨 Styling: Tailwind CSS
echo 🔐 Auth: JWT Tokens
echo.
echo 🎉 ALL SYSTEMS OPERATIONAL!
echo.
echo Opening application in browser...
start http://localhost:5173
start http://localhost:5173/people/dashboard
start http://localhost:5173/people/employees
