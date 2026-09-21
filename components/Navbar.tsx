'use client';

import React from 'react';
import { Sparkles, User, PlusCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { UserProfile, Job } from '@/lib/types';

interface NavbarProps {
  profile: UserProfile;
  jobs: Job[];
  onOpenProfile: () => void;
  onOpenAddJob: () => void;
}

export function Navbar({ profile, jobs, onOpenProfile, onOpenAddJob }: NavbarProps) {
  const pendingApprovalCount = jobs.filter(j => j.tailoredApp?.status === 'pending_approval').length;
  const approvedCount = jobs.filter(j => j.stage === 'approved' || j.tailoredApp?.status === 'approved').length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">ApplyPilot</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Agent Active
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              AI Job Matcher & Human-in-the-Loop Tailoring
            </p>
          </div>
        </div>

        {/* Center / Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {pendingApprovalCount > 0 && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>{pendingApprovalCount} application{pendingApprovalCount > 1 ? 's' : ''} awaiting approval</span>
            </div>
          )}

          <button
            id="nav-add-job-button"
            type="button"
            onClick={onOpenAddJob}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Add Job Posting</span>
            <span className="sm:hidden">Add</span>
          </button>

          <button
            id="nav-profile-button"
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
              {profile.fullName.charAt(0) || <User className="w-3.5 h-3.5" />}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                {profile.fullName}
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                Profile & Resume
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
