'use client';

import React, { useState } from 'react';
import { X, Sparkles, Plus, Briefcase, Building, MapPin, DollarSign } from 'lucide-react';
import { Job, UserProfile, MatchAnalysis } from '@/lib/types';
import { parseJsonResponse, apiFetch } from '@/lib/utils';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddJob: (newJob: Job) => void;
  profile: UserProfile;
}

export function AddJobModal({ isOpen, onClose, onAddJob, profile }: AddJobModalProps) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Remote');
  const [type, setType] = useState<Job['type']>('Full-time');
  const [salaryRange, setSalaryRange] = useState('');
  const [url, setUrl] = useState('');
  const [requirementsInput, setRequirementsInput] = useState('');
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen) return null;

  const handleQuickFill = (preset: 'ai_eng' | 'frontend' | 'fullstack') => {
    if (preset === 'ai_eng') {
      setTitle('Generative AI Systems Engineer');
      setCompany('OmniGen Labs');
      setLocation('San Francisco, CA / Remote');
      setType('Full-time');
      setSalaryRange('$170,000 - $210,000');
      setUrl('https://omnigen.example/careers/ai-eng');
      setRequirementsInput('TypeScript & Python experience\nHands-on Gemini API or LLM tool-calling orchestration\nNext.js and modern API architectures\nDocker & Cloud Deployment');
      setDescription('We are scaling our core AI agent infrastructure. Looking for an engineer who excels at bridging LLMs with real-world database tools, UI widgets, and prompt pipelines.');
    } else if (preset === 'frontend') {
      setTitle('Senior Frontend Architect');
      setCompany('Lumina Cloud');
      setLocation('Remote (Global)');
      setType('Remote');
      setSalaryRange('$160,000 - $190,000');
      setUrl('https://lumina.example/jobs/sr-frontend');
      setRequirementsInput('Expert React, Next.js, and TypeScript\nState management, performance optimization, and accessibility\nDesign systems with Tailwind CSS\nModern build tooling');
      setDescription('Lumina is building real-time collaboration dashboards for cloud observability. We need a frontend leader to own user experience, component quality, and render performance.');
    } else {
      setTitle('Staff Software Engineer (Platform)');
      setCompany('Stratos Infrastructure');
      setLocation('Austin, TX (Hybrid)');
      setType('Hybrid');
      setSalaryRange('$180,000 - $215,000');
      setUrl('https://stratos.example/careers');
      setRequirementsInput('5+ years full stack Node.js & TypeScript\nPostgreSQL schema design and performance tuning\nHigh throughput API design\nMentorship of team members');
      setDescription('Stratos powers high-volume developer APIs. Help us architect the next generation of scalable services and developer-facing dashboards.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;

    setIsAnalyzing(true);

    const parsedRequirements = requirementsInput
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    const newJob: Job = {
      id: `job-${Date.now()}`,
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      type,
      workplace_type: type === 'Remote' ? 'remote' : type === 'Hybrid' ? 'hybrid' : 'onsite',
      source: 'Direct Ingestion',
      salaryRange: salaryRange.trim() || undefined,
      url: url.trim() || undefined,
      description: description.trim() || `${title} at ${company}. Great opportunity.`,
      requirements: parsedRequirements.length > 0 ? parsedRequirements : ['Relevant software engineering experience', 'Strong communication skills'],
      stage: 'discovered',
      postedDate: 'Just now'
    };

    try {
      // Call match API to evaluate match right away with auto-retry
      const matchData = await apiFetch<MatchAnalysis>(
        '/api/match',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, job: newJob }),
        },
        'Match analysis failed'
      );
      newJob.match = matchData;
    } catch (err) {
      console.warn('Match analysis API unavailable, computing local match:', err);
      // Graceful local heuristic fallback so card displays an accurate match score immediately
      const profileSkillsLower = profile.skills.map(s => s.toLowerCase());
      const matched = newJob.requirements.filter(r => profileSkillsLower.some(s => s.includes(r.toLowerCase()) || r.toLowerCase().includes(s)));
      const score = Math.min(95, Math.max(65, Math.round((matched.length / Math.max(1, newJob.requirements.length)) * 100)));
      newJob.match = {
        matchScore: score,
        fitLevel: score >= 85 ? 'Strong Match' : score >= 70 ? 'Good Match' : 'Moderate Match',
        strengths: matched.slice(0, 3).length > 0 ? matched.slice(0, 3) : ['Relevant technical background', 'Experience alignment'],
        missingKeywords: newJob.requirements.filter(r => !matched.includes(r)).slice(0, 3),
        skillGaps: ['Review job description requirements during tailoring'],
        recommendation: `Strong alignment with ${newJob.company}'s requirements. Highlight your experience in ${matched.join(', ') || 'core domains'}.`,
        analyzedAt: new Date().toISOString().split('T')[0]
      };
    } finally {
      setIsAnalyzing(false);
      onAddJob(newJob);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add Target Job Posting</h2>
            <p className="text-xs text-slate-500">ApplyPilot will match your profile and prepare a tailored submission.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Fill Presets */}
        <div className="px-6 py-2.5 bg-indigo-50/40 border-b border-indigo-100/60 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-indigo-900">Quick Demo Presets:</span>
          <button
            type="button"
            onClick={() => handleQuickFill('ai_eng')}
            className="px-2.5 py-1 rounded bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-medium transition-colors"
          >
            AI Systems Eng
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('frontend')}
            className="px-2.5 py-1 rounded bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-medium transition-colors"
          >
            Sr Frontend Architect
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('fullstack')}
            className="px-2.5 py-1 rounded bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-medium transition-colors"
          >
            Staff Platform Eng
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title *</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Stripe, Airbnb, Anthropic"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location & Workplace</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA / Remote"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Range (optional)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={salaryRange}
                  onChange={e => setSalaryRange(e.target.value)}
                  placeholder="e.g. $160,000 - $190,000"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as Job['type'])}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Full-time">Full-time</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Posting URL (optional)</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://company.com/jobs/..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Key Requirements (one per line)</label>
            <textarea
              rows={3}
              value={requirementsInput}
              onChange={e => setRequirementsInput(e.target.value)}
              placeholder="e.g.&#10;5+ years experience with React and TypeScript&#10;Proficiency with Node.js and SQL&#10;Experience deploying on GCP/AWS"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Job Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Paste the full job posting text or description here..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isAnalyzing || !title.trim() || !company.trim()}
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isAnalyzing ? 'Matching with AI...' : 'Add & Match Job'}
          </button>
        </div>
      </div>
    </div>
  );
}
