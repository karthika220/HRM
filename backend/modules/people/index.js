const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Initialize Supabase client with fallback
let supabase;
try {
  supabase = createClient(
    process.env.SUPABSE_URL || process.env.SUPABASE_URL,
    process.env.SUPABSE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  console.log('✅ Supabase client initialized');
} catch (error) {
  console.log('⚠️  Supabase not configured, using mock data');
  supabase = null;
}

// GET /api/people/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    if (!supabase) {
      // Return mock data when Supabase is not configured
      return res.json({
        totalEmployees: 5,
        presentToday: 3,
        absentToday: 2,
        lateArrivals: 1
      });
    }

    // Get total employees count
    const { count: totalEmployees, error: totalError } = await supabase
      .from('employees')
      .select('id');
    
    if (totalError) {
      console.error('Error counting employees:', totalError);
      return res.status(500).json({ message: 'Error counting employees' });
    }

    // Get today's attendance
    const today = new Date().toISOString().split('T')[0];
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select('employee_id, check_in, check_out')
      .gte('check_in', `${today}T00:00:00Z`)
      .lt('check_in', `${today}T23:59:59ZZ`);
    
    if (attendanceError) {
      console.error('Error fetching attendance:', attendanceError);
      return res.status(500).json({ message: 'Error fetching attendance' });
    }

    // Count present employees (those who checked in today)
    const presentEmployeeIds = attendanceData
      .filter(record => record.check_in && !record.check_out)
      .map(record => record.employee_id);
    
    const presentToday = new Set(presentEmployeeIds).size;
    const absentToday = totalEmployees - presentToday;
    
    // Count late arrivals (check-in after 09:15)
    const lateArrivals = attendanceData
      .filter(record => {
        const checkInTime = new Date(record.check_in);
        const lateTime = new Date(`${today}T09:15:00Z`);
        return checkInTime > lateTime;
      }).length;

    const dashboardData = {
      totalEmployees,
      presentToday,
      absentToday,
      lateArrivals
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error during dashboard fetch' });
  }
});

// GET /api/people/employees
router.get('/employees', async (req, res) => {
  try {
    if (!supabase) {
      // Return mock data when Supabase is not configured
      return res.json([
        {
          id: '1',
          employee_id: 'EMP001',
          full_name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          phone: '+1 (555) 123-4567',
          department: 'Engineering',
          role: 'Senior Developer',
          status: 'Active',
          joining_date: '2022-03-15',
          created_at: '2022-03-15T00:00:00Z'
        },
        {
          id: '2',
          employee_id: 'EMP002',
          full_name: 'Michael Chen',
          email: 'michael.chen@company.com',
          phone: '+1 (555) 234-5678',
          department: 'Engineering',
          role: 'Engineering Manager',
          status: 'Active',
          joining_date: '2021-08-20',
          created_at: '2021-08-20T00:00:00Z'
        },
        {
          id: '3',
          employee_id: 'EMP003',
          full_name: 'Emma Davis',
          email: 'emma.davis@company.com',
          phone: '+1 (555) 345-6789',
          department: 'Marketing',
          role: 'Marketing Specialist',
          status: 'On Leave',
          joining_date: '2023-01-10',
          created_at: '2023-01-10T00:00:00Z'
        },
        {
          id: '4',
          employee_id: 'EMP004',
          full_name: 'James Wilson',
          email: 'james.wilson@company.com',
          phone: '+1 (555) 456-7890',
          department: 'Sales',
          role: 'Sales Representative',
          status: 'Active',
          joining_date: '2022-11-05',
          created_at: '2022-11-05T00:00:00Z'
        },
        {
          id: '5',
          employee_id: 'EMP005',
          full_name: 'Lisa Brown',
          email: 'lisa.brown@company.com',
          phone: '+1 (555) 567-8901',
          department: 'HR',
          role: 'HR Manager',
          status: 'Active',
          joining_date: '2021-05-12',
          created_at: '2021-05-12T00:00:00Z'
        }
      ]);
    }

    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching employees:', error);
      return res.status(500).json({ message: 'Error fetching employees' });
    }
    
    res.json(employees);
  } catch (error) {
    console.error('Employees list error:', error);
    res.status(500).json({ message: 'Server error during employees fetch' });
  }
});

// GET /api/people/employees/:id
router.get('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!supabase) {
      // Return mock data when Supabase is not configured
      const mockEmployees = [
        {
          id: '1',
          employee_id: 'EMP001',
          full_name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          phone: '+1 (555) 123-4567',
          department: 'Engineering',
          role: 'Senior Developer',
          status: 'Active',
          joining_date: '2022-03-15',
          created_at: '2022-03-15T00:00:00Z'
        },
        {
          id: '2',
          employee_id: 'EMP002',
          full_name: 'Michael Chen',
          email: 'michael.chen@company.com',
          phone: '+1 (555) 234-5678',
          department: 'Engineering',
          role: 'Engineering Manager',
          status: 'Active',
          joining_date: '2021-08-20',
          created_at: '2021-08-20T00:00:00Z'
        }
      ];
      
      const employee = mockEmployees.find(emp => emp.id === id);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      
      const employeeDetails = {
        ...employee,
        attendance: {
          totalDays: 245,
          presentDays: 235,
          lateDays: 10
        },
        leaveHistory: [
          {
            id: '1',
            leave_type: 'Annual Leave',
            start_date: '2024-01-10',
            end_date: '2024-01-12',
            status: 'Approved',
            created_at: '2024-01-05T00:00:00Z'
          },
          {
            id: '2',
            leave_type: 'Sick Leave',
            start_date: '2024-02-01',
            end_date: '2024-02-02',
            status: 'Pending',
            created_at: '2024-01-30T00:00:00Z'
          }
        ]
      };
      
      return res.json(employeeDetails);
    }
    
    // Get employee details
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
    
    if (employeeError || !employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Get attendance summary
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select('check_in, check_out, created_at')
      .eq('employee_id', id);
    
    // Get leave history
    const { data: leaveData, error: leaveError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('employee_id', id)
      .order('created_at', { ascending: false });
    
    const attendanceSummary = {
      totalDays: attendanceData?.length || 0,
      presentDays: attendanceData?.filter(a => a.check_in).length || 0,
      lateDays: attendanceData?.filter(a => {
        const checkInTime = new Date(a.check_in);
        const lateTime = new Date(checkInTime.toISOString().split('T')[0] + 'T09:15:00Z');
        return checkInTime > lateTime;
      }).length || 0
    };
    
    const employeeDetails = {
      ...employee,
      attendance: attendanceSummary,
      leaveHistory: leaveData || []
    };
    
    res.json(employeeDetails);
  } catch (error) {
    console.error('Employee details error:', error);
    res.status(500).json({ message: 'Server error during employee details fetch' });
  }
});

// POST /api/people/employees
router.post('/employees', async (req, res) => {
  try {
    const {
      employee_id,
      full_name,
      email,
      phone,
      department,
      role,
      status = 'Active',
      joining_date
    } = req.body;
    
    // Validate required fields
    if (!employee_id || !full_name || !email) {
      return res.status(400).json({ message: 'Employee ID, full name, and email are required' });
    }
    
    if (!supabase) {
      // Return mock response when Supabase is not configured
      const newEmployee = {
        id: '6',
        employee_id,
        full_name,
        email,
        phone,
        department,
        role,
        status,
        joining_date,
        created_at: new Date().toISOString()
      };
      
      return res.status(201).json({
        message: 'Employee created successfully',
        employee: newEmployee
      });
    }
    
    // Check if employee_id already exists
    const { data: existingEmployee, error: existingError } = await supabase
      .from('employees')
      .select('employee_id')
      .eq('employee_id', employee_id);
    
    if (existingError) {
      console.error('Error checking existing employee:', existingError);
      return res.status(500).json({ message: 'Error checking existing employee' });
    }
    
    if (existingEmployee && existingEmployee.length > 0) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }
    
    // Check if email already exists
    const { data: existingEmail, error: emailError } = await supabase
      .from('employees')
      .select('email')
      .eq('email', email);
    
    if (emailError) {
      console.error('Error checking existing email:', emailError);
      return res.status(500).json({ message: 'Error checking existing email' });
    }
    
    if (existingEmail && existingEmail.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Create new employee
    const { data: newEmployee, error: createError } = await supabase
      .from('employees')
      .insert([{
        employee_id,
        full_name,
        email,
        phone,
        department,
        role,
        status,
        joining_date
      }])
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating employee:', createError);
      return res.status(500).json({ message: 'Error creating employee' });
    }
    
    res.status(201).json({
      message: 'Employee created successfully',
      employee: newEmployee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error during employee creation' });
  }
});

// PUT /api/people/employees/:id
router.put('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!supabase) {
      // Return mock response when Supabase is not configured
      const updatedEmployee = {
        id,
        employee_id: 'EMP001',
        full_name: updateData.full_name || 'Sarah Johnson',
        email: updateData.email || 'sarah.johnson@company.com',
        phone: updateData.phone || '+1 (555) 123-4567',
        department: updateData.department || 'Engineering',
        role: updateData.role || 'Senior Developer',
        status: updateData.status || 'Active',
        joining_date: updateData.joining_date || '2022-03-15',
        created_at: '2022-03-15T00:00:00Z',
        ...updateData
      };
      
      return res.json({
        message: 'Employee updated successfully',
        employee: updatedEmployee
      });
    }
    
    // Check if employee exists
    const { data: existingEmployee, error: existingError } = await supabase
      .from('employees')
      .select('id')
      .eq('id', id)
      .single();
    
    if (existingError || !existingEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Update employee
    const { data: updatedEmployee, error: updateError } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating employee:', updateError);
      return res.status(500).json({ message: 'Error updating employee' });
    }
    
    res.json({
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error during employee update' });
  }
});

module.exports = router;
