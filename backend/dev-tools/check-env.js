require('dotenv').config();

console.log('🔍 Checking environment variables...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
console.log('PORT:', process.env.PORT ? '✅ Set' : '❌ Not set');

if (process.env.JWT_SECRET) {
  console.log('JWT_SECRET value:', process.env.JWT_SECRET);
}
