require('dotenv').config();

console.log('🔍 Debug Environment Variables');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Current directory:', process.cwd());
console.log('Looking for .env file...');

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
console.log('Env path:', envPath);
console.log('Env file exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('Env file content:');
  console.log(envContent);
}

console.log('\n🔍 Process Environment:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
console.log('PORT:', process.env.PORT ? '✅ Set' : '❌ Not set');

if (process.env.JWT_SECRET) {
  console.log('JWT_SECRET value:', process.env.JWT_SECRET);
}
