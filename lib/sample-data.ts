import { UserProfile, Job } from './types';

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
    'CI/CD Pipelines'
  ],
  summary:
    'Full-stack engineer with 6+ years building scalable, user-centric web applications and AI-driven products. Proven track record of architecting responsive frontends and resilient backends.',
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
AI/ML: Gemini API, OpenAI SDK, Prompt Tuning, RAG architectures
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
        'Built Node.js microservices handling 1.2M monthly active users.',
        'Automated CI/CD deployments reducing delivery friction by 60%.',
        'Developed interactive analytics dashboards with real-time streaming data.'
      ]
    }
  ],
  education: 'B.S. in Computer Science - UC Berkeley',
  portfolioUrl: 'https://alexrivera.dev',
  linkedinUrl: 'https://linkedin.com/in/alexrivera',
  experienceCalculatedText: '5 years 8 months experience',
  verificationStatus: 'verified',
  documentQuality: {
    documentType: 'text_pdf',
    isMultiColumn: true,
    qualityWarning: null,
    overallConfidence: 'high',
  },
  structuredProfile: {
    personal: {
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA (Open to Remote)',
      linkedin: 'https://linkedin.com/in/alexrivera',
      portfolio: 'https://alexrivera.dev',
    },
    professional_summary:
      'Results-driven Senior Full Stack Engineer with 6 years of experience shipping high-impact web products and generative AI capabilities. Expert in React, Next.js, TypeScript, Node.js, and modern cloud architectures.',
    current_role: {
      title: 'Staff Software Engineer',
      company: 'TechPulse Solutions',
      start_date: '2022',
      end_date: 'Present',
    },
    total_experience_years: 5.7,
    experience_formatted: '5 years 8 months experience',
    experience: [
      {
        id: 'exp-1',
        company: 'TechPulse Solutions',
        title: 'Staff Software Engineer',
        start_date: '2022',
        end_date: 'Present',
        responsibilities: [
          'Led frontend architecture migration to Next.js 14, improving page load speeds by 42%.',
          'Mentored 5 mid-level engineers in component design, TypeScript safety, and performance profiling.',
        ],
        achievements: [
          'Integrated generative AI assistants for automated document workflows, saving users 35+ hours weekly.',
        ],
        skills_used: ['TypeScript', 'Next.js', 'React', 'Gemini API'],
        confidence: 'high',
        source: 'VERIFIED FROM RESUME',
      },
      {
        id: 'exp-2',
        company: 'CloudScale Inc.',
        title: 'Full Stack Engineer',
        start_date: '2019',
        end_date: '2022',
        responsibilities: [
          'Designed and built distributed microservices in Node.js and PostgreSQL serving 1.2M monthly active users.',
          'Developed interactive analytics dashboards with real-time streaming data.',
        ],
        achievements: [
          'Automated CI/CD deployment pipelines using GitHub Actions and Docker, reducing release cycle by 60%.',
        ],
        skills_used: ['Node.js', 'PostgreSQL', 'Docker', 'CI/CD Pipelines'],
        confidence: 'high',
        source: 'VERIFIED FROM RESUME',
      },
    ],
    skills: [
      { id: 's-1', name: 'TypeScript', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 's-2', name: 'React / Next.js', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 's-3', name: 'Node.js', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 's-4', name: 'Python', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 's-5', name: 'REST & GraphQL APIs', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 's-6', name: 'Gemini API / LLM Prompt Engineering', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 's-7', name: 'PostgreSQL / Prisma', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 's-8', name: 'Tailwind CSS', confidence: 'high', source: 'VERIFIED FROM RESUME' },
    ],
    tools: [
      { id: 't-1', name: 'Docker', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 't-2', name: 'Git & GitHub Actions', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 't-3', name: 'Redis', confidence: 'high', source: 'VERIFIED FROM RESUME' },
      { id: 't-4', name: 'GCP (Google Cloud)', confidence: 'high', source: 'VERIFIED FROM RESUME' },
    ],
    industries: ['B2B SaaS', 'Developer Tools', 'AI Applications'],
    education: [
      {
        id: 'edu-1',
        institution: 'University of California, Berkeley',
        degree: 'B.S. in Computer Science',
        field_of_study: 'Computer Science',
        start_date: '2015',
        end_date: '2019',
        confidence: 'high',
      },
    ],
    certifications: [],
    projects: [
      {
        id: 'proj-1',
        name: 'Enterprise Document Intelligence Copilot',
        description: 'Automated document processing and multi-modal summarization system using Next.js and Gemini.',
        technologies: ['Next.js', 'TypeScript', 'Gemini API'],
        link: 'https://github.com/alexrivera',
        confidence: 'high',
      },
    ],
    languages: ['English'],
    explicit_preferences: {
      location: 'San Francisco, CA',
      remote_preference: 'Hybrid or Remote',
      salary: '$165,000+',
      notice_period: '2 weeks',
    },
    evidence_layer: [
      {
        claim: 'Proficiency in TypeScript and Next.js',
        evidence: 'Expert in React, Next.js, TypeScript, Node.js, and modern cloud architectures.',
        source_section: 'Summary',
        confidence: 'high',
      },
      {
        claim: 'Cloud & Docker CI/CD Architecture',
        evidence: 'Automated CI/CD deployment pipelines using GitHub Actions and Docker, reducing release cycle by 60%.',
        source_section: 'Experience (CloudScale Inc.)',
        confidence: 'high',
      },
    ],
    quality_assessment: {
      documentType: 'text_pdf',
      isMultiColumn: true,
      qualityWarning: null,
      overallConfidence: 'high',
    },
  },
};

export const initialJobs: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend & AI Applications Engineer',
    company: 'Apex AI Technologies',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    salaryRange: '$165,000 - $195,000',
    postedDate: '2 days ago',
    url: 'https://careers.apex-ai.example/sr-ai-eng',
    description:
      'We are looking for a Senior Frontend & AI Engineer to build next-generation AI agent interfaces. You will translate complex multi-modal LLM workflows into intuitive, lightning-fast web applications using Next.js, React 19, and TypeScript.',
    requirements: [
      '5+ years experience in TypeScript, React, and modern frontend frameworks',
      'Hands-on experience integrating LLM APIs (Gemini, Claude, or OpenAI)',
      'Deep understanding of state management, streaming UI responses, and accessible UX',
      'Solid grasp of backend REST/Node.js microservices'
    ],
    stage: 'discovered',
    match: {
      matchScore: 94,
      fitLevel: 'Strong Match',
      strengths: [
        'Direct alignment with Next.js, TypeScript, and modern React stack',
        'Extensive experience integrating generative AI workflows',
        '6 years of experience exceeds the 5+ years requirement'
      ],
      missingKeywords: ['Streaming UI / Server-Sent Events', 'Multi-modal UX'],
      skillGaps: ['Experience with enterprise streaming architectures'],
      recommendation:
        'Excellent fit. High likelihood of interview request if application emphasizes AI integration work at TechPulse.',
      analyzedAt: '2026-09-20'
    }
  },
  {
    id: 'job-2',
    title: 'Staff Full Stack Developer',
    company: 'NextWave Cloud Systems',
    location: 'Remote (US)',
    type: 'Remote',
    salaryRange: '$175,000 - $210,000',
    postedDate: 'Yesterday',
    url: 'https://nextwave.example/careers/staff-fullstack',
    description:
      'Seeking a seasoned Staff Full Stack Developer to spearhead our developer tools platform. You will design resilient Node.js services, optimize distributed Postgres databases, and build reactive web applications.',
    requirements: [
      '6+ years of full stack software engineering in production',
      'Proficiency in Node.js, TypeScript, and PostgreSQL',
      'Demonstrated experience with high-throughput cloud infrastructure (Docker, GCP/AWS)',
      'Leadership experience mentoring junior and mid-level software developers'
    ],
    stage: 'reviewing',
    match: {
      matchScore: 91,
      fitLevel: 'Strong Match',
      strengths: [
        'Strong production background in Node.js and PostgreSQL (1.2M MAU scale)',
        'Demonstrated mentorship and tech leadership at TechPulse',
        '6 years experience matches the Staff requirements'
      ],
      missingKeywords: ['Distributed Caching', 'High-throughput load testing'],
      skillGaps: ['Specific experience with multi-region database replication'],
      recommendation:
        'Strong match. Focus on your architectural ownership and database tuning in the cover letter.',
      analyzedAt: '2026-09-20'
    },
    tailoredApp: {
      coverLetter: `Dear Hiring Team at NextWave Cloud Systems,

I am writing to express my enthusiastic interest in the Staff Full Stack Developer role. With 6 years of experience building high-performance web systems and developer-centric tools, I have architected distributed Node.js microservices serving over 1.2 million active users and led frontend migrations that sped up response times by 42%.

At TechPulse Solutions and CloudScale Inc., I spearheaded database optimization on PostgreSQL, automated CI/CD pipelines with Docker and GCP, and mentored cohorts of engineers in clean TypeScript architecture. NextWave's mission to empower developers with resilient cloud primitives resonates deeply with my background.

I would welcome the opportunity to discuss how my hands-on architecture experience and leadership can accelerate your product roadmap.

Sincerely,
Alex Rivera`,
      tailoredSummary:
        'Staff-caliber Full Stack Engineer with 6 years experience specializing in high-throughput Node.js microservices, PostgreSQL scaling, and developer infrastructure.',
      suggestedBulletPoints: [
        'Architected distributed Node.js microservices handling 1.2M+ MAU with 99.98% uptime.',
        'Spearheaded automated CI/CD deployments via Docker and GCP, slashing release cycles by 60%.',
        'Mentored 5 engineers in type safety, database index tuning, and resilient service patterns.'
      ],
      outreachEmail: `Subject: Alex Rivera - Staff Full Stack Developer application (NextWave)

Hi NextWave Hiring Team,

I just reviewed the Staff Full Stack Developer role and was energized by your focus on resilient developer tools. Over the past 6 years, I've architected distributed Node.js services for 1.2M users and led core platform migrations.

I've submitted my tailored application and would love to connect for 10 minutes to discuss how my background aligns with your technical goals.

Best regards,
Alex Rivera`,
      keyTalkingPoints: [
        'High-scale database indexing and query optimization on PostgreSQL',
        'Mentorship approach and cross-functional engineering alignment',
        'Pragmatic architectural tradeoffs between speed-to-market and resilience'
      ],
      status: 'pending_approval',
      updatedAt: '2026-09-21'
    }
  },
  {
    id: 'job-3',
    title: 'Lead Product Engineer (Frontend & Systems)',
    company: 'FinVibe Technologies',
    location: 'New York, NY / Remote',
    type: 'Hybrid',
    salaryRange: '$170,000 - $200,000',
    postedDate: '3 days ago',
    url: 'https://finvibe.example/jobs/lead-product-eng',
    description:
      'FinVibe is reinventing modern financial analytics. We need a Lead Product Engineer who can bridge customer insights with pixel-perfect web interfaces, real-time charts, and secure transaction workflows.',
    requirements: [
      '5+ years building customer-facing web products',
      'Mastery of React, TypeScript, and modern CSS/Tailwind',
      'Experience with data visualization (D3, Recharts, or Canvas)',
      'Understanding of security and fintech compliance is a plus'
    ],
    stage: 'approved',
    match: {
      matchScore: 87,
      fitLevel: 'Good Match',
      strengths: [
        'Mastery of React, TypeScript, and Tailwind CSS',
        'Experience building real-time dashboard analytics with WebSockets',
        'Strong customer-centric product mindset'
      ],
      missingKeywords: ['Fintech compliance', 'SOC2 / PCI protocols'],
      skillGaps: ['Direct financial domain experience'],
      recommendation:
        'Great product fit. Approved by user; application package is customized and ready to submit.',
      analyzedAt: '2026-09-19'
    },
    tailoredApp: {
      coverLetter: `Dear FinVibe Team,

I am excited to submit my application for the Lead Product Engineer role at FinVibe. Throughout my 6 years as a software engineer, I have focused on building web applications that turn complex, high-velocity data into clean, actionable user experiences.

At CloudScale and TechPulse, I architected interactive analytics dashboards leveraging real-time WebSockets and responsive charting. I pair deep TypeScript and React craftsmanship with rigorous attention to detail and data integrity.

Thank you for your consideration, and I look forward to exploring how I can contribute to FinVibe's rapid growth.

Warm regards,
Alex Rivera`,
      tailoredSummary:
        'Product-minded Senior Engineer experienced in complex data visualization, real-time dashboards, and high-conversion web interfaces.',
      suggestedBulletPoints: [
        'Engineered real-time data visualizers and analytics dashboards with sub-100ms latency.',
        'Migrated core web applications to modern React architecture, boosting performance by 42%.',
        'Partnered closely with product and design to iterate on high-retention customer workflows.'
      ],
      outreachEmail: `Subject: Alex Rivera - Application for Lead Product Engineer

Hi FinVibe Talent Team,

I recently submitted my application for the Lead Product Engineer position. Having built real-time analytics dashboards and high-fidelity React platforms for 6+ years, I am inspired by FinVibe's product vision.

Looking forward to connecting!

Best,
Alex`,
      keyTalkingPoints: [
        'Optimizing visual rendering of dense financial charts',
        'Ensuring client-side state reliability during network fluctuations'
      ],
      status: 'approved',
      updatedAt: '2026-09-20'
    }
  },
  {
    id: 'job-4',
    title: 'Senior Software Engineer - AI Agents',
    company: 'CognitiveSphere Labs',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salaryRange: '$180,000 - $220,000',
    postedDate: '5 days ago',
    url: 'https://cognitivesphere.example/careers',
    description:
      'Join our core agents team to build autonomous and human-in-the-loop AI agents for knowledge workers. We need engineers skilled in tool-calling, evaluation harnesses, and full stack execution.',
    requirements: [
      'Strong proficiency in Python or TypeScript',
      'Experience building agentic pipelines or structured outputs with LLMs',
      'Solid foundations in system design, caching, and rate limiting'
    ],
    stage: 'applied',
    appliedDate: '2026-09-18',
    match: {
      matchScore: 92,
      fitLevel: 'Strong Match',
      strengths: [
        'Direct experience building AI agent workflows and tool orchestration',
        'Dual proficiency in TypeScript and Python',
        'Strong background in system design and caching'
      ],
      missingKeywords: ['Evaluation benchmarks', 'LangSmith / Tracing'],
      skillGaps: ['Automated LLM evaluation pipelines'],
      recommendation:
        'Applied on Sept 18. Follow up with hiring manager if no response by Sept 25.',
      analyzedAt: '2026-09-18'
    },
    tailoredApp: {
      coverLetter: `Dear CognitiveSphere Hiring Team,

I am writing to apply for the Senior Software Engineer - AI Agents role. Building reliable, human-in-the-loop AI agents is the most exciting frontier in software today. Over the past several years, I have architected generative workflows utilizing modern LLMs, strict structured outputs, and responsive web UIs.

I would love to help CognitiveSphere push the boundaries of agent capability.

Best regards,
Alex Rivera`,
      tailoredSummary:
        'Engineer specializing in agentic systems, prompt optimization, structured LLM outputs, and resilient cloud backends.',
      suggestedBulletPoints: [
        'Integrated multi-turn generative AI workflows saving 35+ hours weekly for end users.',
        'Engineered caching and rate-limiting middleware to keep LLM token costs down by 30%.'
      ],
      outreachEmail: `Hi CognitiveSphere Team,

Following up on my application for the AI Agents role. I'd love to share some insights on structured tool-calling architecture whenever convenient.

Best,
Alex`,
      keyTalkingPoints: ['Tool calling schemas', 'Deterministic error recovery'],
      status: 'approved',
      updatedAt: '2026-09-18'
    }
  }
];
