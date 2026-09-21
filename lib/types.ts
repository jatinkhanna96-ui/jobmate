export type NavigationTab = 
  | 'dashboard' 
  | 'jobs' 
  | 'applications' 
  | 'profile' 
  | 'agent' 
  | 'sources' 
  | 'settings';

export type VerificationSource = 
  | 'VERIFIED FROM RESUME' 
  | 'USER PROVIDED' 
  | 'AI SUGGESTION';

export type SkillCategory = 
  | 'technical' 
  | 'analytical' 
  | 'business' 
  | 'soft';

export interface ExtractedEvidence {
  id?: string;
  claim: string;
  evidence: string;
  source_section: string;
  confidence: 'high' | 'needs_review';
  sourceType?: VerificationSource;
}

export interface CandidateEvidence {
  id: string;
  fact: string;
  source: 'Resume' | 'User Input' | 'AI Inference';
  evidenceQuote: string;
  confidence: 'High' | 'Needs Review';
  verificationSource: VerificationSource;
}

export interface DocumentQualityAssessment {
  documentType: 'text_pdf' | 'scanned_pdf' | 'image_heavy' | 'text_document' | 'docx' | 'unknown';
  isMultiColumn: boolean;
  qualityWarning?: string | null;
  overallConfidence: 'high' | 'needs_review';
}

export interface ExperienceItem {
  id: string;
  company: string;
  title: string;
  start_date: string;
  end_date: string;
  responsibilities: string[];
  achievements: string[];
  skills_used: string[];
  confidence?: 'high' | 'needs_review';
  source?: VerificationSource;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  confidence?: 'high' | 'needs_review';
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer?: string;
  date?: string;
  confidence?: 'high' | 'needs_review';
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  confidence?: 'high' | 'needs_review';
}

export interface SkillItem {
  id: string;
  name: string;
  category?: SkillCategory;
  confidence?: 'high' | 'needs_review';
  source?: VerificationSource;
  evidenceId?: string;
}

export interface ToolItem {
  id: string;
  name: string;
  confidence?: 'high' | 'needs_review';
  source?: VerificationSource;
  evidenceId?: string;
}

export interface StructuredCandidateProfile {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
  };
  professional_summary: string;
  current_role: {
    title: string;
    company: string;
    start_date: string;
    end_date: string;
  };
  total_experience_years: number | null;
  experience_formatted: string;
  experience: ExperienceItem[];
  skills: SkillItem[];
  tools: ToolItem[];
  industries: string[];
  education: EducationItem[];
  certifications: CertificationItem[];
  projects: ProjectItem[];
  languages: string[];
  explicit_preferences: {
    target_roles?: string[];
    preferred_locations?: string[];
    location?: string;
    remote_preference?: 'remote' | 'hybrid' | 'onsite' | 'any' | string;
    salary?: string;
    notice_period?: string;
  };
  evidence_layer?: ExtractedEvidence[];
  quality_assessment?: DocumentQualityAssessment;
  isConfirmed?: boolean;
  confirmedAt?: string;
  verificationStatus?: 'verified' | 'user_provided' | 'unconfirmed';
}

// UserProfile
export interface UserProfile {
  fullName: string;
  email: string;
  phone?: string;
  location: string;
  targetRole: string;
  yearsOfExperience: number;
  skills: string[];
  summary: string;
  resumeRawText?: string;
  resumeFileName?: string;
  workHistory: {
    company: string;
    role: string;
    duration: string;
    highlights: string[];
  }[];
  education?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  structuredProfile?: StructuredCandidateProfile;
  experienceCalculatedText?: string;
  verificationStatus?: 'verified' | 'user_provided' | 'unconfirmed';
  documentQuality?: DocumentQualityAssessment;
  isConfirmed?: boolean;
  confirmedAt?: string;
}

export interface CareerRoleGroup {
  id: string;
  name: string;
  roles: string[];
}

export interface CareerPreferences {
  targetRoles: string[];
  targetRoleGroups: CareerRoleGroup[];
  targetIndustries: string[];
  preferredLocations: string[];
  remotePreference: 'remote' | 'hybrid' | 'onsite' | 'any';
  minimumSalary: number; // e.g. in INR Lakhs or USD
  salaryCurrency: string;
  maxCommuteMinutes?: number;
  experienceRange: {
    minYears: number;
    maxYears: number;
  };
  employmentTypes: ('Full-time' | 'Contract' | 'Part-time' | 'Internship')[];
  companiesToTarget: string[];
  companiesToExclude: string[];
  keywordsToPrioritize: string[];
  keywordsToAvoid: string[];
}

export type JobSourcePlatform = 
  | 'naukri' 
  | 'indeed' 
  | 'linkedin' 
  | 'foundit' 
  | 'greenhouse' 
  | 'lever' 
  | 'workday' 
  | 'ashby' 
  | 'company_careers' 
  | 'custom_feed';

export type SourceStatus = 
  | 'connected' 
  | 'connection_required' 
  | 'unsupported' 
  | 'permission_required' 
  | 'auth_required';

export interface JobSource {
  id: string;
  platform: JobSourcePlatform;
  name: string;
  category: 'Job Board' | 'ATS Platform' | 'Company Careers' | 'Permitted Feed';
  status: SourceStatus;
  statusDetails: string;
  officialApiSupported: boolean;
  complianceNotice: string;
  connectedAt?: string;
  lastSyncAt?: string;
  feedUrl?: string;
  apiKeyConfigured?: boolean;
}

export type FreshnessCategory = '<24 hours' | '<3 days' | '<7 days' | 'older';

export type MatchDecision = 'APPLY' | 'REVIEW' | 'SKIP';

export interface MatchAnalysis {
  matchScore: number; // 0 to 100 ("AI Match Estimate")
  fitLevel: 'Strong Match' | 'Good Match' | 'Moderate Match' | 'Low Match';
  decision?: MatchDecision;
  reasons?: string[];
  gaps?: string[];
  strengths: string[];
  missingKeywords: string[];
  skillGaps: string[];
  breakdown?: {
    skillsMatch: number;
    experienceMatch: number;
    locationMatch?: number;
    salaryMatch?: number;
    roleMatch?: number;
    industryMatch?: number;
    seniorityMatch?: number;
    [key: string]: any;
  };
  constraintViolations?: string[];
  recommendation: string;
  analyzedAt: string;
}

export interface NormalizedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  employment_type?: 'Full-time' | 'Remote' | 'Hybrid' | 'Contract' | 'Part-time';
  workplace_type?: 'remote' | 'hybrid' | 'onsite';
  source: string;
  source_platform?: JobSourcePlatform;
  source_job_id?: string;
  url?: string;
  description: string;
  posted_at?: string; // ISO string
  discovered_at?: string; // ISO string
  freshness?: FreshnessCategory;
  requirements: string[];
  responsibilities?: string[];
  match?: MatchAnalysis;
  isDuplicate?: boolean;
  canonicalUrl?: string;
}

// 13 Distinct Pipeline Stages (with aliases for backward compatibility)
export type PipelineStage = 
  | 'discovered' 
  | 'saved' 
  | 'reviewing'
  | 'analyzing' 
  | 'preparing' 
  | 'ready_for_review' 
  | 'approved' 
  | 'submitting' 
  | 'applied' 
  | 'interview' 
  | 'interviewing'
  | 'rejected' 
  | 'offer' 
  | 'failed' 
  | 'needs_human_action';

export interface ScreeningAnswer {
  question: string;
  answer: string;
  evidenceQuote?: string;
  isVerified: boolean;
  requiresUserInput?: boolean;
}

export interface TailoredApplication {
  coverLetter: string;
  tailoredSummary: string;
  suggestedBulletPoints: string[];
  outreachEmail: string;
  keyTalkingPoints: string[];
  screeningAnswers?: ScreeningAnswer[];
  status: 'pending_approval' | 'approved' | 'rejected' | 'modified';
  userNotes?: string;
  updatedAt: string;
  missingEvidenceFlags?: string[];
}

export interface ApplicationOutcome {
  status: 'applied' | 'recruiter_response' | 'interview' | 'rejected' | 'offer';
  date: string;
  notes?: string;
  interviewRound?: string;
}

export interface ApplicationRecord {
  id: string;
  jobId: string;
  job: NormalizedJob;
  stage: PipelineStage;
  tailoredApp: TailoredApplication;
  appliedDate?: string;
  interviewDate?: string;
  notes?: string;
  followUpDate?: string;
  humanActionRequired?: {
    reason: string;
    details: string;
    blockingField?: string;
  };
  outcomes?: ApplicationOutcome[];
  createdAt?: string;
  updatedAt?: string;
}

// Legacy alias for existing Job cards
export type Job = NormalizedJob & {
  stage: PipelineStage;
  tailoredApp?: TailoredApplication;
  appliedDate?: string;
  interviewDate?: string;
  notes?: string;
  type?: 'Full-time' | 'Remote' | 'Hybrid' | 'Contract';
  postedDate?: string;
  salaryRange?: string;
};

export interface AgentEvent {
  id: string;
  timestamp: string;
  timeFormatted: string;
  type: 'info' | 'search' | 'dedup' | 'analysis' | 'match' | 'prep' | 'review' | 'human_action' | 'warning';
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface AgentRunSummary {
  id: string;
  startedAt: string;
  completedAt?: string;
  status: 'completed' | 'running' | 'failed' | 'paused';
  jobsDiscovered: number;
  duplicatesRemoved: number;
  jobsAnalyzed: number;
  strongMatchesFound: number;
  applicationsPrepared: number;
  requiringHumanAction: number;
  events: AgentEvent[];
}

export interface UserSettings {
  matchThresholds: {
    applyQueueMin: number; // e.g. 80
    reviewQueueMin: number; // e.g. 65
  };
  dailyScheduleTime: string; // e.g. "08:00"
  dailySearchFrequency: 'daily' | 'twice_daily' | 'manual';
  maxApplicationsPreparedPerDay: number;
  autoPrepareApplications: boolean;
  requireApprovalBeforeSubmission: boolean; // Must default to true in MVP
  notifications: {
    enabled: boolean;
    strongMatchesFound: boolean;
    applicationsReadyForReview: boolean;
    humanActionRequired: boolean;
    interviewDetected: boolean;
  };
}

export interface ToolResult<T = any> {
  success: boolean;
  data?: T;
  requires_human: boolean;
  reason?: string;
  actionTaken?: string;
}
