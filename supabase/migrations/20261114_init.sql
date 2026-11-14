-- ==============================================================================
-- "আমার ডিসিপ্লিন" (Amar Discipline) - Supabase Database Schema & RLS Migration
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Function to automatically handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'ব্যবহারকারী',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- 2. CLIENTS
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  project_name text not null,
  contact_info text default '',
  status text not null default 'চলমান', -- 'চলমান', 'অপেক্ষায়', 'সম্পন্ন', 'সম্ভাব্য'
  agreed_amount numeric not null default 0,
  paid_amount numeric not null default 0,
  remaining_amount numeric generated always as (agreed_amount - paid_amount) stored,
  currency text not null default '৳',
  notes text default '',
  next_followup_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients enable row level security;
create policy "Users manage own clients" on public.clients for all using (auth.uid() = user_id);
create index idx_clients_user_id on public.clients(user_id);
create index idx_clients_status on public.clients(status);

-- 3. TASKS
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  description text default '',
  priority text not null default 'সাধারণ', -- 'জরুরি', 'গুরুত্বপূর্ণ', 'সাধারণ'
  status text not null default 'বাকি', -- 'বাকি', 'চলছে', 'সম্পন্ন', 'আ আটকে আছে'
  estimated_minutes integer not null default 30,
  due_date date not null default current_date,
  created_date date not null default current_date,
  completed_at timestamptz,
  tags text[] default '{}',
  blocker_notes text default '',
  is_carried_forward boolean not null default false,
  carried_forward_count integer not null default 0,
  original_due_date date not null default current_date,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
create policy "Users manage own tasks" on public.tasks for all using (auth.uid() = user_id);
create index idx_tasks_user_id on public.tasks(user_id);
create index idx_tasks_due_date on public.tasks(due_date);
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_priority on public.tasks(priority);
create index idx_tasks_client_id on public.tasks(client_id);

-- 4. TASK ACTIVITY HISTORY
create table if not exists public.task_activity_history (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null, -- 'তৈরি', 'স্ট্যাটাস পরিবর্তন', 'পুনরায় নির্ধারণ', 'সম্পন্ন'
  note text default '',
  logged_at timestamptz not null default now()
);

alter table public.task_activity_history enable row level security;
create policy "Users manage own task history" on public.task_activity_history for all using (auth.uid() = user_id);
create index idx_task_history_task on public.task_activity_history(task_id);

-- 5. DAILY LOGS
create table if not exists public.daily_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  focused_work_hours numeric not null default 0,
  client_work_hours numeric not null default 0,
  learning_hours numeric not null default 0,
  english_hours numeric not null default 0,
  hunting_minutes numeric not null default 0,
  wasted_minutes numeric not null default 0,
  sleep_hours numeric not null default 7,
  mood text not null default 'ভালো', -- 'ভালো', 'মাঝারি', 'খারাপ'
  energy_level integer not null default 4, -- 1 to 5
  exercise_minutes integer not null default 0,
  best_thing_today text default '',
  tomorrow_intention text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_user_daily_log unique (user_id, date)
);

alter table public.daily_logs enable row level security;
create policy "Users manage own daily logs" on public.daily_logs for all using (auth.uid() = user_id);
create index idx_daily_logs_user_date on public.daily_logs(user_id, date);

-- 6. PRAYER LOGS
create table if not exists public.prayer_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  fajr jsonb not null default '{"status": "পড়িনি", "type": "একা"}'::jsonb,
  dhuhr jsonb not null default '{"status": "পড়িনি", "type": "একা"}'::jsonb,
  asr jsonb not null default '{"status": "পড়িনি", "type": "একা"}'::jsonb,
  maghrib jsonb not null default '{"status": "পড়িনি", "type": "একা"}'::jsonb,
  isha jsonb not null default '{"status": "পড়িনি", "type": "একা"}'::jsonb,
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_user_prayer_log unique (user_id, date)
);

alter table public.prayer_logs enable row level security;
create policy "Users manage own prayer logs" on public.prayer_logs for all using (auth.uid() = user_id);
create index idx_prayer_logs_user_date on public.prayer_logs(user_id, date);

-- 7. URGE LOGS
create table if not exists public.urge_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  occurred boolean not null default true,
  intensity integer not null default 3, -- 1 to 5
  time_of_day text default '',
  trigger text not null default 'stress',
  recovery_action text default '',
  private_note text default '',
  created_at timestamptz not null default now()
);

alter table public.urge_logs enable row level security;
create policy "Users manage own urge logs" on public.urge_logs for all using (auth.uid() = user_id);
create index idx_urge_logs_user_date on public.urge_logs(user_id, date);

-- 8. RELAPSE LOGS
create table if not exists public.relapse_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  occurred boolean not null default true,
  time_lost_minutes integer not null default 0,
  trigger text not null default 'stress',
  recovery_action_taken text default '',
  private_note text default '',
  created_at timestamptz not null default now()
);

alter table public.relapse_logs enable row level security;
create policy "Users manage own relapse logs" on public.relapse_logs for all using (auth.uid() = user_id);
create index idx_relapse_logs_user_date on public.relapse_logs(user_id, date);

-- 9. REVENUE ENTRIES
create table if not exists public.revenue_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  amount numeric not null default 0,
  currency text not null default '৳',
  received_date date not null default current_date,
  payment_type text not null default 'অগ্রিম',
  notes text default '',
  created_at timestamptz not null default now()
);

alter table public.revenue_entries enable row level security;
create policy "Users manage own revenue" on public.revenue_entries for all using (auth.uid() = user_id);
create index idx_revenue_user_date on public.revenue_entries(user_id, received_date);
create index idx_revenue_client_id on public.revenue_entries(client_id);

-- 10. HUNTING LOGS
create table if not exists public.hunting_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  platform text not null default 'LinkedIn',
  messages_sent integer not null default 0,
  responses_count integer not null default 0,
  calls_count integer not null default 0,
  leads_count integer not null default 0,
  clients_closed integer not null default 0,
  notes text default '',
  created_at timestamptz not null default now()
);

alter table public.hunting_logs enable row level security;
create policy "Users manage own hunting logs" on public.hunting_logs for all using (auth.uid() = user_id);
create index idx_hunting_logs_user_date on public.hunting_logs(user_id, date);

-- 11. APP SETTINGS
create table if not exists public.app_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  profile_name text not null default 'সাব্বির আহমেদ',
  daily_work_target_hours numeric not null default 6,
  daily_english_target_hours numeric not null default 1,
  daily_hunting_target_minutes numeric not null default 45,
  currency_symbol text not null default '৳',
  theme_preference text not null default 'light',
  prayer_tracking_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;
create policy "Users manage own settings" on public.app_settings for all using (auth.uid() = user_id);

-- Updated_at triggers
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.handle_updated_at();
create trigger set_clients_updated_at before update on public.clients for each row execute function public.handle_updated_at();
create trigger set_tasks_updated_at before update on public.tasks for each row execute function public.handle_updated_at();
create trigger set_daily_logs_updated_at before update on public.daily_logs for each row execute function public.handle_updated_at();
create trigger set_prayer_logs_updated_at before update on public.prayer_logs for each row execute function public.handle_updated_at();
create trigger set_app_settings_updated_at before update on public.app_settings for each row execute function public.handle_updated_at();
