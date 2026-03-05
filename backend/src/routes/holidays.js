const express = require('express');
const router = express.Router();

// Mock holiday data for testing
const mockHolidays = [
  {
    id: '1',
    name: 'Good Friday',
    date: '2026-04-18',
    type: 'Public Holiday'
  },
  {
    id: '2',
    name: 'Easter Monday',
    date: '2026-04-21',
    type: 'Public Holiday'
  },
  {
    id: '3',
    name: 'Labor Day',
    date: '2026-05-01',
    type: 'Public Holiday'
  },
  {
    id: '4',
    name: 'Memorial Day',
    date: '2026-05-26',
    type: 'Public Holiday'
  },
  {
    id: '5',
    name: 'Juneteenth',
    date: '2026-06-19',
    type: 'Public Holiday'
  },
  {
    id: '6',
    name: 'Independence Day',
    date: '2026-07-04',
    type: 'Public Holiday'
  },
  {
    id: '7',
    name: 'Team Building Day',
    date: '2026-03-15',
    type: 'Optional Holiday'
  }
];

// GET /api/holidays - Get all holidays
router.get('/', async (req, res) => {
  try {
    const sortedHolidays = mockHolidays.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json({
      success: true,
      data: sortedHolidays,
      message: 'All holidays retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch holidays'
    });
  }
});

// GET /api/holidays/upcoming - Get upcoming holidays for next 30 days
router.get('/upcoming', async (req, res) => {
  try {
    // For now, return all mock holidays sorted by date
    // In a real implementation, you would filter by date range
    const sortedHolidays = mockHolidays.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json({
      success: true,
      data: sortedHolidays,
      message: 'Upcoming holidays retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch holidays'
    });
  }
});

module.exports = router;
