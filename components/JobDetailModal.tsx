'use client';

import React, { useState } from 'react';
import { 
  X, Sparkles, Building, MapPin, DollarSign, Calendar, ExternalLink, 
  CheckCircle, AlertCircle, ArrowRight, RefreshCw, Check
} from 'lucide-react';
import { Job, UserProfile, PipelineStage } from '@/lib/types';

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateJob: (updated: Job) => void;
  onOpenTailorApproval: (job: Job) => void;
}

export function JobDetailModal({
  job,
  isOpen,
  onClose,
  profile,
  onUpdateJob,
  onOpenTailorApproval,
}: JobDetailModalProps) {
  const [isReAnalyzing, setIsReAnalyzing] = useState(false);

  if (!isOpen || !job) return null;

  const handleReMatch = async () => {
    setIsReAnalyzing(true);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, job }),
      });
      if (res.ok) {
        const matchData = await res.json();
        onUpdateJob({
          ...job,
          match: matchData,
        });
      }
    } catch (err) {
      console.error('Error re-analyzing:', err);
    } finally {
      setIsReAnalyzing(false);
    }
  };

  const handleStageChange = (newStage: PipelineStage) => {
    onUpdateJob({
      ...job,
      stage: newStage,
    });
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-slate-100 text-slate-700 border-slate-200';
    if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 75) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (score >= 60) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900">{job.title}</h2>
              {job.match && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getScoreColor(job.match.matchScore)}`}>
                  {job.match.matchScore}% Match
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
              <span className="flex items-center gap-1 font-medium text-slate-800">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {job.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {job.location} ({job.type})
              </span>
              {job.salaryRange && (
                <span className="flex items-center gap-1 font-medium text-emerald-700">
                  <DollarSign className="w-3.5 h-3.5" />
                  {job.salaryRange}
                </span>
              )}
              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Posting
                </a>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Match Analysis Hero Card */}
          {job.match ? (
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {job.match.matchScore}%
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{job.match.fitLevel}</div>
                    <div className="text-[11px] text-slate-500">Evaluated against {profile.fullName}&apos;s profile</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReMatch}
                  disabled={isReAnalyzing}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                >
                  <RefreshCw className={`w-3 h-3 ${isReAnalyzing ? 'animate-spin' : ''}`} />
                  Re-evaluate
                </button>
              </div>

              {/* Recommendation */}
              <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-indigo-100/60 leading-relaxed">
                <strong>Agent Insight:</strong> {job.match.recommendation}
              </p>

              {/* Strengths & Missing Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="font-semibold text-emerald-800 flex items-center gap-1 mb-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Key Matched Strengths
                  </span>
                  <ul className="space-y-1 text-slate-600">
                    {job.match.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-amber-800 flex items-center gap-1 mb-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Keywords to Emphasize / Missing
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {job.match.missingKeywords.map((kw, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[11px]">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <p className="text-xs text-slate-600 mb-2">No match score calculated yet for this posting.</p>
              <button
                type="button"
                onClick={handleReMatch}
                disabled={isReAnalyzing}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
              >
                {isReAnalyzing ? 'Analyzing...' : 'Calculate AI Match Score'}
              </button>
            </div>
          )}

          {/* Pipeline Stage Quick Switcher */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-700">Pipeline Stage:</span>
            <div className="flex gap-1 flex-wrap">
              {(['discovered', 'reviewing', 'approved', 'applied', 'interviewing', 'offer'] as PipelineStage[]).map(stg => (
                <button
                  key={stg}
                  type="button"
                  onClick={() => handleStageChange(stg)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium capitalize transition-colors ${
                    job.stage === stg
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {stg}
                </button>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Requirements</h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
              {job.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Job Description</h3>
            <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 max-h-60 overflow-y-auto">
              {job.description}
            </div>
          </div>

          {/* Tailored App Preview / Callout */}
          {job.tailoredApp && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Tailored Materials Generated ({job.tailoredApp.status})
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Custom cover letter, targeted summary, and talking points ready for review.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTailorApproval(job);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                Review & Approve <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenTailorApproval(job);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {job.tailoredApp ? 'Open Tailoring Studio' : 'Tailor Application with AI'}
          </button>
        </div>
      </div>
    </div>
  );
}
