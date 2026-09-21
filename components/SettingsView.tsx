'use client';

import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Sliders, 
  ShieldCheck, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Bell, 
  Briefcase, 
  Building2, 
  DollarSign, 
  MapPin,
  Lock
} from 'lucide-react';
import { UserSettings, CareerPreferences } from '@/lib/types';
import { exportAllData, importAllData, resetToDefaults } from '@/lib/storage';

interface SettingsViewProps {
  settings: UserSettings;
  preferences: CareerPreferences;
  onSaveSettings: (settings: UserSettings) => void;
  onSavePreferences: (prefs: CareerPreferences) => void;
  onResetData: () => void;
}

export function SettingsView({
  settings,
  preferences,
  onSaveSettings,
  onSavePreferences,
  onResetData
}: SettingsViewProps) {
  const [draftSettings, setDraftSettings] = useState<UserSettings>(settings);
  const [draftPrefs, setDraftPrefs] = useState<CareerPreferences>(preferences);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [exportJson, setExportJson] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(draftSettings);
    onSavePreferences(draftPrefs);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CareerPilot_Data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importAllData(content)) {
        onResetData(); // reload memory and trigger rerender
      } else {
        alert('Invalid CareerPilot JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Settings & Rules</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure matching thresholds, career search criteria, automation safety rules, and local backups
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Match Thresholds Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Deterministic Match Thresholds</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Apply Queue Minimum Score (Default: 80%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="70"
                  max="95"
                  value={draftSettings.matchThresholds.applyQueueMin}
                  onChange={(e) =>
                    setDraftSettings({
                      ...draftSettings,
                      matchThresholds: {
                        ...draftSettings.matchThresholds,
                        applyQueueMin: parseInt(e.target.value, 10)
                      }
                    })
                  }
                  className="w-full accent-indigo-600"
                />
                <span className="font-bold text-indigo-700 w-12 text-right">
                  {draftSettings.matchThresholds.applyQueueMin}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Postings meeting or exceeding this threshold are marked as <strong>APPLY</strong>.
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Review Queue Minimum Score (Default: 65%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="50"
                  max="79"
                  value={draftSettings.matchThresholds.reviewQueueMin}
                  onChange={(e) =>
                    setDraftSettings({
                      ...draftSettings,
                      matchThresholds: {
                        ...draftSettings.matchThresholds,
                        reviewQueueMin: parseInt(e.target.value, 10)
                      }
                    })
                  }
                  className="w-full accent-indigo-600"
                />
                <span className="font-bold text-amber-700 w-12 text-right">
                  {draftSettings.matchThresholds.reviewQueueMin}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Scores below this threshold are automatically marked as <strong>SKIP</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Automation Safety Rules */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Automation Safety & Human Approval</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg">
              <div>
                <strong className="text-slate-900 block font-bold">Require Explicit User Approval Before Submission</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Mandatory during MVP. Applications can never be sent to employers without your explicit review and confirmation.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-bold text-indigo-800 text-xs uppercase">Always ON</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <strong className="text-slate-900 block">Auto-Prepare Materials for Strong Matches</strong>
                <p className="text-slate-500 text-[11px]">
                  When a job achieves an AI Match Estimate ≥ {draftSettings.matchThresholds.applyQueueMin}%, generate tailored cover letter and resume bullets immediately.
                </p>
              </div>
              <input
                type="checkbox"
                checked={draftSettings.autoPrepareApplications}
                onChange={(e) =>
                  setDraftSettings({ ...draftSettings, autoPrepareApplications: e.target.checked })
                }
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Max Applications Prepared Per Day</label>
              <input
                type="number"
                min="1"
                max="25"
                value={draftSettings.maxApplicationsPreparedPerDay}
                onChange={(e) =>
                  setDraftSettings({ ...draftSettings, maxApplicationsPreparedPerDay: parseInt(e.target.value, 10) })
                }
                className="w-32 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Career Preferences Configuration */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Career Preferences & Search Targets</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Job Roles (Comma separated)</label>
              <input
                type="text"
                value={draftPrefs.targetRoles.join(', ')}
                onChange={(e) =>
                  setDraftPrefs({
                    ...draftPrefs,
                    targetRoles: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Preferred Locations</label>
              <input
                type="text"
                value={draftPrefs.preferredLocations.join(', ')}
                onChange={(e) =>
                  setDraftPrefs({
                    ...draftPrefs,
                    preferredLocations: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Remote Preference</label>
              <select
                value={draftPrefs.remotePreference}
                onChange={(e) => setDraftPrefs({ ...draftPrefs, remotePreference: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="remote">Remote Only (Strict)</option>
                <option value="hybrid">Open to Hybrid & Remote</option>
                <option value="onsite">On-site Acceptable</option>
                <option value="any">Any Workplace Type</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Minimum Annual Salary ({draftPrefs.salaryCurrency})</label>
              <input
                type="number"
                step="5000"
                value={draftPrefs.minimumSalary}
                onChange={(e) =>
                  setDraftPrefs({ ...draftPrefs, minimumSalary: parseInt(e.target.value, 10) })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Companies to Target</label>
              <input
                type="text"
                value={draftPrefs.companiesToTarget.join(', ')}
                onChange={(e) =>
                  setDraftPrefs({
                    ...draftPrefs,
                    companiesToTarget: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Companies to Exclude</label>
              <input
                type="text"
                value={draftPrefs.companiesToExclude.join(', ')}
                onChange={(e) =>
                  setDraftPrefs({
                    ...draftPrefs,
                    companiesToExclude: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs sm:text-sm font-bold transition-colors shadow-xs cursor-pointer"
          >
            Save All Configurations
          </button>
        </div>
      </form>

      {/* Data Management Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">Data Persistence & Backups</h3>
          <p className="text-xs text-slate-500">
            Export all verified candidate profiles, preferences, applications, and logs or reset to defaults.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export All Data (JSON)</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Data Backup</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to reset all data to default verified states?')) {
                resetToDefaults();
                onResetData();
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold cursor-pointer ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>Reset to Verified Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
}
