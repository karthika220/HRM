-- Database Schema for Employee Management System

-- 1️⃣ Employees Table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  department TEXT,
  role TEXT,
  status TEXT DEFAULT 'Active',
  joining_date DATE,
  created_at TIMESTAMP DEFAULT now()
);

-- 2️⃣ Attendance Table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  check_in TIMESTAMP,
  lunch_start TIMESTAMP,
  lunch_end TIMESTAMP,
  check_out TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- 3️⃣ Leave Requests Table
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  leave_type TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX idx_attendance_check_in ON attendance(check_in);
CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_start_date ON leave_requests(start_date);

-- Comments for reference
COMMENT ON TABLE employees IS 'Employee master table with basic information';
COMMENT ON TABLE attendance IS 'Attendance tracking with check-in/out times';
COMMENT ON TABLE leave_requests IS 'Leave request management';

-- Sample data (optional - can be removed for production)
INSERT INTO employees (employee_id, full_name, email, phone, department, role, status, joining_date) VALUES
('EMP001', 'Sarah Johnson', 'sarah.johnson@company.com', '+1 (555) 123-4567', 'Engineering', 'Senior Developer', 'Active', '2022-03-15'),
('EMP002', 'Michael Chen', 'michael.chen@company.com', '+1 (555) 234-5678', 'Engineering', 'Engineering Manager', 'Active', '2021-08-20'),
('EMP003', 'Emma Davis', 'emma.davis@company.com', '+1 (555) 345-6789', 'Marketing', 'Marketing Specialist', 'On Leave', '2023-01-10'),
('EMP004', 'James Wilson', 'james.wilson@company.com', '+1 (555) 456-7890', 'Sales', 'Sales Representative', 'Active', '2022-11-05'),
('EMP005', 'Lisa Brown', 'lisa.brown@company.com', '+1 (555) 567-8901', 'HR', 'HR Manager', 'Active', '2021-05-12');
