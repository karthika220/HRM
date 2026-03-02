const express = require('express');
const { authenticate } = require('../middleware/auth');
const AutomationService = require('../services/AutomationService');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Role-based access control middleware
const checkAutomationAccess = (req, res, next) => {
  const userRole = req.user.role;
  
  // Only Managing Director, HR, and Super Admin can access automation
  if (!['MANAGING_DIRECTOR', 'HR', 'SUPER_ADMIN'].includes(userRole)) {
    return res.status(403).json({ 
      error: 'Access denied. Automation module is restricted to Managing Director, HR, and Super Admin roles.' 
    });
  }
  
  next();
};

// Apply role check to all automation routes
router.use(checkAutomationAccess);

// GET /api/v1/automation - Get all automation rules
router.get('/', async (req, res) => {
  try {
    const rules = await AutomationService.getAllRules();
    res.json(rules);
  } catch (error) {
    console.error('Error fetching automation rules:', error);
    res.status(500).json({ error: 'Failed to fetch automation rules' });
  }
});

// POST /api/v1/automation - Create a new automation rule
router.post('/', async (req, res) => {
  try {
    const ruleData = req.body;
    const userId = req.user.id;
    
    const rule = await AutomationService.createRule(ruleData, userId);
    res.status(201).json(rule);
  } catch (error) {
    console.error('Error creating automation rule:', error);
    res.status(500).json({ error: 'Failed to create automation rule' });
  }
});

// PATCH /api/v1/automation/:id/toggle - Toggle automation rule
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedRule = await AutomationService.toggleRule(id);
    res.json(updatedRule);
  } catch (error) {
    console.error('Error toggling automation rule:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Automation rule not found' });
    }
    
    res.status(500).json({ error: 'Failed to toggle automation rule' });
  }
});

// DELETE /api/v1/automation/:id - Delete automation rule
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await AutomationService.deleteRule(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting automation rule:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Automation rule not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete automation rule' });
  }
});

module.exports = router;
