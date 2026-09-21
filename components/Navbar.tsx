'use client';

import React from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  Briefcase, 
  Send, 
  UserCheck, 
  Bot, 
  Globe, 
  Settings as SettingsIcon, 
  PlusCircle, 
  ShieldAlert,
  CheckCircle2,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import { NavigationTab, UserProfile, Job, ApplicationRecord } from '@/lib/types';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  profile: UserProfile;
  jobs: Job[];
  applications: ApplicationRecord[];
  agentStatus: 'ACTIVE' | 'PAUSED';
  onToggleAgentStatus: () => void;
  onOpenAddJob: () => void;
}

export function Navbar({
  currentTab,
  onSelectTab,
  profile,
  jobs,
  applications,
  agentStatus,
  onToggleAgentStatus,
  onOpenAddJob
}: NavbarProps) {
  const readyForReviewCount = applications.filter((a) => a.stage === 'ready_for_review').length;
  const humanActionCount = applications.filter((a) => a.stage === 'needs_human_action').length;

  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Jobs', icon: Briefcase, badge: jobs.length },
    { 
      id: 'applications', 
      label: 'Applications', 
      icon: Send, 
      badge: readyForReviewCount > 0 ? readyForReviewCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    { 
      id: 'profile', 
      label: 'Candidate Profile', 
      icon: UserCheck, 
      badge: profile.isConfirmed ? undefined : 1,
      badgeColor: 'bg-rose-100 text-rose-700'
    },
    { id: 'agent', label: 'AI Agent', icon: Bot },
    { id: 'sources', label: 'Sources', icon: Globe },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar: Brand + Status + Actions */}
        <div className="h-16 flex items-center justify-between gap-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Sparkles className="h-5 w-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                  CareerPilot<span className="text-indigo-600">.ai</span>
                </span>
                <button
                  type="button"
                  onClick={onToggleAgentStatus}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                    agentStatus === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Click to toggle agent status"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${agentStatus === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  <span>Agent {agentStatus === 'ACTIVE' ? 'Active' : 'Paused'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Personal AI Job-Search & Application Agent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {humanActionCount > 0 && (
              <button
                type="button"
                onClick={() => onSelectTab('applications')}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>{humanActionCount} Human Action Required</span>
              </button>
            )}

            {readyForReviewCount > 0 && (
              <button
                type="button"
                onClick={() => onSelectTab('applications')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                <span>{readyForReviewCount} Ready to Review</span>
              </button>
            )}

            <button
              id="nav-add-job-button"
              type="button"
              onClick={onOpenAddJob}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Job</span>
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      item.badgeColor || (isActive ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-600')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
