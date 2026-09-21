import {
  JobProfile,
  JobRecord,
  JobMatchAnalysis,
  TailoredApplication,
  AgentSettings,
  AgentCommandResult,
  ExtractedJobDetails,
  WorkplaceType,
  UserProfile,
  Job,
  MatchAnalysis,
} from "@/types";

// ============================================================================
// EXTENSIVE 100+ KEYWORD SKILLS DICTIONARY
// Covers Tech, Data, Cloud, Operations, Design, Management, and Marketing
// ============================================================================
export const SKILL_DICTIONARY: string[] = [
  // Programming Languages
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP",
  "Swift", "Kotlin", "Scala", "C", "R", "Dart", "Shell", "Bash", "PowerShell", "Perl",

  // Frontend & Mobile
  "React", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte", "HTML", "HTML5", "CSS", "CSS3",
  "Tailwind CSS", "Bootstrap", "Sass", "Redux", "Zustand", "React Native", "Flutter", "Webpack", "Vite",

  // Backend & APIs
  "Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET", ".NET", "Ruby on Rails",
  "GraphQL", "REST API", "gRPC", "WebSockets", "Microservices", "Serverless",

  // Databases & Storage
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "DynamoDB", "Cassandra",
  "SQLite", "MariaDB", "Oracle", "Firebase", "Firestore", "Supabase", "Prisma",

  // Cloud & Infrastructure / DevOps
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "Ansible", "Linux", "Unix",
  "CI/CD", "GitHub Actions", "GitLab CI", "Jenkins", "Nginx", "Cloudflare", "Helm", "Prometheus", "Grafana",

  // Data Science, AI & Machine Learning
  "Machine Learning", "Deep Learning", "Artificial Intelligence", "AI Ops", "MLOps", "PyTorch",
  "TensorFlow", "Scikit-Learn", "Pandas", "NumPy", "Data Analysis", "Data Science", "Data Engineering",
  "BigQuery", "Snowflake", "Apache Spark", "Kafka", "NLP", "Computer Vision", "LLMs", "Generative AI", "RAG",

  // Design, UX & Prototyping
  "Figma", "UI/UX Design", "Wireframing", "Prototyping", "Adobe XD", "User Research", "Design Systems", "Usability Testing",

  // Operations, Agile & Team Leadership
  "Agile", "Scrum", "Kanban", "Jira", "Confluence", "Git", "GitHub", "GitLab",
  "System Design", "Software Architecture", "Project Management", "Product Management",
  "Code Review", "Mentorship", "Team Leadership", "Cross-Functional Collaboration",

  // Marketing, Business & Growth
  "Marketing", "SEO", "SEM", "Google Analytics", "Content Strategy", "Email Marketing",
  "Growth Marketing", "CRM", "Salesforce", "HubSpot", "Social Media Marketing", "Copywriting", "A/B Testing"
];

/**
 * Robust word-boundary skill matching accounting for special characters (+, #, ., -)
 */
export function matchSkillInText(skill: string, text: string): boolean {
  if (!skill || !text) return false;
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const startsWord = /^\w/.test(skill);
  const endsWord = /\w$/.test(skill);
  const pattern = `${startsWord ? "\\b" : ""}${escaped}${endsWord ? "\\b" : ""}`;
  const regex = new RegExp(pattern, "i");
  return regex.test(text);
}

// ============================================================================
// 1. LOCAL RESUME PARSER (OpenResume Algorithm)
// ============================================================================

export async function parseResumeWithAI(resumeText: string): Promise<Partial<JobProfile>> {
  return parseResumeHeuristic(resumeText);
}

export function parseResumeHeuristic(text: string): Partial<JobProfile> {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // 1. Email Extraction
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

  // 2. Phone Extraction
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

  // 3. Improved Name Extraction:
  // Check the first non-empty lines, removing titles, honorifics, or common headings
  let name = "";
  const headingWords = /^(curriculum vitae|resume|cv|candidate profile|profile|summary|contact information|contact info|personal info)\b/i;
  const honorifics = /^(mr\.|mrs\.|ms\.|dr\.|prof\.|eng\.)\s+/i;
  const nonNameRoleKeywords = /^(software|engineer|developer|architect|designer|manager|lead|analyst|specialist|consultant|summary|objective|experience|skills|education)\b/i;

  for (const rawLine of lines.slice(0, 10)) {
    let line = rawLine.trim();

    // Skip lines with email, phone, or web addresses
    if (line.includes("@") || /https?:\/\/|www\./i.test(line) || /\d{3,}/.test(line)) {
      continue;
    }

    // Strip common heading prefixes
    if (headingWords.test(line)) {
      line = line.replace(headingWords, "").trim();
      if (!line) continue;
    }

    // Strip honorific titles (Dr., Mr., etc.)
    line = line.replace(honorifics, "").trim();

    // Handle names separated by pipes or dashes: e.g. "Sarah Connor | Lead Engineer"
    const splitParts = line.split(/[|•—–\/-]/);
    const candidatePart = splitParts[0].trim();

    // Check if the candidate portion consists of 2-4 clean alphabetical words
    if (/^[A-Za-zÀ-ÿ\s'.]{3,40}$/.test(candidatePart)) {
      const words = candidatePart.split(/\s+/).filter(Boolean);
      if (words.length >= 1 && words.length <= 4 && !nonNameRoleKeywords.test(candidatePart)) {
        name = candidatePart;
        break;
      }
    }
  }

  // Fallback if no clean name identified
  if (!name && lines.length > 0) {
    const firstClean = lines[0].replace(/[^A-Za-z\s]/g, " ").trim();
    if (firstClean.length >= 3 && firstClean.length <= 35 && !/resume|cv/i.test(firstClean)) {
      name = firstClean;
    } else {
      name = "Candidate Name";
    }
  }

  // 4. Skills Extraction (100+ keywords across tech, data, cloud, operations, design, management, marketing)
  const detectedSkills = SKILL_DICTIONARY.filter((skill) => matchSkillInText(skill, text));

  // 5. Current Role Extraction (Heuristic scan of top lines)
  let currentRole = "Software Engineer";
  const roleKeywords = [
    "Engineer", "Developer", "Manager", "Analyst", "Architect", 
    "Designer", "Lead", "Specialist", "Scientist", "Consultant", "Director"
  ];
  for (const line of lines.slice(0, 12)) {
    if (roleKeywords.some((k) => new RegExp(`\\b${k}\\b`, "i").test(line)) && line.length < 75 && !line.includes("@")) {
      let cleanedRole = line.replace(/^(Job Title|Position|Current Role|Role):\s*/i, "").trim();
      // If line contains pipe or dash e.g. "Maya Patel | Principal AI Scientist", pick the role part
      if (cleanedRole.includes("|") || cleanedRole.includes("—") || cleanedRole.includes("–")) {
        const parts = cleanedRole.split(/[|—–]/).map(p => p.trim());
        const rolePart = parts.find(p => roleKeywords.some(k => new RegExp(`\\b${k}\\b`, "i").test(p)));
        if (rolePart) {
          cleanedRole = rolePart;
        }
      }
      cleanedRole = cleanedRole.replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.|eng\.)\s+/i, "").trim();
      currentRole = cleanedRole;
      break;
    }
  }

  return {
    name: name || "Candidate Name",
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? phoneMatch[0] : "",
    location: "Remote",
    currentRole,
    yearsOfExperience: 3,
    skills: detectedSkills,
    education: [],
    previousRoles: [], // Returning empty to completely prevent dummy data hallucinations
    companies: [],
    industryExperience: [],
  };
}

// ============================================================================
// 2. LOCAL JOB MATCHER (Strict Keyword Intersection & Requirements Scoring)
// ============================================================================

export async function analyzeJobWithAI(
  profile: JobProfile,
  job: {
    title: string;
    company: string;
    location: string;
    description: string;
    salary?: string;
    workplaceType?: string;
    requirements?: string[];
  }
): Promise<JobMatchAnalysis> {
  return calculateHeuristicMatch(profile, job);
}

export function calculateHeuristicMatch(
  profile: JobProfile,
  job: {
    title: string;
    company: string;
    location: string;
    description: string;
    salary?: string;
    workplaceType?: string;
    requirements?: string[];
  }
): JobMatchAnalysis {
  // Combine job posting requirements and description
  const combinedJobText = [
    job.title || "",
    job.description || "",
    ...(job.requirements || [])
  ].join(" ");
  const jobTextLower = combinedJobText.toLowerCase();

  const candidateSkills = (profile.skills || []).map((s) => s.trim()).filter(Boolean);
  const matchedSkillsSet = new Set<string>();
  const missingSkillsSet = new Set<string>();

  // 1. Direct candidate skill intersection with job text
  for (const skill of candidateSkills) {
    if (matchSkillInText(skill, combinedJobText)) {
      matchedSkillsSet.add(skill);
    }
  }

  // 2. Check 100+ Skill Dictionary keywords mentioned in the job posting
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

  // Remove any skill from missing if it was successfully matched
  for (const matched of matchedSkillsSet) {
    missingSkillsSet.delete(matched);
  }

  const matchedSkills = Array.from(matchedSkillsSet);
  const missingSkills = Array.from(missingSkillsSet);

  // 3. Location match
  const locMatch =
    (profile.preferredLocations || []).some((loc) =>
      job.location.toLowerCase().includes(loc.toLowerCase())
    ) ||
    (profile.location && job.location.toLowerCase().includes(profile.location.toLowerCase())) ||
    job.workplaceType === "remote" ||
    job.location.toLowerCase().includes("remote");

  // 4. Role alignment check
  const roleKeywords = ["engineer", "developer", "lead", "architect", "manager", "designer", "analyst", "scientist"];
  const jobTitleLower = (job.title || "").toLowerCase();
  const candidateRoleLower = (profile.currentRole || "").toLowerCase();
  const roleMatch = roleKeywords.some(
    (kw) => jobTitleLower.includes(kw) && candidateRoleLower.includes(kw)
  );

  // 5. Transparent Mathematical Scoring
  const totalRelevantSkills = matchedSkills.length + missingSkills.length;
  let skillScore = 75;
  if (totalRelevantSkills > 0) {
    skillScore = Math.round((matchedSkills.length / totalRelevantSkills) * 100);
  } else if (matchedSkills.length > 0) {
    skillScore = Math.min(95, 60 + matchedSkills.length * 10);
  }

  // Calculate weighted overall score
  const roleBonus = roleMatch ? 15 : 5;
  const locBonus = locMatch ? 15 : 5;
  const overallScore = Math.min(
    98,
    Math.max(40, Math.round(skillScore * 0.7 + roleBonus + locBonus))
  );

  return {
    overallScore,
    matchReasons: [
      matchedSkills.length > 0
        ? `${matchedSkills.length} key skills matched explicitly (${matchedSkills.slice(0, 4).join(", ")})`
        : "Foundational software competencies align with position.",
      locMatch
        ? `${job.location} aligns with your location preferences.`
        : "Workplace location can be adapted with remote or hybrid flexibility.",
      roleMatch
        ? `Direct title alignment between your experience as a ${profile.currentRole} and the ${job.title} role.`
        : `Transferable engineering capabilities from your ${profile.currentRole} background.`
    ],
    potentialGaps:
      missingSkills.length > 0
        ? [
            `${missingSkills.slice(0, 4).join(", ")} mentioned in the job description but not explicitly listed in your profile.`
          ]
        : ["No critical technical gaps identified based on explicit job requirements."],
    breakdown: {
      skillsMatch: skillScore,
      experienceMatch: Math.min(95, Math.max(65, (profile.yearsOfExperience || 3) * 12 + 40)),
      jobTitleRelevance: roleMatch ? 90 : 75,
      industryRelevance: 80,
      locationPreference: locMatch ? 100 : 55,
      salaryPreference: 80,
      seniority: 80,
      educationRequirements: 85
    },
    requirementsAnalysis: [
      ...matchedSkills.slice(0, 6).map((s) => ({
        skillOrRequirement: s,
        userEvidence: "Explicitly matched from candidate profile competencies.",
        status: "strong" as const
      })),
      ...missingSkills.slice(0, 4).map((s) => ({
        skillOrRequirement: s,
        userEvidence: "Keyword found in job posting requirements.",
        status: "gap" as const
      }))
    ],
    applicationStrategy: {
      relevantResumePoints: [
        `Lead your application with your proven track record in ${matchedSkills[0] || "core engineering"}.`,
      ],
      skillsToEmphasize: matchedSkills.slice(0, 5),
      potentialConcerns:
        missingSkills.length > 0
          ? [`Prepare to address experience or willingness to quickly ramp up on ${missingSkills[0]}.`]
          : ["Highlight specific quantifiable impacts and production deployments."],
      suggestedScreeningAnswers: []
    }
  };
}

// ============================================================================
// 3. JOB RESCORING & ADAPTER HELPERS FOR UI & PIPELINE
// ============================================================================

export function formatMatchAnalysis(
  analysis: JobMatchAnalysis,
  profile: { skills: string[]; currentRole?: string; targetRole?: string }
): MatchAnalysis {
  const score = analysis.overallScore;
  let fitLevel: MatchAnalysis["fitLevel"] = "Good Match";
  if (score >= 88) fitLevel = "Strong Match";
  else if (score >= 72) fitLevel = "Good Match";
  else if (score >= 58) fitLevel = "Moderate Match";
  else fitLevel = "Low Match";

  return {
    matchScore: score,
    fitLevel,
    strengths: analysis.matchReasons,
    missingKeywords: analysis.potentialGaps,
    skillGaps: analysis.potentialGaps.slice(0, 2),
    recommendation: `Match score calculated at ${score}%. Emphasize your key strengths: ${(profile.skills || []).slice(0, 3).join(", ") || "core competencies"} when submitting materials.`,
    analyzedAt: new Date().toISOString().split("T")[0]
  };
}

export function rescoreJobForProfile(profile: UserProfile, job: Job): Job {
  const convertedProfile: JobProfile = {
    name: profile.fullName,
    email: profile.email,
    phone: profile.phone || "",
    location: profile.location || "Remote",
    currentRole: profile.targetRole || "Software Professional",
    yearsOfExperience: profile.yearsOfExperience || 3,
    skills: profile.skills || [],
    education: [],
    previousRoles: [],
    companies: [],
    industryExperience: [],
    preferredLocations: [profile.location || "Remote"]
  };

  const analysis = calculateHeuristicMatch(convertedProfile, {
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.description || "",
    requirements: job.requirements || [],
    workplaceType: job.type ? job.type.toLowerCase() : "remote"
  });

  return {
    ...job,
    match: formatMatchAnalysis(analysis, profile)
  };
}

// ============================================================================
// 4. OTHER LOCAL FALLBACKS
// ============================================================================

export async function extractJobDetailsWithAI(rawInput: string): Promise<ExtractedJobDetails> {
  const trimmed = rawInput.trim();
  const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
  const lower = trimmed.toLowerCase();

  let workplaceType: WorkplaceType = "remote";
  if (lower.includes("hybrid")) workplaceType = "hybrid";
  else if (lower.includes("on-site") || lower.includes("onsite")) workplaceType = "onsite";

  let title = "Software Professional";
  let company = "Tech Company";

  for (const line of lines.slice(0, 8)) {
    if (/engineer|developer|architect|specialist|manager|lead|scientist/i.test(line) && line.length < 70) {
      title = line.replace(/^(Job Title|Position|Role):\s*/i, "").trim();
      break;
    }
  }

  return {
    title,
    company,
    location: "Remote / Specified in Posting",
    workplaceType,
    salary: "",
    description: trimmed.length > 50 ? trimmed : `Extracted Job Opening for ${title}.`
  };
}

export async function prepareTailoredApplicationAI(profile: JobProfile, job: JobRecord): Promise<any> {
  const verifiedSkills = (profile.skills || []).filter(Boolean);
  const topSkills = verifiedSkills.slice(0, 4).join(", ") || "core technical capabilities";
  const roleName = profile.currentRole || "Software Professional";

  return {
    resumeSuggestions: [],
    coverLetter: `Dear Hiring Team at ${job.company},

I am writing to express my strong interest in the ${job.title} role. As a ${roleName} with proven, verified expertise in ${topSkills}, I have focused my career on delivering reliable, scalable systems.

My background aligns directly with the core requirements of ${job.company}:
• Hands-on experience applying ${verifiedSkills.slice(0, 2).join(" and ") || "key skills"} to production environments.
• A consistent record of engineering rigor, cross-functional execution, and reliable delivery.

I welcome the opportunity to discuss how my verified background and skills can contribute to ${job.company}'s upcoming milestones.

Sincerely,
${profile.name}
${profile.email}`,
    screeningAnswers: (job.requirements || []).map((req) => {
      const isMatched = verifiedSkills.some((s) =>
        req.toLowerCase().includes(s.toLowerCase())
      );
      return {
        question: req,
        answer: isMatched
          ? `Verified experience in ${verifiedSkills.find((s) => req.toLowerCase().includes(s.toLowerCase()))} directly supports this requirement.`
          : "Information not available — user input required.",
      };
    }),
  };
}

export async function processAgentCommandAI(
  command: string,
  profile: JobProfile,
  jobs: JobRecord[],
  settings: AgentSettings
): Promise<AgentCommandResult> {
  const lower = command.toLowerCase();
  let matched = [...jobs];
  const isPrepare = lower.includes("prepare") || lower.includes("tailor");

  if (lower.includes("remote")) {
    matched = matched.filter((j) => j.workplaceType === "remote" || (j.location && j.location.toLowerCase().includes("remote")));
  }

  return {
    actionTaken: `Filtered ${matched.length} jobs matching your command.`,
    explanation: `Analyzed your pipeline using local regex filters.`,
    matchedJobIds: matched.map((j) => j.id),
    preparedJobIds: isPrepare ? matched.slice(0, 3).map((j) => j.id) : [],
    suggestedNextStep: "Review matched jobs."
  };
}
