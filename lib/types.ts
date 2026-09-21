export type PipelineStage = 
  | 'discovered' 
  | 'reviewing' 
  | 'approved' 
  | 'applied' 
  | 'interviewing' 
  | 'offer' 
  | 'rejected';

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
