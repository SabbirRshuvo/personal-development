import {
  Client,
  Task,
  DailyLog,
  PrayerLog,
  RevenueEntry,
  HuntingLog,
  AppSettings,
  UrgeLog,
  RelapseLog,
  TimeSession,
} from '@/lib/types/database';

export const INITIAL_SETTINGS: AppSettings = {
  id: 'setting-default',
  user_id: 'local-user',
  profile_name: 'Sabbir Rahman Shuvo',
  daily_work_target_hours: 6.0,
  daily_english_target_hours: 1.0,
  daily_hunting_target_minutes: 45,
  currency_symbol: '৳',
  theme_preference: 'light',
  prayer_tracking_enabled: true,
  created_at: '2026-11-14T00:00:00.000Z',
  updated_at: '2026-11-14T00:00:00.000Z',
};

// All initial collections are genuinely empty for a production-ready first-use experience
export const INITIAL_CLIENTS: Client[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_REVENUE: RevenueEntry[] = [];

export const INITIAL_HUNTING_LOGS: HuntingLog[] = [];

export const INITIAL_URGE_LOGS: UrgeLog[] = [];

export const INITIAL_RELAPSE_LOGS: RelapseLog[] = [];

export const INITIAL_TIME_SESSIONS: TimeSession[] = [];

export const INITIAL_DAILY_LOG: DailyLog = {
  id: 'daily-log-initial',
  user_id: 'local-user',
  date: '2026-11-14',
  focused_work_hours: 0,
  client_work_hours: 0,
  learning_hours: 0,
  english_hours: 0,
  hunting_minutes: 0,
  wasted_minutes: 0,
  sleep_hours: 7,
  mood: 'ভালো',
  energy_level: 4,
  exercise_minutes: 0,
  best_thing_today: '',
  tomorrow_intention: '',
  created_at: '2026-11-14T00:00:00.000Z',
  updated_at: '2026-11-14T00:00:00.000Z',
};

export const INITIAL_PRAYER_LOG: PrayerLog = {
  id: 'prayer-log-initial',
  user_id: 'local-user',
  date: '2026-11-14',
  fajr: { status: 'পড়িনি', type: 'একা' },
  dhuhr: { status: 'পড়িনি', type: 'একা' },
  asr: { status: 'পড়িনি', type: 'একা' },
  maghrib: { status: 'পড়িনি', type: 'একা' },
  isha: { status: 'পড়িনি', type: 'একা' },
  notes: '',
  created_at: '2026-11-14T00:00:00.000Z',
  updated_at: '2026-11-14T00:00:00.000Z',
};
