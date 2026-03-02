const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

async function testFrontendAPI() {
  try {
    console.log('=== TESTING FRONTEND API ACCESS ===\n');

    // Get a Managing Director user
    const user = await prisma.user.findFirst({
      where: { role: 'MANAGING_DIRECTOR' }
    });

    if (!user) {
      console.log('❌ No Managing Director user found');
      return;
    }

    // Create a real JWT token (same as frontend would use)
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    console.log(`✅ Created token for user: ${user.name}`);
    console.log(`🔑 Token: ${token.substring(0, 30)}...`);

    // Test the API endpoint directly with curl-like simulation
    const express = require('express');
    const app = express();
    
    // Import the automation routes
    const automationRoutes = require('./src/routes/automation');
    
    // Mock request object
    const mockReq = {
      user: { id: user.id, email: user.email, role: user.role },
      params: {},
      body: {}
    };

    // Mock response object
    let responseData = null;
    let statusCode = 200;
    
    const mockRes = {
      status: (code) => {
        statusCode = code;
        return mockRes;
      },
      json: (data) => {
        responseData = data;
        return mockRes;
      }
    };

    // Mock next function
    const mockNext = (err) => {
      if (err) {
        console.log('❌ Middleware error:', err.message);
        statusCode = 500;
        responseData = { error: err.message };
      }
    };

    // Test the GET /automation route
    console.log('\n🔄 Testing GET /api/automation...');
    
    try {
      // Simulate the middleware chain
      const authMiddleware = require('./src/middleware/auth');
      
      // Test auth middleware
      authMiddleware(mockReq, mockRes, async () => {
        console.log('✅ Auth middleware passed');
        
        // Test automation routes
        const router = require('./src/routes/automation');
        
        // Create a mock request for GET /
        const getReq = { ...mockReq, method: 'GET', url: '/' };
        
        // Simulate the GET route
        router.stack.forEach(layer => {
          if (layer.route && layer.route.methods.get) {
            layer.route.stack.forEach(handler => {
              if (handler.handle) {
                handler.handle(getReq, mockRes, mockNext);
              }
            });
          }
        });
      });
      
      setTimeout(() => {
        console.log(`📊 Status Code: ${statusCode}`);
        console.log(`📄 Response Data:`, responseData);
        
        if (statusCode === 200 && responseData) {
          console.log('✅ Frontend API should work correctly!');
          console.log(`📋 Found ${responseData.length} automation rules`);
        } else {
          console.log('❌ Frontend API has issues');
        }
      }, 100);

    } catch (error) {
      console.error('❌ Error testing API:', error);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    setTimeout(() => {
      prisma.$disconnect();
    }, 500);
  }
}

testFrontendAPI();
