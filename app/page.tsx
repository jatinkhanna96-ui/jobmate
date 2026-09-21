'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, CheckCircle2, ShieldAlert, ArrowUpRight, 
  Send, Users, Award, PlusCircle, RefreshCw, Briefcase, FileText
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { PipelineBoard } from '@/components/PipelineBoard';
import { ProfileModal } from '@/components/ProfileModal';
import { AddJobModal } from '@/components/AddJobModal';
import { JobDetailModal } from '@/components/JobDetailModal';
import { TailorApprovalModal } from '@/components/TailorApprovalModal';
import { initialProfile, initialJobs } from '@/lib/sample-data';
import { UserProfile, Job, PipelineStage } from '@/lib/types';

export default function Home() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('applypilot_profile');
        if (saved) return JSON.parse(saved);
      } catch {
        // Ignore
      }
    }
    return initialProfile;
  });

  const [jobs, setJobs] = useState<Job[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('applypilot_jobs');
        if (saved) return JSON.parse(saved);
      } catch {
        // Ignore
      }
    }
    return initialJobs;
  });

  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [tailoringJob, setTailoringJob] = useState<Job | null>(null);

  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    try {
      localStorage.setItem('applypilot_profile', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleAddJob = (newJob: Job) => {
    const updated = [newJob, ...jobs];
    setJobs(updated);
    try {
      localStorage.setItem('applypilot_jobs', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleUpdateJob = (updatedJob: Job) => {
    const updated = jobs.map(j => (j.id === updatedJob.id ? updatedJob : j));
    setJobs(updated);
    if (selectedJob?.id === updatedJob.id) {
      setSelectedJob(updatedJob);
    }
    if (tailoringJob?.id === updatedJob.id) {
      setTailoringJob(updatedJob);
    }
    try {
      localStorage.setItem('applypilot_jobs', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleUpdateJobStage = (jobId: string, stage: PipelineStage) => {
    const updated = jobs.map(j => (j.id === jobId ? { ...j, stage } : j));
    setJobs(updated);
    try {
      localStorage.setItem('applypilot_jobs', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Metrics
  const strongMatchesCount = jobs.filter(j => (j.match?.matchScore || 0) >= 85).length;
  const pendingApprovalCount = jobs.filter(j => j.tailoredApp?.status === 'pending_approval').length;
  const approvedReadyCount = jobs.filter(j => j.stage === 'approved' || j.tailoredApp?.status === 'approved').length;
  const interviewingCount = jobs.filter(j => j.stage === 'interviewing').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        profile={profile}
        jobs={jobs}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAddJob={() => setIsAddJobOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Human-in-the-loop Assurance & Hero Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                Autonomous Matching with Human-In-The-Loop Approval
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Welcome back, {profile.fullName.split(' ')[0]}
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                ApplyPilot matches your experience against job postings, crafts bespoke cover letters and bullet points, and waits for your explicit review and approval before anything is submitted.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                Edit Profile & Skills
              </button>
              <button
                type="button"
                onClick={() => setIsAddJobOpen(true)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-950/40"
              >
                <PlusCircle className="w-4 h-4" />
                Add Target Job
              </button>
            </div>
          </div>

          {/* Decorative subtle background circle */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-medium text-slate-500 flex items-center justify-between mb-1">
              <span>Tracked Jobs</span>
              <Briefcase className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{jobs.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Active opportunities</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-medium text-slate-500 flex items-center justify-between mb-1">
              <span>High Fit Matches</span>
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">{strongMatchesCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">&gt;85% compatibility</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-medium text-slate-500 flex items-center justify-between mb-1">
              <span>Awaiting Approval</span>
              <ShieldAlert className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{pendingApprovalCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Ready for your sign-off</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-medium text-slate-500 flex items-center justify-between mb-1">
              <span>Ready / Approved</span>
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-indigo-600">{approvedReadyCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Tailored & confirmed</div>
          </div>
        </div>

        {/* Pipeline Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Application Pipeline & Tracking</h2>
              <p className="text-xs text-slate-500">Manage opportunities from initial AI match through final offer.</p>
            </div>
          </div>

          <PipelineBoard
            jobs={jobs}
            onSelectJob={(job) => setSelectedJob(job)}
            onOpenTailoring={(job) => setTailoringJob(job)}
            onUpdateJobStage={handleUpdateJobStage}
          />
        </div>
      </main>

      {/* Modals */}
      <ProfileModal
        profile={profile}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSaveProfile={handleSaveProfile}
      />

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
        onOpenTailorApproval={(job) => {
          setSelectedJob(null);
          setTailoringJob(job);
        }}
      />

      <TailorApprovalModal
        job={tailoringJob}
        isOpen={Boolean(tailoringJob)}
        onClose={() => setTailoringJob(null)}
        profile={profile}
        onUpdateJob={handleUpdateJob}
      />
    </div>
  );
}
