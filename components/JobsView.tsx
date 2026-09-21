'use client';

import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Sparkles, 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  ArrowUpRight, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Job, MatchDecision, FreshnessCategory } from '@/lib/types';

interface JobsViewProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onOpenTailor: (job: Job) => void;
  onOpenAddJob: () => void;
  onUpdateJobStage: (jobId: string, stage: any) => void;
}

export function JobsView({
  jobs,
  onSelectJob,
  onOpenTailor,
  onOpenAddJob,
  onUpdateJobStage
}: JobsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFreshness, setSelectedFreshness] = useState<string>('all');
  const [selectedDecision, setSelectedDecision] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');

  const filteredJobs = jobs.filter((job) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${job.title} ${job.company} ${job.location} ${job.description} ${job.requirements.join(' ')}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    // Freshness filter
    if (selectedFreshness !== 'all') {
      if (selectedFreshness === '<24h' && job.freshness !== '<24 hours') return false;
      if (selectedFreshness === '<3d' && !['<24 hours', '<3 days'].includes(job.freshness || '')) return false;
      if (selectedFreshness === '<7d' && !['<24 hours', '<3 days', '<7 days'].includes(job.freshness || '')) return false;
    }

    // Decision filter
    if (selectedDecision !== 'all') {
      if (job.match?.decision !== selectedDecision) return false;
    }

    // Source filter
    if (selectedSource !== 'all') {
      if (job.source_platform !== selectedSource) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Job Discovery Catalog</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Ingested opportunities from connected sources, normalized and scored with transparent AI match estimates
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddJob}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Job (JD / URL)</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by role title, company, skill, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Freshness Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
              <span className="text-slate-400 px-1 font-medium">Freshness:</span>
              {(['all', '<24h', '<3d', '<7d'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedFreshness(f)}
                  className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    selectedFreshness === f ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>

            {/* Decision Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
              <span className="text-slate-400 px-1 font-medium">Decision:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'APPLY', label: 'Apply (≥80%)' },
                { id: 'REVIEW', label: 'Review' },
                { id: 'SKIP', label: 'Skip' }
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDecision(d.id)}
                  className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    selectedDecision === d.id ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Counter and Active Filter Pill */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing <strong className="text-slate-700">{filteredJobs.length}</strong> of {jobs.length} jobs</span>
          {(searchQuery || selectedFreshness !== 'all' || selectedDecision !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedFreshness('all');
                setSelectedDecision('all');
                setSelectedSource('all');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Jobs Catalog Grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-800">No jobs match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, clearing filters, or adding a new job description directly.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddJob}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs"
          >
            Add New Job Opening
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const match = job.match;
            const score = match?.matchScore || 0;
            const decision = match?.decision || (score >= 80 ? 'APPLY' : score >= 65 ? 'REVIEW' : 'SKIP');

            return (
              <div
                key={job.id}
                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-5 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                        {job.freshness || 'Recent'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {job.source}
                      </span>
                      {job.workplace_type && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 uppercase">
                          {job.workplace_type}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {job.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>
                      {job.salary && (
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          {job.salary}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI Match Estimate Box */}
                  <div className="sm:text-right shrink-0">
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-semibold text-slate-400">AI Match Estimate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wide ${
                          decision === 'APPLY'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : decision === 'REVIEW'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}>
                          {score}% · {decision}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match Details & Reasons */}
                {match && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                    {/* Strengths / Reasons */}
                    <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-3 space-y-1.5">
                      <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Qualifications & Strengths:
                      </span>
                      <ul className="space-y-1 text-slate-600 text-[11px]">
                        {(match.reasons || []).slice(0, 2).map((r, i) => (
                          <li key={i} className="line-clamp-1">• {r}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Gaps / Violations */}
                    <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-3 space-y-1.5">
                      <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Potential Gaps & Considerations:
                      </span>
                      <ul className="space-y-1 text-slate-600 text-[11px]">
                        {(match.gaps || ['No critical technical gaps detected.']).slice(0, 2).map((g, i) => (
                          <li key={i} className="line-clamp-1">• {g}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {job.url && (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium"
                      >
                        <span>Original Posting</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectJob(job)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Analysis & Details
                    </button>
                    {decision !== 'SKIP' && (
                      <button
                        type="button"
                        onClick={() => onOpenTailor(job)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs cursor-pointer"
                      >
                        <span>Prepare Application</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
