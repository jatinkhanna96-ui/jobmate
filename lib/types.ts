export type PipelineStage = 
  | 'discovered' 
  | 'reviewing' 
  | 'approved' 
  | 'applied' 
  | 'interviewing' 
  | 'offer' 
  | 'rejected';

export type VerificationSource = 'VERIFIED FROM RESUME' | 'USER PROVIDED' | 'AI SUGGESTION';

export interface ExtractedEvidence {
  claim: string;
  evidence: string;
  source_section: string;
  confidence: 'high' | 'needs_review';
}

export interface DocumentQualityAssessment {
  documentType: 'text_pdf' | 'scanned_pdf' | 'image_heavy' | 'text_document' | 'unknown';
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
  confidence?: 'high' | 'needs_review';
  source?: VerificationSource;
}

export interface ToolItem {
  id: string;
  name: string;
  confidence?: 'high' | 'needs_review';
  source?: VerificationSource;
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
  experience_formatted: string; // e.g. "4 years 2 months experience"
  experience: ExperienceItem[];
  skills: SkillItem[];
  tools: ToolItem[];
  industries: string[];
  education: EducationItem[];
  certifications: CertificationItem[];
  projects: ProjectItem[];
  languages: string[];
  explicit_preferences: {
    location: string;
    remote_preference: string;
    salary: string;
    notice_period: string;
  };
  evidence_layer?: ExtractedEvidence[];
  quality_assessment?: DocumentQualityAssessment;
  verificationStatus?: 'verified' | 'user_provided' | 'unconfirmed';
}

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
  // Enhanced candidate profile structure
  structuredProfile?: StructuredCandidateProfile;
  experienceCalculatedText?: string;
  verificationStatus?: 'verified' | 'user_provided' | 'unconfirmed';
  documentQuality?: DocumentQualityAssessment;
}

export interface MatchAnalysis {
  matchScore: number; // 0 to 100
  fitLevel: 'Strong Match' | 'Good Match' | 'Moderate Match' | 'Low Match';
  strengths: string[];
  missingKeywords: string[];
  skillGaps: string[];
  recommendation: string;
  analyzedAt: string;
}

export interface TailoredApplication {
  coverLetter: string;
  tailoredSummary: string;
  suggestedBulletPoints: string[];
  outreachEmail: string;
  keyTalkingPoints: string[];
  status: 'pending_approval' | 'approved' | 'rejected' | 'modified';
  userNotes?: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Remote' | 'Hybrid' | 'Contract';
  salaryRange?: string;
  postedDate: string;
  url?: string;
  description: string;
  requirements: string[];
  stage: PipelineStage;
  match?: MatchAnalysis;
  tailoredApp?: TailoredApplication;
  appliedDate?: string;
  interviewDate?: string;
  notes?: string;
}
