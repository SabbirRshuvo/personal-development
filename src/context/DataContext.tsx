'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Task,
  Client,
  DailyLog,
  PrayerLog,
  RevenueEntry,
  HuntingLog,
  AppSettings,
  UrgeLog,
  RelapseLog,
  PrayerStatus,
  PrayerType,
  TimeSession,
  TimeSessionCategory,
  BreakType,
} from '@/lib/types/database';
import {
  INITIAL_SETTINGS,
} from '@/lib/utils/demo-data';
import { getTodayDateString } from '@/lib/utils/bangla';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

const generateSessionId = () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export interface TrackedDayStats {
  focusedWorkSeconds: number;
  clientWorkSeconds: number;
  englishSeconds: number;
  learningSeconds: number;
  huntingSeconds: number;
  wastedSeconds: number;
  breakSeconds: number;
  prayerBreakSeconds: number;
  totalTrackedSeconds: number;
  pomodoroSessionsCount: number;
  // Conveniences in minutes & counts
  totalFocusMinutes: number;
  breakMinutes: number;
  englishMinutes: number;
  huntingMinutes: number;
  learningMinutes: number;
  wastedMinutes: number;
  completedPomodoros: number;
}

interface DataContextType {
  tasks: Task[];
  clients: Client[];
  dailyLog: DailyLog;
  allDailyLogs: Record<string, DailyLog>;
  prayerLog: PrayerLog;
  revenue: RevenueEntry[];
  huntingLogs: HuntingLog[];
  urgeLogs: UrgeLog[];
  relapseLogs: RelapseLog[];
  timeSessions: TimeSession[];
  todaySessions: TimeSession[];
  activeSession: TimeSession | null;
  todayTrackedStats: TrackedDayStats;
  settings: AppSettings;
  language: 'bn' | 'en';
  setLanguage: (lang: 'bn' | 'en') => void;
  currentDate: string;
  isOnlineDemo: boolean;
  isSaving: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  refreshData: () => Promise<void>;
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  rescheduleTaskForToday: (id: string) => Promise<void>;
  reorderTasks: (newTasks: Task[]) => Promise<void>;
  // Client actions
  addClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'remaining_amount'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  // Daily log actions
  updateDailyLog: (updates: Partial<DailyLog>) => Promise<void>;
  // Prayer log actions
  updatePrayerStatus: (
    prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
    status: PrayerStatus,
    type?: PrayerType
  ) => Promise<void>;
  updatePrayerNotes: (notes: string) => Promise<void>;
  // Urge & Relapse actions
  addUrgeLog: (log: Omit<UrgeLog, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  addRelapseLog: (log: Omit<RelapseLog, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  // Revenue & Hunting
  addRevenue: (entry: Omit<RevenueEntry, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  deleteRevenue: (id: string) => Promise<void>;
  addHuntingLog: (log: Omit<HuntingLog, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  deleteHuntingLog: (id: string) => Promise<void>;
  // Live Timer & Work Timeline actions
  startSession: (params: {
    category: TimeSessionCategory;
    clientId?: string | null;
    taskId?: string | null;
    title?: string;
    note?: string;
    isPomodoro?: boolean;
    pomodoroFocusMinutes?: number;
    pomodoroBreakMinutes?: number;
  }) => Promise<TimeSession>;
  pauseSession: (id?: string) => Promise<void>;
  resumeSession: (id?: string) => Promise<void>;
  stopSession: (id?: string) => Promise<TimeSession | null>;
  startBreak: (
    breakTypeOrParams?: BreakType | { breakType?: BreakType; note?: string },
    maybeNote?: string
  ) => Promise<TimeSession>;
  resumeFocusFromBreak: (params?: {
    category?: TimeSessionCategory;
    clientId?: string | null;
    taskId?: string | null;
  }) => Promise<TimeSession>;
  addPastSession: (session: Omit<TimeSession, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<TimeSession>;
  updateSession: (id: string, updates: Partial<TimeSession>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  // Settings
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetToDemoData: () => void;
  clearAllUserData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CLEAN_FLAG: 'amar_discipline_clean_flag_v3',
  TASKS: 'amar_discipline_tasks_v3',
  CLIENTS: 'amar_discipline_clients_v3',
  DAILY_LOGS: 'amar_discipline_daily_logs_v3',
  PRAYER_LOGS: 'amar_discipline_prayer_logs_v3',
  REVENUE: 'amar_discipline_revenue_v3',
  HUNTING: 'amar_discipline_hunting_v3',
  URGE: 'amar_discipline_urge_v3',
  RELAPSE: 'amar_discipline_relapse_v3',
  SETTINGS: 'amar_discipline_settings_v3',
  TIME_SESSIONS: 'amar_discipline_time_sessions_v3',
  ACTIVE_SESSION: 'amar_discipline_active_session_v3',
  LANGUAGE: 'amar_discipline_language_v3',
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [allDailyLogs, setAllDailyLogs] = useState<Record<string, DailyLog>>({});
  const [allPrayerLogs, setAllPrayerLogs] = useState<Record<string, PrayerLog>>({});
  const [revenue, setRevenue] = useState<RevenueEntry[]>([]);
  const [huntingLogs, setHuntingLogs] = useState<HuntingLog[]>([]);
  const [urgeLogs, setUrgeLogs] = useState<UrgeLog[]>([]);
  const [relapseLogs, setRelapseLogs] = useState<RelapseLog[]>([]);
  const [timeSessions, setTimeSessions] = useState<TimeSession[]>([]);
  const [activeSession, setActiveSession] = useState<TimeSession | null>(null);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [language, setLanguageState] = useState<'bn' | 'en'>('bn');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('local-user');

  const supabase = useMemo(() => createClient(), []);
  const supabaseConnected = isSupabaseConfigured() && Boolean(supabase);

  const setLanguage = (lang: 'bn' | 'en') => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch {}
  };

  // Purge any legacy dummy/seed data from localStorage on first run
  const purgeLegacyMockData = () => {
    try {
      const isClean = localStorage.getItem(STORAGE_KEYS.CLEAN_FLAG);
      if (!isClean) {
        // Clear all previous mock keys
        localStorage.removeItem('amar_discipline_tasks_v2');
        localStorage.removeItem('amar_discipline_clients_v2');
        localStorage.removeItem('amar_discipline_daily_logs_v2');
        localStorage.removeItem('amar_discipline_prayer_logs_v2');
        localStorage.removeItem('amar_discipline_revenue_v2');
        localStorage.removeItem('amar_discipline_hunting_v2');
        localStorage.removeItem('amar_discipline_urge_v2');
        localStorage.removeItem('amar_discipline_relapse_v2');
        localStorage.removeItem('amar_discipline_settings_v2');
        localStorage.removeItem('amar_discipline_time_sessions_v2');
        localStorage.removeItem('amar_discipline_active_session_v2');
        localStorage.setItem(STORAGE_KEYS.CLEAN_FLAG, 'true');
      }
    } catch {}
  };

  // Load Data from Supabase (or clean localStorage fallback)
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    purgeLegacyMockData();

    const todayStr = getTodayDateString();
    setSelectedDate(todayStr);

    try {
      if (supabase && supabaseConnected) {
        // Check current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        const uid = user?.id || 'local-user';
        setCurrentUserId(uid);

        // Fetch from Supabase tables
        const [
          tasksRes,
          clientsRes,
          dailyLogsRes,
          prayerLogsRes,
          revenueRes,
          huntingRes,
          urgeRes,
          relapseRes,
          sessionsRes,
          settingsRes,
        ] = await Promise.all([
          supabase.from('tasks').select('*').order('display_order', { ascending: true }),
          supabase.from('clients').select('*').order('created_at', { ascending: false }),
          supabase.from('daily_logs').select('*'),
          supabase.from('prayer_logs').select('*'),
          supabase.from('revenue_entries').select('*').order('received_date', { ascending: false }),
          supabase.from('hunting_logs').select('*').order('date', { ascending: false }),
          supabase.from('urge_logs').select('*').order('created_at', { ascending: false }),
          supabase.from('relapse_logs').select('*').order('created_at', { ascending: false }),
          supabase.from('time_sessions').select('*').order('started_at', { ascending: false }),
          supabase.from('app_settings').select('*').maybeSingle(),
        ]);

        // Process Tasks & carry-forward
        let fetchedTasks: Task[] = (tasksRes.data as Task[]) || [];
        let hasCarriedForward = false;
        fetchedTasks = fetchedTasks.map((t) => {
          if (t.status !== 'সম্পন্ন' && t.due_date < todayStr) {
            hasCarriedForward = true;
            return {
              ...t,
              due_date: todayStr,
              is_carried_forward: true,
              carried_forward_count: (t.carried_forward_count || 0) + 1,
              updated_at: new Date().toISOString(),
            };
          }
          return t;
        });
        setTasks(fetchedTasks);
        if (hasCarriedForward && user) {
          // Sync carry forward updates
          fetchedTasks
            .filter((t) => t.is_carried_forward && t.due_date === todayStr)
            .forEach((t) => {
              supabase.from('tasks').update({
                due_date: todayStr,
                is_carried_forward: true,
                carried_forward_count: t.carried_forward_count,
              }).eq('id', t.id);
            });
        }

        // Process Clients
        setClients((clientsRes.data as Client[]) || []);

        // Process Daily Logs
        const dailyLogsMap: Record<string, DailyLog> = {};
        if (dailyLogsRes.data) {
          dailyLogsRes.data.forEach((d: DailyLog) => {
            dailyLogsMap[d.date] = d;
          });
        }
        setAllDailyLogs(dailyLogsMap);

        // Process Prayer Logs
        const prayerLogsMap: Record<string, PrayerLog> = {};
        if (prayerLogsRes.data) {
          prayerLogsRes.data.forEach((p: PrayerLog) => {
            prayerLogsMap[p.date] = p;
          });
        }
        setAllPrayerLogs(prayerLogsMap);

        // Process Revenue, Hunting, Urge, Relapse
        setRevenue((revenueRes.data as RevenueEntry[]) || []);
        setHuntingLogs((huntingRes.data as HuntingLog[]) || []);
        setUrgeLogs((urgeRes.data as UrgeLog[]) || []);
        setRelapseLogs((relapseRes.data as RelapseLog[]) || []);

        // Process Time Sessions & Active Timer
        const fetchedSessions: TimeSession[] = (sessionsRes.data as TimeSession[]) || [];
        setTimeSessions(fetchedSessions);

        const currentRunning = fetchedSessions.find(
          (s) => s.status === 'active' || s.status === 'paused' || s.status === 'running'
        );
        setActiveSession(currentRunning || null);

        // Process Settings
        if (settingsRes.data) {
          setSettings(settingsRes.data as AppSettings);
        } else {
          setSettings({ ...INITIAL_SETTINGS, user_id: uid });
        }
      } else {
        // Fallback to local storage (strictly real user data only, initial state is empty [])
        const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
        const storedClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
        const storedDailyLogs = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
        const storedPrayerLogs = localStorage.getItem(STORAGE_KEYS.PRAYER_LOGS);
        const storedRevenue = localStorage.getItem(STORAGE_KEYS.REVENUE);
        const storedHunting = localStorage.getItem(STORAGE_KEYS.HUNTING);
        const storedUrge = localStorage.getItem(STORAGE_KEYS.URGE);
        const storedRelapse = localStorage.getItem(STORAGE_KEYS.RELAPSE);
        const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        const storedSessions = localStorage.getItem(STORAGE_KEYS.TIME_SESSIONS);
        const storedActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
        const storedLang = localStorage.getItem(STORAGE_KEYS.LANGUAGE);

        if (storedLang === 'bn' || storedLang === 'en') {
          setLanguageState(storedLang);
        }

        let parsedTasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
        const parsedClients: Client[] = storedClients ? JSON.parse(storedClients) : [];

        // Automatic carry forward
        parsedTasks = parsedTasks.map((t) => {
          if (t.status !== 'সম্পন্ন' && t.due_date < todayStr) {
            return {
              ...t,
              due_date: todayStr,
              is_carried_forward: true,
              carried_forward_count: (t.carried_forward_count || 0) + 1,
              updated_at: new Date().toISOString(),
            };
          }
          return t;
        });

        setTasks(parsedTasks);
        setClients(parsedClients);
        setAllDailyLogs(storedDailyLogs ? JSON.parse(storedDailyLogs) : {});
        setAllPrayerLogs(storedPrayerLogs ? JSON.parse(storedPrayerLogs) : {});
        setRevenue(storedRevenue ? JSON.parse(storedRevenue) : []);
        setHuntingLogs(storedHunting ? JSON.parse(storedHunting) : []);
        setUrgeLogs(storedUrge ? JSON.parse(storedUrge) : []);
        setRelapseLogs(storedRelapse ? JSON.parse(storedRelapse) : []);
        setSettings(storedSettings ? JSON.parse(storedSettings) : INITIAL_SETTINGS);

        const parsedSessions: TimeSession[] = storedSessions ? JSON.parse(storedSessions) : [];
        setTimeSessions(parsedSessions);

        if (storedActive) {
          setActiveSession(JSON.parse(storedActive));
        } else {
          const running = parsedSessions.find(
            (s) => s.status === 'active' || s.status === 'paused' || s.status === 'running'
          );
          setActiveSession(running || null);
        }
      }
    } catch (err: any) {
      console.error('Error loading Supabase/local data:', err);
      setErrorMessage(err?.message || 'ডেটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, supabaseConnected]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time Supabase Subscription for multi-device sync
  useEffect(() => {
    if (!supabase || !supabaseConnected) return;

    const channel = supabase
      .channel('amar_discipline_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_sessions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new as TimeSession;
            setTimeSessions((prev) => [newRow, ...prev.filter((s) => s.id !== newRow.id)]);
            if (newRow.status === 'active' || newRow.status === 'paused') {
              setActiveSession(newRow);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedRow = payload.new as TimeSession;
            setTimeSessions((prev) =>
              prev.map((s) => (s.id === updatedRow.id ? updatedRow : s))
            );
            if (updatedRow.status === 'completed' || updatedRow.status === 'cancelled') {
              setActiveSession((prev) => (prev?.id === updatedRow.id ? null : prev));
            } else if (updatedRow.status === 'active' || updatedRow.status === 'paused') {
              setActiveSession(updatedRow);
            }
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id;
            setTimeSessions((prev) => prev.filter((s) => s.id !== oldId));
            setActiveSession((prev) => (prev?.id === oldId ? null : prev));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new as Task;
            setTasks((prev) => [newRow, ...prev.filter((t) => t.id !== newRow.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedRow = payload.new as Task;
            setTasks((prev) => prev.map((t) => (t.id === updatedRow.id ? updatedRow : t)));
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, supabaseConnected]);

  // Backup sync to LocalStorage
  useEffect(() => {
    if (isLoading) return;
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
      localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(allDailyLogs));
      localStorage.setItem(STORAGE_KEYS.PRAYER_LOGS, JSON.stringify(allPrayerLogs));
      localStorage.setItem(STORAGE_KEYS.REVENUE, JSON.stringify(revenue));
      localStorage.setItem(STORAGE_KEYS.HUNTING, JSON.stringify(huntingLogs));
      localStorage.setItem(STORAGE_KEYS.URGE, JSON.stringify(urgeLogs));
      localStorage.setItem(STORAGE_KEYS.RELAPSE, JSON.stringify(relapseLogs));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEYS.TIME_SESSIONS, JSON.stringify(timeSessions));
      if (activeSession) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(activeSession));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      }
    } catch (e) {
      console.warn('LocalStorage backup sync failed:', e);
    }
  }, [
    tasks,
    clients,
    allDailyLogs,
    allPrayerLogs,
    revenue,
    huntingLogs,
    urgeLogs,
    relapseLogs,
    settings,
    timeSessions,
    activeSession,
    isLoading,
  ]);

  // Tracked stats calculated strictly from real sessions
  const todayTrackedStats: TrackedDayStats = useMemo(() => {
    const daySessions = timeSessions.filter((s) => s.started_at.startsWith(selectedDate));
    let focusedWorkSeconds = 0;
    let clientWorkSeconds = 0;
    let englishSeconds = 0;
    let learningSeconds = 0;
    let huntingSeconds = 0;
    let wastedSeconds = 0;
    let breakSeconds = 0;
    let prayerBreakSeconds = 0;
    let totalTrackedSeconds = 0;
    let pomodoroSessionsCount = 0;

    daySessions.forEach((s) => {
      const dur = s.duration_seconds || 0;
      totalTrackedSeconds += dur;
      if (s.is_pomodoro && (s.status === 'completed' || s.duration_seconds >= 1500)) {
        pomodoroSessionsCount += 1;
      }

      switch (s.category) {
        case 'deep_focus':
        case 'Deep Focus':
        case 'admin_planning':
        case 'Admin/Planning':
        case 'other':
        case 'Other':
          focusedWorkSeconds += dur;
          break;
        case 'client_work':
        case 'Client Work':
          clientWorkSeconds += dur;
          focusedWorkSeconds += dur;
          break;
        case 'english_practice':
        case 'English Practice':
          englishSeconds += dur;
          focusedWorkSeconds += dur;
          break;
        case 'learning_class':
        case 'Learning/Class':
          learningSeconds += dur;
          focusedWorkSeconds += dur;
          break;
        case 'client_hunting':
        case 'Client Hunting':
          huntingSeconds += dur;
          break;
        case 'wasted_time':
        case 'Wasted Time':
          wastedSeconds += dur;
          break;
        case 'break':
        case 'Break':
        case 'exercise':
        case 'Exercise':
          breakSeconds += dur;
          break;
        case 'prayer':
        case 'Prayer':
          prayerBreakSeconds += dur;
          breakSeconds += dur;
          break;
        default:
          focusedWorkSeconds += dur;
          break;
      }
    });

    return {
      focusedWorkSeconds,
      clientWorkSeconds,
      englishSeconds,
      learningSeconds,
      huntingSeconds,
      wastedSeconds,
      breakSeconds,
      prayerBreakSeconds,
      totalTrackedSeconds,
      pomodoroSessionsCount,
      totalFocusMinutes: Math.round(focusedWorkSeconds / 60),
      breakMinutes: Math.round(breakSeconds / 60),
      englishMinutes: Math.round(englishSeconds / 60),
      huntingMinutes: Math.round(huntingSeconds / 60),
      learningMinutes: Math.round(learningSeconds / 60),
      wastedMinutes: Math.round(wastedSeconds / 60),
      completedPomodoros: pomodoroSessionsCount,
    };
  }, [timeSessions, selectedDate]);

  // Current Daily Log for selectedDate (seamlessly blends real tracked sessions)
  const currentDailyLog: DailyLog = useMemo(() => {
    const raw = allDailyLogs[selectedDate];
    const trackedFocusedHours = Number((todayTrackedStats.focusedWorkSeconds / 3600).toFixed(1));
    const trackedClientHours = Number((todayTrackedStats.clientWorkSeconds / 3600).toFixed(1));
    const trackedEnglishHours = Number((todayTrackedStats.englishSeconds / 3600).toFixed(1));
    const trackedHuntingMinutes = Math.round(todayTrackedStats.huntingSeconds / 60);
    const trackedWastedMinutes = Math.round(todayTrackedStats.wastedSeconds / 60);

    if (raw) {
      return {
        ...raw,
        focused_work_hours: trackedFocusedHours > 0 ? trackedFocusedHours : raw.focused_work_hours,
        client_work_hours: trackedClientHours > 0 ? trackedClientHours : raw.client_work_hours,
        english_hours: trackedEnglishHours > 0 ? trackedEnglishHours : raw.english_hours,
        hunting_minutes: trackedHuntingMinutes > 0 ? trackedHuntingMinutes : raw.hunting_minutes,
        wasted_minutes: trackedWastedMinutes > 0 ? trackedWastedMinutes : raw.wasted_minutes,
      };
    }

    return {
      id: `daily-log-${selectedDate}`,
      user_id: currentUserId,
      date: selectedDate,
      focused_work_hours: trackedFocusedHours || 0,
      client_work_hours: trackedClientHours || 0,
      learning_hours: 0,
      english_hours: trackedEnglishHours || 0,
      hunting_minutes: trackedHuntingMinutes || 0,
      wasted_minutes: trackedWastedMinutes || 0,
      sleep_hours: 7,
      mood: 'ভালো',
      energy_level: 4,
      exercise_minutes: 0,
      best_thing_today: '',
      tomorrow_intention: '',
      created_at: `${selectedDate}T00:00:00.000Z`,
      updated_at: `${selectedDate}T00:00:00.000Z`,
    };
  }, [allDailyLogs, selectedDate, todayTrackedStats, currentUserId]);

  // Current Prayer Log for selectedDate
  const currentPrayerLog: PrayerLog = useMemo(() => {
    if (allPrayerLogs[selectedDate]) {
      return allPrayerLogs[selectedDate];
    }
    return {
      id: `prayer-log-${selectedDate}`,
      user_id: currentUserId,
      date: selectedDate,
      fajr: { status: 'পড়িনি', type: 'একা' },
      dhuhr: { status: 'পড়িনি', type: 'একা' },
      asr: { status: 'পড়িনি', type: 'একা' },
      maghrib: { status: 'পড়িনি', type: 'একা' },
      isha: { status: 'পড়িনি', type: 'একা' },
      notes: '',
      created_at: `${selectedDate}T00:00:00.000Z`,
      updated_at: `${selectedDate}T00:00:00.000Z`,
    };
  }, [allPrayerLogs, selectedDate, currentUserId]);

  // ================= TASK ACTIONS =================
  const addTask = async (
    taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ): Promise<Task> => {
    setIsSaving(true);
    const nowIso = new Date().toISOString();

    const clientObj = clients.find((c) => c.id === taskData.client_id);
    const clientName = clientObj ? (clientObj.name || clientObj.client_name) : undefined;

    let createdTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      user_id: currentUserId,
      client_name: clientName,
      display_order: tasks.length + 1,
      created_at: nowIso,
      updated_at: nowIso,
    };

    if (supabase && supabaseConnected) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            user_id: currentUserId,
            client_id: taskData.client_id || null,
            title: taskData.title,
            description: taskData.description || '',
            priority: taskData.priority,
            status: taskData.status || 'বাকি',
            estimated_minutes: taskData.estimated_minutes || 30,
            due_date: taskData.due_date,
            created_date: taskData.created_date || taskData.due_date,
            completed_at: taskData.completed_at || null,
            tags: taskData.tags || [],
            blocker_notes: taskData.blocker_notes || '',
            is_carried_forward: taskData.is_carried_forward || false,
            carried_forward_count: taskData.carried_forward_count || 0,
            original_due_date: taskData.original_due_date || taskData.due_date,
            display_order: tasks.length + 1,
          })
          .select()
          .single();

        if (data && !error) {
          createdTask = { ...data, client_name: clientName };
        }
      } catch (e) {
        console.warn('Supabase task insert fallback to local:', e);
      }
    }

    setTasks((prev) => [createdTask, ...prev]);
    setIsSaving(false);
    return createdTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setIsSaving(true);
    const nowIso = new Date().toISOString();

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updated_at: nowIso } : t))
    );

    if (supabase && supabaseConnected) {
      try {
        await supabase
          .from('tasks')
          .update({ ...updates, updated_at: nowIso })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase task update failed:', e);
      }
    }
    setIsSaving(false);
  };

  const toggleTaskComplete = async (id: string) => {
    setIsSaving(true);
    const nowIso = new Date().toISOString();
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      setIsSaving(false);
      return;
    }

    const isCompleting = task.status !== 'সম্পন্ন';
    const newStatus = isCompleting ? 'সম্পন্ন' : 'বাকি';
    const completedAt = isCompleting ? nowIso : null;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: newStatus, completed_at: completedAt, updated_at: nowIso } : t
      )
    );

    if (supabase && supabaseConnected) {
      try {
        await supabase
          .from('tasks')
          .update({
            status: newStatus,
            completed_at: completedAt,
            updated_at: nowIso,
          })
          .eq('id', id);

        // Add to task activity history
        await supabase.from('task_activity_history').insert({
          task_id: id,
          user_id: currentUserId,
          action_type: isCompleting ? 'সম্পন্ন' : 'স্ট্যাটাস পরিবর্তন',
          note: isCompleting ? 'কাজটি সম্পন্ন চিহ্নিত করা হয়েছে' : 'কাজটি পুনরায় খোলা হয়েছে',
          logged_at: nowIso,
        });
      } catch (e) {
        console.warn('Supabase toggle complete failed:', e);
      }
    }
    setIsSaving(false);
  };

  const deleteTask = async (id: string) => {
    setIsSaving(true);
    setTasks((prev) => prev.filter((t) => t.id !== id));

    if (supabase && supabaseConnected) {
      try {
        await supabase.from('tasks').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete task failed:', e);
      }
    }
    setIsSaving(false);
  };

  const rescheduleTaskForToday = async (id: string) => {
    const todayStr = getTodayDateString();
    const nowIso = new Date().toISOString();
    setIsSaving(true);

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              due_date: todayStr,
              is_carried_forward: true,
              carried_forward_count: (t.carried_forward_count || 0) + 1,
              updated_at: nowIso,
            }
          : t
      )
    );

    if (supabase && supabaseConnected) {
      try {
        const task = tasks.find((t) => t.id === id);
        const count = (task?.carried_forward_count || 0) + 1;
        await supabase
          .from('tasks')
          .update({
            due_date: todayStr,
            is_carried_forward: true,
            carried_forward_count: count,
            updated_at: nowIso,
          })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase reschedule task failed:', e);
      }
    }
    setIsSaving(false);
  };

  const reorderTasks = async (newTasks: Task[]) => {
    const ordered = newTasks.map((t, index) => ({ ...t, display_order: index + 1 }));
    setTasks(ordered);

    if (supabase && supabaseConnected) {
      try {
        await Promise.all(
          ordered.map((t) =>
            supabase.from('tasks').update({ display_order: t.display_order }).eq('id', t.id)
          )
        );
      } catch (e) {
        console.warn('Supabase reorder failed:', e);
      }
    }
  };

  // ================= CLIENT ACTIONS =================
  const addClient = async (
    clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'remaining_amount'>
  ): Promise<Client> => {
    setIsSaving(true);
    const nowIso = new Date().toISOString();
    const remaining = clientData.agreed_amount - clientData.paid_amount;

    let createdClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      user_id: currentUserId,
      remaining_amount: remaining,
      created_at: nowIso,
      updated_at: nowIso,
    };

    if (supabase && supabaseConnected) {
      try {
        const { data, error } = await supabase
          .from('clients')
          .insert({
            user_id: currentUserId,
            name: clientData.name,
            project_name: clientData.project_name,
            contact_info: clientData.contact_info || '',
            status: clientData.status || 'চলমান',
            agreed_amount: clientData.agreed_amount,
            paid_amount: clientData.paid_amount,
            currency: clientData.currency || '৳',
            notes: clientData.notes || '',
            next_followup_date: clientData.next_followup_date || null,
          })
          .select()
          .single();

        if (data && !error) {
          createdClient = data;
        }
      } catch (e) {
        console.warn('Supabase addClient failed:', e);
      }
    }

    setClients((prev) => [createdClient, ...prev]);
    setIsSaving(false);
    return createdClient;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    setIsSaving(true);
    const nowIso = new Date().toISOString();

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updates, updated_at: nowIso };
          if (updates.agreed_amount !== undefined || updates.paid_amount !== undefined) {
            updated.remaining_amount = updated.agreed_amount - updated.paid_amount;
          }
          return updated;
        }
        return c;
      })
    );

    if (supabase && supabaseConnected) {
      try {
        await supabase.from('clients').update({ ...updates, updated_at: nowIso }).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateClient failed:', e);
      }
    }
    setIsSaving(false);
  };

  const deleteClient = async (id: string) => {
    setIsSaving(true);
    setClients((prev) => prev.filter((c) => c.id !== id));

    if (supabase && supabaseConnected) {
      try {
        await supabase.from('clients').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteClient failed:', e);
      }
    }
    setIsSaving(false);
  };

  // ================= DAILY LOG ACTIONS =================
  const updateDailyLog = async (updates: Partial<DailyLog>) => {
    setIsSaving(true);
    const nowIso = new Date().toISOString();

    const updatedLog: DailyLog = {
      ...currentDailyLog,
      ...updates,
      updated_at: nowIso,
    };

    setAllDailyLogs((prev) => ({
      ...prev,
      [selectedDate]: updatedLog,
    }));

    if (supabase && supabaseConnected) {
      try {
        await supabase.from('daily_logs').upsert(
          {
            user_id: currentUserId,
            date: selectedDate,
            focused_work_hours: updatedLog.focused_work_hours,
            client_work_hours: updatedLog.client_work_hours,
            learning_hours: updatedLog.learning_hours,
            english_hours: updatedLog.english_hours,
            hunting_minutes: updatedLog.hunting_minutes,
            wasted_minutes: updatedLog.wasted_minutes,
            sleep_hours: updatedLog.sleep_hours,
            mood: updatedLog.mood,
            energy_level: updatedLog.energy_level,
            exercise_minutes: updatedLog.exercise_minutes,
            best_thing_today: updatedLog.best_thing_today,
            tomorrow_intention: updatedLog.tomorrow_intention,
            updated_at: nowIso,
          },
          { onConflict: 'user_id,date' }
        );
      } catch (e) {
        console.warn('Supabase daily_logs upsert failed:', e);
      }
    }
    setIsSaving(false);
  };

  // ================= PRAYER LOG ACTIONS =================
  const updatePrayerStatus = async (
    prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
    status: PrayerStatus,
    type: PrayerType = 'জামাতে'
  ) => {
    setIsSaving(true);
    const nowIso = new Date().toISOString();

    const updatedLog: PrayerLog = {
      ...currentPrayerLog,
      [prayer]: { status, type },
      updated_at: nowIso,
    };

    setAllPrayerLogs((prev) => ({
      ...prev,
      [selectedDate]: updatedLog,
    }));

    if (supabase && supabaseConnected) {
      try {
        await supabase.from('prayer_logs').upsert(
          {
            user_id: currentUserId,
            date: selectedDate,
            fajr: updatedLog.fajr,
            dhuhr: updatedLog.dhuhr,
            asr: updatedLog.asr,
            maghrib: updatedLog.maghrib,
            isha: updatedLog.isha,
            notes: updatedLog.notes,
            updated_at: nowIso,
          },
          { onConflict: 'user_id,date' }
        );
      } catch (e) {
        console.warn('Supabase prayer_logs upsert failed:', e);
      }
    }
    setIsSaving(false);
  };

  const updatePrayerNotes = async (notes: string) => {
    setIsSaving(true);
    const nowIso = new Date().toISOString();
    const updatedLog: PrayerLog = {
      ...currentPrayerLog,
      notes,
      updated_at: nowIso,
    };
    setAllPrayerLogs((prev) => ({
      ...prev,
      [selectedDate]: updatedLog,
    }));

    if (supabase && supabaseConnected) {
      try {
        await supabase.from('prayer_logs').upsert(
          {
            user_id: currentUserId,
            date: selectedDate,
            fajr: updatedLog.fajr,
            dhuhr: updatedLog.dhuhr,
            asr: updatedLog.asr,
            maghrib: updatedLog.maghrib,
            isha: updatedLog.isha,
            notes: updatedLog.notes,
            updated_at: nowIso,
          },
          { onConflict: 'user_id,date' }
        );
      } catch (e) {
        console.warn('Supabase prayer notes upsert failed:', e);
      }
    }
    setIsSaving(false);
  };

  // ================= URGE & RELAPSE ACTIONS =================
  const addUrgeLog = async (logData: Omit<UrgeLog, 'id' | 'created_at' | 'user_id'>) => {
    setIsSaving(true);
    const nowIso = new Date().toISOString();
    let newLog: UrgeLog = {
      ...logData,
      id: `urge-${Date.now()}`,
      user_id: currentUserId,
      created_at: nowIso,
    };

    if (supabase && supabaseConnected) {
      try {
        const { data, error } = await supabase
          .from('urge_logs')
          .insert({
            user_id: currentUserId,
            date: logData.date,
            occurred: logData.occurred,
            intensity: logData.intensity,
            time_of_day: logData.time_of_day,
            trigger: logData.trigger,
            recovery_action: logData.recovery_action,
            private_note: logData.private_note,
          })
          .select()
          .single();
        if (data && !error) newLog = data;
      } catch (e) {
        console.warn('Supabase urge_logs insert failed:', e);
      }
    }

    setUrgeLogs((prev) => [newLog, ...prev]);
    setIsSaving(false);
  };

  const addRelapseLog = async (logData: Omit<RelapseLog, 'id' | 'created_at' | 'user_id'>) => {
    setIsSaving(true);
    const nowIso = new Date().toISOString();
    let newLog: RelapseLog = {
      ...logData,
      id: `relapse-${Date.now()}`,
      user_id: currentUserId,
      created_at: nowIso,
    };

    if (supabase && supabaseConnected) {
      try {
        const { data, error } = await supabase
          .from('relapse_logs')
          .insert({
            user_id: currentUserId,
            date: logData.date,
            occurred: logData.occurred,
            time_lost_minutes: logData.time_lost_minutes,
            trigger: logData.trigger,
            recovery_action_taken: logData.recovery_action_taken,
            private_note: logData.private_note,
          })
          .select()
          .single();
        if (data && !error) newLog = data;
      } catch (e) {
        console.warn('Supabase relapse_logs insert failed:', e);
      }
    }

    setRelapseLogs((prev) => [newLog, ...prev]);
    setIsSaving(false);
  };

  // ================= REVENUE ACTIONS =================
  const addRevenue = async (entryData: Omit<RevenueEntry, 'id' | 'created_at' | 'user_id'>) => {
    setIsSaving(true);
    const nowIso = new Date().toISOString();
    const clientObj = clients.find((c) => c.id === entryData.client_id);
    const clientName = clientObj ? (clientObj.name || clientObj.client_name) : undefined;

    let newEntry: RevenueEntry = {
      ...entryData,
      id: `rev-${Date.now()}`,
      user_id: currentUserId,
      client_name: clientName,
      created_at: nowIso,
    };

    if (supabase && supabaseConnected) {
      try {
        const { data, error } = await supabase
          .from('revenue_entries')
          .insert({
            user_id: currentUserId,
            client_id: entryData.client_id || null,
            amount: entryData.amount,
            currency: entryData.currency || '৳',
            received_date: entryData.received_date,
            payment_type: entryData.payment_type,
            notes: entryData.notes || '',
          })
          .select()
          .single();
        if (data && !error) newEntry = { ...data, client_name: clientName };
      } catch (e) {
        console.warn('Supabase revenue insert failed:', e);
      }
    }

    setRevenue((prev) => [newEntry, ...prev]);
    setIsSaving(false);
  };

  const deleteRevenue = async (id: string) => {
    setIsSaving(true);
    setRevenue((prev) => prev.filter((r) => r.id !== id));
    if (supabase && supabaseConnected) {
      try {
        await supabase.from('revenue_entries').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase revenue delete failed:', e);
      }
    }
    setIsSaving(false);
  };

  // ================= HUNTING ACTIONS =================
  const addHuntingLog = async (logData: Omit<HuntingLog, 'id' | 'created_at' | 'user_id'>) => {
    setIsSaving(true);
    const nowIso = new Date().toISOString();
    let newLog: HuntingLog = {
      ...logData,
      id: `hunt-${Date.now()}`,
      user_id: currentUserId,
      created_at: nowIso,
    };

    if (supabase && supabaseConnected) {
      try {
        const { data, error } = await supabase
          .from('hunting_logs')
          .insert({
            user_id: currentUserId,
            date: logData.date,
            platform: logData.platform,
            messages_sent: logData.messages_sent,
            responses_count: logData.responses_count,
            calls_count: logData.calls_count,
            leads_count: logData.leads_count,
            clients_closed: logData.clients_closed,
            notes: logData.notes || '',
          })
          .select()
          .single();
        if (data && !error) newLog = data;
      } catch (e) {
        console.warn('Supabase hunting_logs insert failed:', e);
      }
    }

    setHuntingLogs((prev) => [newLog, ...prev]);
    setIsSaving(false);
  };

  const deleteHuntingLog = async (id: string) => {
    setIsSaving(true);
    setHuntingLogs((prev) => prev.filter((h) => h.id !== id));
    if (supabase && supabaseConnected) {
      try {
        await supabase.from('hunting_logs').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase hunting delete failed:', e);
      }
    }
    setIsSaving(false);
  };

  // ================= LIVE TIMER & TIME SESSIONS =================
  const startSession = async (params: {
    category: TimeSessionCategory;
    clientId?: string | null;
    taskId?: string | null;
    title?: string;
    note?: string;
    isPomodoro?: boolean;
    pomodoroFocusMinutes?: number;
    pomodoroBreakMinutes?: number;
  }): Promise<TimeSession> => {
    setIsSaving(true);
    const nowIso = new Date().toISOString();

    // 1. If another active session is running, close it first to prevent concurrent overlapping
    if (activeSession) {
      await stopSession(activeSession.id);
    }

    const selectedClient = clients.find((c) => c.id === params.clientId);
    const selectedTask = tasks.find((t) => t.id === params.taskId);

    const clientName = selectedClient ? (selectedClient.name || selectedClient.client_name) : undefined;
    const taskTitle = selectedTask ? selectedTask.title : undefined;

    let newSession: TimeSession = {
      id: generateSessionId(),
      user_id: currentUserId,
      client_id: params.clientId || null,
      client_name: clientName,
      linked_client_id: params.clientId || null,
      linked_client_name: clientName,
      task_id: params.taskId || null,
      task_title: taskTitle,
      linked_task_id: params.taskId || null,
      linked_task_title: taskTitle,
      category: params.category,
      break_type: null,
      title: params.title || String(params.category),
      note: params.note || '',
      started_at: nowIso,
      ended_at: null,
      duration_seconds: 0,
      status: 'active',
      is_pomodoro: Boolean(params.isPomodoro),
      pomodoro_focus_minutes: params.pomodoroFocusMinutes || (params.isPomodoro ? 25 : null),
      pomodoro_break_minutes: params.pomodoroBreakMinutes || (params.isPomodoro ? 5 : null),
      created_at: nowIso,
      updated_at: nowIso,
    };

    if (supabase && supabaseConnected) {
      try {
        const { data, error } = await supabase
          .from('time_sessions')
          .insert({
            user_id: currentUserId,
            client_id: params.clientId || null,
            task_id: params.taskId || null,
            category: params.category,
            break_type: null,
            title: newSession.title,
            note: newSession.note,
            started_at: nowIso,
            ended_at: null,
            duration_seconds: 0,
            status: 'active',
            is_pomodoro: newSession.is_pomodoro,
            pomodoro_focus_minutes: newSession.pomodoro_focus_minutes,
            pomodoro_break_minutes: newSession.pomodoro_break_minutes,
          })
          .select()
          .single();

        if (data && !error) {
          newSession = {
            ...data,
            client_name: clientName,
            linked_client_name: clientName,
            task_title: taskTitle,
            linked_task_title: taskTitle,
          };
        }
      } catch (e) {
        console.warn('Supabase startSession insert failed:', e);
      }
    }

    setActiveSession(newSession);
    setTimeSessions((prev) => [newSession, ...prev]);
    setIsSaving(false);
    return newSession;
  };

  const pauseSession = async (id?: string) => {
    setIsSaving(true);
    const targetId = id || activeSession?.id;
    const nowIso = new Date().toISOString();

    if (activeSession && (!targetId || activeSession.id === targetId)) {
      const updated = { ...activeSession, status: 'paused' as const, updated_at: nowIso };
      setActiveSession(updated);
      setTimeSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

      if (supabase && supabaseConnected) {
        try {
          await supabase
            .from('time_sessions')
            .update({ status: 'paused', updated_at: nowIso })
            .eq('id', updated.id);
        } catch (e) {
          console.warn('Supabase pauseSession failed:', e);
        }
      }
    }
    setIsSaving(false);
  };

  const resumeSession = async (id?: string) => {
    setIsSaving(true);
    const targetId = id || activeSession?.id;
    const nowIso = new Date().toISOString();

    if (activeSession && (!targetId || activeSession.id === targetId)) {
      const updated = { ...activeSession, status: 'active' as const, updated_at: nowIso };
      setActiveSession(updated);
      setTimeSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

      if (supabase && supabaseConnected) {
        try {
          await supabase
            .from('time_sessions')
            .update({ status: 'active', updated_at: nowIso })
            .eq('id', updated.id);
        } catch (e) {
          console.warn('Supabase resumeSession failed:', e);
        }
      }
    }
    setIsSaving(false);
  };

  const stopSession = async (id?: string): Promise<TimeSession | null> => {
    setIsSaving(true);
    const targetSession = id ? timeSessions.find((s) => s.id === id) : activeSession;
    if (!targetSession) {
      setIsSaving(false);
      return null;
    }

    const nowIso = new Date().toISOString();
    const startMs = new Date(targetSession.started_at).getTime();
    const endMs = new Date(nowIso).getTime();
    const duration_seconds = Math.max(0, Math.round((endMs - startMs) / 1000));

    const completedSession: TimeSession = {
      ...targetSession,
      ended_at: nowIso,
      duration_seconds,
      status: 'completed',
      updated_at: nowIso,
    };

    setTimeSessions((prev) =>
      prev.map((s) => (s.id === targetSession.id ? completedSession : s))
    );

    if (activeSession?.id === targetSession.id) {
      setActiveSession(null);
    }

    if (supabase && supabaseConnected) {
      try {
        await supabase
          .from('time_sessions')
          .update({
            ended_at: nowIso,
            duration_seconds,
            status: 'completed',
            updated_at: nowIso,
          })
          .eq('id', targetSession.id);
      } catch (e) {
        console.warn('Supabase stopSession failed:', e);
      }
    }

    setIsSaving(false);
    return completedSession;
  };

  const startBreak = async (
    breakTypeOrParams?: BreakType | { breakType?: BreakType; note?: string },
    maybeNote?: string
  ): Promise<TimeSession> => {
    setIsSaving(true);
    const nowIso = new Date().toISOString();

    let breakType: BreakType = 'বিশ্রাম';
    let breakNote: string | undefined = undefined;

    if (typeof breakTypeOrParams === 'object' && breakTypeOrParams !== null) {
      if (breakTypeOrParams.breakType) breakType = breakTypeOrParams.breakType;
      if (breakTypeOrParams.note) breakNote = breakTypeOrParams.note;
    } else if (typeof breakTypeOrParams === 'string') {
      breakType = breakTypeOrParams;
      breakNote = maybeNote;
    }

    // 1. If focus session is active, stop it immediately at this exact moment
    if (activeSession) {
      await stopSession(activeSession.id);
    }

    // 2. Start new break session
    const isPrayer = breakType === 'নামাজ';
    const breakCategory: TimeSessionCategory = isPrayer ? 'prayer' : 'break';

    let newBreakSession: TimeSession = {
      id: `break-${Date.now()}`,
      user_id: currentUserId,
      client_id: null,
      task_id: null,
      category: breakCategory,
      break_type: breakType,
      title: isPrayer ? 'নামাজ বিরতি' : `বিরতি (${breakType})`,
      note: breakNote || '',
      started_at: nowIso,
      ended_at: null,
      duration_seconds: 0,
      status: 'active',
      is_pomodoro: false,
      created_at: nowIso,
      updated_at: nowIso,
    };

    if (supabase && supabaseConnected) {
      try {
        const { data, error } = await supabase
          .from('time_sessions')
          .insert({
            user_id: currentUserId,
            client_id: null,
            task_id: null,
            category: breakCategory,
            break_type: breakType,
            title: newBreakSession.title,
            note: newBreakSession.note,
            started_at: nowIso,
            ended_at: null,
            duration_seconds: 0,
            status: 'active',
            is_pomodoro: false,
          })
          .select()
          .single();

        if (data && !error) newBreakSession = data;
      } catch (e) {
        console.warn('Supabase startBreak insert failed:', e);
      }
    }

    setActiveSession(newBreakSession);
    setTimeSessions((prev) => [newBreakSession, ...prev]);
    setIsSaving(false);
    return newBreakSession;
  };

  const resumeFocusFromBreak = async (params?: {
    category?: TimeSessionCategory;
    clientId?: string | null;
    taskId?: string | null;
  }): Promise<TimeSession> => {
    if (activeSession) {
      await stopSession(activeSession.id);
    }
    return startSession({
      category: params?.category || 'deep_focus',
      clientId: params?.clientId,
      taskId: params?.taskId,
    });
  };

  const addPastSession = async (
    sessionData: Omit<TimeSession, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ): Promise<TimeSession> => {
    setIsSaving(true);
    const nowIso = new Date().toISOString();

    const clientObj = clients.find((c) => c.id === sessionData.client_id || c.id === sessionData.linked_client_id);
    const clientName = clientObj ? (clientObj.name || clientObj.client_name) : undefined;
    const taskObj = tasks.find((t) => t.id === sessionData.task_id || t.id === sessionData.linked_task_id);
    const taskTitle = taskObj ? taskObj.title : undefined;

    let newSession: TimeSession = {
      ...sessionData,
      id: `session-${Date.now()}`,
      user_id: currentUserId,
      client_name: clientName,
      linked_client_name: clientName,
      task_title: taskTitle,
      linked_task_title: taskTitle,
      status: 'completed',
      created_at: nowIso,
      updated_at: nowIso,
    };

    if (supabase && supabaseConnected) {
      try {
        const { data, error } = await supabase
          .from('time_sessions')
          .insert({
            user_id: currentUserId,
            client_id: sessionData.client_id || sessionData.linked_client_id || null,
            task_id: sessionData.task_id || sessionData.linked_task_id || null,
            category: sessionData.category,
            break_type: sessionData.break_type || null,
            title: sessionData.title || String(sessionData.category),
            note: sessionData.note || '',
            started_at: sessionData.started_at,
            ended_at: sessionData.ended_at,
            duration_seconds: sessionData.duration_seconds,
            status: 'completed',
            is_pomodoro: Boolean(sessionData.is_pomodoro),
            pomodoro_focus_minutes: sessionData.pomodoro_focus_minutes || null,
            pomodoro_break_minutes: sessionData.pomodoro_break_minutes || null,
          })
          .select()
          .single();

        if (data && !error) {
          newSession = {
            ...data,
            client_name: clientName,
            linked_client_name: clientName,
            task_title: taskTitle,
            linked_task_title: taskTitle,
          };
        }
      } catch (e) {
        console.warn('Supabase addPastSession failed:', e);
      }
    }

    setTimeSessions((prev) => [newSession, ...prev]);
    setIsSaving(false);
    return newSession;
  };

  const updateSession = async (id: string, updates: Partial<TimeSession>) => {
    setIsSaving(true);
    const nowIso = new Date().toISOString();

    setTimeSessions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updates, updated_at: nowIso };
          if (updated.started_at && updated.ended_at) {
            const sMs = new Date(updated.started_at).getTime();
            const eMs = new Date(updated.ended_at).getTime();
            updated.duration_seconds = Math.max(0, Math.round((eMs - sMs) / 1000));
          }
          return updated;
        }
        return s;
      })
    );

    if (activeSession?.id === id) {
      setActiveSession((prev) => (prev ? { ...prev, ...updates, updated_at: nowIso } : null));
    }

    if (supabase && supabaseConnected) {
      try {
        await supabase.from('time_sessions').update({ ...updates, updated_at: nowIso }).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateSession failed:', e);
      }
    }
    setIsSaving(false);
  };

  const deleteSession = async (id: string) => {
    setIsSaving(true);
    setTimeSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSession?.id === id) {
      setActiveSession(null);
    }

    if (supabase && supabaseConnected) {
      try {
        await supabase.from('time_sessions').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteSession failed:', e);
      }
    }
    setIsSaving(false);
  };

  // ================= SETTINGS ACTIONS =================
  const updateSettings = async (updates: Partial<AppSettings>) => {
    setIsSaving(true);
    const nowIso = new Date().toISOString();
    const updated = { ...settings, ...updates, updated_at: nowIso };
    setSettings(updated);

    if (supabase && supabaseConnected) {
      try {
        await supabase.from('app_settings').upsert({
          user_id: currentUserId,
          profile_name: updated.profile_name,
          daily_work_target_hours: updated.daily_work_target_hours,
          daily_english_target_hours: updated.daily_english_target_hours,
          daily_hunting_target_minutes: updated.daily_hunting_target_minutes,
          currency_symbol: updated.currency_symbol,
          theme_preference: updated.theme_preference,
          prayer_tracking_enabled: updated.prayer_tracking_enabled,
          updated_at: nowIso,
        }, { onConflict: 'user_id' });
      } catch (e) {
        console.warn('Supabase settings upsert failed:', e);
      }
    }
    setIsSaving(false);
  };

  const resetToDemoData = () => {
    // Resets to completely clean state
    clearAllUserData();
  };

  const clearAllUserData = () => {
    try {
      localStorage.clear();
      localStorage.setItem(STORAGE_KEYS.CLEAN_FLAG, 'true');
    } catch {}
    setTasks([]);
    setClients([]);
    setAllDailyLogs({});
    setAllPrayerLogs({});
    setRevenue([]);
    setHuntingLogs([]);
    setUrgeLogs([]);
    setRelapseLogs([]);
    setTimeSessions([]);
    setActiveSession(null);
  };

  return (
    <DataContext.Provider
      value={{
        tasks,
        clients,
        dailyLog: currentDailyLog,
        allDailyLogs,
        prayerLog: currentPrayerLog,
        revenue,
        huntingLogs,
        urgeLogs,
        relapseLogs,
        timeSessions,
        todaySessions: timeSessions.filter((s) => s.started_at.startsWith(selectedDate)),
        activeSession,
        todayTrackedStats,
        settings,
        language,
        setLanguage,
        currentDate: selectedDate,
        isOnlineDemo: !supabaseConnected,
        isSaving,
        isLoading,
        errorMessage,
        selectedDate,
        setSelectedDate,
        refreshData: loadData,
        addTask,
        updateTask,
        toggleTaskComplete,
        deleteTask,
        rescheduleTaskForToday,
        reorderTasks,
        addClient,
        updateClient,
        deleteClient,
        updateDailyLog,
        updatePrayerStatus,
        updatePrayerNotes,
        addUrgeLog,
        addRelapseLog,
        addRevenue,
        deleteRevenue,
        addHuntingLog,
        deleteHuntingLog,
        startSession,
        pauseSession,
        resumeSession,
        stopSession,
        startBreak,
        resumeFocusFromBreak,
        addPastSession,
        updateSession,
        deleteSession,
        updateSettings,
        resetToDemoData,
        clearAllUserData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
