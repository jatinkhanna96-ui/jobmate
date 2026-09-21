'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Briefcase, 
  Send, 
  Bot, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  DollarSign, 
  FileText,
  ChevronRight,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { Job, UserProfile, ApplicationRecord, NavigationTab } from '@/lib/types';
import { runDailyAgentWorkflow } from '@/lib/agent-tools';

interface DashboardViewProps {
  profile: UserProfile;
  jobs: Job[];
  applications: ApplicationRecord[];
  agentStatus: 'ACTIVE' | 'PAUSED';
  onNavigate: (tab: NavigationTab) => void;
  onSelectJob: (job: Job) => void;
  onOpenTailor: (job: Job) => void;
  onRefresh: () => void;
}

export function DashboardView({
  profile,
  jobs,
  applications,
  agentStatus,
  onNavigate,
  onSelectJob,
  onOpenTailor,
  onRefresh
}: DashboardViewProps) {
  const [isRunningDaily, setIsRunningDaily] = useState(false);
  const [dailyRunResult, setDailyRunResult] = useState<string | null>(null);

  const strongMatches = jobs.filter((j) => (j.match?.matchScore || 0) >= 80);
  const readyForReview = applications.filter((a) => a.stage === 'ready_for_review');
  const appliedCount = applications.filter((a) => ['applied', 'interview', 'offer', 'rejected'].includes(a.stage)).length;
  const interviewCount = applications.filter((a) => a.stage === 'interview').length;
  const humanActionCount = applications.filter((a) => a.stage === 'needs_human_action').length;

  const handleRunDailyAgent = async () => {
    setIsRunningDaily(true);
    setDailyRunResult(null);
    try {
      const summary = await runDailyAgentWorkflow();
      setDailyRunResult(`Daily agent run completed: ${summary.jobsAnalyzed} jobs analyzed, ${summary.strongMatchesFound} strong matches identified.`);
      onRefresh();
    } catch (e: any) {
      setDailyRunResult(`Agent run encountered an issue: ${e?.message || String(e)}`);
    } finally {
      setIsRunningDaily(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Product Promise Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-indigo-900/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Career Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Your AI career agent works every day to find the right jobs before they disappear.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Continuously ingests newly posted opportunities from verified feeds, applies forensic candidate matching, and prepares tailor-fit application materials with human review.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Unconfirmed Profile Alert Banner */}
      {!profile.isConfirmed && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Profile Confirmation Required</h4>
              <p className="text-xs text-amber-750">
                Your extracted candidate profile has not been verified. CareerPilot AI only prepares applications against confirmed sources of truth.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            Review & Confirm Profile
          </button>
        </div>
      )}

      {/* Agent Status & Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Controller Card */}
        <div className="lg:col-span-1 rounded-xl bg-white border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Career Agent Status</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                agentStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${agentStatus === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                {agentStatus}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-2">Daily Discovery Engine</h3>
            <p className="text-xs text-slate-500 mt-1">
              Scheduled daily at <strong className="text-slate-700">8:00 AM</strong>. Evaluates fresh job feeds against your verified career preferences.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleRunDailyAgent}
              disabled={isRunningDaily}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRunningDaily ? 'animate-spin' : ''}`} />
              <span>{isRunningDaily ? 'Running Daily Workflow...' : 'Run Daily Agent Now'}</span>
            </button>

            {dailyRunResult && (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                {dailyRunResult}
              </p>
            )}

            <button
              type="button"
              onClick={() => onNavigate('agent')}
              className="w-full text-center text-xs text-indigo-600 hover:text-indigo-800 font-semibold py-1 transition-colors"
            >
              Open AI Agent Console & Activity Logs →
            </button>
          </div>
        </div>

        {/* Real Activity Metrics Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Jobs Discovered</span>
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{jobs.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">Across 3 active sources</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Strong Matches</span>
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-indigo-600">{strongMatches.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">Score ≥80% (Apply Queue)</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Ready for Review</span>
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{readyForReview.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">Tailored & waiting approval</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Applications Sent</span>
              <Send className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700">{appliedCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">Logged with user approval</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Active Interviews</span>
              <Clock className="w-4 h-4 text-violet-600" />
            </div>
            <div className="text-2xl font-bold text-violet-700">{interviewCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">Nova Cloud Technical Screen</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Human Action Req.</span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-rose-600">{humanActionCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">Workday login challenge</p>
          </div>
        </div>
      </div>

      {/* Priority Opportunities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Priority Opportunities</h2>
            <p className="text-xs text-slate-500">Freshest high-match job openings evaluated by your agent</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('jobs')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All Jobs ({jobs.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {strongMatches.slice(0, 3).map((job) => {
            const score = job.match?.matchScore || 0;
            return (
              <div
                key={job.id}
                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {job.freshness || 'Recent'}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-slate-400">AI Match Estimate:</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                        {score}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 line-clamp-1">{job.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>
                    </div>
                  </div>

                  {job.salary && (
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded">
                      <DollarSign className="w-3 h-3 text-slate-400" />
                      <span>{job.salary}</span>
                    </div>
                  )}

                  {/* Why it matches */}
                  {job.match?.reasons && job.match.reasons.length > 0 && (
                    <div className="text-xs text-slate-600 bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-lg space-y-1">
                      <span className="font-bold text-emerald-800 text-[11px] block">Match Rationale:</span>
                      <p className="line-clamp-2 text-slate-700 text-[11px]">
                        {job.match.reasons[0]}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectJob(job)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenTailor(job)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>Prepare Application</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Application Funnel Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Application Pipeline Funnel</h3>
            <p className="text-xs text-slate-500">Real-time status across your application lifecycle</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('applications')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            Open Full Tracker →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
            <span className="text-[11px] font-semibold text-slate-500 block">Discovered</span>
            <span className="text-xl font-bold text-slate-800">{jobs.filter((j) => j.stage === 'discovered').length}</span>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-100 text-center">
            <span className="text-[11px] font-semibold text-amber-700 block">Ready to Review</span>
            <span className="text-xl font-bold text-amber-800">{readyForReview.length}</span>
          </div>
          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-center">
            <span className="text-[11px] font-semibold text-blue-700 block">Applied</span>
            <span className="text-xl font-bold text-blue-800">{applications.filter((a) => a.stage === 'applied').length}</span>
          </div>
          <div className="p-3 bg-violet-50/60 rounded-lg border border-violet-100 text-center">
            <span className="text-[11px] font-semibold text-violet-700 block">Interviewing</span>
            <span className="text-xl font-bold text-violet-800">{interviewCount}</span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 text-center">
            <span className="text-[11px] font-semibold text-emerald-700 block">Offers</span>
            <span className="text-xl font-bold text-emerald-800">{applications.filter((a) => a.stage === 'offer').length}</span>
          </div>
          <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-100 text-center">
            <span className="text-[11px] font-semibold text-rose-700 block">Action Req.</span>
            <span className="text-xl font-bold text-rose-800">{humanActionCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
