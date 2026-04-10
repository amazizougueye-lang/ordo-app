export type CaseStatus = 'urgent' | 'monitor' | 'stable'
export type DeadlineUrgency = 'urgent' | 'monitor' | 'stable'

export interface Case {
  id: string
  user_id: string
  name: string
  client_name: string
  status: CaseStatus
  deadline: string | null
  deadline_name: string | null
  deadline_urgency: DeadlineUrgency | null
  pinned: boolean
  archived: boolean
  case_type: string
  case_number: string | null
  summary: string | null
  created_at: string
  updated_at: string
  last_document_at: string | null
}

export interface Document {
  id: string
  case_id: string
  user_id: string
  name: string
  storage_path: string
  summary: string | null
  extracted_date: string | null
  doc_type: string | null
  created_at: string
}

export interface Note {
  id: string
  case_id: string
  user_id: string
  content: string
  created_at: string
}

export interface Profile {
  id: string
  email: string
  nom: string | null
  created_at: string
  daily_reminder_time: string // "08:00"
  daily_reminder_enabled: boolean
}

export interface CpcRule {
  id: string
  doc_type: string
  label: string
  deadlines: CpcDeadline[]
}

export interface CpcDeadline {
  label: string
  days: number
}

export interface CaseDeadline {
  id: string
  case_id: string
  user_id: string
  name: string
  deadline: string
  urgency: DeadlineUrgency
  completed: boolean
  snoozed_until: string | null
  created_at: string
  updated_at: string
}
