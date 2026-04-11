-- Add threshold fields for auto-urgency calculation on case_deadlines
ALTER TABLE case_deadlines ADD COLUMN IF NOT EXISTS monitor_days INTEGER DEFAULT 7;
ALTER TABLE case_deadlines ADD COLUMN IF NOT EXISTS urgent_days INTEGER DEFAULT 3;
