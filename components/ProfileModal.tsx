'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  Check,
  Plus,
  Sparkles,
  Loader2,
  Clipboard,
  AlertTriangle,
  Eye,
  CheckCircle2,
  Trash2,
  Edit3,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  UserProfile,
  StructuredCandidateProfile,
  ExperienceItem,
  EducationItem,
  CertificationItem,
  ProjectItem,
  SkillItem,
  ToolItem,
  DocumentQualityAssessment,
  VerificationSource,
} from '@/lib/types';
import { apiFetch } from '@/lib/utils';
import { calculateTotalExperience } from '@/lib/experience-calculator';

interface ProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (updated: UserProfile) => void;
}

export function ProfileModal({ profile, isOpen, onClose, onSaveProfile }: ProfileModalProps) {
  if (!isOpen) return null;

  return (
    <ProfileModalContent
      profile={profile}
      onClose={onClose}
      onSaveProfile={onSaveProfile}
    />
  );
}

function ProfileModalContent({
  profile,
  onClose,
  onSaveProfile,
}: Omit<ProfileModalProps, 'isOpen'>) {
  // Determine if we start in review mode or upload mode
  const [viewMode, setViewMode] = useState<'review' | 'upload'>(
    profile.structuredProfile ? 'review' : 'upload'
  );

  // Active section inside the review view
  const [activeSection, setActiveSection] = useState<
    'personal' | 'experience' | 'skills' | 'tools' | 'education' | 'certifications' | 'projects' | 'industries' | 'preferences'
  >('personal');

  // Raw resume inspection view toggle
  const [showRawResume, setShowRawResume] = useState(false);

  // Upload/Input states
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState(profile.resumeRawText || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Candidate confirmation checkbox state
  const [isConfirmedByUser, setIsConfirmedByUser] = useState(
    profile.verificationStatus === 'verified'
  );

  // Master Structured Profile state
  const [structured, setStructured] = useState<StructuredCandidateProfile>(() => {
    if (profile.structuredProfile) {
      return profile.structuredProfile;
    }

    // Default structure constructed from existing UserProfile
    const experiences: ExperienceItem[] = (profile.workHistory || []).map((w, idx) => ({
      id: `exp-${idx}-${Date.now()}`,
      company: w.company,
      title: w.role,
      start_date: w.duration.split(/[-–—]/)[0]?.trim() || '',
      end_date: w.duration.split(/[-–—]/)[1]?.trim() || 'Present',
      responsibilities: w.highlights || [],
      achievements: [],
      skills_used: [],
      confidence: 'high',
      source: 'VERIFIED FROM RESUME',
    }));

    const expCalc = calculateTotalExperience(experiences);

    return {
      personal: {
        name: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || 'Remote',
        linkedin: profile.linkedinUrl || '',
        portfolio: profile.portfolioUrl || '',
      },
      professional_summary: profile.summary || '',
      current_role: {
        title: profile.targetRole || 'Software Professional',
        company: experiences[0]?.company || '',
        start_date: experiences[0]?.start_date || '',
        end_date: experiences[0]?.end_date || 'Present',
      },
      total_experience_years: expCalc.years,
      experience_formatted: profile.experienceCalculatedText || expCalc.formatted,
      experience: experiences,
      skills: (profile.skills || []).map((s, idx) => ({
        id: `s-${idx}`,
        name: s,
        confidence: 'high',
        source: 'VERIFIED FROM RESUME',
      })),
      tools: [],
      industries: [],
      education: profile.education
        ? [
            {
              id: 'edu-1',
              degree: profile.education,
              institution: '',
              confidence: 'high',
            },
          ]
        : [],
      certifications: [],
      projects: [],
      languages: [],
      explicit_preferences: {
        location: profile.location || '',
        remote_preference: 'Open to Remote',
        salary: '',
        notice_period: '',
      },
      evidence_layer: [],
      quality_assessment: profile.documentQuality || {
        documentType: 'text_pdf',
        isMultiColumn: false,
        qualityWarning: null,
        overallConfidence: 'high',
      },
    };
  });

  const [rawResumeTranscript, setRawResumeTranscript] = useState(
    profile.resumeRawText || ''
  );
  const [resumeFileName, setResumeFileName] = useState(
    profile.resumeFileName || 'Resume.pdf'
  );

  // In-line creation helper states
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newToolInput, setNewToolInput] = useState('');
  const [newIndustryInput, setNewIndustryInput] = useState('');

  // Experience addition modal/form state
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpCompany, setNewExpCompany] = useState('');
  const [newExpStart, setNewExpStart] = useState('');
  const [newExpEnd, setNewExpEnd] = useState('');
  const [newExpBullets, setNewExpBullets] = useState('');

  // Re-calculate experience whenever experience list changes
  const updateExperienceList = (newExperiences: ExperienceItem[]) => {
    const calc = calculateTotalExperience(newExperiences);
    setStructured((prev) => ({
      ...prev,
      experience: newExperiences,
      total_experience_years: calc.years,
      experience_formatted: calc.formatted,
    }));
  };

  // Upload handler (PDF or DOCX or text)
  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const data = new FormData();
      data.append('file', file);

      const parsed = await apiFetch<any>(
        '/api/parse-resume',
        {
          method: 'POST',
          body: data,
        },
        'Failed to process resume with Gemini document understanding'
      );

      if (parsed.structuredProfile) {
        setStructured(parsed.structuredProfile);
        setRawResumeTranscript(parsed.resumeRawText || '');
        setResumeFileName(parsed.resumeFileName || file.name);
        setViewMode('review');
        setIsConfirmedByUser(false); // Requires user review before confirming
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message ||
          'Failed to understand the document. Please ensure it is a valid PDF or text file.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Text paste extraction handler
  const handleExtractFromText = async () => {
    if (!pastedText.trim()) {
      setErrorMessage('Please paste your resume text before extracting.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const parsed = await apiFetch<any>(
        '/api/parse-resume',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: pastedText }),
        },
        'Failed to process pasted resume text'
      );

      if (parsed.structuredProfile) {
        setStructured(parsed.structuredProfile);
        setRawResumeTranscript(parsed.resumeRawText || pastedText);
        setResumeFileName(parsed.resumeFileName || 'Pasted_Resume.txt');
        setViewMode('review');
        setIsConfirmedByUser(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Error processing pasted text. Please retry.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Skills handlers
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    const name = newSkillInput.trim();
    if (!structured.skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setStructured((prev) => ({
        ...prev,
        skills: [
          ...prev.skills,
          {
            id: `skill-${Date.now()}`,
            name,
            confidence: 'high',
            source: 'USER PROVIDED' as VerificationSource,
          },
        ],
      }));
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (id: string) => {
    setStructured((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
    }));
  };

  // Tools handlers
  const handleAddTool = () => {
    if (!newToolInput.trim()) return;
    const name = newToolInput.trim();
    if (!structured.tools.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      setStructured((prev) => ({
        ...prev,
        tools: [
          ...prev.tools,
          {
            id: `tool-${Date.now()}`,
            name,
            confidence: 'high',
            source: 'USER PROVIDED' as VerificationSource,
          },
        ],
      }));
    }
    setNewToolInput('');
  };

  const handleRemoveTool = (id: string) => {
    setStructured((prev) => ({
      ...prev,
      tools: prev.tools.filter((t) => t.id !== id),
    }));
  };

  // Industries handlers
  const handleAddIndustry = () => {
    if (!newIndustryInput.trim()) return;
    const name = newIndustryInput.trim();
    if (!structured.industries.includes(name)) {
      setStructured((prev) => ({
        ...prev,
        industries: [...prev.industries, name],
      }));
    }
    setNewIndustryInput('');
  };

  const handleRemoveIndustry = (name: string) => {
    setStructured((prev) => ({
      ...prev,
      industries: prev.industries.filter((i) => i !== name),
    }));
  };

  // Add new experience role
  const handleSaveNewExperience = () => {
    if (!newExpTitle.trim() || !newExpCompany.trim()) return;
    const bullets = newExpBullets
      .split('\n')
      .map((b) => b.trim().replace(/^[•\-\*]\s*/, ''))
      .filter(Boolean);

    const newRole: ExperienceItem = {
      id: `exp-${Date.now()}`,
      title: newExpTitle.trim(),
      company: newExpCompany.trim(),
      start_date: newExpStart.trim(),
      end_date: newExpEnd.trim() || 'Present',
      responsibilities: bullets,
      achievements: [],
      skills_used: [],
      confidence: 'high',
      source: 'USER PROVIDED',
    };

    updateExperienceList([newRole, ...structured.experience]);
    setNewExpTitle('');
    setNewExpCompany('');
    setNewExpStart('');
    setNewExpEnd('');
    setNewExpBullets('');
    setIsAddingExperience(false);
  };

  const handleDeleteExperience = (id: string) => {
    updateExperienceList(structured.experience.filter((e) => e.id !== id));
  };

  // Final Confirmation: Save as Source of Truth
  const handleConfirmProfile = () => {
    if (!isConfirmedByUser) return;

    // Convert into persistent UserProfile format with verified flags
    const updatedProfile: UserProfile = {
      fullName: structured.personal.name || 'Candidate',
      email: structured.personal.email || '',
      phone: structured.personal.phone || '',
      location: structured.personal.location || 'Remote',
      targetRole: structured.current_role.title || 'Software Professional',
      yearsOfExperience: structured.total_experience_years || 0,
      experienceCalculatedText: structured.experience_formatted,
      skills: structured.skills.map((s) => s.name),
      summary: structured.professional_summary || '',
      workHistory: structured.experience.map((e) => ({
        company: e.company,
        role: e.title,
        duration: e.start_date && e.end_date ? `${e.start_date} - ${e.end_date}` : e.start_date || 'Past',
        highlights: [...e.responsibilities, ...e.achievements],
      })),
      education: structured.education
        .map((e) => [e.degree, e.institution].filter(Boolean).join(' - '))
        .filter(Boolean)
        .join(', '),
      portfolioUrl: structured.personal.portfolio || '',
      linkedinUrl: structured.personal.linkedin || '',
      resumeRawText: rawResumeTranscript,
      resumeFileName: resumeFileName,
      structuredProfile: structured,
      verificationStatus: 'verified',
      documentQuality: structured.quality_assessment,
    };

    onSaveProfile(updatedProfile);
    onClose();
  };

  const qualityAssessment = structured.quality_assessment;
  const hasQualityWarning = Boolean(qualityAssessment?.qualityWarning);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-6 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {viewMode === 'review'
                    ? 'Review your AI-extracted profile'
                    : 'Upload Candidate Resume'}
                </h2>
                {isConfirmedByUser && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Source of Truth
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {viewMode === 'review'
                  ? 'The uploaded resume is your primary source of truth. Confirm verified facts before job matching.'
                  : 'Gemini natively understands multi-page text and scanned PDF layouts without hallucinations.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'review' && (
              <>
                <button
                  type="button"
                  id="view-extracted-resume-btn"
                  onClick={() => setShowRawResume(!showRawResume)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                    showRawResume
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showRawResume ? 'Hide Raw Resume' : 'View extracted resume'}
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('upload')}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Re-upload
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* VIEW MODE A: UPLOAD / INGESTION */}
          {viewMode === 'upload' && (
            <div className="max-w-2xl mx-auto space-y-6 py-4">
              <div className="text-center space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  Select how you want to ingest your resume
                </h3>
                <p className="text-xs text-slate-500">
                  Supports standard text PDFs, scanned image PDFs, Word (.docx), and plain text.
                </p>
              </div>

              {/* Ingestion Mode Toggle */}
              <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-100/80">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'upload'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload Resume File (PDF / DOCX)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'paste'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clipboard className="w-4 h-4" />
                  Paste Plain Resume Text
                </button>
              </div>

              {/* Upload Dropzone */}
              {activeTab === 'upload' && (
                <div
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    isProcessing
                      ? 'border-indigo-300 bg-indigo-50/50 cursor-wait'
                      : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/20'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    disabled={isProcessing}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                      {isProcessing ? (
                        <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
                      ) : (
                        <FileText className="w-7 h-7" />
                      )}
                    </div>
                    {isProcessing ? (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-800">
                          Analyzing document with Gemini...
                        </p>
                        <p className="text-xs text-slate-500">
                          Interpreting layout, columns, tables, and calculating non-overlapping experience
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-800">
                            Click to browse or drop your resume here
                          </p>
                          <p className="text-xs text-slate-500">
                            Native PDF, Scanned PDF, or DOCX up to 10MB
                          </p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                          <Sparkles className="w-3 h-3 mr-1" /> Anti-Hallucination Strict Extraction
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Paste Text Mode */}
              {activeTab === 'paste' && (
                <div className="space-y-3">
                  <textarea
                    rows={10}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste the full text of your resume here (Summary, Experience, Education, Skills, etc.)..."
                    className="w-full text-xs font-mono p-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none outline-none leading-relaxed text-slate-800"
                  />
                  <button
                    type="button"
                    disabled={isProcessing || !pastedText.trim()}
                    onClick={handleExtractFromText}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Extracting Verified Profile...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Extract Structured Profile
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Return to existing review button if available */}
              {structured.personal.name && structured.personal.name !== 'Candidate' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('review')}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                  >
                    Back to current profile review
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE B: STRUCTURED PROFILE REVIEW */}
          {viewMode === 'review' && (
            <div className="space-y-6">
              
              {/* Quality & OCR Quality Warning Banner */}
              {hasQualityWarning && (
                <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs text-amber-900">
                    <p className="font-bold">
                      Some resume information could not be read confidently. Please review the highlighted fields.
                    </p>
                    <p className="text-amber-800/90">
                      {qualityAssessment?.qualityWarning ||
                        'Multi-column layout or scan artifacts detected. Missing or ambiguous items have not been fabricated.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Experience Duration Header Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Calculated Experience</div>
                    <div className="text-sm font-bold text-slate-900">
                      {structured.experience_formatted || 'Duration calculated from dates'}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 max-w-md">
                  Non-overlapping duration derived from employment intervals. Overlapping tenures are unified to avoid double-counting.
                </div>
              </div>

              {/* Raw Resume Split Drawer (when toggled) */}
              {showRawResume && (
                <div className="border border-indigo-200 bg-indigo-50/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-indigo-900">
                        Extracted Resume Transcript ({resumeFileName})
                      </span>
                    </div>
                    <span className="text-[11px] text-indigo-600">
                      Primary Source of Truth
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {rawResumeTranscript || 'No raw transcript recorded.'}
                  </div>
                  {structured.evidence_layer && structured.evidence_layer.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-xs font-semibold text-slate-700">
                        Evidence Audit Trail ({structured.evidence_layer.length} verified quotes)
                      </span>
                      <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
                        {structured.evidence_layer.map((ev, i) => (
                          <div key={i} className="p-2 text-[11px] flex flex-col gap-0.5">
                            <span className="font-semibold text-slate-800">{ev.claim}</span>
                            <span className="text-slate-600 italic">{ev.evidence}</span>
                            <span className="text-slate-400 text-[10px]">Source: {ev.source_section}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 9 Review Section Navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 text-xs font-semibold">
                {(
                  [
                    { id: 'personal', label: 'Personal' },
                    { id: 'experience', label: `Experience (${structured.experience.length})` },
                    { id: 'skills', label: `Skills (${structured.skills.length})` },
                    { id: 'tools', label: `Tools (${structured.tools.length})` },
                    { id: 'education', label: `Education (${structured.education.length})` },
                    { id: 'certifications', label: `Certifications (${structured.certifications.length})` },
                    { id: 'projects', label: `Projects (${structured.projects.length})` },
                    { id: 'industries', label: `Industries (${structured.industries.length})` },
                    { id: 'preferences', label: 'Preferences' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSection(tab.id)}
                    className={`px-3.5 py-2 rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                      activeSection === tab.id
                        ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* SECTION 1: PERSONAL */}
              {activeSection === 'personal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={structured.personal.name}
                        onChange={(e) =>
                          setStructured({
                            ...structured,
                            personal: { ...structured.personal, name: e.target.value },
                          })
                        }
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={structured.personal.email}
                        onChange={(e) =>
                          setStructured({
                            ...structured,
                            personal: { ...structured.personal, email: e.target.value },
                          })
                        }
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={structured.personal.phone}
                        onChange={(e) =>
                          setStructured({
                            ...structured,
                            personal: { ...structured.personal, phone: e.target.value },
                          })
                        }
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={structured.personal.location}
                        onChange={(e) =>
                          setStructured({
                            ...structured,
                            personal: { ...structured.personal, location: e.target.value },
                          })
                        }
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        LinkedIn URL
                      </label>
                      <input
                        type="text"
                        value={structured.personal.linkedin}
                        onChange={(e) =>
                          setStructured({
                            ...structured,
                            personal: { ...structured.personal, linkedin: e.target.value },
                          })
                        }
                        placeholder="https://linkedin.com/in/username"
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Portfolio / GitHub URL
                      </label>
                      <input
                        type="text"
                        value={structured.personal.portfolio}
                        onChange={(e) =>
                          setStructured({
                            ...structured,
                            personal: { ...structured.personal, portfolio: e.target.value },
                          })
                        }
                        placeholder="https://yourportfolio.dev"
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Professional Summary
                    </label>
                    <textarea
                      rows={4}
                      value={structured.professional_summary}
                      onChange={(e) =>
                        setStructured({
                          ...structured,
                          professional_summary: e.target.value,
                        })
                      }
                      className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 2: EXPERIENCE */}
              {activeSection === 'experience' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Employment History
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {structured.experience.length} roles found. Each role is tracked with verified source citations.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingExperience(true)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Experience
                    </button>
                  </div>

                  {/* Add Experience Form */}
                  {isAddingExperience && (
                    <div className="p-4 bg-slate-50 border border-indigo-200 rounded-xl space-y-3">
                      <div className="font-bold text-xs text-indigo-900 flex items-center justify-between">
                        <span>Add New Experience Role</span>
                        <button
                          type="button"
                          onClick={() => setIsAddingExperience(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Job Title (e.g. Senior Software Engineer)"
                          value={newExpTitle}
                          onChange={(e) => setNewExpTitle(e.target.value)}
                          className="text-xs p-2.5 border border-slate-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={newExpCompany}
                          onChange={(e) => setNewExpCompany(e.target.value)}
                          className="text-xs p-2.5 border border-slate-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Start Date (e.g. Jan 2021)"
                          value={newExpStart}
                          onChange={(e) => setNewExpStart(e.target.value)}
                          className="text-xs p-2.5 border border-slate-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="End Date (e.g. Present, or Dec 2023)"
                          value={newExpEnd}
                          onChange={(e) => setNewExpEnd(e.target.value)}
                          className="text-xs p-2.5 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Key responsibilities and achievements (one per line)..."
                        value={newExpBullets}
                        onChange={(e) => setNewExpBullets(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingExperience(false)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveNewExperience}
                          className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                        >
                          Save Role
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of roles */}
                  <div className="space-y-3">
                    {structured.experience.map((exp, idx) => (
                      <div
                        key={exp.id || idx}
                        className="p-4 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-colors space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="text-sm font-bold text-slate-900">{exp.title}</h5>
                              <span className="text-xs font-semibold text-slate-500">at {exp.company}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  exp.source === 'VERIFIED FROM RESUME'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                              >
                                {exp.source || 'VERIFIED FROM RESUME'}
                              </span>
                              {exp.confidence === 'needs_review' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                  Needs review
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{exp.start_date || 'Start'} — {exp.end_date || 'Present'}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteExperience(exp.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete this role"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Bullets */}
                        {exp.responsibilities && exp.responsibilities.length > 0 && (
                          <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                            {exp.responsibilities.map((resp, bIdx) => (
                              <li key={bIdx} className="leading-relaxed">
                                {resp}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}

                    {structured.experience.length === 0 && (
                      <div className="p-6 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                        No employment history found in resume. Click &quot;Add Experience&quot; to provide roles manually.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 3: SKILLS */}
              {activeSection === 'skills' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Extracted Skills
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {structured.skills.length} skills verified against document text. No AI hallucinations.
                      </p>
                    </div>
                  </div>

                  {/* Add skill input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a new skill (e.g. Distributed Systems, Kubernetes, Python)..."
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      className="flex-1 text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>

                  {/* Skills Grid */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {structured.skills.map((skill) => (
                      <div
                        key={skill.id}
                        className={`group px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all ${
                          skill.source === 'USER PROVIDED'
                            ? 'bg-blue-50/80 border-blue-200 text-blue-800'
                            : 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                        }`}
                      >
                        <span>{skill.name}</span>
                        <span className="text-[9px] font-bold opacity-60 uppercase">
                          {skill.source === 'USER PROVIDED' ? 'User' : 'Resume'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill.id)}
                          className="opacity-40 group-hover:opacity-100 hover:text-red-600 transition-opacity ml-1"
                          title="Remove skill"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {structured.skills.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 4: TOOLS */}
              {activeSection === 'tools' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Developer Tools & Software
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Specific platforms, development tools, and software frameworks.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a tool (e.g. Docker, Jira, GitHub Actions, Figma)..."
                      value={newToolInput}
                      onChange={(e) => setNewToolInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTool())}
                      className="flex-1 text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddTool}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {structured.tools.map((tool) => (
                      <div
                        key={tool.id}
                        className="group px-3 py-1.5 rounded-lg text-xs font-medium border bg-slate-50 border-slate-200 text-slate-800 flex items-center gap-2"
                      >
                        <span>{tool.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTool(tool.id)}
                          className="opacity-40 group-hover:opacity-100 hover:text-red-600 transition-opacity ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {structured.tools.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No tools recorded.</p>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 5: EDUCATION */}
              {activeSection === 'education' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Education & Academic Background
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Degrees and institutions extracted from document.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {structured.education.map((edu, idx) => (
                      <div
                        key={edu.id || idx}
                        className="p-3.5 border border-slate-200 rounded-xl bg-white flex items-start justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold text-slate-900">{edu.degree || 'Degree'}</h5>
                          <p className="text-xs text-slate-600">{edu.institution || 'University / College'}</p>
                          {edu.start_date && (
                            <p className="text-[11px] text-slate-400">
                              {edu.start_date} {edu.end_date ? `— ${edu.end_date}` : ''}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setStructured({
                              ...structured,
                              education: structured.education.filter((_, i) => i !== idx),
                            })
                          }
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {structured.education.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No education records found in resume.</p>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 6: CERTIFICATIONS */}
              {activeSection === 'certifications' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Certifications & Credentials
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Professional certifications explicitly documented in the resume.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {structured.certifications.map((cert, idx) => (
                      <div
                        key={cert.id || idx}
                        className="p-3 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">{cert.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {cert.issuer} {cert.date ? `• ${cert.date}` : ''}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setStructured({
                              ...structured,
                              certifications: structured.certifications.filter((_, i) => i !== idx),
                            })
                          }
                          className="text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {structured.certifications.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No certifications listed.</p>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 7: PROJECTS */}
              {activeSection === 'projects' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Highlighted Projects
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Independent or enterprise projects extracted from the resume.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {structured.projects.map((proj, idx) => (
                      <div key={proj.id || idx} className="p-3.5 border border-slate-200 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-slate-900">{proj.name}</h5>
                          <button
                            type="button"
                            onClick={() =>
                              setStructured({
                                ...structured,
                                projects: structured.projects.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600">{proj.description}</p>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {proj.technologies.map((t, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded font-mono"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {structured.projects.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No specific projects section found.</p>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 8: INDUSTRIES */}
              {activeSection === 'industries' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Industry & Domain Experience
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Industries where you have accumulated direct professional experience.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add an industry (e.g. Fintech, Healthcare, B2B SaaS, E-Commerce)..."
                      value={newIndustryInput}
                      onChange={(e) => setNewIndustryInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIndustry())}
                      className="flex-1 text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddIndustry}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {structured.industries.map((ind) => (
                      <div
                        key={ind}
                        className="group px-3 py-1.5 rounded-lg text-xs font-medium border bg-slate-50 border-slate-200 text-slate-800 flex items-center gap-2"
                      >
                        <span>{ind}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIndustry(ind)}
                          className="opacity-40 group-hover:opacity-100 hover:text-red-600 transition-opacity ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {structured.industries.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No industries specified yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 9: PREFERENCES */}
              {activeSection === 'preferences' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Job Search & Explicit Preferences
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Explicit criteria for job matching and application tailoring.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Target Role Title
                      </label>
                      <input
                        type="text"
                        value={structured.current_role.title}
                        onChange={(e) =>
                          setStructured({
                            ...structured,
                            current_role: { ...structured.current_role, title: e.target.value },
                          })
                        }
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Remote Preference
                      </label>
                      <select
                        value={structured.explicit_preferences.remote_preference || 'Remote'}
                        onChange={(e) =>
                          setStructured({
                            ...structured,
                            explicit_preferences: {
                              ...structured.explicit_preferences,
                              remote_preference: e.target.value,
                            },
                          })
                        }
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      >
                        <option value="Remote">Remote Only</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Onsite">Onsite</option>
                        <option value="Open to Remote">Open to Remote / Flexible</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Target Compensation / Salary
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. $160,000+ or Negotiable"
                        value={structured.explicit_preferences.salary}
                        onChange={(e) =>
                          setStructured({
                            ...structured,
                            explicit_preferences: {
                              ...structured.explicit_preferences,
                              salary: e.target.value,
                            },
                          })
                        }
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Notice Period / Availability
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Immediate, 2 weeks, 1 month"
                        value={structured.explicit_preferences.notice_period}
                        onChange={(e) =>
                          setStructured({
                            ...structured,
                            explicit_preferences: {
                              ...structured.explicit_preferences,
                              notice_period: e.target.value,
                            },
                          })
                        }
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer / Confirmation */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          {viewMode === 'review' ? (
            <>
              <div className="flex items-center gap-2.5">
                <input
                  id="confirm-accurate-checkbox"
                  type="checkbox"
                  checked={isConfirmedByUser}
                  onChange={(e) => setIsConfirmedByUser(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <label
                  htmlFor="confirm-accurate-checkbox"
                  className="text-xs font-semibold text-slate-800 cursor-pointer select-none"
                >
                  I confirm this profile accurately represents my experience.
                </label>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-profile-btn"
                  disabled={!isConfirmedByUser}
                  onClick={handleConfirmProfile}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                    isConfirmedByUser
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 cursor-pointer'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  CONFIRM PROFILE
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Extraction runs locally & securely with Gemini document understanding.
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
