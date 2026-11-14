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
} from '@/lib/utils/demo-data';
import { getTodayDateString } from '@/lib/utils/bangla';
import { isSupabaseConfigured } from '@/lib/supabase/client';

interface DataContextType {
  tasks: Task[];
  clients: Client[];
  dailyLog: DailyLog;
  prayerLog: PrayerLog;
  revenue: RevenueEntry[];
  huntingLogs: HuntingLog[];
  urgeLogs: UrgeLog[];
  relapseLogs: RelapseLog[];
  settings: AppSettings;
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

      let parsedTasks: Task[] = storedTasks ? JSON.parse(storedTasks) : INITIAL_TASKS;
      const parsedClients: Client[] = storedClients ? JSON.parse(storedClients) : INITIAL_CLIENTS;
      const todayStr = getTodayDateString();

      // Automatic Carry Forward Logic:
      // Incomplete tasks from previous days must automatically carry forward to today.
      // Badge: "আগের বাকি কাজ"
      // Do not duplicate the task; preserve original created date and history.
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
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [tasks, clients, allDailyLogs, allPrayerLogs, revenue, huntingLogs, urgeLogs, relapseLogs, settings, isInitialized]);

  useEffect(() => {
    saveStateToLocal();
  }, [saveStateToLocal]);

  // Current Daily Log for selectedDate (defaults to today)
  const currentDailyLog: DailyLog = useMemo(() => {
    if (allDailyLogs[selectedDate]) {
      return allDailyLogs[selectedDate];
    }
    return {
      id: `daily-log-${selectedDate}`,
      user_id: 'local-user',
      date: selectedDate,
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
  }, [allDailyLogs, selectedDate]);

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

    // Update client paid_amount if client_id exists
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
        settings,
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
