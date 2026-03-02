const axios = require('axios');

// Test automation and tags
async function testFeatures() {
  try {
    console.log('🧪 Testing ProjectFlow Features...\n');

    // 1. Test project creation with services
    console.log('1️⃣ Creating project with services...');
    const projectData = {
      name: 'Test Automation Project',
      description: 'Testing automation and tags',
      status: 'ONBOARDING',
      startDate: '2026-02-26',
      endDate: '2026-02-28',
      budget: 1000,
      color: '#00A1C7',
      tags: ['TEST', 'AUTOMATION'],
      services: ['Meta Ads'],
      memberIds: [],
      createdBy: '09bc1d76-a602-44ce-aae9-09ce825b9a88',
      ownerIds: ['d69f594a-6a5c-459c-8c5c-da79108e2b31']
    };

    const projectResponse = await axios.post('http://localhost:3001/api/projects', projectData, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA5YmMxZDc2LWE2MDItNDRjZS1hYWU5LTA5Y2U4MjViOWE4OCIsInJvbGUiOiJNQU5BR0lOR19ESVJFQ1RPUiIsImlhdCI6MTc0MDY0NjgwMCwiZXhwIjoxNzQwNzMzNjAwfQ.8Q0hJh8hNlNt0mJ4cQdHtLwqN3tP4nL0aV8d0k',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Project created:', projectResponse.data.id);
    console.log('📋 Services:', projectResponse.data.services);
    console.log('🏷️  Tags:', projectResponse.data.tags);

    // 2. Test task creation (automation)
    console.log('\n2️⃣ Creating automated task...');
    const taskData = {
      title: 'Test Automated Task',
      description: 'This should be automated',
      status: 'TODO',
      priority: 'MEDIUM',
      projectId: projectResponse.data.id,
      service: 'META_ADS',
      isAutomated: true,
      ownerId: '09bc1d76-a602-44ce-aae9-09ce825b9a88'
    };

    const taskResponse = await axios.post('http://localhost:3001/api/tasks', taskData, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA5YmMxZDc2LWE2MDItNDRjZS1hYWU5LTA5Y2U4MjViOWE4OCIsInJvbGUiOiJNQU5BR0lOR19ESVJFQ1RPUiIsImlhdCI6MTc0MDY0NjgwMCwiZXhwIjoxNzQwNzMzNjAwfQ.8Q0hJh8hNlNt0mJ4cQdHtLwqN3tP4nL0aV8d0k',
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Task created:', taskResponse.data.id);
    console.log('🤖 Is Automated:', taskResponse.data.isAutomated);
    console.log('🔧 Service:', taskResponse.data.service);

    // 3. Test project retrieval
    console.log('\n3️⃣ Testing project retrieval...');
    const getProjectResponse = await axios.get(`http://localhost:3001/api/projects/${projectResponse.data.id}`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA5YmMxZDc2LWE2MDItNDRjZS1hYWU5LTA5Y2U4MjViOWE4OCIsInJvbGUiOiJNQU5BR0lOR19ESVJFQ1RPUiIsImlhdCI6MTc0MDY0NjgwMCwiZXhwIjoxNzQwNzMzNjAwfQ.8Q0hJh8hNlNt0mJ4cQdHtLwqN3tP4nL0aV8d0k'
      }
    });

    console.log('✅ Retrieved project tags:', getProjectResponse.data.tags);
    console.log('✅ Retrieved project services:', getProjectResponse.data.services);

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFeatures();
