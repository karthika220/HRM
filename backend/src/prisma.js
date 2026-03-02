const { PrismaClient } = require('@prisma/client');

// Singleton pattern for Prisma client to prevent connection pool exhaustion
let prisma;

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://postgres.ulapsnjzjtmzdysmello:Profitcast%402026@aws-1-ap-south-1.pooler.supabase.com:5432/postgres'
        }
      },
      log: ['error', 'warn'], // Reduce logging to prevent connection issues
      // Add connection pool configuration
      __internal: {
        engine: {
          // Optimize connection pool for better performance
          connectionLimit: 3, // Reduced from 10 to prevent pool exhaustion
          poolTimeout: 10000, // 10 seconds timeout
          idleTimeoutMillis: 30000, // 30 seconds idle timeout
          // Add connection retry configuration
          retryAttempts: 3,
          retryDelay: 1000
        }
      }
    });
  }
  return prisma;
}

// Create Prisma client with explicit database URL and optimized connection pool
const prismaClient = getPrismaClient();

// Test database connection with retry logic
async function testConnection() {
  try {
    await prismaClient.$connect();
    console.log('✅ Prisma database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Prisma database connection error:', error.message);
    console.error('🔄 Retrying connection in 5 seconds...');
    
    // Retry connection after delay
    setTimeout(async () => {
      try {
        await prismaClient.$connect();
        console.log('✅ Prisma database reconnected successfully');
      } catch (retryError) {
        console.error('❌ Prisma database retry failed:', retryError.message);
      }
    }, 5000);
    
    return false;
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prismaClient.$disconnect();
});

module.exports = { prisma: prismaClient, testConnection };
