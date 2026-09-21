'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Play, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  Terminal, 
  ListFilter,
  RefreshCw,
  HelpCircle,
  Calendar,
  Layers
} from 'lucide-react';
import { AgentEvent, AgentRunSummary, Job, UserSettings } from '@/lib/types';
import { executeAgentCommand, runDailyAgentWorkflow } from '@/lib/agent-tools';

interface AgentViewProps {
  events: AgentEvent[];
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onRefresh: () => void;
  onSelectJob: (job: Job) => void;
}

export function AgentView({
  events,
  settings,
  onUpdateSettings,
  onRefresh,
  onSelectJob
}: AgentViewProps) {
  const [inputCommand, setInputCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'agent';
    text: string;
    toolsCalled?: string[];
    jobs?: Job[];
  }>>([
    {
      role: 'agent',
      text: "Hello! I am your CareerPilot AI Agent. I continuously analyze your connected job feeds against your confirmed source of truth. How can I assist your job search today?"
    }
  ]);

  const [scheduleTime, setScheduleTime] = useState(settings.dailyScheduleTime || '08:00');
  const [frequency, setFrequency] = useState(settings.dailySearchFrequency || 'daily');
  const [isRunningDaily, setIsRunningDaily] = useState(false);

  const samplePrompts = [
    "Find AI Ops jobs in Delhi NCR posted today",
    "Find remote jobs above ₹10 lakh",
    "Prepare applications for my strongest matches",
    "Why did you reject this job?"
  ];

  const handleSendCommand = async (textToSend?: string) => {
    const query = (textToSend || inputCommand).trim();
    if (!query || isProcessing) return;

    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    if (!textToSend) setInputCommand('');
    setIsProcessing(true);

    try {
      const result = await executeAgentCommand(query);
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          text: result.textResponse,
          toolsCalled: result.toolsCalled,
          jobs: result.matchedJobs
        }
      ]);
      onRefresh();
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          text: `Command error: ${err?.message || String(err)}`
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunDaily = async () => {
    setIsRunningDaily(true);
    try {
      await runDailyAgentWorkflow();
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunningDaily(false);
    }
  };

  const handleSaveSchedule = () => {
    onUpdateSettings({
      ...settings,
      dailyScheduleTime: scheduleTime,
      dailySearchFrequency: frequency as any
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Career Agent</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Tool-Equipped Autonomous Agent
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Give commands to your career agent. The agent uses discrete auditable tools and never hallucinates completed actions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Conversational Console (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col h-[520px] overflow-hidden">
            {/* Console Header */}
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>Agent Interactive Console</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                TOOLS READY
              </span>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-bl-xs'
                    }`}
                  >
                    <p>{m.text}</p>

                    {/* Tools Called Badges */}
                    {m.toolsCalled && m.toolsCalled.length > 0 && (
                      <div className="pt-2 mt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <Wrench className="w-3 h-3" /> Tools:
                        </span>
                        {m.toolsCalled.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700"
                          >
                            {t}()
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Matched Jobs Carousel Snippet */}
                  {m.jobs && m.jobs.length > 0 && (
                    <div className="mt-2 w-full max-w-[85%] space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Relevant Openings:</span>
                      <div className="space-y-1">
                        {m.jobs.slice(0, 3).map((j) => (
                          <div
                            key={j.id}
                            onClick={() => onSelectJob(j)}
                            className="p-2 bg-white hover:bg-indigo-50/60 border border-slate-200 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div>
                              <span className="font-bold text-slate-900 block">{j.title}</span>
                              <span className="text-[11px] text-slate-500">{j.company} · {j.location}</span>
                            </div>
                            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {j.match?.matchScore || 80}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-2 p-3 bg-indigo-50/60 text-indigo-700 rounded-xl text-xs font-semibold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Agent executing tools & evaluating verified constraints...</span>
                </div>
              )}
            </div>

            {/* Suggested Prompt Chips */}
            <div className="p-2.5 bg-white border-t border-slate-100 flex flex-wrap gap-1.5">
              {samplePrompts.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => handleSendCommand(prompt)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Give command (e.g. 'Prepare applications for my strongest matches')..."
                value={inputCommand}
                onChange={(e) => setInputCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendCommand();
                }}
                className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              />
              <button
                type="button"
                onClick={() => handleSendCommand()}
                disabled={isProcessing || !inputCommand.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Daily Agent Scheduler & Live Activity Timeline (1 col) */}
        <div className="space-y-6">
          {/* Scheduler Config Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Daily Agent Schedule</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-500">
              The agent runs automatically every day to discover fresh postings, deduplicate, and prepare applications.
            </p>

            <div className="space-y-3 text-xs pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Execution Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="daily">Daily (Default 8:00 AM)</option>
                  <option value="twice_daily">Twice Daily (8:00 AM & 5:00 PM)</option>
                  <option value="manual">Manual Trigger Only</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveSchedule}
                  className="flex-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Save Schedule
                </button>
                <button
                  type="button"
                  onClick={handleRunDaily}
                  disabled={isRunningDaily}
                  className="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isRunningDaily ? 'Running...' : 'Run Now'}
                </button>
              </div>
            </div>
          </div>

          {/* Activity Log Timeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Agent Activity Log</h3>
              </div>
              <span className="text-[10px] text-slate-400">Step-by-step</span>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 text-xs">
              {events.slice(0, 15).map((evt) => (
                <div key={evt.id} className="border-l-2 border-indigo-400 pl-3 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-slate-700">{evt.timeFormatted}</span>
                    <span className="uppercase text-[9px] font-mono font-bold text-indigo-600">{evt.type}</span>
                  </div>
                  <strong className="text-slate-800 text-xs block">{evt.title}</strong>
                  <p className="text-slate-600 text-[11px] leading-snug">{evt.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
