'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { Navbar } from '@/components/Navbar';
import { DashboardView } from '@/components/DashboardView';
import { JobsView } from '@/components/JobsView';
import { ApplicationsView } from '@/components/ApplicationsView';
import { ProfileView } from '@/components/ProfileView';
import { AgentView } from '@/components/AgentView';
import { SourcesView } from '@/components/SourcesView';
import { SettingsView } from '@/components/SettingsView';
import { AddJobModal } from '@/components/AddJobModal';
import { JobDetailModal } from '@/components/JobDetailModal';
import { TailorApprovalModal } from '@/components/TailorApprovalModal';
import { 
  NavigationTab, 
  UserProfile, 
  Job, 
  ApplicationRecord, 
  CareerPreferences, 
  JobSource, 
  UserSettings, 
  AgentEvent,
  PipelineStage,
  ApplicationOutcome
} from '@/lib/types';
import {
  getProfile,
  saveProfile,
  getPreferences,
  savePreferences,
  getSources,
  saveSources,
  getJobs,
  saveJobs,
  addJob,
  getApplications,
  saveApplications,
  updateApplication,
  getSettings,
  saveSettings,
  getEvents,
  saveEvents,
  getAgentStatus,
  saveAgentStatus,
  subscribeToStore
} from '@/lib/storage';
import { rescoreJobForProfile } from '@/lib/ai-services';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // React 19 / Next.js safe store subscription
  const [storeTick, setStoreTick] = useState(0);

  useEffect(() => {
    return subscribeToStore(() => {
      setStoreTick((t) => t + 1);
    });
  }, []);

  // Synchronous getters from local storage
  const profile: UserProfile = getProfile();
  const preferences: CareerPreferences = getPreferences();
  const sources: JobSource[] = getSources();
  const jobs: Job[] = getJobs();
  const applications: ApplicationRecord[] = getApplications();
  const settings: UserSettings = getSettings();
  const events: AgentEvent[] = getEvents();
  const agentStatus: 'ACTIVE' | 'PAUSED' = getAgentStatus();

  // Modals state
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [tailoringJob, setTailoringJob] = useState<Job | null>(null);

  const handleToggleAgentStatus = () => {
    const next = agentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    saveAgentStatus(next);
  };

  const handleSaveProfile = (updated: UserProfile) => {
    saveProfile(updated);
    // Automatically recalculate match analysis for all existing jobs
    const rescored = jobs.map((job) => rescoreJobForProfile(updated, job, {
      applyThreshold: settings.matchThresholds.applyQueueMin,
      reviewThreshold: settings.matchThresholds.reviewQueueMin,
      preferences
    }));
    saveJobs(rescored);
  };

  const handleSavePreferences = (updated: CareerPreferences) => {
    savePreferences(updated);
    const rescored = jobs.map((job) => rescoreJobForProfile(profile, job, {
      applyThreshold: settings.matchThresholds.applyQueueMin,
      reviewThreshold: settings.matchThresholds.reviewQueueMin,
      preferences: updated
    }));
    saveJobs(rescored);
  };

  const handleAddJob = (newJob: Job) => {
    const scored = rescoreJobForProfile(profile, newJob, {
      applyThreshold: settings.matchThresholds.applyQueueMin,
      reviewThreshold: settings.matchThresholds.reviewQueueMin,
      preferences
    });
    addJob(scored);
    setIsAddJobOpen(false);
  };

  const handleUpdateJob = (updated: Job) => {
    const current = getJobs();
    const idx = current.findIndex((j) => j.id === updated.id);
    if (idx >= 0) {
      current[idx] = updated;
      saveJobs([...current]);
    }
  };

  const handleUpdateApplicationStage = (appId: string, stage: PipelineStage) => {
    const current = getApplications();
    const app = current.find((a) => a.id === appId);
    if (app) {
      const updated: ApplicationRecord = {
        ...app,
        stage,
        updatedAt: new Date().toISOString()
      };
      updateApplication(updated);
    }
  };

  const handleLogOutcome = (appId: string, outcome: ApplicationOutcome) => {
    const current = getApplications();
    const app = current.find((a) => a.id === appId);
    if (app) {
      const nextStage: PipelineStage = 
        outcome.status === 'interview' ? 'interview' :
        outcome.status === 'offer' ? 'offer' :
        outcome.status === 'rejected' ? 'rejected' : app.stage;

      const updated: ApplicationRecord = {
        ...app,
        stage: nextStage,
        interviewDate: outcome.status === 'interview' ? `${outcome.date} (${outcome.interviewRound || 'Interview'})` : app.interviewDate,
        notes: outcome.notes || app.notes,
        outcomes: [...(app.outcomes || []), outcome],
        updatedAt: new Date().toISOString()
      };
      updateApplication(updated);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Primary Navigation & Brand Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        profile={profile}
        jobs={jobs}
        applications={applications}
        agentStatus={agentStatus}
        onToggleAgentStatus={handleToggleAgentStatus}
        onOpenAddJob={() => setIsAddJobOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            jobs={jobs}
            applications={applications}
            agentStatus={agentStatus}
            onNavigate={setCurrentTab}
            onSelectJob={(j) => setSelectedJob(j)}
            onOpenTailor={(j) => setTailoringJob(j)}
            onRefresh={() => setStoreTick((t) => t + 1)}
          />
        )}

        {currentTab === 'jobs' && (
          <JobsView
            jobs={jobs}
            onSelectJob={(j) => setSelectedJob(j)}
            onOpenTailor={(j) => setTailoringJob(j)}
            onOpenAddJob={() => setIsAddJobOpen(true)}
            onUpdateJobStage={(jobId, stage) => {
              const job = jobs.find((j) => j.id === jobId);
              if (job) handleUpdateJob({ ...job, stage });
            }}
          />
        )}

        {currentTab === 'applications' && (
          <ApplicationsView
            applications={applications}
            onSelectApplication={(a) => {
              const job = jobs.find((j) => j.id === a.jobId);
              if (job) setSelectedJob(job);
            }}
            onUpdateStage={handleUpdateApplicationStage}
            onLogOutcome={handleLogOutcome}
            onOpenTailorModal={(j) => setTailoringJob(j)}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            profile={profile}
            onSaveProfile={handleSaveProfile}
          />
        )}

        {currentTab === 'agent' && (
          <AgentView
            events={events}
            settings={settings}
            onUpdateSettings={saveSettings}
            onRefresh={() => setStoreTick((t) => t + 1)}
            onSelectJob={(j) => setSelectedJob(j)}
          />
        )}

        {currentTab === 'sources' && (
          <SourcesView
            sources={sources}
            onUpdateSource={(updated) => {
              const current = getSources();
              const idx = current.findIndex((s) => s.id === updated.id);
              if (idx >= 0) {
                current[idx] = updated;
                saveSources([...current]);
              }
            }}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            preferences={preferences}
            onSaveSettings={saveSettings}
            onSavePreferences={handleSavePreferences}
            onResetData={() => setStoreTick((t) => t + 1)}
          />
        )}
      </main>

      {/* Global Modals */}
      <AddJobModal
        isOpen={isAddJobOpen}
        onClose={() => setIsAddJobOpen(false)}
        onAddJob={handleAddJob}
        profile={profile}
      />

      <JobDetailModal
        job={selectedJob}
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        profile={profile}
        onUpdateJob={handleUpdateJob}
        onOpenTailorApproval={(j: Job) => {
          setSelectedJob(null);
          setTailoringJob(j);
        }}
      />

      <TailorApprovalModal
        job={tailoringJob}
        isOpen={Boolean(tailoringJob)}
        onClose={() => setTailoringJob(null)}
        profile={profile}
        onUpdateJob={(updatedJob) => {
          handleUpdateJob(updatedJob);
          // Sync to applications record
          const app = applications.find((a) => a.jobId === updatedJob.id);
          if (app) {
            updateApplication({
              ...app,
              job: updatedJob,
              stage: updatedJob.stage,
              tailoredApp: updatedJob.tailoredApp || app.tailoredApp,
              updatedAt: new Date().toISOString()
            });
          }
        }}
      />
    </div>
  );
}
