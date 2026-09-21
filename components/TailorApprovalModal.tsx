'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, CheckCircle2, Copy, Check, Edit3, ArrowRight, 
  RotateCcw, ShieldCheck, Mail, FileText, ListOrdered, MessageSquare, AlertCircle,
  ExternalLink, Lock, ShieldAlert, CheckSquare, UserCheck
} from 'lucide-react';
import { Job, UserProfile, TailoredApplication, ScreeningAnswer } from '@/lib/types';
import { prepareTailoredApplicationAI } from '@/lib/ai-services';

interface TailorApprovalModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateJob: (updated: Job) => void;
}

export function TailorApprovalModal({
  job,
  isOpen,
  onClose,
  profile,
  onUpdateJob,
}: TailorApprovalModalProps) {
  if (!isOpen || !job) return null;

  return (
    <TailorApprovalModalContent
      key={job.id}
      job={job}
      profile={profile}
      onClose={onClose}
      onUpdateJob={onUpdateJob}
    />
  );
}

function TailorApprovalModalContent({
  job,
  profile,
  onClose,
  onUpdateJob,
}: {
  job: Job;
  profile: UserProfile;
  onClose: () => void;
  onUpdateJob: (updated: Job) => void;
}) {
  const [tone, setTone] = useState<'professional' | 'conversational' | 'bold'>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'cover_letter' | 'resume_bullets' | 'screening_answers' | 'outreach'>('cover_letter');

  // Editable fields initialized from current job
  const [coverLetter, setCoverLetter] = useState(job.tailoredApp?.coverLetter || '');
  const [tailoredSummary, setTailoredSummary] = useState(job.tailoredApp?.tailoredSummary || '');
  const [bulletsText, setBulletsText] = useState(job.tailoredApp?.suggestedBulletPoints?.join('\n') || '');
  const [outreachEmail, setOutreachEmail] = useState(job.tailoredApp?.outreachEmail || '');
  const [screeningAnswers, setScreeningAnswers] = useState<ScreeningAnswer[]>(job.tailoredApp?.screeningAnswers || []);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [approvalNotice, setApprovalNotice] = useState<string | null>(null);

  // External platform automation status
  const requiresHumanConnection = ['workday', 'linkedin', 'indeed', 'naukri'].includes(job.source_platform || '');

  useEffect(() => {
    if (!job.tailoredApp || !job.tailoredApp.coverLetter) {
      handleGenerate();
    }
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setApprovalNotice(null);

    try {
      const generated = await prepareTailoredApplicationAI(profile, job);

      setCoverLetter(generated.coverLetter);
      setTailoredSummary(generated.tailoredSummary);
      setBulletsText(generated.suggestedBulletPoints.join('\n'));
      setOutreachEmail(generated.outreachEmail);
      setScreeningAnswers(generated.screeningAnswers || []);

      const updatedJob: Job = {
        ...job,
        stage: job.stage === 'discovered' ? 'ready_for_review' : job.stage,
        tailoredApp: generated,
      };
      onUpdateJob(updatedJob);
    } catch (err) {
      console.warn('Error tailoring application:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAnswerChange = (idx: number, newAnswer: string) => {
    const updated = [...screeningAnswers];
    updated[idx] = {
      ...updated[idx],
      answer: newAnswer,
      requiresUserInput: false
    };
    setScreeningAnswers(updated);
  };

  const handleApproveAndSubmit = () => {
    const updatedBullets = bulletsText.split('\n').map(b => b.trim()).filter(Boolean);

    const approvedApp: TailoredApplication = {
      coverLetter,
      tailoredSummary,
      suggestedBulletPoints: updatedBullets,
      outreachEmail,
      screeningAnswers,
      keyTalkingPoints: job.tailoredApp?.keyTalkingPoints || [],
      status: 'approved',
      updatedAt: new Date().toISOString().split('T')[0],
    };

    const nextStage = requiresHumanConnection ? 'needs_human_action' : 'applied';

    const updatedJob: Job = {
      ...job,
      stage: nextStage,
      appliedDate: !requiresHumanConnection ? new Date().toISOString().split('T')[0] : undefined,
      tailoredApp: approvedApp,
    };

    onUpdateJob(updatedJob);

    if (requiresHumanConnection) {
      setApprovalNotice(`Application approved! Platform requires individual authentication. Marked as 'Needs Human Action'.`);
    } else {
      setApprovalNotice(`Application approved & submitted via verified feed! Marked as 'Applied'.`);
    }

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleSaveDraft = () => {
    const updatedBullets = bulletsText.split('\n').map(b => b.trim()).filter(Boolean);

    const savedApp: TailoredApplication = {
      coverLetter,
      tailoredSummary,
      suggestedBulletPoints: updatedBullets,
      outreachEmail,
      screeningAnswers,
      keyTalkingPoints: job.tailoredApp?.keyTalkingPoints || [],
      status: 'modified',
      updatedAt: new Date().toISOString().split('T')[0],
    };

    const updatedJob: Job = {
      ...job,
      stage: 'ready_for_review',
      tailoredApp: savedApp,
    };

    onUpdateJob(updatedJob);
    setApprovalNotice('Draft edits saved to Ready for Review.');
    setTimeout(() => setApprovalNotice(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50/80 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                Application Review & Approval
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                AI Match: {job.match?.matchScore || 80}%
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              {job.title} · <span className="text-slate-600 font-medium">{job.company}</span>
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Source: {job.source}</span>
              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                >
                  <span>View Posting</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Human Connection Alert Banner */}
        {requiresHumanConnection && (
          <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-900 shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <p>
              <strong>Connection Required on {job.source}:</strong> Automated direct submission is restricted by platform security. Approving will save your package and guide you to submit on the employer portal.
            </p>
          </div>
        )}

        {/* Notification Toast */}
        {approvalNotice && (
          <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-bold shrink-0">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{approvalNotice}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('cover_letter')}
            className={`py-3 px-3 border-b-2 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'cover_letter'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Cover Letter
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('resume_bullets')}
            className={`py-3 px-3 border-b-2 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'resume_bullets'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Resume Customizations
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('screening_answers')}
            className={`py-3 px-3 border-b-2 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'screening_answers'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Screening Answers ({screeningAnswers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('outreach')}
            className={`py-3 px-3 border-b-2 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'outreach'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Recruiter Outreach Email
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'cover_letter' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-xs">
                  Tailored Cover Letter (Evidence-Backed)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(coverLetter, 'cl')}
                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  {copiedKey === 'cl' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'cl' ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
              <textarea
                rows={14}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs leading-relaxed text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          )}

          {activeTab === 'resume_bullets' && (
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tailored Profile Summary</label>
                <textarea
                  rows={3}
                  value={tailoredSummary}
                  onChange={(e) => setTailoredSummary(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Recommended Resume Bullet Points</label>
                  <button
                    type="button"
                    onClick={() => handleCopy(bulletsText, 'bullets')}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    {copiedKey === 'bullets' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'bullets' ? 'Copied' : 'Copy Bullets'}</span>
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={bulletsText}
                  onChange={(e) => setBulletsText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white font-mono"
                />
              </div>
            </div>
          )}

          {activeTab === 'screening_answers' && (
            <div className="space-y-4">
              <p className="text-slate-500 text-xs">
                Answers generated strictly using verified resume citations. Any unverified items require your input.
              </p>

              {screeningAnswers.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                  No specific screening questions identified for this position.
                </div>
              ) : (
                <div className="space-y-3">
                  {screeningAnswers.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border space-y-2 ${
                        item.requiresUserInput
                          ? 'bg-rose-50/50 border-rose-200'
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <strong className="text-slate-900 font-semibold text-xs">
                          {idx + 1}. {item.question}
                        </strong>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          item.isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.isVerified ? 'VERIFIED EVIDENCE' : 'USER INPUT REQUIRED'}
                        </span>
                      </div>

                      <textarea
                        rows={2}
                        value={item.answer}
                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />

                      {item.evidenceQuote && (
                        <div className="text-[11px] text-slate-500 italic bg-slate-100/70 p-2 rounded">
                          Citing evidence: "{item.evidenceQuote}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'outreach' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-xs">
                  Recruiter Outreach Email (Subject & Body)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(outreachEmail, 'outreach')}
                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  {copiedKey === 'outreach' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'outreach' ? 'Copied' : 'Copy Email'}</span>
                </button>
              </div>
              <textarea
                rows={10}
                value={outreachEmail}
                onChange={(e) => setOutreachEmail(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate Content</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold cursor-pointer"
            >
              Save Draft Edits
            </button>

            <button
              type="button"
              onClick={handleApproveAndSubmit}
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>APPROVE & SUBMIT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
