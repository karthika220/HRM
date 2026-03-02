-- Attendance Logs Table
CREATE TABLE IF NOT EXISTS attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  log_type TEXT NOT NULL CHECK (log_type IN ('IN', 'OUT')),
  log_time TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Attendance Summary Table (for daily totals)
CREATE TABLE IF NOT EXISTS attendance_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  date DATE NOT NULL,
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  total_work_minutes INTEGER DEFAULT 0,
  lunch_duration_minutes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Present' CHECK (status IN ('Present', 'Half Day', 'Absent', 'Overtime')),
  is_late BOOLEAN DEFAULT FALSE,
  is_overtime BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_logs_employee_date ON attendance_logs(employee_id, DATE(log_time));
CREATE INDEX IF NOT EXISTS idx_attendance_logs_type ON attendance_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_attendance_summary_date ON attendance_summary(date);
