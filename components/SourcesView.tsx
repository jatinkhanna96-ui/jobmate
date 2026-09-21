'use client';

import React, { useState } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Key, 
  ExternalLink, 
  Settings2, 
  ShieldAlert,
  HelpCircle,
  Database,
  Layers
} from 'lucide-react';
import { JobSource, SourceStatus } from '@/lib/types';

interface SourcesViewProps {
  sources: JobSource[];
  onUpdateSource: (source: JobSource) => void;
}

export function SourcesView({ sources, onUpdateSource }: SourcesViewProps) {
  const [configSource, setConfigSource] = useState<JobSource | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleOpenConfig = (src: JobSource) => {
    setConfigSource(src);
    setInputUrl(src.feedUrl || '');
    setApiKeyInput('');
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configSource) return;

    const isConnected = Boolean(inputUrl.trim() || apiKeyInput.trim());
    const updated: JobSource = {
      ...configSource,
      status: isConnected ? 'connected' : configSource.status,
      feedUrl: inputUrl.trim() || undefined,
      apiKeyConfigured: Boolean(apiKeyInput.trim()),
      connectedAt: isConnected ? new Date().toISOString() : configSource.connectedAt,
      lastSyncAt: isConnected ? new Date().toISOString() : configSource.lastSyncAt
    };

    onUpdateSource(updated);
    setConfigSource(null);
  };

  const getStatusBadge = (status: SourceStatus) => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Connected
          </span>
        );
      case 'connection_required':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Connection Required
          </span>
        );
      case 'auth_required':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <Lock className="w-3.5 h-3.5 text-rose-600" />
            Authentication Required
          </span>
        );
      case 'permission_required':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            Permission Required
          </span>
        );
      case 'unsupported':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Unsupported
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Job Sources & Connectors</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Honest Integration Architecture
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          CareerPilot AI strictly connects to authorized APIs, public feeds, or compliant user sessions. We never pretend a platform is automated if unauthorized.
        </p>
      </div>

      {/* Compliance Architecture Notice */}
      <div className="p-4 bg-slate-900 text-white rounded-xl shadow-xs space-y-2 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Strict Platform Compliance & Terms Policy</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Where external platforms (such as LinkedIn, Indeed, or Naukri) restrict unauthorized automated scrapers or require multi-factor human authentication, CareerPilot AI does not bypass access controls. The architecture supports official partner feeds, user-supplied API keys, or manual link ingestion.
        </p>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sources.map((src) => {
          const isConnected = src.status === 'connected';

          return (
            <div
              key={src.id}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                isConnected ? 'border-emerald-200 hover:border-emerald-300' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{src.name}</h3>
                    <span className="text-[11px] font-semibold text-slate-400">{src.category}</span>
                  </div>
                  {getStatusBadge(src.status)}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {src.statusDetails}
                </p>

                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-slate-500 space-y-1">
                  <strong className="text-slate-700 block font-semibold">Compliance Note:</strong>
                  <p>{src.complianceNotice}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">
                  {src.lastSyncAt ? `Last checked: ${new Date(src.lastSyncAt).toLocaleDateString()}` : 'Unconnected'}
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenConfig(src)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Source Config Modal */}
      {configSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Configure {configSource.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Set public feed URL, company board identifier, or compliant API key.
              </p>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Public Feed / Board URL</label>
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="e.g. https://boards-api.greenhouse.io/v1/boards/company/jobs"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">API Token / Publisher Key (Optional)</label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Enter partner credential if authorized..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Keys are stored safely in your browser session. Never sent to untrusted third parties.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConfigSource(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Connector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
