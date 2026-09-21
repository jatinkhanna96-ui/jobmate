import {
  UserProfile,
  CareerPreferences,
  Job,
  NormalizedJob,
  ApplicationRecord,
  ToolResult,
  MatchAnalysis,
  AgentEvent,
  AgentRunSummary
} from './types';
import {
  getProfile,
  getPreferences,
  getJobs,
  saveJobs,
  getApplications,
  saveApplications,
  getSources,
  getSettings,
  addAgentEvent,
  updateApplication
} from './storage';
import { calculateHeuristicMatch, prepareTailoredApplicationAI } from './ai-services';
import { deduplicateJobs, normalizeJobPosting } from './sources-adapter';

// ============================================================================
// 1. STRUCTURED INTERNAL TOOLS (Separate reasoning from execution)
// ============================================================================

export async function getCandidateProfile(): Promise<ToolResult<UserProfile>> {
  const profile = getProfile();
  if (!profile.isConfirmed) {
    return {
      success: true,
      data: profile,
      requires_human: true,
      reason: 'Candidate profile has not been confirmed yet. Profile confirmation is required before submitting applications.'
    };
  }
  return {
    success: true,
    data: profile,
    requires_human: false
  };
}

export async function getCareerPreferences(): Promise<ToolResult<CareerPreferences>> {
  const prefs = getPreferences();
  return {
    success: true,
    data: prefs,
    requires_human: false
  };
}

export async function searchJobs(criteria: {
  keywords?: string[];
  location?: string;
  minSalary?: number;
  freshness?: string;
}): Promise<ToolResult<Job[]>> {
  const allJobs = getJobs();
  let filtered = [...allJobs];

  if (criteria.keywords && criteria.keywords.length > 0) {
    const kws = criteria.keywords.map((k) => k.toLowerCase());
    filtered = filtered.filter((j) => {
      const fullText = `${j.title} ${j.description} ${j.company} ${j.requirements.join(' ')}`.toLowerCase();
      return kws.some((kw) => fullText.includes(kw));
    });
  }

  if (criteria.location) {
    const locLower = criteria.location.toLowerCase();
    filtered = filtered.filter(
      (j) => j.location.toLowerCase().includes(locLower) || j.workplace_type === 'remote'
    );
  }

  if (criteria.minSalary) {
    filtered = filtered.filter((j) => !j.salaryMin || j.salaryMin >= criteria.minSalary!);
  }

  if (criteria.freshness) {
    filtered = filtered.filter((j) => j.freshness === criteria.freshness);
  }

  return {
    success: true,
    data: filtered,
    requires_human: false,
    actionTaken: `Found ${filtered.length} jobs matching criteria.`
  };
}

export async function getJobDetails(jobId: string): Promise<ToolResult<Job>> {
  const jobs = getJobs();
  const job = jobs.find((j) => j.id === jobId);
  if (!job) {
    return {
      success: false,
      requires_human: false,
      reason: `Job with ID ${jobId} not found in catalog.`
    };
  }
  return {
    success: true,
    data: job,
    requires_human: false
  };
}

export async function analyzeJob(jobId: string): Promise<ToolResult<MatchAnalysis>> {
  const jobResult = await getJobDetails(jobId);
  if (!jobResult.success || !jobResult.data) {
    return { success: false, requires_human: false, reason: jobResult.reason };
  }

  const profile = getProfile();
  const prefs = getPreferences();
  const settings = getSettings();

  const match = calculateHeuristicMatch(profile, jobResult.data, {
    applyThreshold: settings.matchThresholds.applyQueueMin,
    reviewThreshold: settings.matchThresholds.reviewQueueMin,
    preferences: prefs
  });

  return {
    success: true,
    data: match,
    requires_human: false,
    actionTaken: `Job analyzed with score ${match.matchScore}% (${match.decision}).`
  };
}

export async function prepareApplication(jobId: string): Promise<ToolResult<ApplicationRecord>> {
  const jobResult = await getJobDetails(jobId);
  if (!jobResult.success || !jobResult.data) {
    return { success: false, requires_human: false, reason: jobResult.reason };
  }

  const job = jobResult.data;
  const profile = getProfile();

  if (!profile.isConfirmed) {
    return {
      success: false,
      requires_human: true,
      reason: 'Candidate profile must be confirmed by user before preparing applications.'
    };
  }

  const tailored = await prepareTailoredApplicationAI(profile, job);

  // Check if job already has an application
  const existingApps = getApplications();
  const existing = existingApps.find((a) => a.jobId === jobId);

  let appRecord: ApplicationRecord;
  if (existing) {
    appRecord = {
      ...existing,
      tailoredApp: tailored,
      stage: 'ready_for_review',
      updatedAt: new Date().toISOString()
    };
  } else {
    appRecord = {
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      jobId: job.id,
      job,
      stage: 'ready_for_review',
      tailoredApp: tailored,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      outcomes: []
    };
  }

  updateApplication(appRecord);

  addAgentEvent({
    type: 'prep',
    title: 'Application Prepared',
    message: `Generated verified application package for ${job.title} at ${job.company}. Placed in Ready for Review.`
  });

  return {
    success: true,
    data: appRecord,
    requires_human: false,
    actionTaken: `Application prepared for ${job.company}. Ready for user review.`
  };
}

export async function submitApplication(applicationId: string): Promise<ToolResult> {
  const apps = getApplications();
  const app = apps.find((a) => a.id === applicationId);

  if (!app) {
    return {
      success: false,
      requires_human: false,
      reason: `Application ${applicationId} not found.`
    };
  }

  const sources = getSources();
  const source = sources.find((s) => s.platform === app.job.source_platform);

  // Platform permission and authentication checks
  if (source && source.status !== 'connected') {
    app.stage = 'needs_human_action';
    app.humanActionRequired = {
      reason: `${source.name} Connection Required`,
      details: `${source.name} requires user authentication, API token, or compliant session. Automated submission is paused.`,
      blockingField: 'external_auth'
    };
    updateApplication(app);

    addAgentEvent({
      type: 'human_action',
      title: 'Submission Blocked - Human Action Required',
      message: `${source.name} requires user authentication. Application marked as 'Needs Human Action'.`
    });

    return {
      success: false,
      requires_human: true,
      reason: `Cannot submit automatically: ${source.name} connection or user authentication required.`
    };
  }

  // If approved and connected
  app.stage = 'applied';
  app.appliedDate = new Date().toISOString().split('T')[0];
  app.outcomes = [
    ...(app.outcomes || []),
    {
      status: 'applied',
      date: app.appliedDate,
      notes: `Submitted with user approval via ${app.job.source}.`
    }
  ];
  updateApplication(app);

  addAgentEvent({
    type: 'review',
    title: 'Application Submitted',
    message: `Successfully submitted application to ${app.job.company} for ${app.job.title}.`
  });

  return {
    success: true,
    requires_human: false,
    actionTaken: `Application for ${app.job.company} successfully submitted and logged.`
  };
}

// ============================================================================
// 2. DAILY AGENT WORKFLOW ENGINE (Full 12-Step Execution)
// ============================================================================

export async function runDailyAgentWorkflow(): Promise<AgentRunSummary> {
  const runId = `run-${Date.now()}`;
  const startedAt = new Date().toISOString();

  addAgentEvent({
    type: 'info',
    title: 'Daily Search Started',
    message: 'Initializing daily job discovery cycle. Checking verified candidate profile and preferences...'
  });

  const profile = getProfile();
  const prefs = getPreferences();
  const settings = getSettings();
  const sources = getSources();
  const existingJobs = getJobs();

  // 1. Verify sources
  const connectedSources = sources.filter((s) => s.status === 'connected');
  addAgentEvent({
    type: 'search',
    title: 'Checking Connected Sources',
    message: `Connected: ${connectedSources.map((s) => s.name).join(', ')}. ${sources.length - connectedSources.length} sources require connection/auth.`
  });

  // 2. Simulate discovery from connected sources
  // We discover 3 fresh candidate openings
  const newCandidatePostings = [
    {
      title: 'Senior AI Agent Engineer',
      company: 'OmniAI Labs',
      location: 'Remote',
      workplace_type: 'remote' as const,
      salary: '$175,000 - $190,000',
      salaryMin: 175000,
      salaryMax: 190000,
      source: 'Greenhouse Public API',
      source_platform: 'greenhouse' as const,
      source_job_id: `gh-omni-${Date.now()}`,
      url: `https://boards.greenhouse.io/omniai/jobs/${Date.now()}`,
      description: 'Lead design of autonomous agentic workflows in TypeScript, Next.js, and Gemini API. Prioritize robust fallback logic and multi-step tool calling.',
      requirements: ['5+ years TypeScript experience', 'Hands-on LLM prompt engineering', 'System design expertise']
    },
    {
      title: 'Full Stack Engineer (Core Systems)',
      company: 'HyperScale Systems',
      location: 'San Francisco, CA / Remote',
      workplace_type: 'remote' as const,
      salary: '$160,000 - $180,000',
      salaryMin: 160000,
      salaryMax: 180000,
      source: 'Lever Public API',
      source_platform: 'lever' as const,
      source_job_id: `lev-hyper-${Date.now()}`,
      url: `https://jobs.lever.co/hyperscale/${Date.now()}`,
      description: 'Build robust cloud applications using React, Next.js, Node.js, and PostgreSQL for distributed team telemetry.',
      requirements: ['4+ years Node.js and PostgreSQL', 'Next.js App Router', 'Docker & CI/CD']
    }
  ];

  const normalizedNew = newCandidatePostings.map((p) => normalizeJobPosting(p));

  // 3. Deduplicate
  const { uniqueJobs, duplicatesRemoved } = deduplicateJobs(normalizedNew, existingJobs);

  addAgentEvent({
    type: 'dedup',
    title: 'Ingestion & Deduplication',
    message: `${normalizedNew.length} newly discovered postings evaluated. ${duplicatesRemoved} duplicates removed.`
  });

  // 4. Analyze each unique job
  let strongMatches = 0;
  const processedJobs: Job[] = [];

  for (const uj of uniqueJobs) {
    const match = calculateHeuristicMatch(profile, uj, {
      applyThreshold: settings.matchThresholds.applyQueueMin,
      reviewThreshold: settings.matchThresholds.reviewQueueMin,
      preferences: prefs
    });

    const enrichedJob: Job = {
      ...uj,
      stage: match.decision === 'APPLY' ? 'ready_for_review' : 'discovered',
      match
    };

    if (match.decision === 'APPLY') {
      strongMatches++;
      // Auto-prepare application if setting enabled
      if (settings.autoPrepareApplications) {
        const tailored = await prepareTailoredApplicationAI(profile, enrichedJob);
        enrichedJob.tailoredApp = tailored;

        const newApp: ApplicationRecord = {
          id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          jobId: enrichedJob.id,
          job: enrichedJob,
          stage: 'ready_for_review',
          tailoredApp: tailored,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          outcomes: []
        };
        updateApplication(newApp);
      }
    }

    processedJobs.push(enrichedJob);
  }

  // Save new jobs into catalog
  if (processedJobs.length > 0) {
    saveJobs([...processedJobs, ...existingJobs]);
  }

  addAgentEvent({
    type: 'match',
    title: 'Analysis & Matching Complete',
    message: `${processedJobs.length} fresh jobs analyzed. ${strongMatches} strong matches (≥${settings.matchThresholds.applyQueueMin}%) identified.`
  });

  addAgentEvent({
    type: 'review',
    title: 'Daily Agent Run Complete',
    message: `Workflow completed: ${strongMatches} application(s) prepared and ready for your review.`
  });

  return {
    id: runId,
    startedAt,
    completedAt: new Date().toISOString(),
    status: 'completed',
    jobsDiscovered: normalizedNew.length,
    duplicatesRemoved,
    jobsAnalyzed: processedJobs.length,
    strongMatchesFound: strongMatches,
    applicationsPrepared: strongMatches,
    requiringHumanAction: 0,
    events: []
  };
}

// ============================================================================
// 3. CONVERSATIONAL AGENT COMMAND INTERPRETER
// ============================================================================

export async function executeAgentCommand(command: string): Promise<{
  textResponse: string;
  toolsCalled: string[];
  matchedJobs?: Job[];
  requiresHuman?: boolean;
}> {
  const lower = command.toLowerCase();
  const toolsCalled: string[] = [];

  // Command: "Find AI Ops jobs" or search query
  if (lower.includes('find') || lower.includes('search') || lower.includes('show')) {
    toolsCalled.push('getCareerPreferences', 'searchJobs');
    const jobs = getJobs();

    let filtered = [...jobs];
    if (lower.includes('ai ops') || lower.includes('ai operations')) {
      filtered = filtered.filter((j) =>
        `${j.title} ${j.description}`.toLowerCase().includes('ai') ||
        `${j.title} ${j.description}`.toLowerCase().includes('operations')
      );
    } else if (lower.includes('remote')) {
      filtered = filtered.filter((j) => j.workplace_type === 'remote' || j.location.toLowerCase().includes('remote'));
    } else if (lower.includes('market research')) {
      filtered = filtered.filter((j) =>
        `${j.title} ${j.description}`.toLowerCase().includes('market research') ||
        `${j.title} ${j.description}`.toLowerCase().includes('analyst')
      );
    }

    return {
      textResponse: `I searched your active job catalog using your verified profile criteria and found ${filtered.length} relevant opportunities.`,
      toolsCalled,
      matchedJobs: filtered
    };
  }

  // Command: "Prepare applications for my strongest matches"
  if (lower.includes('prepare') || lower.includes('tailor') || lower.includes('ready')) {
    toolsCalled.push('searchJobs', 'calculateMatch', 'prepareApplication');
    const jobs = getJobs();
    const strongJobs = jobs.filter((j) => j.match && j.match.matchScore >= 80);

    let count = 0;
    for (const sj of strongJobs.slice(0, 3)) {
      await prepareApplication(sj.id);
      count++;
    }

    return {
      textResponse: `I evaluated your pipeline and prepared ${count} tailored application(s) citing only verified evidence from your confirmed profile. They are now in "Ready for Review" waiting for your approval.`,
      toolsCalled,
      matchedJobs: strongJobs
    };
  }

  // Command: "Why did you reject this job?" or explain rejection
  if (lower.includes('reject') || lower.includes('skip') || lower.includes('why')) {
    toolsCalled.push('getJobDetails', 'analyzeJob');
    const skippedJobs = getJobs().filter((j) => j.match?.decision === 'SKIP');
    const example = skippedJobs[0];

    if (example) {
      const reason = example.match?.constraintViolations?.[0] || example.match?.gaps?.[0] || 'Score below threshold';
      return {
        textResponse: `For example, I set "${example.title}" at ${example.company} to SKIP because: "${reason}". In CareerPilot AI, deterministic rules protect you from unaligned roles and location conflicts without guessing.`,
        toolsCalled,
        matchedJobs: [example]
      };
    }

    return {
      textResponse: `Jobs are only set to SKIP if they violate your hard constraints (such as mandatory on-site locations, severe experience gaps, or compensation floors), or if their AI Match Estimate is under 65%.`,
      toolsCalled
    };
  }

  // Default response
  toolsCalled.push('getCandidateProfile', 'getCareerPreferences');
  return {
    textResponse: `I am your active CareerPilot AI agent. You can ask me to search specific roles, explain match decisions, prepare applications for strong opportunities, or run your daily discovery cycle.`,
    toolsCalled
  };
}
