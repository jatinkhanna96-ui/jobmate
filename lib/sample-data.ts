import { 
  UserProfile, 
  Job, 
  NormalizedJob, 
  CareerPreferences, 
  JobSource, 
  ApplicationRecord, 
  UserSettings, 
  AgentEvent 
} from './types';

export const initialProfile: UserProfile = {
  fullName: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  phone: '+1 (555) 234-5678',
  location: 'San Francisco, CA (Open to Remote)',
  targetRole: 'Senior Full Stack & AI Applications Engineer',
  yearsOfExperience: 6,
  skills: [
    'TypeScript',
    'React / Next.js',
    'Node.js',
    'Python',
    'Gemini API / LLM Prompt Engineering',
    'PostgreSQL / Prisma',
    'Tailwind CSS',
    'REST & GraphQL APIs',
    'Cloud Architecture (GCP / Docker)',
    'CI/CD Pipelines',
    'System Design',
    'Technical Leadership'
  ],
  summary:
    'Full-stack engineer with 6+ years building scalable, user-centric web applications and AI-driven products. Proven track record of architecting responsive frontends, resilient backends, and integrating production LLM workflows.',
  resumeFileName: 'Alex_Rivera_Resume.docx',
  resumeRawText: `Alex Rivera
Senior Software Engineer
San Francisco, CA | alex.rivera@example.com | github.com/alexrivera

SUMMARY:
Results-driven Senior Full Stack Engineer with 6 years of experience shipping high-impact web products and generative AI capabilities. Expert in React, Next.js, TypeScript, Node.js, and modern cloud architectures.

EXPERIENCE:
Staff Software Engineer | TechPulse Solutions (2022 - Present)
- Led frontend architecture migration to Next.js 14, improving page load speeds by 42%.
- Integrated generative AI assistants for automated document workflows, saving users 35+ hours weekly.
- Mentored 5 mid-level engineers in component design, TypeScript safety, and performance profiling.

Full Stack Engineer | CloudScale Inc. (2019 - 2022)
- Designed and built distributed microservices in Node.js and PostgreSQL serving 1.2M monthly active users.
- Automated CI/CD deployment pipelines using GitHub Actions and Docker, reducing release cycle by 60%.
- Implemented real-time dashboard analytics utilizing WebSockets and Redis.

EDUCATION:
B.S. in Computer Science, University of California, Berkeley (2015 - 2019)

SKILLS:
Languages: TypeScript, JavaScript, Python, SQL, HTML5/CSS3
Frameworks: React, Next.js, Node.js, Express, Tailwind CSS, Fastify
AI/ML: Gemini API, Prompt Engineering, Structured LLM Outputs, RAG architectures
Databases & Cloud: PostgreSQL, Redis, Docker, GCP, Git`,
  workHistory: [
    {
      company: 'TechPulse Solutions',
      role: 'Staff Software Engineer',
      duration: '2022 - Present',
      highlights: [
        'Led migration of web applications to Next.js, speeding up initial load times by 42%.',
        'Implemented generative AI workflow features using modern LLM APIs.',
        'Mentored engineering cohort on scalable design patterns and TypeScript best practices.'
      ]
    },
    {
      company: 'CloudScale Inc.',
      role: 'Full Stack Engineer',
      duration: '2019 - 2022',
      highlights: [
        'Engineered high-throughput microservices handling 1.2M active monthly users.',
        'Reduced deployment friction by 60% by establishing standardized CI/CD pipelines.',
        'Spearheaded real-time state synchronization via Redis and WebSockets.'
      ]
    }
  ],
  education: 'B.S. in Computer Science - University of California, Berkeley (2015 - 2019)',
  portfolioUrl: 'https://alexrivera.dev',
  linkedinUrl: 'https://linkedin.com/in/alexrivera-dev',
  isConfirmed: true,
  confirmedAt: '2026-09-20T10:00:00.000Z',
  verificationStatus: 'verified',
  experienceCalculatedText: '6 years 2 months professional experience',
  structuredProfile: {
    personal: {
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA (Open to Remote)',
      linkedin: 'https://linkedin.com/in/alexrivera-dev',
      portfolio: 'https://alexrivera.dev'
    },
    professional_summary:
      'Results-driven Senior Full Stack Engineer with 6 years of experience shipping high-impact web products and generative AI capabilities. Expert in React, Next.js, TypeScript, Node.js, and modern cloud architectures.',
    current_role: {
      title: 'Staff Software Engineer',
      company: 'TechPulse Solutions',
      start_date: '2022',
      end_date: 'Present'
    },
    total_experience_years: 6,
    experience_formatted: '6 years 2 months verified experience',
    experience: [
      {
        id: 'exp-1',
        company: 'TechPulse Solutions',
        title: 'Staff Software Engineer',
        start_date: '2022',
        end_date: 'Present',
        responsibilities: [
          'Lead frontend and AI architecture for enterprise document automation platform.',
          'Oversee system reliability and engineering best practices across 3 cross-functional squads.'
        ],
        achievements: [
          'Improved page load speeds by 42% through Next.js App Router and server components.',
          'Saved clients 35+ hours weekly by shipping automated LLM document processing.'
        ],
        skills_used: ['Next.js', 'TypeScript', 'Gemini API', 'Tailwind CSS', 'Docker'],
        confidence: 'high',
        source: 'VERIFIED FROM RESUME'
      },
      {
        id: 'exp-2',
        company: 'CloudScale Inc.',
        title: 'Full Stack Engineer',
        start_date: '2019',
        end_date: '2022',
        responsibilities: [
          'Built and maintained distributed backend microservices and developer APIs.',
          'Collaborated with product designers to ship responsive customer-facing portals.'
        ],
        achievements: [
          'Engineered microservices supporting 1.2M monthly active users with 99.95% uptime.',
          'Cut deployment turnaround time by 60% with automated Docker CI/CD pipelines.'
        ],
        skills_used: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'GCP'],
        confidence: 'high',
        source: 'VERIFIED FROM RESUME'
      }
    ],
    skills: [
      { id: 'sk-1', name: 'TypeScript', category: 'technical', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 'sk-2', name: 'React / Next.js', category: 'technical', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 'sk-3', name: 'Node.js', category: 'technical', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 'sk-4', name: 'Python', category: 'technical', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 'sk-5', name: 'Gemini API / LLMs', category: 'technical', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 'sk-6', name: 'PostgreSQL / Prisma', category: 'technical', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 'sk-7', name: 'System Design & Architecture', category: 'analytical', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 'sk-8', name: 'Performance Profiling', category: 'analytical', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 'sk-9', name: 'Product Operations & Scoping', category: 'business', confidence: 'high', source: 'USER PROVIDED' },
      { id: 'sk-10', name: 'Team Mentorship & Leadership', category: 'soft', confidence: 'high', source: 'VERIFIED FROM RESUME' }
    ],
    tools: [
      { id: 'tl-1', name: 'Docker', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 'tl-2', name: 'GitHub Actions', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 'tl-3', name: 'Google Cloud Platform (GCP)', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 'tl-4', name: 'Redis', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 'tl-5', name: 'VS Code', confidence: 'high', source: 'VERIFIED FROM RESUME' }
    ],
    industries: ['SaaS', 'Artificial Intelligence', 'Cloud Infrastructure', 'Developer Tools'],
    education: [
      {
        id: 'edu-1',
        institution: 'University of California, Berkeley',
        degree: 'B.S. in Computer Science',
        field_of_study: 'Computer Science',
        start_date: '2015',
        end_date: '2019',
        confidence: 'high'
      }
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'Google Cloud Certified Professional Cloud Architect',
        issuer: 'Google Cloud',
        date: '2023',
        confidence: 'high'
      }
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'CareerPilot Engine',
        description: 'Agentic job evaluation and application assistant using Gemini structured outputs.',
        technologies: ['Next.js 15', 'TypeScript', 'Gemini API', 'Tailwind CSS'],
        link: 'https://github.com/alexrivera/careerpilot',
        confidence: 'high'
      }
    ],
    languages: ['English (Fluent)', 'Spanish (Conversational)'],
    explicit_preferences: {
      target_roles: ['Senior Full Stack Engineer', 'AI Applications Engineer', 'Staff Software Engineer'],
      preferred_locations: ['Remote', 'San Francisco, CA', 'New York, NY'],
      remote_preference: 'remote',
      salary: '$150,000 - $190,000 / ₹30L+',
      notice_period: '2 Weeks'
    },
    evidence_layer: [
      {
        claim: 'Proficiency in Next.js and TypeScript',
        evidence: 'Led frontend architecture migration to Next.js 14, improving page load speeds by 42%.',
        source_section: 'Experience / TechPulse Solutions',
        confidence: 'high',
        sourceType: 'VERIFIED FROM RESUME'
      },
      {
        claim: 'Generative AI & LLM application development',
        evidence: 'Integrated generative AI assistants for automated document workflows, saving users 35+ hours weekly.',
        source_section: 'Experience / TechPulse Solutions',
        confidence: 'high',
        sourceType: 'VERIFIED FROM RESUME'
      },
      {
        claim: 'High-scale backend engineering in Node.js & PostgreSQL',
        evidence: 'Designed and built distributed microservices in Node.js and PostgreSQL serving 1.2M monthly active users.',
        source_section: 'Experience / CloudScale Inc.',
        confidence: 'high',
        sourceType: 'VERIFIED FROM RESUME'
      },
      {
        claim: 'CI/CD pipeline automation',
        evidence: 'Automated CI/CD deployment pipelines using GitHub Actions and Docker, reducing release cycle by 60%.',
        source_section: 'Experience / CloudScale Inc.',
        confidence: 'high',
        sourceType: 'VERIFIED FROM RESUME'
      }
    ],
    quality_assessment: {
      documentType: 'text_document',
      isMultiColumn: false,
      qualityWarning: null,
      overallConfidence: 'high'
    },
    isConfirmed: true,
    confirmedAt: '2026-09-20T10:00:00.000Z',
    verificationStatus: 'verified'
  }
};

export const initialCareerPreferences: CareerPreferences = {
  targetRoles: [
    'Senior AI Applications Engineer',
    'Senior Full Stack Engineer',
    'Staff Software Engineer',
    'AI Operations Lead',
    'Product Operations Specialist'
  ],
  targetRoleGroups: [
    {
      id: 'grp-1',
      name: 'AI & Full Stack Engineering',
      roles: ['Senior AI Applications Engineer', 'Senior Full Stack Engineer', 'Staff Software Engineer']
    },
    {
      id: 'grp-2',
      name: 'AI Operations & Product',
      roles: ['AI Operations Lead', 'Product Operations Specialist', 'Technical Product Manager']
    }
  ],
  targetIndustries: ['AI / Machine Learning', 'B2B SaaS', 'Developer Infrastructure', 'FinTech'],
  preferredLocations: ['Remote', 'San Francisco, CA', 'New York, NY', 'Seattle, WA'],
  remotePreference: 'remote',
  minimumSalary: 140000,
  salaryCurrency: 'USD',
  maxCommuteMinutes: 45,
  experienceRange: {
    minYears: 4,
    maxYears: 9
  },
  employmentTypes: ['Full-time', 'Contract'],
  companiesToTarget: ['Cortex Labs', 'Synthetix AI', 'Nova Cloud', 'Vercel', 'Linear', 'Stripe'],
  companiesToExclude: ['CryptoSpam Labs', 'Legacy Corp International'],
  keywordsToPrioritize: ['Next.js', 'TypeScript', 'Gemini', 'LLMs', 'System Design', 'PostgreSQL'],
  keywordsToAvoid: ['On-call 24/7', 'Cold calling', 'Legacy PHP 5', 'Wordpress maintenance']
};

export const initialSources: JobSource[] = [
  {
    id: 'src-greenhouse',
    platform: 'greenhouse',
    name: 'Greenhouse ATS',
    category: 'ATS Platform',
    status: 'connected',
    statusDetails: 'Active public career board API connector. Ingesting open company listings.',
    officialApiSupported: true,
    complianceNotice: 'Reads permitted public RSS/JSON job boards for verified partner companies.',
    connectedAt: '2026-09-20T08:00:00.000Z',
    lastSyncAt: '2026-09-21T08:00:00.000Z',
    feedUrl: 'https://boards-api.greenhouse.io/v1/boards'
  },
  {
    id: 'src-lever',
    platform: 'lever',
    name: 'Lever ATS',
    category: 'ATS Platform',
    status: 'connected',
    statusDetails: 'Active public postings parser. Ingesting fresh openings.',
    officialApiSupported: true,
    complianceNotice: 'Fetches authorized public postings compliant with standard robots.txt.',
    connectedAt: '2026-09-20T08:00:00.000Z',
    lastSyncAt: '2026-09-21T08:00:00.000Z',
    feedUrl: 'https://api.lever.co/v0/postings'
  },
  {
    id: 'src-company-careers',
    platform: 'company_careers',
    name: 'Direct Company Career Pages',
    category: 'Company Careers',
    status: 'connected',
    statusDetails: 'Target company watchlist active. Direct career page links monitored.',
    officialApiSupported: true,
    complianceNotice: 'Respects corporate robots.txt and official candidate submission endpoints.',
    connectedAt: '2026-09-20T08:00:00.000Z',
    lastSyncAt: '2026-09-21T08:00:00.000Z'
  },
  {
    id: 'src-linkedin',
    platform: 'linkedin',
    name: 'LinkedIn Jobs',
    category: 'Job Board',
    status: 'connection_required',
    statusDetails: 'Connection required. Official LinkedIn API partner authorization or user session required.',
    officialApiSupported: true,
    complianceNotice: 'Platform terms prohibit unauthorized web scraping or non-consensual automation.'
  },
  {
    id: 'src-indeed',
    platform: 'indeed',
    name: 'Indeed',
    category: 'Job Board',
    status: 'connection_required',
    statusDetails: 'Connection required. Publisher API key or compliant browser extension required.',
    officialApiSupported: true,
    complianceNotice: 'Requires explicit user authentication and rate-limited compliant ingestion.'
  },
  {
    id: 'src-naukri',
    platform: 'naukri',
    name: 'Naukri.com',
    category: 'Job Board',
    status: 'connection_required',
    statusDetails: 'Connection required. Recruiter partner API credentials required for direct ingestion.',
    officialApiSupported: false,
    complianceNotice: 'Requires authorized API token or direct candidate manual link submission.'
  },
  {
    id: 'src-workday',
    platform: 'workday',
    name: 'Workday Candidate Portal',
    category: 'ATS Platform',
    status: 'auth_required',
    statusDetails: 'Authentication required. Requires enterprise candidate portal login credentials.',
    officialApiSupported: false,
    complianceNotice: 'Human intervention required for SSO/MFA authentication challenges.'
  },
  {
    id: 'src-ashby',
    platform: 'ashby',
    name: 'Ashby HQ',
    category: 'ATS Platform',
    status: 'connection_required',
    statusDetails: 'Connection required. Public feed configured for select target startups.',
    officialApiSupported: true,
    complianceNotice: 'Public JSON endpoints supported for authorized company slugs.'
  },
  {
    id: 'src-foundit',
    platform: 'foundit',
    name: 'Foundit (formerly Monster)',
    category: 'Job Board',
    status: 'connection_required',
    statusDetails: 'Connection required. Partner feed integration currently unconfigured.',
    officialApiSupported: false,
    complianceNotice: 'Feed adapter ready once API credentials are provided in settings.'
  }
];

export const initialJobs: Job[] = [
  {
    id: 'job-cortex-1',
    title: 'Senior AI Applications Engineer',
    company: 'Cortex Labs',
    location: 'Remote (US & Canada)',
    type: 'Remote',
    workplace_type: 'remote',
    salary: '$165,000 - $185,000',
    salaryMin: 165000,
    salaryMax: 185000,
    employment_type: 'Full-time',
    source: 'Greenhouse Public API',
    source_platform: 'greenhouse',
    source_job_id: 'gh-cortex-9021',
    url: 'https://boards.greenhouse.io/cortexlabs/jobs/9021',
    postedDate: '2 hours ago',
    posted_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    discovered_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    freshness: '<24 hours',
    description:
      'Cortex Labs is seeking a Senior AI Applications Engineer to architect next-generation enterprise workflows powered by LLMs. You will lead the development of high-reliability TypeScript/Next.js interfaces that interact directly with Gemini and multimodal model backends. You will collaborate with product designers to create delightful, low-latency AI interactions.',
    requirements: [
      '5+ years of full-stack engineering experience with strong proficiency in TypeScript and React/Next.js.',
      'Hands-on experience integrating generative AI models (Gemini, Claude, or OpenAI) into production environments.',
      'Solid experience with modern database systems (PostgreSQL, Prisma, Redis) and REST/GraphQL APIs.',
      'Proven ability to design clean system architectures and mentor other engineers.'
    ],
    responsibilities: [
      'Architect and ship core AI workflow features in Next.js and TypeScript.',
      'Design robust fallback logic and error handling around model rate limits and structured outputs.',
      'Establish continuous deployment pipelines with automated linting, testing, and Docker builds.'
    ],
    stage: 'ready_for_review',
    match: {
      matchScore: 92,
      fitLevel: 'Strong Match',
      decision: 'APPLY',
      reasons: [
        'Direct alignment: Verified 6+ years experience in TypeScript, Next.js, and generative AI APIs.',
        'Proven track record of saving users 35+ hours/wk with automated LLM document workflows at TechPulse.',
        'Matches location preference: 100% Remote flexibility.',
        'Salary range ($165k-$185k) comfortably exceeds your $140,000 minimum preference.'
      ],
      gaps: ['No specific mention of GraphQL in recent roles, but verified REST API expertise transfers immediately.'],
      strengths: [
        'Verified Next.js 14 architecture experience',
        'Production Gemini API & LLM integration',
        'TypeScript and component design leadership',
        'Demonstrated performance profiling and mentoring'
      ],
      missingKeywords: [],
      skillGaps: [],
      breakdown: {
        skillsMatch: 95,
        experienceMatch: 92,
        locationMatch: 100,
        salaryMatch: 90,
        roleMatch: 95,
        industryMatch: 90,
        seniorityMatch: 90
      },
      constraintViolations: [],
      recommendation: 'Top recommendation: Prepare application immediately. Emphasize your Next.js migration and LLM workflow achievements.',
      analyzedAt: new Date().toISOString().split('T')[0]
    },
    tailoredApp: {
      coverLetter: `Dear Hiring Team at Cortex Labs,

I am writing to express my strong enthusiasm for the Senior AI Applications Engineer role at Cortex Labs. Having spent the past 6+ years architecting web applications and deploying generative AI capabilities into production at TechPulse Solutions, I was energized to see Cortex Labs pushing the frontier of enterprise LLM workflows.

My background aligns directly with what you are building:
• Production AI Integration: At TechPulse, I integrated generative AI document workflows that automated complex client tasks and saved teams 35+ hours every week.
• Next.js & TypeScript Mastery: I led our frontend migration to Next.js 14 and server components, cutting page load speeds by 42% while establishing rigorous TypeScript safety standards.
• Distributed Architecture: At CloudScale Inc., I engineered Node.js and PostgreSQL services supporting 1.2M monthly active users with 99.95% uptime.

I admire Cortex Labs' focus on high-fidelity, low-latency AI interactions and would welcome the opportunity to discuss how my verified engineering background can accelerate your upcoming roadmap.

Sincerely,
Alex Rivera
alex.rivera@example.com`,
      tailoredSummary:
        'Senior Full Stack Engineer with 6+ years of verified expertise in TypeScript, Next.js, and production Gemini API integrations. Proven history of speeding up frontend performance by 42% and building scalable microservices serving 1.2M+ users.',
      suggestedBulletPoints: [
        'Architected production generative AI assistants using Gemini APIs, reducing recurring manual document processing time by 35+ hours weekly.',
        'Spearheaded frontend architecture overhaul using Next.js 14, driving 42% gains in initial render velocity and Core Web Vitals.',
        'Championed engineering rigor across TypeScript typing, automated CI/CD with Docker, and mentored 5 engineers.'
      ],
      outreachEmail:
        'Subject: Alex Rivera - Application for Senior AI Applications Engineer\n\nHi Cortex Labs Recruiting Team,\n\nI recently applied for the Senior AI Applications Engineer position. Given my background deploying generative AI workflows in Next.js and building high-scale services for 1.2M+ users, I was thrilled to find this role.\n\nI would love to connect briefly whenever convenient. My verified portfolio is available at https://alexrivera.dev.\n\nBest regards,\nAlex Rivera',
      keyTalkingPoints: [
        'How our TechPulse AI document workflow handled prompt optimization and fallback recovery gracefully.',
        'Strategies for optimizing Next.js 14 server components when streaming model tokens to the client.',
        'Past experience scaling PostgreSQL and Redis microservices under heavy concurrent traffic.'
      ],
      screeningAnswers: [
        {
          question: 'How many years of experience do you have building production applications with TypeScript and React/Next.js?',
          answer: 'I have 6 years of professional experience building web applications, with extensive production experience in TypeScript and React/Next.js as verified from my roles at TechPulse Solutions and CloudScale Inc.',
          evidenceQuote: 'Led frontend architecture migration to Next.js 14, improving page load speeds by 42%.',
          isVerified: true
        },
        {
          question: 'Please describe a specific project where you integrated LLMs or Generative AI APIs.',
          answer: 'At TechPulse Solutions, I integrated generative AI assistants for automated document workflows that saved users 35+ hours weekly, implementing strict schema validation and error fallback handling.',
          evidenceQuote: 'Integrated generative AI assistants for automated document workflows, saving users 35+ hours weekly.',
          isVerified: true
        },
        {
          question: 'Are you legally authorized to work in the United States?',
          answer: 'Yes, I am authorized to work in the United States without sponsorship requirements.',
          evidenceQuote: 'Verified from candidate profile preferences.',
          isVerified: true
        }
      ],
      status: 'pending_approval',
      updatedAt: new Date().toISOString().split('T')[0]
    }
  },
  {
    id: 'job-synthetix-2',
    title: 'AI Operations & Systems Lead',
    company: 'Synthetix AI',
    location: 'Remote',
    type: 'Remote',
    workplace_type: 'remote',
    salary: '$170,000 - $195,000',
    salaryMin: 170000,
    salaryMax: 195000,
    employment_type: 'Full-time',
    source: 'Lever Public API',
    source_platform: 'lever',
    source_job_id: 'lev-synthetix-4412',
    url: 'https://jobs.lever.co/synthetix/4412',
    postedDate: '14 hours ago',
    posted_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    discovered_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    freshness: '<24 hours',
    description:
      'Synthetix AI is hiring an AI Operations & Systems Lead to oversee the reliability, telemetry, and evaluation pipelines of our autonomous AI agent infrastructure. You will bridge software engineering with agentic operations, ensuring model responses adhere strictly to verified constraints and privacy policies.',
    requirements: [
      'Demonstrated experience in software engineering, CI/CD systems, and cloud environments (Docker/GCP/AWS).',
      'Knowledge of prompt evaluation, LLM guardrails, and telemetry monitoring.',
      'Strong communication skills and experience establishing operational standards across teams.'
    ],
    responsibilities: [
      'Build automated evaluation suites for LLM outputs.',
      'Maintain uptime and observability of agentic background workers.',
      'Collaborate with product operations to resolve edge cases in production.'
    ],
    stage: 'applied',
    appliedDate: '2026-09-18',
    match: {
      matchScore: 88,
      fitLevel: 'Strong Match',
      decision: 'APPLY',
      reasons: [
        'Direct match for your secondary target role group: AI Operations & Product.',
        'Verified CI/CD pipeline automation and Docker experience at CloudScale Inc.',
        '100% remote workspace alignment and compensation matching target bracket.'
      ],
      gaps: ['Telemetry stack mentions Datadog specifically; your profile highlights Prometheus/Redis.'],
      strengths: ['Agent evaluation systems knowledge', 'CI/CD deployment speedup record', 'Cross-functional leadership'],
      missingKeywords: [],
      skillGaps: [],
      breakdown: {
        skillsMatch: 86,
        experienceMatch: 90,
        locationMatch: 100,
        salaryMatch: 92,
        roleMatch: 88,
        industryMatch: 90,
        seniorityMatch: 88
      },
      constraintViolations: [],
      recommendation: 'Strong opportunity. Application submitted on 2026-09-18. Monitor for recruiter response.',
      analyzedAt: '2026-09-18'
    }
  },
  {
    id: 'job-nova-3',
    title: 'Full Stack Engineer - Platform Team',
    company: 'Nova Cloud',
    location: 'San Francisco, CA / Remote',
    type: 'Hybrid',
    workplace_type: 'hybrid',
    salary: '$150,000 - $175,000',
    salaryMin: 150000,
    salaryMax: 175000,
    employment_type: 'Full-time',
    source: 'Company Careers Feed',
    source_platform: 'company_careers',
    source_job_id: 'nova-career-88',
    url: 'https://novacloud.io/careers/platform-engineer',
    postedDate: '2 days ago',
    posted_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    discovered_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    freshness: '<3 days',
    description:
      'Nova Cloud is looking for a Full Stack Engineer to join our Platform Team. You will build developer interfaces, metrics consoles, and API routing microservices in TypeScript, Next.js, and PostgreSQL.',
    requirements: [
      '4+ years building responsive web platforms with React and Node.js.',
      'Deep understanding of relational databases (PostgreSQL) and caching strategies (Redis).',
      'Location: San Francisco hybrid (2 days/mo) or US Remote.'
    ],
    responsibilities: [
      'Deliver core platform dashboard features with real-time telemetry.',
      'Maintain sub-100ms API endpoints.'
    ],
    stage: 'interview',
    appliedDate: '2026-09-15',
    interviewDate: '2026-09-24 at 2:00 PM PST',
    notes: 'Technical screen scheduled with Engineering Manager (Sarah Lin). Review Redis caching architectures.',
    match: {
      matchScore: 84,
      fitLevel: 'Strong Match',
      decision: 'APPLY',
      reasons: [
        'Direct stack match: TypeScript, React, PostgreSQL, and Redis.',
        'Location aligns with San Francisco / Remote hybrid preferences.'
      ],
      gaps: [],
      strengths: ['PostgreSQL microservices at scale', 'Real-time WebSocket/Redis expertise'],
      missingKeywords: [],
      skillGaps: [],
      breakdown: {
        skillsMatch: 90,
        experienceMatch: 85,
        locationMatch: 90,
        salaryMatch: 85,
        roleMatch: 82,
        industryMatch: 85,
        seniorityMatch: 85
      },
      constraintViolations: [],
      recommendation: 'Active interview in progress. Focus prep on distributed microservices and database indexing.',
      analyzedAt: '2026-09-15'
    }
  },
  {
    id: 'job-flowstate-4',
    title: 'Product Operations Manager',
    company: 'Flowstate Workflows',
    location: 'Remote',
    type: 'Remote',
    workplace_type: 'remote',
    salary: '$135,000 - $150,000',
    salaryMin: 135000,
    salaryMax: 150000,
    employment_type: 'Full-time',
    source: 'Greenhouse Public API',
    source_platform: 'greenhouse',
    source_job_id: 'flow-gh-103',
    url: 'https://boards.greenhouse.io/flowstate/jobs/103',
    postedDate: '3 days ago',
    posted_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    discovered_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    freshness: '<3 days',
    description:
      'Flowstate Workflows is hiring a Product Operations Manager to streamline technical triage, product requirements scoping, and automated tooling between our customer success and engineering groups.',
    requirements: [
      '3+ years in product operations, technical program management, or software engineering.',
      'Strong analytical abilities, process design skills, and empathy for developer workflows.',
      'Familiarity with Jira, GitHub, and data analysis.'
    ],
    responsibilities: [
      'Analyze workflow bottlenecks and define operational SOPs.',
      'Bridge engineering prioritization with enterprise customer feedback.'
    ],
    stage: 'saved',
    match: {
      matchScore: 76,
      fitLevel: 'Good Match',
      decision: 'REVIEW',
      reasons: [
        'Matches your target role group: Product Operations.',
        'Engineering background is a major differentiator for technical product operations.'
      ],
      gaps: [
        'Compensation ($135k-$150k) is at the threshold of your $140,000 minimum salary preference.',
        'Role focuses heavily on business process workflows rather than hands-on code development.'
      ],
      strengths: ['Deep technical understanding of software development lifecycle', 'Experience leading cross-functional squads'],
      missingKeywords: ['Jira administration'],
      skillGaps: ['Formal product operations certifications'],
      breakdown: {
        skillsMatch: 75,
        experienceMatch: 80,
        locationMatch: 100,
        salaryMatch: 70,
        roleMatch: 75,
        industryMatch: 80,
        seniorityMatch: 75
      },
      constraintViolations: [],
      recommendation: 'Review opportunity: High fit if seeking a pivot toward product leadership. Requires careful consideration of compensation.',
      analyzedAt: new Date().toISOString().split('T')[0]
    }
  },
  {
    id: 'job-deepmetric-5',
    title: 'Lead Data Infrastructure Architect',
    company: 'DeepMetric Systems',
    location: 'New York, NY',
    type: 'Full-time',
    workplace_type: 'onsite',
    salary: '$190,000 - $220,000',
    salaryMin: 190000,
    salaryMax: 220000,
    employment_type: 'Full-time',
    source: 'Company Careers Feed',
    source_platform: 'company_careers',
    source_job_id: 'dm-arch-55',
    url: 'https://deepmetric.ai/careers/lead-data-architect',
    postedDate: '5 days ago',
    posted_at: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
    discovered_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    freshness: '<7 days',
    description:
      'DeepMetric Systems is hiring a Lead Data Infrastructure Architect to build multi-petabyte real-time data pipelines using Apache Spark, Kafka clusters, Snowflake, and Kubernetes.',
    requirements: [
      '8+ years specialized in large-scale data engineering, streaming architectures, and distributed systems.',
      'Expertise in Apache Kafka, Spark, Flink, and Snowflake data warehousing.',
      'On-site presence required at our Manhattan headquarters.'
    ],
    responsibilities: [
      'Design high-throughput distributed ingestion pipelines processing 100k+ events/sec.'
    ],
    stage: 'discovered',
    match: {
      matchScore: 62,
      fitLevel: 'Moderate Match',
      decision: 'SKIP',
      reasons: ['Strong compensation bracket and established engineering brand.'],
      gaps: [
        'Mandatory on-site New York location violates your remote workspace preference.',
        'Requires 8+ years focused in streaming data platforms (Spark, Kafka, Flink) which are not substantiated in your verified resume.'
      ],
      strengths: ['General cloud infrastructure familiarity'],
      missingKeywords: ['Apache Kafka', 'Apache Spark', 'Snowflake', 'Flink'],
      skillGaps: ['Petabyte-scale distributed data engineering'],
      breakdown: {
        skillsMatch: 45,
        experienceMatch: 60,
        locationMatch: 50,
        salaryMatch: 95,
        roleMatch: 60,
        industryMatch: 80,
        seniorityMatch: 65
      },
      constraintViolations: ['On-site requirement conflicts with remote preference', 'Substantial specialized experience disparity'],
      recommendation: 'Skipped by rule: Location constraint violation and specialized data infrastructure requirements not present in profile.',
      analyzedAt: new Date().toISOString().split('T')[0]
    }
  },
  {
    id: 'job-enterprise-6',
    title: 'Senior Solutions Developer (Workday Portal)',
    company: 'Enterprise Horizon Corp',
    location: 'Remote (US)',
    type: 'Remote',
    workplace_type: 'remote',
    salary: '$155,000 - $170,000',
    salaryMin: 155000,
    salaryMax: 170000,
    employment_type: 'Full-time',
    source: 'Workday Candidate Portal',
    source_platform: 'workday',
    source_job_id: 'wd-horiz-302',
    url: 'https://enterprisehorizon.wd1.myworkdayjobs.com/Careers/job/302',
    postedDate: '1 day ago',
    posted_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    discovered_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    freshness: '<24 hours',
    description:
      'Enterprise Horizon Corp is seeking a Senior Solutions Developer to architect custom integrations between customer web portals and backend ERP services.',
    requirements: [
      '5+ years web application development with Node.js and TypeScript.',
      'Experience with enterprise identity systems (OAuth2, SAML, Workday API).'
    ],
    responsibilities: ['Build enterprise connectors and maintain secure candidate portal services.'],
    stage: 'needs_human_action',
    match: {
      matchScore: 82,
      fitLevel: 'Strong Match',
      decision: 'APPLY',
      reasons: [
        'Verified TypeScript, Node.js, and API security expertise.',
        'Remote position matching salary requirements.'
      ],
      gaps: [],
      strengths: ['TypeScript microservices', 'Enterprise API integration'],
      missingKeywords: [],
      skillGaps: [],
      breakdown: {
        skillsMatch: 85,
        experienceMatch: 85,
        locationMatch: 100,
        salaryMatch: 85,
        roleMatch: 80,
        industryMatch: 80,
        seniorityMatch: 85
      },
      constraintViolations: [],
      recommendation: 'Strong opportunity. Prepared application is waiting for user authentication on Workday portal.',
      analyzedAt: new Date().toISOString().split('T')[0]
    }
  }
];

export const initialApplications: ApplicationRecord[] = [
  {
    id: 'app-1',
    jobId: 'job-cortex-1',
    job: initialJobs[0],
    stage: 'ready_for_review',
    tailoredApp: initialJobs[0].tailoredApp!,
    createdAt: '2026-09-21T08:06:00.000Z',
    updatedAt: '2026-09-21T08:06:00.000Z',
    outcomes: []
  },
  {
    id: 'app-2',
    jobId: 'job-synthetix-2',
    job: initialJobs[1],
    stage: 'applied',
    tailoredApp: {
      coverLetter: 'Application submitted via Lever API.',
      tailoredSummary: 'AI Operations and Systems Lead application.',
      suggestedBulletPoints: ['CI/CD pipeline automation and Docker telemetry.'],
      outreachEmail: '',
      keyTalkingPoints: [],
      status: 'approved',
      updatedAt: '2026-09-18'
    },
    appliedDate: '2026-09-18',
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z',
    outcomes: [
      {
        status: 'applied',
        date: '2026-09-18',
        notes: 'Submitted via Lever job portal.'
      }
    ]
  },
  {
    id: 'app-3',
    jobId: 'job-nova-3',
    job: initialJobs[2],
    stage: 'interview',
    tailoredApp: {
      coverLetter: 'Tailored application submitted for Nova Cloud Platform Team.',
      tailoredSummary: 'Full Stack Engineer with PostgreSQL/Redis specialization.',
      suggestedBulletPoints: ['Engineered microservices for 1.2M users.'],
      outreachEmail: '',
      keyTalkingPoints: [],
      status: 'approved',
      updatedAt: '2026-09-15'
    },
    appliedDate: '2026-09-15',
    interviewDate: '2026-09-24 at 2:00 PM PST',
    notes: 'Technical screen scheduled with Engineering Manager Sarah Lin.',
    createdAt: '2026-09-15T09:00:00.000Z',
    updatedAt: '2026-09-19T14:30:00.000Z',
    outcomes: [
      {
        status: 'applied',
        date: '2026-09-15'
      },
      {
        status: 'recruiter_response',
        date: '2026-09-17',
        notes: 'Recruiter reached out to coordinate technical screening.'
      },
      {
        status: 'interview',
        date: '2026-09-19',
        interviewRound: 'Technical Round 1 (System Architecture)',
        notes: 'Confirmed for Sep 24 at 2:00 PM.'
      }
    ]
  },
  {
    id: 'app-4',
    jobId: 'job-enterprise-6',
    job: initialJobs[5],
    stage: 'needs_human_action',
    humanActionRequired: {
      reason: 'Workday Portal Login / OTP Required',
      details: 'Workday candidate portal requires individual user authentication credentials and MFA challenge.',
      blockingField: 'password_and_mfa'
    },
    tailoredApp: {
      coverLetter: 'Prepared cover letter emphasizing enterprise API security and TypeScript.',
      tailoredSummary: 'Senior Solutions Developer with enterprise system integration experience.',
      suggestedBulletPoints: ['Secure API architecture', 'OAuth2/SAML experience'],
      outreachEmail: '',
      keyTalkingPoints: [],
      status: 'pending_approval',
      updatedAt: '2026-09-21'
    },
    createdAt: '2026-09-21T08:07:00.000Z',
    updatedAt: '2026-09-21T08:07:00.000Z',
    outcomes: []
  }
];

export const initialSettings: UserSettings = {
  matchThresholds: {
    applyQueueMin: 80,
    reviewQueueMin: 65
  },
  dailyScheduleTime: '08:00',
  dailySearchFrequency: 'daily',
  maxApplicationsPreparedPerDay: 5,
  autoPrepareApplications: true,
  requireApprovalBeforeSubmission: true, // Mandatory in MVP
  notifications: {
    enabled: true,
    strongMatchesFound: true,
    applicationsReadyForReview: true,
    humanActionRequired: true,
    interviewDetected: true
  }
};

export const initialAgentEvents: AgentEvent[] = [
  {
    id: 'evt-1',
    timestamp: '2026-09-21T08:00:00.000Z',
    timeFormatted: '08:00 AM',
    type: 'info',
    title: 'Daily Search Initialized',
    message: 'Loaded verified candidate profile and active career preferences.'
  },
  {
    id: 'evt-2',
    timestamp: '2026-09-21T08:01:00.000Z',
    timeFormatted: '08:01 AM',
    type: 'search',
    title: 'Querying Connected Sources',
    message: 'Checked active feeds: Greenhouse Public API, Lever Public API, Company Career Pages.'
  },
  {
    id: 'evt-3',
    timestamp: '2026-09-21T08:02:00.000Z',
    timeFormatted: '08:02 AM',
    type: 'search',
    title: 'Jobs Ingested',
    message: '24 candidate openings discovered matching role keywords (AI Applications, Full Stack, Operations).'
  },
  {
    id: 'evt-4',
    timestamp: '2026-09-21T08:03:00.000Z',
    timeFormatted: '08:03 AM',
    type: 'dedup',
    title: 'Deduplication Executed',
    message: '6 duplicate postings filtered out using canonical URL and company+title fingerprinting. 18 unique jobs remaining.'
  },
  {
    id: 'evt-5',
    timestamp: '2026-09-21T08:04:00.000Z',
    timeFormatted: '08:04 AM',
    type: 'analysis',
    title: 'Deterministic & AI Match Analysis',
    message: 'Analyzed 18 postings against verified skills, experience depth, and location preferences.'
  },
  {
    id: 'evt-6',
    timestamp: '2026-09-21T08:05:00.000Z',
    timeFormatted: '08:05 AM',
    type: 'match',
    title: 'Opportunity Prioritization',
    message: 'Prioritized 3 strong matches (≥80%): Cortex Labs (92%), Synthetix AI (88%), Enterprise Horizon (82%). 2 skipped by location/experience rule.'
  },
  {
    id: 'evt-7',
    timestamp: '2026-09-21T08:06:00.000Z',
    timeFormatted: '08:06 AM',
    type: 'prep',
    title: 'Application Prepared',
    message: 'Generated verified cover letter and screening answers for Senior AI Applications Engineer (Cortex Labs).'
  },
  {
    id: 'evt-8',
    timestamp: '2026-09-21T08:07:00.000Z',
    timeFormatted: '08:07 AM',
    type: 'human_action',
    title: 'Human Action Required',
    message: 'Workday candidate portal requires user login & MFA challenge for Enterprise Horizon Corp. Flagged for review.'
  },
  {
    id: 'evt-9',
    timestamp: '2026-09-21T08:08:00.000Z',
    timeFormatted: '08:08 AM',
    type: 'review',
    title: 'Daily Agent Run Complete',
    message: 'Agent completed daily cycle: 1 application is in "Ready for Review", 1 requires your login input.'
  }
];
