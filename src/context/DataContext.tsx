'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  Task,
  Client,
  DailyLog,
  PrayerLog,
  RevenueEntry,
  HuntingLog,
  UrgeLog,
  RelapseLog,
  AppSettings,
  PrayerStatus,
  PrayerType,
  TimeSession,
  TimeSessionCategory,
  BreakType,
} from '@/lib/types/database';
import {
  INITIAL_CLIENTS,
  INITIAL_TASKS,
  INITIAL_DAILY_LOG,
  INITIAL_PRAYER_LOG,
  INITIAL_REVENUE,
  INITIAL_HUNTING_LOGS,
  INITIAL_SETTINGS,
  INITIAL_URGE_LOGS,
  INITIAL_RELAPSE_LOGS,
  INITIAL_TIME_SESSIONS,
} from '@/lib/utils/demo-data';
import { getTodayDateString } from '@/lib/utils/bangla';
import { isSupabaseConfigured } from '@/lib/supabase/client';

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
  selectedDate: string;
  setSelectedDate: (date: string) => void;
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
  TASKS: 'amar_discipline_tasks_v2',
  CLIENTS: 'amar_discipline_clients_v2',
  DAILY_LOGS: 'amar_discipline_daily_logs_v2',
  PRAYER_LOGS: 'amar_discipline_prayer_logs_v2',
  REVENUE: 'amar_discipline_revenue_v2',
  HUNTING: 'amar_discipline_hunting_v2',
  URGE: 'amar_discipline_urge_v2',
  RELAPSE: 'amar_discipline_relapse_v2',
  SETTINGS: 'amar_discipline_settings_v2',
  TIME_SESSIONS: 'amar_discipline_time_sessions_v2',
  ACTIVE_SESSION: 'amar_discipline_active_session_v2',
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-14');
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
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const supabaseConnected = isSupabaseConfigured();

  // Load Initial Data from LocalStorage or Supabase
  useEffect(() => {
    try {
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

      let parsedTasks: Task[] = storedTasks ? JSON.parse(storedTasks) : INITIAL_TASKS;
      const parsedClients: Client[] = storedClients ? JSON.parse(storedClients) : INITIAL_CLIENTS;
      const todayStr = getTodayDateString();
      setSelectedDate(todayStr);

      // Automatic Carry Forward Logic:
      let hasCarriedForward = false;
      parsedTasks = parsedTasks.map((t) => {
        if (t.status !== 'সম্পন্ন' && t.due_date < todayStr) {
          hasCarriedForward = true;
          return {
            ...t,
            due_date: todayStr,
            is_carried_forward: true,
            carried_forward_count: (t.carried_forward_count || 0) + 1,
            updated_at: todayStr,
          };
        }
        return t;
      });

      setTasks(parsedTasks);
      setClients(parsedClients);

      if (storedDailyLogs) {
        setAllDailyLogs(JSON.parse(storedDailyLogs));
      } else {
        setAllDailyLogs({ [todayStr]: INITIAL_DAILY_LOG });
      }

      if (storedPrayerLogs) {
        setAllPrayerLogs(JSON.parse(storedPrayerLogs));
      } else {
        setAllPrayerLogs({ [todayStr]: INITIAL_PRAYER_LOG });
      }

      setRevenue(storedRevenue ? JSON.parse(storedRevenue) : INITIAL_REVENUE);
      setHuntingLogs(storedHunting ? JSON.parse(storedHunting) : INITIAL_HUNTING_LOGS);
      setUrgeLogs(storedUrge ? JSON.parse(storedUrge) : INITIAL_URGE_LOGS);
      setRelapseLogs(storedRelapse ? JSON.parse(storedRelapse) : INITIAL_RELAPSE_LOGS);
      setSettings(storedSettings ? JSON.parse(storedSettings) : INITIAL_SETTINGS);
      setTimeSessions(storedSessions ? JSON.parse(storedSessions) : INITIAL_TIME_SESSIONS);
      setActiveSession(storedActive ? JSON.parse(storedActive) : null);

      if (hasCarriedForward) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(parsedTasks));
      }
    } catch (err) {
      console.error('Error loading local data:', err);
      setTasks(INITIAL_TASKS);
      setClients(INITIAL_CLIENTS);
      setAllDailyLogs({ [getTodayDateString()]: INITIAL_DAILY_LOG });
      setAllPrayerLogs({ [getTodayDateString()]: INITIAL_PRAYER_LOG });
      setRevenue(INITIAL_REVENUE);
      setHuntingLogs(INITIAL_HUNTING_LOGS);
      setUrgeLogs(INITIAL_URGE_LOGS);
      setTimeSessions(INITIAL_TIME_SESSIONS);
      setSettings(INITIAL_SETTINGS);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to LocalStorage whenever state changes
  const saveStateToLocal = useCallback(() => {
    if (!isInitialized) return;
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
      console.warn('LocalStorage save failed:', e);
    }
  }, [tasks, clients, allDailyLogs, allPrayerLogs, revenue, huntingLogs, urgeLogs, relapseLogs, settings, timeSessions, activeSession, isInitialized]);

  useEffect(() => {
    saveStateToLocal();
  }, [saveStateToLocal]);

  // Aggregate stats from time sessions for selectedDate
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
      if (s.is_pomodoro && s.status === 'completed') {
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

  // Current Daily Log for selectedDate (seamlessly blends tracked sessions)
  const currentDailyLog: DailyLog = useMemo(() => {
    const raw = allDailyLogs[selectedDate];
    // If tracked sessions exist for this date, automatically reflect them!
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
      user_id: 'local-user',
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
      created_at: '2026-11-14T00:00:00.000Z',
      updated_at: '2026-11-14T00:00:00.000Z',
    };
  }, [allDailyLogs, selectedDate, todayTrackedStats]);

  // Current Prayer Log for selectedDate
  const currentPrayerLog: PrayerLog = useMemo(() => {
    if (allPrayerLogs[selectedDate]) {
      return allPrayerLogs[selectedDate];
    }
    return {
      id: `prayer-log-${selectedDate}`,
      user_id: 'local-user',
      date: selectedDate,
      fajr: { status: 'পড়িনি', type: 'একা' },
      dhuhr: { status: 'পড়িনি', type: 'একা' },
      asr: { status: 'পড়িনি', type: 'একা' },
      maghrib: { status: 'পড়িনি', type: 'একা' },
      isha: { status: 'পড়িনি', type: 'একা' },
      notes: '',
      created_at: '2026-11-14T00:00:00.000Z',
      updated_at: '2026-11-14T00:00:00.000Z',
    };
  }, [allPrayerLogs, selectedDate]);

  // TASK ACTIONS
  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Task> => {
    setIsSaving(true);
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      user_id: 'local-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setIsSaving(false);
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setIsSaving(true);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t))
    );
    setIsSaving(false);
  };

  const toggleTaskComplete = async (id: string) => {
    setIsSaving(true);
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isCompleting = t.status !== 'সম্পন্ন';
          return {
            ...t,
            status: isCompleting ? 'সম্পন্ন' : 'বাকি',
            completed_at: isCompleting ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          };
        }
        return t;
      })
    );
    setIsSaving(false);
  };

  const deleteTask = async (id: string) => {
    setIsSaving(true);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setIsSaving(false);
  };

  const rescheduleTaskForToday = async (id: string) => {
    const todayStr = getTodayDateString();
    setIsSaving(true);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
            ...t,
            due_date: todayStr,
            is_carried_forward: true,
            carried_forward_count: (t.carried_forward_count || 0) + 1,
            updated_at: new Date().toISOString(),
          }
          : t
      )
    );
    setIsSaving(false);
  };

  const reorderTasks = async (newTasks: Task[]) => {
    const ordered = newTasks.map((t, index) => ({ ...t, display_order: index + 1 }));
    setTasks(ordered);
  };

  // CLIENT ACTIONS
  const addClient = async (
    clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'remaining_amount'>
  ): Promise<Client> => {
    setIsSaving(true);
    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      user_id: 'local-user',
      remaining_amount: clientData.agreed_amount - clientData.paid_amount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setClients((prev) => [newClient, ...prev]);
    setIsSaving(false);
    return newClient;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    setIsSaving(true);
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updates, updated_at: new Date().toISOString() };
          if (updates.agreed_amount !== undefined || updates.paid_amount !== undefined) {
            updated.remaining_amount = updated.agreed_amount - updated.paid_amount;
          }
          return updated;
        }
        return c;
      })
    );
    setIsSaving(false);
  };

  const deleteClient = async (id: string) => {
    setIsSaving(true);
    setClients((prev) => prev.filter((c) => c.id !== id));
    setIsSaving(false);
  };

  // DAILY LOG ACTIONS
  const updateDailyLog = async (updates: Partial<DailyLog>) => {
    setIsSaving(true);
    const updatedLog: DailyLog = {
      ...currentDailyLog,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setAllDailyLogs((prev) => ({
      ...prev,
      [selectedDate]: updatedLog,
    }));
    setIsSaving(false);
  };

  // PRAYER LOG ACTIONS
  const updatePrayerStatus = async (
    prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
    status: PrayerStatus,
    type: PrayerType = 'একা'
  ) => {
    setIsSaving(true);
    const updatedLog: PrayerLog = {
      ...currentPrayerLog,
      [prayer]: { status, type },
      updated_at: new Date().toISOString(),
    };
    setAllPrayerLogs((prev) => ({
      ...prev,
      [selectedDate]: updatedLog,
    }));
    setIsSaving(false);
  };

  const updatePrayerNotes = async (notes: string) => {
    setIsSaving(true);
    const updatedLog: PrayerLog = {
      ...currentPrayerLog,
      notes,
      updated_at: new Date().toISOString(),
    };
    setAllPrayerLogs((prev) => ({
      ...prev,
      [selectedDate]: updatedLog,
    }));
    setIsSaving(false);
  };

  // URGE & RELAPSE ACTIONS
  const addUrgeLog = async (logData: Omit<UrgeLog, 'id' | 'created_at' | 'user_id'>) => {
    setIsSaving(true);
    const newLog: UrgeLog = {
      ...logData,
      id: `urge-${Date.now()}`,
      user_id: 'local-user',
      created_at: new Date().toISOString(),
    };
    setUrgeLogs((prev) => [newLog, ...prev]);
    setIsSaving(false);
  };

  const addRelapseLog = async (logData: Omit<RelapseLog, 'id' | 'created_at' | 'user_id'>) => {
    setIsSaving(true);
    const newLog: RelapseLog = {
      ...logData,
      id: `relapse-${Date.now()}`,
      user_id: 'local-user',
      created_at: new Date().toISOString(),
    };
    setRelapseLogs((prev) => [newLog, ...prev]);
    setIsSaving(false);
  };

  // REVENUE ACTIONS
  const addRevenue = async (entryData: Omit<RevenueEntry, 'id' | 'created_at' | 'user_id'>) => {
    setIsSaving(true);
    const newEntry: RevenueEntry = {
      ...entryData,
      id: `rev-${Date.now()}`,
      user_id: 'local-user',
      created_at: new Date().toISOString(),
    };
    setRevenue((prev) => [newEntry, ...prev]);

    if (newEntry.client_id) {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === newEntry.client_id) {
            const newPaid = c.paid_amount + newEntry.amount;
            return {
              ...c,
              paid_amount: newPaid,
              remaining_amount: c.agreed_amount - newPaid,
              updated_at: new Date().toISOString(),
            };
          }
          return c;
        })
      );
    }
    setIsSaving(false);
  };

  const deleteRevenue = async (id: string) => {
    setIsSaving(true);
    setRevenue((prev) => prev.filter((r) => r.id !== id));
    setIsSaving(false);
  };

  // HUNTING ACTIONS
  const addHuntingLog = async (logData: Omit<HuntingLog, 'id' | 'created_at' | 'user_id'>) => {
    setIsSaving(true);
    const newLog: HuntingLog = {
      ...logData,
      id: `hunt-${Date.now()}`,
      user_id: 'local-user',
      created_at: new Date().toISOString(),
    };
    setHuntingLogs((prev) => [newLog, ...prev]);
    setIsSaving(false);
  };

  const deleteHuntingLog = async (id: string) => {
    setIsSaving(true);
    setHuntingLogs((prev) => prev.filter((h) => h.id !== id));
    setIsSaving(false);
  };

  // ==============================================================================
  // SECTION 9: LIVE FOCUS TIMER & TIME BLOCKS ACTIONS
  // ==============================================================================

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

    // Prevent overlapping sessions: Stop any currently active session immediately
    if (activeSession) {
      const endedAt = nowIso;
      const startMs = new Date(activeSession.started_at).getTime();
      const endMs = new Date(endedAt).getTime();
      const durSecs = Math.max(0, Math.round((endMs - startMs) / 1000));

      const completedPrevious: TimeSession = {
        ...activeSession,
        ended_at: endedAt,
        duration_seconds: durSecs,
        status: 'completed',
        updated_at: nowIso,
      };

      setTimeSessions((prev) => [
        completedPrevious,
        ...prev.filter((s) => s.id !== activeSession.id),
      ]);
    }

    const selectedClient = clients.find((c) => c.id === params.clientId);
    const selectedTask = tasks.find((t) => t.id === params.taskId);

    const categoryTitles: Record<string, string> = {
      client_work: selectedClient ? `${selectedClient.name} প্রজেক্ট কাজ` : 'ক্লায়েন্ট কাজ',
      deep_focus: 'ডিপ ফোকাস সেশন',
      client_hunting: 'ক্লায়েন্ট হান্টিং ও আউটরিচ',
      english_practice: 'ইংরেজি কমিউনিকেশন চর্চা',
      learning_class: 'লার্নিং ও ক্লাস সেশন',
      admin_planning: 'প্ল্যানিং ও পর্যালোচনা',
      break: 'বিশ্রাম বিরতি',
      prayer: 'নামাজ বিরতি',
      exercise: 'হাঁটা ও শরীরচর্চা',
      wasted_time: 'অনাকাঙ্ক্ষিত অপচয়',
      other: 'অন্যান্য কাজ',
    };

    const newSession: TimeSession = {
      id: `session-${Date.now()}`,
      user_id: 'local-user',
      client_id: params.clientId || null,
      client_name: selectedClient ? selectedClient.name : undefined,
      task_id: params.taskId || null,
      task_title: selectedTask ? selectedTask.title : undefined,
      category: params.category,
      break_type: null,
      title: params.title || (selectedTask ? selectedTask.title : categoryTitles[params.category]),
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

    // 1. If focus session is active, stop it at this exact moment
    if (
      activeSession &&
      activeSession.category !== 'break' &&
      activeSession.category !== 'Break' &&
      activeSession.category !== 'prayer' &&
      activeSession.category !== 'Prayer'
    ) {
      const startMs = new Date(activeSession.started_at).getTime();
      const endMs = new Date(nowIso).getTime();
      const durSecs = Math.max(0, Math.round((endMs - startMs) / 1000));

      const completedFocus: TimeSession = {
        ...activeSession,
        ended_at: nowIso,
        duration_seconds: durSecs,
        status: 'completed',
        updated_at: nowIso,
      };

      setTimeSessions((prev) => [
        completedFocus,
        ...prev.filter((s) => s.id !== activeSession.id),
      ]);
    }

    // 2. Start new break session immediately
    const isPrayer = breakType === 'নামাজ';
    const breakCategory: TimeSessionCategory = isPrayer ? 'prayer' : 'break';

    const newBreakSession: TimeSession = {
      id: `break-${Date.now()}`,
      user_id: 'local-user',
      client_id: null,
      task_id: null,
      category: breakCategory,
      break_type: breakType,
      title: isPrayer ? 'নামাজ ও দোয়া বিরতি' : `বিরতি (${breakType})`,
      note: breakNote || '',
      started_at: nowIso,
      ended_at: null,
      duration_seconds: 0,
      status: 'active',
      is_pomodoro: false,
      created_at: nowIso,
      updated_at: nowIso,
    };

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
    // 1. Stop break session
    if (activeSession) {
      await stopSession(activeSession.id);
    }
    // 2. Start focus session
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
    const newSession: TimeSession = {
      ...sessionData,
      id: `session-${Date.now()}`,
      user_id: 'local-user',
      status: 'completed',
      created_at: nowIso,
      updated_at: nowIso,
    };
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
    setIsSaving(false);
  };

  const deleteSession = async (id: string) => {
    setIsSaving(true);
    setTimeSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSession?.id === id) {
      setActiveSession(null);
    }
    setIsSaving(false);
  };

  // SETTINGS ACTIONS
  const updateSettings = async (updates: Partial<AppSettings>) => {
    setIsSaving(true);
    setSettings((prev) => ({
      ...prev,
      ...updates,
      updated_at: new Date().toISOString(),
    }));
    setIsSaving(false);
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setTasks(INITIAL_TASKS);
    setClients(INITIAL_CLIENTS);
    setAllDailyLogs({ [getTodayDateString()]: INITIAL_DAILY_LOG });
    setAllPrayerLogs({ [getTodayDateString()]: INITIAL_PRAYER_LOG });
    setRevenue(INITIAL_REVENUE);
    setHuntingLogs(INITIAL_HUNTING_LOGS);
    setUrgeLogs(INITIAL_URGE_LOGS);
    setRelapseLogs([]);
    setTimeSessions(INITIAL_TIME_SESSIONS);
    setActiveSession(null);
    setSettings(INITIAL_SETTINGS);
  };

  const clearAllUserData = () => {
    localStorage.clear();
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
        language: 'bn',
        setLanguage: () => {},
        currentDate: selectedDate,
        isOnlineDemo: !supabaseConnected,
        isSaving,
        selectedDate,
        setSelectedDate,
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
