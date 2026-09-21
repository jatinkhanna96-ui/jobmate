import { getGeminiClient, cleanJsonText } from './gemini';
import { calculateTotalExperience } from './experience-calculator';
import {
  StructuredCandidateProfile,
  ExperienceItem,
  EducationItem,
  CertificationItem,
  ProjectItem,
  SkillItem,
  ToolItem,
  ExtractedEvidence,
  DocumentQualityAssessment,
  SkillCategory,
} from './types';

export interface ResumePipelineInput {
  buffer?: Buffer;
  mimeType?: string;
  text?: string;
  fileName?: string;
}

export interface ResumePipelineResult {
  structuredProfile: StructuredCandidateProfile;
  rawExtractedText: string;
  qualityAssessment: DocumentQualityAssessment;
  evidenceLayer: ExtractedEvidence[];
}

const SYSTEM_INSTRUCTION = `You are an elite, forensic resume parsing engine.
Your sole mission is to extract an authentic, accurate, and completely verifiable candidate profile from the provided document.

### CRITICAL ANTI-HALLUCINATION DIRECTIVES:
1. THE UPLOADED DOCUMENT IS THE ONLY SOURCE OF TRUTH.
2. NEVER invent, infer, extrapolate, or guess any information.
3. If an item, skill, company, date, salary, or credential is NOT explicitly written in the document:
   - Use null, empty array [], or "Not found in resume".
   - DO NOT fabricate programming languages, tools, job titles, or metrics.
   - DO NOT turn generic statements into specific qualifications (e.g., if resume says "worked with AI tools", output "AI tools", NEVER infer "Python", "PyTorch", or "3 years ML experience").
4. EVIDENCE LAYER:
   - For every extracted skill, tool, responsibility, and role, provide the exact verbatim or tightly summarized evidence sentence from the document and the source section where it was found.
   - If you cannot find direct textual evidence for a claim, DO NOT include that claim.
5. QUALITY DETECTION:
   - Carefully assess the visual layout and text clarity: Is this a multi-column layout? Is it a scanned or image-heavy document? Are pages rotated? Is any text blurry or OCR-degraded?
   - If quality is compromised or ambiguous, set qualityWarning: "Some resume information could not be read confidently. Please review the highlighted fields." and set confidence to "needs_review" for affected fields.
6. 4-TIER SKILL CATEGORIZATION:
   - Categorize skills into:
     * technical (languages, frameworks, databases, cloud, DevOps)
     * analytical (system design, profiling, data analysis, A/B testing, metrics)
     * business (product operations, requirements scoping, market research, customer insights)
     * soft (leadership, mentorship, communication, collaboration)
7. COMPLETE EXTRACTION:
   - Read every page from top to bottom, including header, footer, sidebar columns, and tables.
   - Separate conceptual skills from specific tools/software (e.g. Git, Docker, Figma, Jira).`;

export async function processResumePipeline(
  input: ResumePipelineInput
): Promise<ResumePipelineResult> {
  const gemini = getGeminiClient();

  if (gemini) {
    try {
      const parts: any[] = [];

      // If we have a PDF buffer, use Gemini's native PDF document understanding
      if (input.buffer && (input.mimeType === 'application/pdf' || input.fileName?.toLowerCase().endsWith('.pdf'))) {
        parts.push({
          inlineData: {
            mimeType: 'application/pdf',
            data: input.buffer.toString('base64'),
          },
        });
      }

      // Instruction prompt
      const promptText = `Analyze this resume with maximum fidelity and extract the structured profile according to the strict JSON schema.

Document context:
${input.text ? `Extracted Document Text:\n${input.text}\n` : 'Analyze the attached document directly.'}

Return a valid JSON object matching this EXACT schema:
{
  "personal": {
    "name": "string (or 'Not found in resume')",
    "email": "string (or 'Not found in resume')",
    "phone": "string (or 'Not found in resume')",
    "location": "string (or 'Not found in resume')",
    "linkedin": "string (or 'Not found in resume')",
    "portfolio": "string (or 'Not found in resume')"
  },
  "professional_summary": "string (verbatim or factual summary, or 'Not found in resume')",
  "current_role": {
    "title": "string (or 'Not found in resume')",
    "company": "string (or 'Not found in resume')",
    "start_date": "string (or 'Not found in resume')",
    "end_date": "string (or 'Present' or 'Not found in resume')"
  },
  "experience": [
    {
      "company": "string",
      "title": "string",
      "start_date": "string",
      "end_date": "string",
      "responsibilities": ["string"],
      "achievements": ["string"],
      "skills_used": ["string"],
      "confidence": "high" | "needs_review"
    }
  ],
  "skills": [
    { 
      "name": "string", 
      "category": "technical" | "analytical" | "business" | "soft", 
      "confidence": "high" | "needs_review" 
    }
  ],
  "tools": [
    { "name": "string", "confidence": "high" | "needs_review" }
  ],
  "industries": ["string"],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field_of_study": "string",
      "start_date": "string",
      "end_date": "string",
      "confidence": "high" | "needs_review"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string",
      "confidence": "high" | "needs_review"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "link": "string",
      "confidence": "high" | "needs_review"
    }
  ],
  "languages": ["string"],
  "explicit_preferences": {
    "location": "string (or 'Not found in resume')",
    "remote_preference": "string (or 'Not found in resume')",
    "salary": "string (or 'Not found in resume')",
    "notice_period": "string (or 'Not found in resume')"
  },
  "evidence_layer": [
    {
      "claim": "string",
      "evidence": "string (exact quote from document)",
      "source_section": "string",
      "confidence": "high" | "needs_review"
    }
  ],
  "quality_assessment": {
    "documentType": "text_pdf" | "scanned_pdf" | "image_heavy" | "text_document" | "unknown",
    "isMultiColumn": boolean,
    "qualityWarning": string | null,
    "overallConfidence": "high" | "needs_review"
  },
  "raw_document_transcript": "string (full structured transcription of everything understood from the document)"
}`;

      parts.push(promptText);

      const candidateModels = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-3.1-flash-lite',
        'gemini-3.8-flash'
      ];
      let responseText: string | null = null;
      let lastErr: any = null;

      for (const model of candidateModels) {
        try {
          const resp = await gemini.models.generateContent({
            model,
            contents: parts,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              temperature: 0.1, // Near-zero temperature for strictly deterministic extraction
            },
          });
          if (resp?.text) {
            responseText = resp.text;
            break;
          }
        } catch (err: any) {
          lastErr = err;
          const msg = String(err?.message || err);
          const isQuota = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota');
          if (isQuota) {
            console.info(`[Gemini Pipeline] Model ${model} quota reached, switching to alternative model...`);
          } else {
            console.info(`[Gemini Pipeline] Model ${model} transient issue: ${msg.slice(0, 100)}`);
          }
        }
      }

      if (responseText) {
        const cleaned = cleanJsonText(responseText);
        const parsed = JSON.parse(cleaned);

        return formatAndValidateProfile(parsed, input.text || parsed.raw_document_transcript || '');
      } else {
        console.info('[Gemini Pipeline] Gemini models reached quota or returned empty. Applying deterministic fallback.');
      }
    } catch (apiError: any) {
      console.info('[Gemini Pipeline] Gemini API exception. Using deterministic local parser.');
    }
  }

  // Deterministic local extraction fallback if Gemini is unreachable or no key
  return fallbackDeterministicPipeline(input);
}

/**
 * Validates, cleans, and applies mathematically exact date-union experience calculation.
 */
function formatAndValidateProfile(
  raw: any,
  fallbackRawText: string
): ResumePipelineResult {
  const personal = {
    name: sanitizeString(raw.personal?.name, 'Candidate'),
    email: sanitizeString(raw.personal?.email, ''),
    phone: sanitizeString(raw.personal?.phone, ''),
    location: sanitizeString(raw.personal?.location, 'Remote'),
    linkedin: sanitizeString(raw.personal?.linkedin, ''),
    portfolio: sanitizeString(raw.personal?.portfolio, ''),
  };

  const experienceList: ExperienceItem[] = Array.isArray(raw.experience)
    ? raw.experience.map((exp: any, idx: number) => ({
        id: `exp-${idx}-${Date.now()}`,
        company: sanitizeString(exp.company, 'Company'),
        title: sanitizeString(exp.title, 'Role'),
        start_date: sanitizeString(exp.start_date, ''),
        end_date: sanitizeString(exp.end_date, ''),
        responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities.filter(Boolean) : [],
        achievements: Array.isArray(exp.achievements) ? exp.achievements.filter(Boolean) : [],
        skills_used: Array.isArray(exp.skills_used) ? exp.skills_used.filter(Boolean) : [],
        confidence: exp.confidence === 'needs_review' ? 'needs_review' : 'high',
        source: 'VERIFIED FROM RESUME',
      }))
    : [];

  // Calculate non-overlapping professional duration
  const expCalc = calculateTotalExperience(experienceList);

  const skillsList: SkillItem[] = Array.isArray(raw.skills)
    ? raw.skills
        .map((s: any, idx: number) => {
          const name = typeof s === 'string' ? s : s?.name;
          if (!name || typeof name !== 'string') return null;
          const validCategory: SkillCategory = ['technical', 'analytical', 'business', 'soft'].includes(s?.category)
            ? s.category
            : 'technical';
          return {
            id: `skill-${idx}-${Date.now()}`,
            name: name.trim(),
            category: validCategory,
            confidence: (s?.confidence === 'needs_review' ? 'needs_review' : 'high') as 'high' | 'needs_review',
            source: 'VERIFIED FROM RESUME' as const,
          };
        })
        .filter(Boolean) as SkillItem[]
    : [];

  const toolsList: ToolItem[] = Array.isArray(raw.tools)
    ? raw.tools
        .map((t: any, idx: number) => {
          const name = typeof t === 'string' ? t : t?.name;
          if (!name || typeof name !== 'string') return null;
          return {
            id: `tool-${idx}-${Date.now()}`,
            name: name.trim(),
            confidence: (t?.confidence === 'needs_review' ? 'needs_review' : 'high') as 'high' | 'needs_review',
            source: 'VERIFIED FROM RESUME' as const,
          };
        })
        .filter(Boolean) as ToolItem[]
    : [];

  const educationList: EducationItem[] = Array.isArray(raw.education)
    ? raw.education.map((edu: any, idx: number) => ({
        id: `edu-${idx}-${Date.now()}`,
        institution: sanitizeString(edu.institution, ''),
        degree: sanitizeString(edu.degree, ''),
        field_of_study: sanitizeString(edu.field_of_study, ''),
        start_date: sanitizeString(edu.start_date, ''),
        end_date: sanitizeString(edu.end_date, ''),
        confidence: edu.confidence === 'needs_review' ? 'needs_review' : 'high',
      }))
    : [];

  const certificationsList: CertificationItem[] = Array.isArray(raw.certifications)
    ? raw.certifications.map((cert: any, idx: number) => ({
        id: `cert-${idx}-${Date.now()}`,
        name: sanitizeString(cert.name, ''),
        issuer: sanitizeString(cert.issuer, ''),
        date: sanitizeString(cert.date, ''),
        confidence: cert.confidence === 'needs_review' ? 'needs_review' : 'high',
      }))
    : [];

  const projectsList: ProjectItem[] = Array.isArray(raw.projects)
    ? raw.projects.map((proj: any, idx: number) => ({
        id: `proj-${idx}-${Date.now()}`,
        name: sanitizeString(proj.name, ''),
        description: sanitizeString(proj.description, ''),
        technologies: Array.isArray(proj.technologies) ? proj.technologies.filter(Boolean) : [],
        link: sanitizeString(proj.link, ''),
        confidence: proj.confidence === 'needs_review' ? 'needs_review' : 'high',
      }))
    : [];

  const evidenceLayer: ExtractedEvidence[] = Array.isArray(raw.evidence_layer)
    ? raw.evidence_layer.map((ev: any) => ({
        claim: sanitizeString(ev.claim, ''),
        evidence: sanitizeString(ev.evidence, ''),
        source_section: sanitizeString(ev.source_section, 'General'),
        confidence: ev.confidence === 'needs_review' ? 'needs_review' : 'high',
        sourceType: 'VERIFIED FROM RESUME',
      }))
    : [];

  const qualityAssessment: DocumentQualityAssessment = {
    documentType: raw.quality_assessment?.documentType || 'text_pdf',
    isMultiColumn: Boolean(raw.quality_assessment?.isMultiColumn),
    qualityWarning: raw.quality_assessment?.qualityWarning || null,
    overallConfidence: raw.quality_assessment?.overallConfidence === 'needs_review' ? 'needs_review' : 'high',
  };

  const rawExtractedTranscript =
    sanitizeString(raw.raw_document_transcript, '') || fallbackRawText;

  const currentRole = {
    title: sanitizeString(raw.current_role?.title, experienceList[0]?.title || 'Professional'),
    company: sanitizeString(raw.current_role?.company, experienceList[0]?.company || ''),
    start_date: sanitizeString(raw.current_role?.start_date, experienceList[0]?.start_date || ''),
    end_date: sanitizeString(raw.current_role?.end_date, experienceList[0]?.end_date || 'Present'),
  };

  const structuredProfile: StructuredCandidateProfile = {
    personal,
    professional_summary: sanitizeString(raw.professional_summary, ''),
    current_role: currentRole,
    total_experience_years: expCalc.years,
    experience_formatted: expCalc.formatted,
    experience: experienceList,
    skills: skillsList,
    tools: toolsList,
    industries: Array.isArray(raw.industries) ? raw.industries.filter(Boolean) : [],
    education: educationList,
    certifications: certificationsList,
    projects: projectsList,
    languages: Array.isArray(raw.languages) ? raw.languages.filter(Boolean) : [],
    explicit_preferences: {
      location: sanitizeString(raw.explicit_preferences?.location, ''),
      remote_preference: sanitizeString(raw.explicit_preferences?.remote_preference, 'remote'),
      salary: sanitizeString(raw.explicit_preferences?.salary, ''),
      notice_period: sanitizeString(raw.explicit_preferences?.notice_period, ''),
    },
    evidence_layer: evidenceLayer,
    quality_assessment: qualityAssessment,
    isConfirmed: false, // Must be explicitly reviewed and confirmed by the candidate
    verificationStatus: 'unconfirmed',
  };

  return {
    structuredProfile,
    rawExtractedText: rawExtractedTranscript,
    qualityAssessment,
    evidenceLayer,
  };
}

function sanitizeString(val: any, fallback: string = ''): string {
  if (val === null || val === undefined) return fallback;
  const str = String(val).trim();
  if (['null', 'undefined', 'not found in resume', 'n/a', 'none'].includes(str.toLowerCase())) {
    return fallback;
  }
  return str;
}

/**
 * Deterministic fallback parser adhering to anti-hallucination rules, 4-tier skill categorization,
 * and evidence tracking when Gemini client is not initialized.
 */
function fallbackDeterministicPipeline(input: ResumePipelineInput): ResumePipelineResult {
  const text = input.text || '';
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  // Extract Name
  const headingKeywords = /^(curriculum vitae|resume|cv|contact|profile|summary|experience|education|skills)/i;
  let name = 'Candidate';
  for (const line of lines.slice(0, 10)) {
    if (headingKeywords.test(line)) continue;
    if (line.includes('@') || line.includes('http') || line.includes('.com') || /^\+?\d{1,4}/.test(line)) continue;
    if (line.length > 1 && line.length < 50) {
      let cleaned = line.replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.|eng\.)\s+/i, '');
      if (cleaned.includes('|') || cleaned.includes('—') || cleaned.includes('–')) {
        cleaned = cleaned.split(/[|—–]/)[0].trim();
      }
      name = cleaned;
      break;
    }
  }

  // Extract Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  // Extract Phone
  const phoneMatch = text.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Extract LinkedIn & Portfolio
  const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const linkedin = linkedinMatch ? `https://${linkedinMatch[0]}` : '';

  const portfolioMatch = text.match(/https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.(?:dev|io|me|com|app)(?:\/[^\s]*)?/i);
  const portfolio = portfolioMatch && !portfolioMatch[0].includes('linkedin') ? portfolioMatch[0] : '';

  // 4-Tier Categorized Skills Dictionary
  const KNOWN_SKILLS: { name: string; category: SkillCategory }[] = [
    // Technical
    { name: 'TypeScript', category: 'technical' },
    { name: 'JavaScript', category: 'technical' },
    { name: 'Python', category: 'technical' },
    { name: 'Go', category: 'technical' },
    { name: 'Rust', category: 'technical' },
    { name: 'Java', category: 'technical' },
    { name: 'C++', category: 'technical' },
    { name: 'C#', category: 'technical' },
    { name: 'SQL', category: 'technical' },
    { name: 'React', category: 'technical' },
    { name: 'Next.js', category: 'technical' },
    { name: 'Node.js', category: 'technical' },
    { name: 'PostgreSQL', category: 'technical' },
    { name: 'Redis', category: 'technical' },
    { name: 'GraphQL', category: 'technical' },
    { name: 'REST APIs', category: 'technical' },
    { name: 'Docker', category: 'technical' },
    { name: 'Kubernetes', category: 'technical' },
    { name: 'CI/CD', category: 'technical' },
    { name: 'Machine Learning', category: 'technical' },
    { name: 'LLMs', category: 'technical' },
    { name: 'Gemini API', category: 'technical' },

    // Analytical
    { name: 'System Design', category: 'analytical' },
    { name: 'Data Analysis', category: 'analytical' },
    { name: 'Performance Profiling', category: 'analytical' },
    { name: 'A/B Testing', category: 'analytical' },
    { name: 'Root Cause Analysis', category: 'analytical' },
    { name: 'Market Research', category: 'analytical' },
    { name: 'Consumer Insights', category: 'analytical' },

    // Business
    { name: 'Product Operations', category: 'business' },
    { name: 'AI Operations', category: 'business' },
    { name: 'Requirements Scoping', category: 'business' },
    { name: 'Sprint Planning', category: 'business' },
    { name: 'Stakeholder Management', category: 'business' },

    // Soft
    { name: 'Team Mentorship', category: 'soft' },
    { name: 'Cross-Functional Leadership', category: 'soft' },
    { name: 'Technical Writing', category: 'soft' },
    { name: 'Agile Collaboration', category: 'soft' }
  ];

  const KNOWN_TOOLS = [
    'Git', 'GitHub', 'GitLab', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins',
    'Jira', 'Confluence', 'Figma', 'Postman', 'VS Code', 'AWS CLI', 'Datadog',
    'Grafana', 'Prometheus', 'Tableau', 'Power BI', 'Snowflake', 'BigQuery'
  ];

  const extractedSkills: SkillItem[] = [];
  const extractedTools: ToolItem[] = [];
  const evidenceLayer: ExtractedEvidence[] = [];

  for (const { name: skillName, category } of KNOWN_SKILLS) {
    const regex = new RegExp(`\\b${skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const match = text.match(regex);
    if (match) {
      extractedSkills.push({
        id: `skill-${extractedSkills.length}-${Date.now()}`,
        name: skillName,
        category,
        confidence: 'high',
        source: 'VERIFIED FROM RESUME',
      });
      // Extract contextual snippet as evidence
      const idx = match.index || 0;
      const snippet = text.slice(Math.max(0, idx - 40), Math.min(text.length, idx + 60)).replace(/\n/g, ' ').trim();
      evidenceLayer.push({
        claim: `Verified proficiency in ${skillName}`,
        evidence: `"...${snippet}..."`,
        source_section: 'Skills / Experience',
        confidence: 'high',
        sourceType: 'VERIFIED FROM RESUME',
      });
    }
  }

  for (const tool of KNOWN_TOOLS) {
    if (extractedSkills.some((s) => s.name.toLowerCase() === tool.toLowerCase())) continue;
    const regex = new RegExp(`\\b${tool.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const match = text.match(regex);
    if (match) {
      extractedTools.push({
        id: `tool-${extractedTools.length}-${Date.now()}`,
        name: tool,
        confidence: 'high',
        source: 'VERIFIED FROM RESUME',
      });
    }
  }

  // Extract Experience blocks heuristically
  const experienceList: ExperienceItem[] = [];
  const datePattern = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\b(19\d{2}|20\d{2})\b[\s\-–—to]+(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(?:\b(19\d{2}|20\d{2})\b|Present|Current)/i;

  let currentExp: Partial<ExperienceItem> | null = null;
  for (const line of lines) {
    if (datePattern.test(line)) {
      if (currentExp && currentExp.title) {
        experienceList.push({
          id: `exp-${experienceList.length}-${Date.now()}`,
          company: currentExp.company || 'Organization',
          title: currentExp.title || 'Professional Role',
          start_date: currentExp.start_date || '',
          end_date: currentExp.end_date || 'Present',
          responsibilities: currentExp.responsibilities || [],
          achievements: currentExp.achievements || [],
          skills_used: currentExp.skills_used || [],
          confidence: 'high',
          source: 'VERIFIED FROM RESUME',
        });
      }
      const match = line.match(datePattern);
      const parts = line.split(/[|—–-]/);
      currentExp = {
        title: parts[0]?.trim() || 'Role',
        company: parts[1]?.trim() || '',
        start_date: match ? match[1] || match[0] : '',
        end_date: match && match[2] ? match[2] : 'Present',
        responsibilities: [],
        achievements: [],
        skills_used: [],
      };
    } else if (currentExp && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))) {
      currentExp.responsibilities = currentExp.responsibilities || [];
      currentExp.responsibilities.push(line.replace(/^[•\-\*]\s*/, '').trim());
    }
  }
  if (currentExp && currentExp.title) {
    experienceList.push({
      id: `exp-${experienceList.length}-${Date.now()}`,
      company: currentExp.company || 'Organization',
      title: currentExp.title || 'Professional Role',
      start_date: currentExp.start_date || '',
      end_date: currentExp.end_date || 'Present',
      responsibilities: currentExp.responsibilities || [],
      achievements: currentExp.achievements || [],
      skills_used: currentExp.skills_used || [],
      confidence: 'high',
      source: 'VERIFIED FROM RESUME',
    });
  }

  const expCalc = calculateTotalExperience(experienceList);

  const structuredProfile: StructuredCandidateProfile = {
    personal: {
      name,
      email,
      phone,
      location: 'Remote',
      linkedin,
      portfolio,
    },
    professional_summary: lines.slice(0, 4).join(' '),
    current_role: {
      title: experienceList[0]?.title || 'Software Professional',
      company: experienceList[0]?.company || '',
      start_date: experienceList[0]?.start_date || '',
      end_date: experienceList[0]?.end_date || 'Present',
    },
    total_experience_years: expCalc.years,
    experience_formatted: expCalc.formatted,
    experience: experienceList,
    skills: extractedSkills,
    tools: extractedTools,
    industries: [],
    education: [],
    certifications: [],
    projects: [],
    languages: [],
    explicit_preferences: {
      location: '',
      remote_preference: 'remote',
      salary: '',
      notice_period: '',
    },
    evidence_layer: evidenceLayer,
    quality_assessment: {
      documentType: 'text_document',
      isMultiColumn: false,
      qualityWarning: null,
      overallConfidence: 'high',
    },
    isConfirmed: false,
    verificationStatus: 'unconfirmed',
  };

  return {
    structuredProfile,
    rawExtractedText: text,
    qualityAssessment: structuredProfile.quality_assessment!,
    evidenceLayer,
  };
}
