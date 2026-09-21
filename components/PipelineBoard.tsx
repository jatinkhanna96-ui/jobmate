'use client';

import React, { useState } from 'react';
import { 
  Building, MapPin, Sparkles, CheckCircle, Clock, Send, 
  Users, Award, ChevronRight, Search, Filter, ShieldAlert,
  SlidersHorizontal, CheckCircle2, ArrowRight, ExternalLink
} from 'lucide-react';
import { Job, PipelineStage } from '@/lib/types';

interface PipelineBoardProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onOpenTailoring: (job: Job) => void;
  onUpdateJobStage: (jobId: string, stage: PipelineStage) => void;
}

const STAGES: { id: PipelineStage; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'discovered', label: 'Discovered', icon: <Sparkles className="w-3.5 h-3.5 text-indigo-500" />, color: 'border-indigo-200' },
  { id: 'reviewing', label: 'Reviewing', icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />, color: 'border-amber-200' },
  { id: 'approved', label: 'Approved', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />, color: 'border-emerald-200' },
  { id: 'applied', label: 'Applied', icon: <Send className="w-3.5 h-3.5 text-blue-500" />, color: 'border-blue-200' },
  { id: 'interviewing', label: 'Interviewing', icon: <Users className="w-3.5 h-3.5 text-purple-500" />, color: 'border-purple-200' },
  { id: 'offer', label: 'Offer', icon: <Award className="w-3.5 h-3.5 text-rose-500" />, color: 'border-rose-200' },
];

export function PipelineBoard({
  jobs,
  onSelectJob,
  onOpenTailoring,
  onUpdateJobStage,
}: PipelineBoardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requirements.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStage = selectedStageFilter === 'all' || job.stage === selectedStageFilter;
    return matchesSearch && matchesStage;
  });

  const getScoreBadge = (score?: number) => {
    if (!score) return null;
    let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
    if (score >= 90) colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
    else if (score >= 75) colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
    else if (score >= 60) colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
    else colorClass = 'bg-rose-50 text-rose-700 border-rose-200';

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border ${colorClass}`}>
        <Sparkles className="w-2.5 h-2.5" />
        {score}% Match
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls: Search, Stage Filter, and View Mode */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, or skills..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedStageFilter}
            onChange={e => setSelectedStageFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
          >
            <option value="all">All Stages ({jobs.length})</option>
            {STAGES.map(s => (
              <option key={s.id} value={s.id}>
                {s.label} ({jobs.filter(j => j.stage === s.id).length})
              </option>
            ))}
          </select>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'kanban'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Kanban Pipeline
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {/* Kanban Layout */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const stageJobs = filteredJobs.filter(j => j.stage === stage.id);

            return (
              <div
                key={stage.id}
                className="bg-slate-100/70 rounded-xl p-3 border border-slate-200/80 flex flex-col min-w-[250px] min-h-[420px]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                    {stage.icon}
                    <span>{stage.label}</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-white text-slate-600 rounded-full border border-slate-200">
                    {stageJobs.length}
                  </span>
                </div>

                {/* Stage Cards */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {stageJobs.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400">
                      No jobs in {stage.label}
                    </div>
                  ) : (
                    stageJobs.map(job => (
                      <div
                        key={job.id}
                        className="bg-white p-3 rounded-lg border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between gap-2.5 group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <h4
                              onClick={() => onSelectJob(job)}
                              className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 cursor-pointer line-clamp-2"
                            >
                              {job.title}
                            </h4>
                            {getScoreBadge(job.match?.matchScore)}
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-slate-600 mb-1 font-medium">
                            <Building className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{job.company}</span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </div>
                        </div>

                        {/* Status / Tailor Badge */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          {job.tailoredApp?.status === 'approved' ? (
                            <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Approved
                            </span>
                          ) : job.tailoredApp?.status === 'pending_approval' ? (
                            <span className="text-[10px] font-semibold text-amber-700 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-amber-600" />
                              Needs Approval
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Untailored</span>
                          )}

                          <button
                            type="button"
                            onClick={() => onOpenTailoring(job)}
                            className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[10px] transition-colors"
                          >
                            {job.tailoredApp ? 'Review' : 'Tailor'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {filteredJobs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No job postings found matching criteria.
            </div>
          ) : (
            filteredJobs.map(job => (
              <div
                key={job.id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="min-w-[260px] flex-1 cursor-pointer" onClick={() => onSelectJob(job)}>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-900 hover:text-indigo-600">
                      {job.title}
                    </h4>
                    {getScoreBadge(job.match?.matchScore)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="font-medium text-slate-700 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location} ({job.type})
                    </span>
                    {job.salaryRange && (
                      <span className="text-emerald-700 font-medium">
                        {job.salaryRange}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stage dropdown & Tailor Action */}
                <div className="flex items-center gap-3">
                  <select
                    value={job.stage}
                    onChange={e => onUpdateJobStage(job.id, e.target.value as PipelineStage)}
                    className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white capitalize font-medium text-slate-700"
                  >
                    {STAGES.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => onOpenTailoring(job)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    {job.tailoredApp ? 'Tailored Studio' : 'Tailor with AI'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
