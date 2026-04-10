-- Add urgency, completed, snoozed_until to case_deadlines
ALTER TABLE case_deadlines ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'stable';
ALTER TABLE case_deadlines ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;
ALTER TABLE case_deadlines ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMP WITH TIME ZONE;

-- Add urgency for the main deadline on cases
ALTER TABLE cases ADD COLUMN IF NOT EXISTS deadline_urgency TEXT DEFAULT 'stable';
