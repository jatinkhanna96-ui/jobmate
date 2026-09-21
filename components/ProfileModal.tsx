'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Check, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface ProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (updated: UserProfile) => void;
}

export function ProfileModal({ profile, isOpen, onClose, onSaveProfile }: ProfileModalProps) {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [newSkill, setNewSkill] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (!formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setErrorMessage(null);
    setUploadSuccess(null);

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        throw new Error('Failed to parse resume document');
      }

      const parsed = await res.json();

      setFormData(prev => ({
        ...prev,
        fullName: parsed.fullName || prev.fullName,
        email: parsed.email || prev.email,
        phone: parsed.phone || prev.phone,
        targetRole: parsed.targetRole || prev.targetRole,
        yearsOfExperience: parsed.yearsOfExperience || prev.yearsOfExperience,
        skills: parsed.skills && parsed.skills.length > 0 ? Array.from(new Set([...prev.skills, ...parsed.skills])) : prev.skills,
        summary: parsed.summary || prev.summary,
        resumeRawText: parsed.resumeRawText || prev.resumeRawText,
        resumeFileName: parsed.resumeFileName || file.name,
        workHistory: parsed.workHistory && parsed.workHistory.length > 0 ? parsed.workHistory : prev.workHistory,
        education: parsed.education || prev.education,
      }));

      setUploadSuccess(`Successfully extracted profile from ${file.name}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error processing file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Candidate Profile & Resume</h2>
            <p className="text-xs text-slate-500">ApplyPilot uses this baseline to match jobs and tailor application materials.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Resume Upload Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-xl p-5 text-center bg-indigo-50/30 transition-all cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.txt,.doc,.md"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-2 text-indigo-600">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-sm font-semibold">Extracting details with AI & Mammoth...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-1">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  Upload or drop your Resume (.docx or .txt)
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Supports Word documents & raw resumes. Current: {formData.resumeFileName || 'Default Profile'}
                </p>
              </div>
            )}
          </div>

          {uploadSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
              {errorMessage}
            </div>
          )}

          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Title</label>
              <input
                type="text"
                value={formData.targetRole}
                onChange={e => setFormData({ ...formData, targetRole: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Senior Full Stack Engineer"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience</label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.yearsOfExperience}
                onChange={e => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location & Remote Preference</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Education</label>
              <input
                type="text"
                value={formData.education || ''}
                onChange={e => setFormData({ ...formData, education: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. B.S. in Computer Science"
              />
            </div>
          </div>

          {/* Professional Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Summary</label>
            <textarea
              rows={3}
              value={formData.summary}
              onChange={e => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Highlight your background, core strengths, and goals..."
            />
          </div>

          {/* Skills Management */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Core Skills & Competencies</label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-600 focus:outline-none"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add skill (e.g., Python, PostgreSQL, Gemini API)"
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Work History Excerpt */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work History Highlights</label>
            <div className="space-y-2">
              {formData.workHistory.map((work, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div className="font-semibold text-slate-800">{work.role} • {work.company}</div>
                  <div className="text-slate-500 text-[11px] mb-1">{work.duration}</div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    {work.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="truncate">{h}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
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
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm"
          >
            Save Candidate Profile
          </button>
        </div>
      </div>
    </div>
  );
}
