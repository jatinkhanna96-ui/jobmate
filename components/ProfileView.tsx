'use client';

import React, { useState } from 'react';
import { 
  UserCheck, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Save, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  HelpCircle, 
  Sparkles,
  RefreshCw,
  ExternalLink,
  Lock,
  Layers,
  Award
} from 'lucide-react';
import { UserProfile, VerificationSource, SkillCategory, SkillItem } from '@/lib/types';

interface ProfileViewProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export function ProfileView({ profile, onSaveProfile }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftProfile, setDraftProfile] = useState<UserProfile>(profile);
  const [isUploading, setIsUploading] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [activeSkillCategory, setActiveSkillCategory] = useState<SkillCategory>('technical');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillSource, setNewSkillSource] = useState<VerificationSource>('USER PROVIDED');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isConfirmed = draftProfile.isConfirmed || false;

  const handleConfirmProfile = () => {
    const updated: UserProfile = {
      ...draftProfile,
      isConfirmed: true,
      confirmedAt: new Date().toISOString(),
      verificationStatus: 'verified'
    };
    setDraftProfile(updated);
    onSaveProfile(updated);
  };

  const handleSaveEdits = () => {
    onSaveProfile(draftProfile);
    setIsEditing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error('Failed to parse document. Check server logs.');
      }

      const parsedData = await res.json();
      const updated: UserProfile = {
        ...parsedData,
        isConfirmed: false, // Must be explicitly confirmed
        verificationStatus: 'unconfirmed'
      };
      setDraftProfile(updated);
      onSaveProfile(updated);
    } catch (err: any) {
      console.error('Upload parse error:', err);
      setUploadError(err?.message || 'Error processing resume file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePastedTextSubmit = async () => {
    if (!pastedText.trim()) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pastedText })
      });

      if (!res.ok) throw new Error('Failed to process pasted resume text.');

      const parsedData = await res.json();
      const updated: UserProfile = {
        ...parsedData,
        isConfirmed: false,
        verificationStatus: 'unconfirmed'
      };
      setDraftProfile(updated);
      onSaveProfile(updated);
      setPasteMode(false);
    } catch (err: any) {
      setUploadError(err?.message || 'Error processing text.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const newSkill: SkillItem = {
      id: `skill-${Date.now()}`,
      name: newSkillName.trim(),
      category: activeSkillCategory,
      confidence: 'high',
      source: newSkillSource
    };

    const currentSkills = draftProfile.structuredProfile?.skills || [];
    const updatedSkills = [...currentSkills, newSkill];

    const updatedProfile: UserProfile = {
      ...draftProfile,
      skills: Array.from(new Set([...draftProfile.skills, newSkill.name])),
      structuredProfile: {
        ...(draftProfile.structuredProfile as any),
        skills: updatedSkills
      }
    };

    setDraftProfile(updatedProfile);
    onSaveProfile(updatedProfile);
    setNewSkillName('');
  };

  const handleRemoveSkill = (skillId: string, skillName: string) => {
    const currentSkills = draftProfile.structuredProfile?.skills || [];
    const updatedSkills = currentSkills.filter((s) => s.id !== skillId);

    const updatedProfile: UserProfile = {
      ...draftProfile,
      skills: draftProfile.skills.filter((s) => s !== skillName),
      structuredProfile: {
        ...(draftProfile.structuredProfile as any),
        skills: updatedSkills
      }
    };

    setDraftProfile(updatedProfile);
    onSaveProfile(updatedProfile);
  };

  const skillsList = draftProfile.structuredProfile?.skills || [];
  const categorizedSkills = skillsList.filter((s) => s.category === activeSkillCategory);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header & Verification Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Candidate Profile</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Source of Truth
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Your verified background, skills, and citations. CareerPilot AI strictly uses this evidence to prevent hallucinations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              type="button"
              onClick={handleSaveEdits}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          )}

          {!isConfirmed ? (
            <button
              type="button"
              onClick={handleConfirmProfile}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>CONFIRM PROFILE</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>CONFIRMED SOURCE OF TRUTH</span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation State Banner */}
      {!isConfirmed ? (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-bold text-amber-900 block">AI-extracted profile — review before using</strong>
              <p className="text-xs text-amber-800 mt-0.5">
                Carefully inspect extracted skills, dates, and evidence below. Click <strong>"CONFIRM PROFILE"</strong> to establish this as your verified candidate source of truth.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleConfirmProfile}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer shadow-xs"
          >
            Confirm Now
          </button>
        </div>
      ) : (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" />
            <span>
              Profile confirmed on <strong>{draftProfile.confirmedAt ? new Date(draftProfile.confirmedAt).toLocaleDateString() : 'Active'}</strong>. Protected against AI hallucination.
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {draftProfile.experienceCalculatedText || 'Calculated non-overlapping tenure'}
          </span>
        </div>
      )}

      {/* Resume Upload / Ingestion Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Upload Resume (PDF, DOCX, or Text)</h3>
          </div>
          <button
            type="button"
            onClick={() => setPasteMode(!pasteMode)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            {pasteMode ? 'Upload File Instead' : 'Paste Resume Text'}
          </button>
        </div>

        {pasteMode ? (
          <div className="space-y-3">
            <textarea
              rows={5}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste raw resume text, markdown, or plain text here..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handlePastedTextSubmit}
                disabled={isUploading || !pastedText.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold"
              >
                {isUploading ? 'Parsing...' : 'Process Resume Text'}
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-6 text-center transition-colors bg-slate-50/50">
            <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">
              Drag and drop your complete resume, or <label className="text-indigo-600 hover:underline cursor-pointer">browse file<input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" /></label>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports multi-page PDFs, tables, and multi-column layouts via Gemini multimodal understanding.
            </p>
            {draftProfile.resumeFileName && (
              <span className="inline-block mt-2 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                Active Source: {draftProfile.resumeFileName}
              </span>
            )}
          </div>
        )}

        {isUploading && (
          <div className="flex items-center justify-center gap-2 p-3 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Analyzing resume document and extracting evidence layers...</span>
          </div>
        )}

        {uploadError && (
          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
            {uploadError}
          </p>
        )}
      </div>

      {/* Structured Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal & Preferences */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 md:col-span-1">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Personal & Target Role
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={draftProfile.fullName}
                  onChange={(e) => setDraftProfile({ ...draftProfile, fullName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded"
                />
              ) : (
                <p className="font-bold text-slate-800 text-sm">{draftProfile.fullName}</p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Role</label>
              {isEditing ? (
                <input
                  type="text"
                  value={draftProfile.targetRole}
                  onChange={(e) => setDraftProfile({ ...draftProfile, targetRole: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded"
                />
              ) : (
                <p className="font-semibold text-indigo-700">{draftProfile.targetRole}</p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={draftProfile.email}
                  onChange={(e) => setDraftProfile({ ...draftProfile, email: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded"
                />
              ) : (
                <p className="text-slate-700">{draftProfile.email}</p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="text"
                  value={draftProfile.phone || ''}
                  onChange={(e) => setDraftProfile({ ...draftProfile, phone: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded"
                />
              ) : (
                <p className="text-slate-700">{draftProfile.phone || 'Not found in resume'}</p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={draftProfile.location}
                  onChange={(e) => setDraftProfile({ ...draftProfile, location: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded"
                />
              ) : (
                <p className="text-slate-700">{draftProfile.location}</p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Verified Experience</label>
              <p className="font-bold text-slate-800">
                {draftProfile.yearsOfExperience} Years ({draftProfile.experienceCalculatedText || 'Exact non-overlapping tenure'})
              </p>
            </div>
          </div>
        </div>

        {/* Professional Summary & Experience */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 md:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Professional Summary & Career History
          </h3>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Professional Summary</label>
            {isEditing ? (
              <textarea
                rows={3}
                value={draftProfile.summary}
                onChange={(e) => setDraftProfile({ ...draftProfile, summary: e.target.value })}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded"
              />
            ) : (
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {draftProfile.summary || 'No summary extracted from document.'}
              </p>
            )}
          </div>

          {/* Work History */}
          <div className="space-y-3 pt-2">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Employment History</span>
            {(draftProfile.workHistory || []).map((w, idx) => (
              <div key={idx} className="border border-slate-100 p-3 rounded-lg space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{w.role} · {w.company}</span>
                  <span className="text-[11px] font-medium text-slate-500">{w.duration}</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600 pt-1">
                  {w.highlights.map((h, hIdx) => (
                    <li key={hIdx}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4-Tier Skills Category Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">4-Tier Categorized Skills & Evidence</h3>
            <p className="text-xs text-slate-500">
              Categorized into technical, analytical, business, and soft skills with strict evidence attribution.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            {(['technical', 'analytical', 'business', 'soft'] as SkillCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveSkillCategory(cat)}
                className={`px-3 py-1 rounded-md capitalize font-semibold cursor-pointer transition-colors ${
                  activeSkillCategory === cat
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Skill Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {categorizedSkills.map((skill) => {
            const isVerified = skill.source === 'VERIFIED FROM RESUME';
            return (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800"
              >
                <span>{skill.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                    isVerified
                      ? 'bg-emerald-100 text-emerald-800'
                      : skill.source === 'USER PROVIDED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                  title={skill.source}
                >
                  {skill.source}
                </span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill.id, skill.name)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer ml-1"
                  >
                    ×
                  </button>
                )}
              </span>
            );
          })}
        </div>

        {/* Add Skill Form */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder={`Add ${activeSkillCategory} skill...`}
            className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg flex-1 text-slate-800"
          />
          <select
            value={newSkillSource}
            onChange={(e) => setNewSkillSource(e.target.value as VerificationSource)}
            className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="USER PROVIDED">USER PROVIDED</option>
            <option value="VERIFIED FROM RESUME">VERIFIED FROM RESUME</option>
            <option value="AI SUGGESTION">AI SUGGESTION</option>
          </select>
          <button
            type="button"
            onClick={handleAddSkill}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      {/* Evidence Inspector */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Extracted Evidence Citations</h3>
            <p className="text-xs text-slate-500">
              Verbatim proof sentences from your resume document backing every candidate qualification.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            {draftProfile.structuredProfile?.evidence_layer?.length || 0} Citations Tracked
          </span>
        </div>

        <div className="space-y-2.5 pt-2">
          {(draftProfile.structuredProfile?.evidence_layer || []).map((ev, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{ev.claim}</span>
                <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {ev.source_section}
                </span>
              </div>
              <p className="text-slate-600 italic text-[11px]">
                "{ev.evidence}"
              </p>
              <div className="flex items-center gap-2 pt-1 text-[10px] font-medium text-emerald-700">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Source: {ev.sourceType || 'VERIFIED FROM RESUME'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
