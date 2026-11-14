export type Priority = 'জরুরি' | 'গুরুত্বপূর্ণ' | 'সাধারণ';
export type TaskStatus = 'বাকি' | 'চলছে' | 'সম্পন্ন' | 'আ আটকে আছে';
export type ClientStatus = 'চলমান' | 'অপেক্ষায়' | 'সম্পন্ন' | 'সম্ভাব্য';
export type PrayerStatus = 'পড়েছি' | 'পড়িনি';
export type PrayerType = 'জামাতে' | 'একা' | 'কাজা' | 'বাদ';
export type Mood = 'ভালো' | 'মাঝারি' | 'খারাপ';
export type TriggerType = 'একা থাকা' | 'boredom' | 'stress' | 'রাত জাগা' | 'social media' | 'অন্যান্য';
export type PaymentType = 'অগ্রিম' | 'মাইলস্টোন' | 'চূড়ান্ত' | 'অন্যান্য';
export type OutreachPlatform = 'Facebook' | 'LinkedIn' | 'Upwork' | 'রেফারেল' | 'অন্যান্য';

export type TimeSessionCategory =
  | 'client_work'
  | 'deep_focus'
  | 'client_hunting'
  | 'english_practice'
  | 'learning_class'
  | 'admin_planning'
  | 'break'
  | 'prayer'
  | 'exercise'
  | 'wasted_time'
  | 'other'
  | 'Client Work'
  | 'Deep Focus'
  | 'Client Hunting'
  | 'English Practice'
  | 'Learning/Class'
  | 'Admin/Planning'
  | 'Break'
  | 'Prayer'
  | 'Exercise'
  | 'Wasted Time'
  | 'Other';

export type BreakType =
  | 'খাবার'
  | 'নামাজ'
  | 'হাঁটা/ব্যায়াম'
  | 'বিশ্রাম'
  | 'পরিবার'
  | 'social_media'
  | 'Social media'
  | 'অন্যান্য'
  | 'Other';

export type SessionStatus = 'active' | 'paused' | 'completed' | 'cancelled' | 'running';

export interface TimeSession {
  id: string;
  user_id: string;
  client_id: string | null;
  client_name?: string | null;
  linked_client_id?: string | null;
  linked_client_name?: string | null;
  task_id: string | null;
  task_title?: string | null;
  linked_task_id?: string | null;
  linked_task_title?: string | null;
  category: TimeSessionCategory;
  break_type: BreakType | null;
  title: string;
  note: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  status: SessionStatus;
  is_pomodoro: boolean;
  pomodoro_focus_minutes?: number | null;
  pomodoro_break_minutes?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  client_name?: string;
  project_name: string;
  contact_info: string;
  status: ClientStatus;
  agreed_amount: number;
  paid_amount: number;
  remaining_amount: number;
  currency: string;
  notes: string;
  next_followup_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  client_id: string | null;
  client_name?: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  estimated_minutes: number;
  due_date: string; // YYYY-MM-DD
  created_date: string; // YYYY-MM-DD
  completed_at: string | null;
  tags: string[];
  blocker_notes: string;
  is_carried_forward: boolean;
  carried_forward_count: number;
  original_due_date: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TaskActivityHistory {
  id: string;
  task_id: string;
  user_id: string;
  action_type: 'তৈরি' | 'স্ট্যাটাস পরিবর্তন' | 'পুনরায় নির্ধারণ' | 'সম্পন্ন' | 'সম্পাদনা';
  note: string;
  logged_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  focused_work_hours: number;
  client_work_hours: number;
  learning_hours: number;
  english_hours: number;
  hunting_minutes: number;
  wasted_minutes: number;
  sleep_hours: number;
  mood: Mood;
  energy_level: number; // 1 to 5
  exercise_minutes: number;
  best_thing_today: string;
  tomorrow_intention: string;
  created_at: string;
  updated_at: string;
}

export interface PrayerLog {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  fajr: { status: PrayerStatus; type: PrayerType };
  dhuhr: { status: PrayerStatus; type: PrayerType };
  asr: { status: PrayerStatus; type: PrayerType };
  maghrib: { status: PrayerStatus; type: PrayerType };
  isha: { status: PrayerStatus; type: PrayerType };
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface UrgeLog {
  id: string;
  user_id: string;
  date: string;
  occurred: boolean;
  intensity: number; // 1 to 5
  time_of_day: string;
  trigger: TriggerType;
  recovery_action: string;
  private_note: string;
  created_at: string;
}

export interface RelapseLog {
  id: string;
  user_id: string;
  date: string;
  occurred: boolean;
  time_lost_minutes: number;
  trigger: TriggerType;
  recovery_action_taken: string;
  private_note: string;
  created_at: string;
}

export interface RevenueEntry {
  id: string;
  user_id: string;
  client_id: string | null;
  client_name?: string;
  amount: number;
  currency: string;
  received_date: string; // YYYY-MM-DD
  payment_type: PaymentType;
  notes: string;
  created_at: string;
}

export interface HuntingLog {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  platform: OutreachPlatform;
  messages_sent: number;
  responses_count: number;
  calls_count: number;
  leads_count: number;
  clients_closed: number;
  notes: string;
  created_at: string;
}

export interface AppSettings {
  id: string;
  user_id: string;
  profile_name: string;
  daily_work_target_hours: number;
  daily_english_target_hours: number;
  daily_hunting_target_minutes: number;
  currency_symbol: string;
  theme_preference: 'light' | 'dark' | 'system';
  prayer_tracking_enabled: boolean;
  created_at: string;
  updated_at: string;
}
