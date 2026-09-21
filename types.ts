export * from './lib/types';

export type WorkplaceType = 'remote' | 'hybrid' | 'onsite';

export interface JobProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  currentRole: string;
  yearsOfExperience: number;
  skills: string[];
  education: any[];
  previousRoles: any[];
  companies: any[];
  industryExperience: any[];
  preferredLocations: string[];
}

export interface JobRecord {
  id: string;
  title: string;
  company: string;
  location: string;
  workplaceType?: WorkplaceType | string;
  description: string;
  salary?: string;
  requirements?: string[];
  [key: string]: any;
}

export interface JobMatchAnalysis {
  overallScore: number;
  matchReasons: string[];
  potentialGaps: string[];
  breakdown: {
    skillsMatch: number;
    experienceMatch: number;
    jobTitleRelevance: number;
    industryRelevance: number;
    locationPreference: number;
    salaryPreference: number;
    seniority: number;
    educationRequirements: number;
  };
  requirementsAnalysis: Array<{
    skillOrRequirement: string;
    userEvidence: string;
    status: 'strong' | 'gap' | 'moderate';
  }>;
  applicationStrategy: {
    relevantResumePoints: string[];
    skillsToEmphasize: string[];
    potentialConcerns: string[];
    suggestedScreeningAnswers: string[];
  };
}

export interface AgentSettings {
  autoApply?: boolean;
  minMatchScore?: number;
  preferredLocations?: string[];
  [key: string]: any;
}

export interface AgentCommandResult {
  actionTaken: string;
  explanation: string;
  matchedJobIds: string[];
  preparedJobIds: string[];
  suggestedNextStep: string;
}

export interface ExtractedJobDetails {
  title: string;
  company: string;
  location: string;
  workplaceType: WorkplaceType;
  salary: string;
  description: string;
}
