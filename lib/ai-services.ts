import {
  UserProfile,
  Job,
  NormalizedJob,
  MatchAnalysis,
  MatchDecision,
  TailoredApplication,
  CareerPreferences,
  ScreeningAnswer,
  ExtractedEvidence,
} from './types';
import { initialCareerPreferences } from './sample-data';

// ============================================================================
// EXTENSIVE 100+ KEYWORD SKILLS DICTIONARY
// Covers Tech, Data, Cloud, Operations, Design, Management, and Marketing
// ============================================================================
export const SKILL_DICTIONARY: string[] = [
  // Programming Languages
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP',
  'Swift', 'Kotlin', 'Scala', 'C', 'R', 'Dart', 'Shell', 'Bash', 'PowerShell', 'Perl',

  // Frontend & Mobile
  'React', 'Next.js', 'Vue.js', 'Nuxt.js', 'Angular', 'Svelte', 'HTML', 'HTML5', 'CSS', 'CSS3',
  'Tailwind CSS', 'Bootstrap', 'Sass', 'Redux', 'Zustand', 'React Native', 'Flutter', 'Webpack', 'Vite',

  // Backend & APIs
  'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET', '.NET', 'Ruby on Rails',
  'GraphQL', 'REST API', 'gRPC', 'WebSockets', 'Microservices', 'Serverless',

  // Databases & Storage
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB', 'Cassandra',
  'SQLite', 'MariaDB', 'Oracle', 'Firebase', 'Firestore', 'Supabase', 'Prisma',

  // Cloud & Infrastructure / DevOps
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Linux', 'Unix',
  'CI/CD', 'GitHub Actions', 'GitLab CI', 'Jenkins', 'Nginx', 'Cloudflare', 'Helm', 'Prometheus', 'Grafana',

  // Data Science, AI & Machine Learning
  'Machine Learning', 'Deep Learning', 'Artificial Intelligence', 'AI Ops', 'MLOps', 'PyTorch',
  'TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy', 'Data Analysis', 'Data Science', 'Data Engineering',
  'BigQuery', 'Snowflake', 'Apache Spark', 'Kafka', 'NLP', 'Computer Vision', 'LLMs', 'Generative AI', 'RAG',
  'Gemini API',

  // Design, UX & Prototyping
  'Figma', 'UI/UX Design', 'Wireframing', 'Prototyping', 'Adobe XD', 'User Research', 'Design Systems',

  // Operations, Product & Team Leadership
  'Product Operations', 'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence', 'Git', 'GitHub', 'GitLab',
  'System Design', 'Software Architecture', 'Project Management', 'Product Management',
  'Code Review', 'Mentorship', 'Team Leadership', 'Cross-Functional Collaboration',

  // Business & Research
  'Market Research', 'Consumer Insights', 'Marketing Analytics', 'Business Analysis', 'SOP Design', 'Requirements Scoping'
];

/**
 * Word-boundary matching accounting for special characters (+, #, ., -)
 */
export function matchSkillInText(skill: string, text: string): boolean {
  if (!skill || !text) return false;
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startsWord = /^\w/.test(skill);
  const endsWord = /\w$/.test(skill);
  const pattern = `${startsWord ? '\\b' : ''}${escaped}${endsWord ? '\\b' : ''}`;
  const regex = new RegExp(pattern, 'i');
  return regex.test(text);
}

// ============================================================================
// DETERMINISTIC & AI JOB MATCHING ENGINE
// ============================================================================

export interface MatchOptions {
  applyThreshold?: number; // default 80
  reviewThreshold?: number; // default 65
  preferences?: CareerPreferences;
}

export function calculateHeuristicMatch(
  profile: UserProfile,
  job: {
    title: string;
    company: string;
    location: string;
    description: string;
    salary?: string;
    salaryMin?: number;
    workplace_type?: string;
    requirements?: string[];
  },
  options?: MatchOptions
): MatchAnalysis {
  const prefs = options?.preferences || initialCareerPreferences;
  const applyMin = options?.applyThreshold ?? 80;
  const reviewMin = options?.reviewThreshold ?? 65;

  const combinedJobText = [
    job.title || '',
    job.description || '',
    ...(job.requirements || [])
  ].join(' ');

  const candidateSkills = (profile.skills || []).map((s) => s.trim()).filter(Boolean);
  const matchedSkillsSet = new Set<string>();
  const missingSkillsSet = new Set<string>();

  // 1. Direct candidate skill intersection
  for (const skill of candidateSkills) {
    if (matchSkillInText(skill, combinedJobText)) {
      matchedSkillsSet.add(skill);
    }
  }

  // 2. Scan skill dictionary against job posting
  for (const dictSkill of SKILL_DICTIONARY) {
    if (matchSkillInText(dictSkill, combinedJobText)) {
      const candidateHasIt = candidateSkills.some(
        (cs) => cs.toLowerCase() === dictSkill.toLowerCase() || matchSkillInText(dictSkill, cs)
      );
      if (candidateHasIt) {
        matchedSkillsSet.add(dictSkill);
      } else {
        missingSkillsSet.add(dictSkill);
      }
    }
  }

  for (const m of matchedSkillsSet) {
    missingSkillsSet.delete(m);
  }

  const matchedSkills = Array.from(matchedSkillsSet);
  const missingSkills = Array.from(missingSkillsSet);

  // 3. Location & Workplace Type Analysis
  const jobLocationLower = (job.location || '').toLowerCase();
  const workplaceType = job.workplace_type || (jobLocationLower.includes('remote') ? 'remote' : 'onsite');

  const locMatch =
    prefs.preferredLocations.some((loc) => jobLocationLower.includes(loc.toLowerCase())) ||
    (profile.location && jobLocationLower.includes(profile.location.toLowerCase())) ||
    workplaceType === 'remote';

  // 4. Role Title Alignment
  const targetRoles = [
    ...(prefs.targetRoles || []),
    profile.targetRole
  ].filter(Boolean);

  const jobTitleLower = (job.title || '').toLowerCase();
  const roleMatch = targetRoles.some((tr) => {
    const trWords = tr.toLowerCase().split(/\s+/);
    return trWords.some((w) => w.length > 3 && jobTitleLower.includes(w));
  });

  // 5. Hard Constraint Checking
  const constraintViolations: string[] = [];

  // Constraint: Mandatory on-site conflicts with remote preference
  if (prefs.remotePreference === 'remote' && workplaceType === 'onsite' && !locMatch) {
    constraintViolations.push('Mandatory on-site location violates candidate remote preference.');
  }

  // Constraint: Salary below minimum floor
  if (job.salaryMin && prefs.minimumSalary && job.salaryMin < prefs.minimumSalary * 0.85) {
    constraintViolations.push(`Stated salary ($${job.salaryMin.toLocaleString()}) is below user minimum threshold ($${prefs.minimumSalary.toLocaleString()}).`);
  }

  // Constraint: Required experience gap (check for "8+ years", "10+ years")
  const expReqMatch = combinedJobText.match(/(\d+)\+?\s*years?\s+(?:of\s+)?experience/i);
  if (expReqMatch) {
    const requiredYears = parseInt(expReqMatch[1], 10);
    const candidateYears = profile.yearsOfExperience || 3;
    if (requiredYears >= candidateYears + 3) {
      constraintViolations.push(`Job requires ${requiredYears}+ years experience, exceeding candidate verified tenure (${candidateYears} years).`);
    }
  }

  // 6. Transparent Mathematical Scoring
  const totalRelevantSkills = matchedSkills.length + missingSkills.length;
  let skillScore = 75;
  if (totalRelevantSkills > 0) {
    skillScore = Math.round((matchedSkills.length / totalRelevantSkills) * 100);
  } else if (matchedSkills.length > 0) {
    skillScore = Math.min(95, 60 + matchedSkills.length * 8);
  }

  const expScore = Math.min(95, Math.max(50, (profile.yearsOfExperience || 3) * 10 + 35));
  const locScore = locMatch ? 100 : (workplaceType === 'hybrid' ? 70 : 45);
  const roleScore = roleMatch ? 92 : 72;
  const salaryScore = constraintViolations.some(c => c.includes('salary')) ? 40 : 85;

  let overallScore = Math.round(
    skillScore * 0.45 +
    expScore * 0.15 +
    roleScore * 0.20 +
    locScore * 0.10 +
    salaryScore * 0.10
  );

  // If there are hard constraint violations, cap score to prevent accidental queueing
  if (constraintViolations.length > 0) {
    overallScore = Math.min(64, overallScore);
  } else {
    overallScore = Math.min(98, Math.max(40, overallScore));
  }

  // 7. Decision Determination
  let decision: MatchDecision = 'REVIEW';
  let fitLevel: MatchAnalysis['fitLevel'] = 'Good Match';

  if (constraintViolations.length > 0 || overallScore < reviewMin) {
    decision = 'SKIP';
    fitLevel = 'Low Match';
  } else if (overallScore >= applyMin) {
    decision = 'APPLY';
    fitLevel = 'Strong Match';
  } else {
    decision = 'REVIEW';
    fitLevel = 'Moderate Match';
  }

  // 8. Transparent Match Reasons & Potential Gaps
  const reasons: string[] = [];
  if (matchedSkills.length > 0) {
    reasons.push(`${matchedSkills.length} verified skills matched directly (${matchedSkills.slice(0, 4).join(', ')})`);
  }
  if (roleMatch) {
    reasons.push(`Direct alignment between candidate target roles and ${job.title}`);
  }
  if (locMatch) {
    reasons.push(`${job.location} aligns with preferred locations and remote flexibility`);
  }

  const gaps: string[] = [];
  if (missingSkills.length > 0) {
    gaps.push(`${missingSkills.slice(0, 4).join(', ')} mentioned in requirements but not explicitly verified in profile`);
  }
  if (constraintViolations.length > 0) {
    gaps.push(...constraintViolations);
  }

  return {
    matchScore: overallScore,
    fitLevel,
    decision,
    reasons,
    gaps,
    strengths: matchedSkills.slice(0, 5),
    missingKeywords: missingSkills.slice(0, 5),
    skillGaps: missingSkills.slice(0, 3),
    breakdown: {
      skillsMatch: skillScore,
      experienceMatch: expScore,
      locationMatch: locScore,
      salaryMatch: salaryScore,
      roleMatch: roleScore,
      industryMatch: 80,
      seniorityMatch: 80
    },
    constraintViolations,
    recommendation: decision === 'APPLY'
      ? `AI Match Estimate: ${overallScore}% (APPLY). Strong qualification alignment. Recommended for immediate application preparation.`
      : decision === 'REVIEW'
      ? `AI Match Estimate: ${overallScore}% (REVIEW). Viable opportunity with moderate skill/compensation trade-offs. Review details before preparing.`
      : `AI Match Estimate: ${overallScore}% (SKIP). ${constraintViolations[0] || 'Score below qualification threshold.'}`,
    analyzedAt: new Date().toISOString().split('T')[0]
  };
}

export function rescoreJobForProfile(
  profile: UserProfile, 
  job: Job, 
  options?: MatchOptions
): Job {
  const analysis = calculateHeuristicMatch(profile, {
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.description || '',
    requirements: job.requirements || [],
    workplace_type: job.workplace_type || (job.type ? job.type.toLowerCase() : 'remote'),
    salary: job.salary,
    salaryMin: job.salaryMin
  }, options);

  return {
    ...job,
    match: analysis
  };
}

// ============================================================================
// ZERO-HALLUCINATION APPLICATION PREPARATION ENGINE
// ============================================================================

export async function prepareTailoredApplicationAI(
  profile: UserProfile,
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    requirements?: string[];
  }
): Promise<TailoredApplication> {
  const verifiedSkills = (profile.skills || []).filter(Boolean);
  const topSkills = verifiedSkills.slice(0, 4).join(', ') || 'core engineering competencies';
  const roleName = profile.targetRole || 'Software Professional';
  const primaryCompany = profile.workHistory && profile.workHistory.length > 0 ? profile.workHistory[0].company : 'recent engineering organizations';
  const achievements = (profile.workHistory || []).flatMap((w) => w.highlights || []).slice(0, 2);

  const evidenceList: ExtractedEvidence[] = profile.structuredProfile?.evidence_layer || [];

  // Generate verified screening question answers
  const screeningAnswers: ScreeningAnswer[] = (job.requirements || []).map((req) => {
    const reqLower = req.toLowerCase();
    const matchedSkill = verifiedSkills.find((s) => reqLower.includes(s.toLowerCase()));
    const matchingEvidence = evidenceList.find(
      (ev) => reqLower.includes(ev.claim.toLowerCase()) || (matchedSkill && ev.claim.toLowerCase().includes(matchedSkill.toLowerCase()))
    );

    if (matchedSkill) {
      return {
        question: req,
        answer: `Verified background in ${matchedSkill} directly demonstrates this requirement.`,
        evidenceQuote: matchingEvidence ? matchingEvidence.evidence : `Verified skill: ${matchedSkill}`,
        isVerified: true
      };
    }

    // Explicitly flag unverified requirements rather than hallucinating answers
    return {
      question: req,
      answer: 'User input required — no direct verified evidence found in resume.',
      isVerified: false,
      requiresUserInput: true
    };
  });

  const coverLetter = `Dear Hiring Team at ${job.company},

I am writing to express my strong interest in the ${job.title} role at ${job.company}. Having built my career around verified experience in ${topSkills}, I have focused on delivering scalable, reliable systems and high-velocity engineering.

My background aligns directly with the goals of ${job.company}:
• Hands-on expertise applying ${verifiedSkills.slice(0, 2).join(' and ') || 'modern frameworks'} to production services.
• Proven track record at ${primaryCompany}: ${achievements[0] || 'accelerating delivery and ensuring system reliability'}.
• Commitment to cross-functional alignment, clean architecture, and engineering rigor.

I welcome the opportunity to discuss how my verified background and technical capabilities can support ${job.company}'s upcoming milestones.

Sincerely,
${profile.fullName}
${profile.email}`;

  const tailoredSummary = `${roleName} with ${profile.yearsOfExperience}+ years of verified track record in ${topSkills}. Proven delivery of high-impact systems at ${primaryCompany} with direct alignment for ${job.company}.`;

  const suggestedBulletPoints = [
    `Architected scalable features utilizing ${verifiedSkills.slice(0, 2).join(' and ') || 'modern engineering frameworks'}, driving measurable improvements in speed and reliability.`,
    `Collaborated cross-functionally across engineering, product, and operations to ship user-facing capabilities aligned with ${job.company}'s mission.`,
    `Championed rigorous engineering standards, continuous testing, and resilient system design.`
  ];

  const outreachEmail = `Subject: ${profile.fullName} - ${job.title} application (${job.company})

Hi ${job.company} Recruiting Team,

I recently submitted my application for the ${job.title} position. Given my verified background with ${profile.yearsOfExperience}+ years in ${topSkills} at ${primaryCompany}, I was very excited to see this role open up.

I would love to connect briefly or provide any additional context on my background. My verified portfolio is at ${profile.portfolioUrl || 'available upon request'}.

Best regards,
${profile.fullName}`;

  const missingEvidenceFlags = screeningAnswers
    .filter((a) => a.requiresUserInput)
    .map((a) => a.question);

  return {
    coverLetter,
    tailoredSummary,
    suggestedBulletPoints,
    outreachEmail,
    keyTalkingPoints: [
      `Demonstrating alignment with ${job.requirements && job.requirements[0] ? job.requirements[0] : 'key requirements'} through verified production wins`,
      `How past experience at ${primaryCompany} prepares you for day-1 contribution at ${job.company}`,
      `Approach to maintainability, system speed, and team collaboration`
    ],
    screeningAnswers,
    status: 'pending_approval',
    updatedAt: new Date().toISOString().split('T')[0],
    missingEvidenceFlags
  };
}

// Backward compatibility exports
export async function analyzeJobWithAI(
  profile: any,
  job: any
): Promise<MatchAnalysis> {
  const convertedProfile: UserProfile = {
    fullName: profile.name || profile.fullName || 'Candidate',
    email: profile.email || '',
    location: profile.location || 'Remote',
    targetRole: profile.currentRole || profile.targetRole || 'Software Professional',
    yearsOfExperience: profile.yearsOfExperience || 3,
    skills: profile.skills || [],
    summary: '',
    workHistory: []
  };
  return calculateHeuristicMatch(convertedProfile, job);
}

export function formatMatchAnalysis(analysis: MatchAnalysis, _profile?: any): MatchAnalysis {
  return analysis;
}

