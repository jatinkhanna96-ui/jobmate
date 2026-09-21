'use client';

import { 
  UserProfile, 
  Job, 
  CareerPreferences, 
  JobSource, 
  ApplicationRecord, 
  UserSettings, 
  AgentEvent 
} from './types';
import { 
  initialProfile, 
  initialCareerPreferences, 
  initialSources, 
  initialJobs, 
  initialApplications, 
  initialSettings, 
  initialAgentEvents 
} from './sample-data';

const STORAGE_KEYS = {
  PROFILE: 'careerpilot_profile_v2',
  PREFERENCES: 'careerpilot_preferences_v2',
  SOURCES: 'careerpilot_sources_v2',
  JOBS: 'careerpilot_jobs_v2',
  APPLICATIONS: 'careerpilot_applications_v2',
  SETTINGS: 'careerpilot_settings_v2',
  EVENTS: 'careerpilot_events_v2',
  AGENT_STATUS: 'careerpilot_agent_status_v2'
};

const STORE_EVENT = 'careerpilot_store_update';

function emitChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(STORE_EVENT));
  }
}

// In-memory caches to guarantee consistency and support SSR
let memoryProfile: UserProfile = initialProfile;
let memoryPreferences: CareerPreferences = initialCareerPreferences;
let memorySources: JobSource[] = initialSources;
let memoryJobs: Job[] = initialJobs;
let memoryApplications: ApplicationRecord[] = initialApplications;
let memorySettings: UserSettings = initialSettings;
let memoryEvents: AgentEvent[] = initialAgentEvents;
let memoryAgentStatus: 'ACTIVE' | 'PAUSED' = 'ACTIVE';

export function getProfile(): UserProfile {
  if (typeof window === 'undefined') return memoryProfile;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      memoryProfile = JSON.parse(raw);
      return memoryProfile;
    }
  } catch (e) {
    console.warn('[Storage] Error reading profile:', e);
  }
  return memoryProfile;
}

export function saveProfile(profile: UserProfile): void {
  memoryProfile = profile;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('[Storage] Error saving profile:', e);
    }
    emitChange();
  }
}

export function getPreferences(): CareerPreferences {
  if (typeof window === 'undefined') return memoryPreferences;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (raw) {
      memoryPreferences = JSON.parse(raw);
      return memoryPreferences;
    }
  } catch (e) {
    console.warn('[Storage] Error reading preferences:', e);
  }
  return memoryPreferences;
}

export function savePreferences(preferences: CareerPreferences): void {
  memoryPreferences = preferences;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    } catch (e) {
      console.warn('[Storage] Error saving preferences:', e);
    }
    emitChange();
  }
}

export function getSources(): JobSource[] {
  if (typeof window === 'undefined') return memorySources;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOURCES);
    if (raw) {
      memorySources = JSON.parse(raw);
      return memorySources;
    }
  } catch (e) {
    console.warn('[Storage] Error reading sources:', e);
  }
  return memorySources;
}

export function saveSources(sources: JobSource[]): void {
  memorySources = sources;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
    } catch (e) {
      console.warn('[Storage] Error saving sources:', e);
    }
    emitChange();
  }
}

export function getJobs(): Job[] {
  if (typeof window === 'undefined') return memoryJobs;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JOBS);
    if (raw) {
      memoryJobs = JSON.parse(raw);
      return memoryJobs;
    }
  } catch (e) {
    console.warn('[Storage] Error reading jobs:', e);
  }
  return memoryJobs;
}

export function saveJobs(jobs: Job[]): void {
  memoryJobs = jobs;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    } catch (e) {
      console.warn('[Storage] Error saving jobs:', e);
    }
    emitChange();
  }
}

export function addJob(job: Job): void {
  const current = getJobs();
  const existingIdx = current.findIndex(
    (j) => j.id === job.id || (j.company.toLowerCase() === job.company.toLowerCase() && j.title.toLowerCase() === job.title.toLowerCase())
  );
  let updated: Job[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = job;
  } else {
    updated = [job, ...current];
  }
  saveJobs(updated);
}

export function getApplications(): ApplicationRecord[] {
  if (typeof window === 'undefined') return memoryApplications;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (raw) {
      memoryApplications = JSON.parse(raw);
      return memoryApplications;
    }
  } catch (e) {
    console.warn('[Storage] Error reading applications:', e);
  }
  return memoryApplications;
}

export function saveApplications(apps: ApplicationRecord[]): void {
  memoryApplications = apps;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    } catch (e) {
      console.warn('[Storage] Error saving applications:', e);
    }
    emitChange();
  }
}

export function updateApplication(app: ApplicationRecord): void {
  const current = getApplications();
  const idx = current.findIndex((a) => a.id === app.id);
  let updated: ApplicationRecord[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = app;
  } else {
    updated = [app, ...current];
  }
  saveApplications(updated);

  // Sync stage to job card if present
  const jobs = getJobs();
  const jobIdx = jobs.findIndex((j) => j.id === app.jobId);
  if (jobIdx >= 0) {
    jobs[jobIdx].stage = app.stage;
    if (app.tailoredApp) {
      jobs[jobIdx].tailoredApp = app.tailoredApp;
    }
    if (app.appliedDate) {
      jobs[jobIdx].appliedDate = app.appliedDate;
    }
    if (app.interviewDate) {
      jobs[jobIdx].interviewDate = app.interviewDate;
    }
    saveJobs([...jobs]);
  }
}

export function getSettings(): UserSettings {
  if (typeof window === 'undefined') return memorySettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      memorySettings = JSON.parse(raw);
      return memorySettings;
    }
  } catch (e) {
    console.warn('[Storage] Error reading settings:', e);
  }
  return memorySettings;
}

export function saveSettings(settings: UserSettings): void {
  memorySettings = settings;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('[Storage] Error saving settings:', e);
    }
    emitChange();
  }
}

export function getEvents(): AgentEvent[] {
  if (typeof window === 'undefined') return memoryEvents;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (raw) {
      memoryEvents = JSON.parse(raw);
      return memoryEvents;
    }
  } catch (e) {
    console.warn('[Storage] Error reading events:', e);
  }
  return memoryEvents;
}

export function saveEvents(events: AgentEvent[]): void {
  memoryEvents = events;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) {
      console.warn('[Storage] Error saving events:', e);
    }
    emitChange();
  }
}

export function addAgentEvent(event: Omit<AgentEvent, 'id' | 'timestamp' | 'timeFormatted'>): AgentEvent {
  const date = new Date();
  const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fullEvent: AgentEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: date.toISOString(),
    timeFormatted,
    ...event
  };
  const current = getEvents();
  const updated = [fullEvent, ...current].slice(0, 100); // keep last 100
  saveEvents(updated);
  return fullEvent;
}

export function getAgentStatus(): 'ACTIVE' | 'PAUSED' {
  if (typeof window === 'undefined') return memoryAgentStatus;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AGENT_STATUS);
    if (raw === 'ACTIVE' || raw === 'PAUSED') {
      memoryAgentStatus = raw;
      return raw;
    }
  } catch {
    // Ignore
  }
  return memoryAgentStatus;
}

export function saveAgentStatus(status: 'ACTIVE' | 'PAUSED'): void {
  memoryAgentStatus = status;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.AGENT_STATUS, status);
    } catch {
      // Ignore
    }
    emitChange();
  }
}

export function subscribeToStore(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener(STORE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(STORE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function resetToDefaults(): void {
  if (typeof window !== 'undefined') {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  }
  memoryProfile = initialProfile;
  memoryPreferences = initialCareerPreferences;
  memorySources = initialSources;
  memoryJobs = initialJobs;
  memoryApplications = initialApplications;
  memorySettings = initialSettings;
  memoryEvents = initialAgentEvents;
  memoryAgentStatus = 'ACTIVE';
  emitChange();
}

export function exportAllData(): string {
  const exportPayload = {
    version: '2.0.0',
    app: 'CareerPilot AI',
    exportedAt: new Date().toISOString(),
    profile: getProfile(),
    preferences: getPreferences(),
    sources: getSources(),
    jobs: getJobs(),
    applications: getApplications(),
    settings: getSettings(),
    events: getEvents()
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.profile) saveProfile(data.profile);
    if (data.preferences) savePreferences(data.preferences);
    if (data.sources) saveSources(data.sources);
    if (data.jobs) saveJobs(data.jobs);
    if (data.applications) saveApplications(data.applications);
    if (data.settings) saveSettings(data.settings);
    if (data.events) saveEvents(data.events);
    return true;
  } catch (e) {
    console.error('[Storage] Failed to import data:', e);
    return false;
  }
}
