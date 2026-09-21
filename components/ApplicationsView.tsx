'use client';

import React, { useState } from 'react';
import { 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Building2, 
  MapPin, 
  FileText, 
  Calendar, 
  ChevronRight,
  ShieldAlert,
  Award,
  PlusCircle,
  Eye,
  Check
} from 'lucide-react';
import { ApplicationRecord, PipelineStage, ApplicationOutcome, Job } from '@/lib/types';

interface ApplicationsViewProps {
  applications: ApplicationRecord[];
  onSelectApplication: (app: ApplicationRecord) => void;
  onUpdateStage: (appId: string, stage: PipelineStage) => void;
  onLogOutcome: (appId: string, outcome: ApplicationOutcome) => void;
  onOpenTailorModal: (job: Job) => void;
}

export function ApplicationsView({
  applications,
  onSelectApplication,
  onUpdateStage,
  onLogOutcome,
  onOpenTailorModal
}: ApplicationsViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [loggingApp, setLoggingApp] = useState<ApplicationRecord | null>(null);
  const [outcomeStatus, setOutcomeStatus] = useState<'interview' | 'offer' | 'rejected' | 'recruiter_response'>('interview');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [outcomeDate, setOutcomeDate] = useState(new Date().toISOString().split('T')[0]);
  const [interviewRound, setInterviewRound] = useState('Technical Screening');

  const filteredApps = applications.filter((app) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'review') return app.stage === 'ready_for_review';
    if (selectedFilter === 'action_required') return app.stage === 'needs_human_action';
    if (selectedFilter === 'applied') return app.stage === 'applied';
    if (selectedFilter === 'interview') return app.stage === 'interview';
    if (selectedFilter === 'offer') return app.stage === 'offer';
    return true;
  });

  const handleSaveOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggingApp) return;

    onLogOutcome(loggingApp.id, {
      status: outcomeStatus,
      date: outcomeDate,
      notes: outcomeNotes.trim() || undefined,
      interviewRound: outcomeStatus === 'interview' ? interviewRound : undefined
    });

    setLoggingApp(null);
    setOutcomeNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Application Tracker</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track prepared materials, human intervention alerts, submission statuses, and recruiter outcomes across 13 stages
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All', count: applications.length },
            { id: 'review', label: 'Ready for Review', count: applications.filter(a => a.stage === 'ready_for_review').length, color: 'text-amber-700 bg-amber-50' },
            { id: 'action_required', label: 'Action Required', count: applications.filter(a => a.stage === 'needs_human_action').length, color: 'text-rose-700 bg-rose-50' },
            { id: 'applied', label: 'Applied', count: applications.filter(a => a.stage === 'applied').length },
            { id: 'interview', label: 'Interviews', count: applications.filter(a => a.stage === 'interview').length, color: 'text-violet-700 bg-violet-50' },
            { id: 'offer', label: 'Offers', count: applications.filter(a => a.stage === 'offer').length, color: 'text-emerald-700 bg-emerald-50' }
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFilter(f.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{f.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedFilter === f.id ? 'bg-indigo-700 text-white' : f.color || 'bg-slate-100 text-slate-600'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <Send className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No applications in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Jobs that meet your threshold will appear in "Ready for Review" once tailored.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const isReadyForReview = app.stage === 'ready_for_review';
            const isHumanAction = app.stage === 'needs_human_action';
            const isInterview = app.stage === 'interview';
            const isOffer = app.stage === 'offer';

            return (
              <div
                key={app.id}
                className={`bg-white border rounded-xl p-5 shadow-xs transition-all space-y-4 ${
                  isHumanAction
                    ? 'border-rose-300 bg-rose-50/20'
                    : isReadyForReview
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        isHumanAction
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isReadyForReview
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : isInterview
                          ? 'bg-violet-100 text-violet-800 border border-violet-200'
                          : isOffer
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        Stage: {app.stage.replace(/_/g, ' ')}
                      </span>

                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {app.job.source}
                      </span>

                      {app.job.match && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          AI Match: {app.job.match.matchScore}%
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {app.job.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {app.job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {app.job.location}
                      </span>
                      {app.appliedDate && (
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Applied on {app.appliedDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Stage Action */}
                  <div className="flex flex-wrap items-center gap-2">
                    {isReadyForReview && (
                      <button
                        type="button"
                        onClick={() => onOpenTailorModal({ ...app.job, stage: app.stage, tailoredApp: app.tailoredApp } as Job)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer"
                      >
                        Review & Approve
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setLoggingApp(app)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Log Outcome
                    </button>
                  </div>
                </div>

                {/* Human Action Alert Banner */}
                {isHumanAction && app.humanActionRequired && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-900">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block">{app.humanActionRequired.reason}</strong>
                      <p className="text-rose-800 text-[11px] mt-0.5">{app.humanActionRequired.details}</p>
                    </div>
                  </div>
                )}

                {/* Interview Notes if Scheduled */}
                {app.interviewDate && (
                  <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg flex items-center justify-between gap-3 text-xs text-violet-900">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-violet-600" />
                      <div>
                        <strong>Upcoming Interview:</strong> {app.interviewDate}
                        {app.notes && <p className="text-violet-700 text-[11px]">{app.notes}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Material Preview Drawer */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-700 text-[11px]">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      Prepared Materials Preview:
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenTailorModal({ ...app.job, stage: app.stage, tailoredApp: app.tailoredApp } as Job)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      <span>Full Package</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-slate-600 line-clamp-2 text-[11px] italic bg-white p-2 rounded border border-slate-100">
                    "{app.tailoredApp?.tailoredSummary || app.tailoredApp?.coverLetter?.slice(0, 140)}..."
                  </p>

                  {app.tailoredApp?.screeningAnswers && app.tailoredApp.screeningAnswers.length > 0 && (
                    <div className="text-[11px] text-slate-500">
                      <strong>{app.tailoredApp.screeningAnswers.length}</strong> screening questions answered citing verified resume evidence.
                    </div>
                  )}
                </div>

                {/* Stage Progress Selector */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-600">Update Status:</span>
                    <select
                      value={app.stage}
                      onChange={(e) => onUpdateStage(app.id, e.target.value as PipelineStage)}
                      className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="discovered">Discovered</option>
                      <option value="saved">Saved</option>
                      <option value="ready_for_review">Ready for Review</option>
                      <option value="approved">Approved</option>
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                      <option value="needs_human_action">Needs Human Action</option>
                    </select>
                  </div>

                  {app.outcomes && app.outcomes.length > 0 && (
                    <span className="text-[11px] text-slate-400">
                      {app.outcomes.length} outcome event(s) logged
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Outcome Modal */}
      {loggingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Log Recruiter Outcome
            </h3>
            <p className="text-xs text-slate-500">
              Record recruiter responses, technical interview rounds, offers, or rejections for <strong>{loggingApp.job.company}</strong>.
            </p>

            <form onSubmit={handleSaveOutcome} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Outcome Type</label>
                <select
                  value={outcomeStatus}
                  onChange={(e) => setOutcomeStatus(e.target.value as any)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="interview">Interview Scheduled</option>
                  <option value="recruiter_response">Recruiter Response / In Review</option>
                  <option value="offer">Job Offer Received 🎉</option>
                  <option value="rejected">Application Rejected</option>
                </select>
              </div>

              {outcomeStatus === 'interview' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Round / Stage</label>
                  <input
                    type="text"
                    value={interviewRound}
                    onChange={(e) => setInterviewRound(e.target.value)}
                    placeholder="e.g. Technical Round 1 (System Design)"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={outcomeDate}
                  onChange={(e) => setOutcomeDate(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Context</label>
                <textarea
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  placeholder="e.g. Recruiter mentioned focus on distributed microservices..."
                  rows={3}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLoggingApp(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
