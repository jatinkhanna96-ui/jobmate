import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { UserProfile, Job, TailoredApplication } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { 
      profile, 
      job, 
      tone = 'professional' 
    }: { 
      profile: UserProfile; 
      job: Job; 
      tone?: 'professional' | 'conversational' | 'bold' 
    } = await req.json();

    if (!profile || !job) {
      return NextResponse.json({ error: 'Missing profile or job data' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are ApplyPilot, an expert AI job application copilot.
Your job is to generate tailored application materials for this candidate applying to this specific job.
Candidate must approve everything before submitting ("Human-In-The-Loop").

Candidate Profile:
- Full Name: ${profile.fullName}
- Email: ${profile.email}
- Target Role: ${profile.targetRole}
- Years of Experience: ${profile.yearsOfExperience}
- Skills: ${profile.skills.join(', ')}
- Summary: ${profile.summary}
- Work History: ${JSON.stringify(profile.workHistory)}
${profile.resumeRawText ? `\nResume Excerpt:\n${profile.resumeRawText.slice(0, 1500)}` : ''}

Target Job:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Requirements: ${job.requirements.join('; ')}
- Description: ${job.description}

Desired Tone: ${tone}

Please produce customized materials. Respond ONLY with a valid JSON object matching this structure:
{
  "coverLetter": string (3-4 concise, impactful paragraphs addressing the hiring manager, mentioning specific company needs and candidate matches),
  "tailoredSummary": string (2-3 sentences profile summary tailored directly to this job's keywords),
  "suggestedBulletPoints": string[] (3-4 high-impact resume achievement bullet points starting with action verbs, incorporating quantifiable metrics),
  "outreachEmail": string (a short, polite 4-sentence LinkedIn or cold email note to a hiring manager or recruiter),
  "keyTalkingPoints": string[] (2-3 strategic topics for the candidate to bring up in an interview)
}
No markdown wrappers around JSON, no commentary.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        const parsed = JSON.parse(rawText);
        
        const result: TailoredApplication = {
          coverLetter: parsed.coverLetter,
          tailoredSummary: parsed.tailoredSummary,
          suggestedBulletPoints: parsed.suggestedBulletPoints || [],
          outreachEmail: parsed.outreachEmail,
          keyTalkingPoints: parsed.keyTalkingPoints || [],
          status: 'pending_approval',
          updatedAt: new Date().toISOString().split('T')[0]
        };

        return NextResponse.json(result);
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to dynamic generator:', geminiError);
      }
    }

    // High quality dynamic fallback generator
    const topSkills = profile.skills.slice(0, 4).join(', ');
    const primaryCompany = profile.workHistory[0]?.company || 'TechPulse Solutions';

    const fallbackCoverLetter = `Dear Hiring Team at ${job.company},

I am excited to submit my application for the ${job.title} position. With over ${profile.yearsOfExperience} years of experience specializing in ${topSkills}, I have consistently built robust, scalable solutions that drive measurable business outcomes.

What specifically draws me to ${job.company} is your commitment to innovative engineering and high-standard product execution. At ${primaryCompany}, I led key technical initiatives that optimized application performance and established reliable system architectures. I see strong alignment between the responsibilities outlined in your posting—specifically regarding ${job.requirements[0] || 'core engineering execution'}—and my proven background.

I welcome the opportunity to discuss in detail how my skills and collaborative approach will bring immediate value to the ${job.company} team. Thank you for your time and consideration.

Warm regards,
${profile.fullName}
${profile.email}`;

    const fallbackSummary = `${profile.targetRole} with ${profile.yearsOfExperience}+ years of proven success in ${topSkills}. Track record of accelerating product delivery and architecting reliable web systems for modern engineering teams.`;

    const fallbackBullets = [
      `Architected and shipped scalable features using ${profile.skills.slice(0, 2).join(' and ') || 'modern frameworks'}, driving significant gains in reliability and velocity.`,
      `Collaborated cross-functionally across engineering, product, and design to deliver core workflows aligned with user needs.`,
      `Championed best practices in code quality, automated testing, and CI/CD pipelines at ${primaryCompany}.`
    ];

    const fallbackOutreach = `Subject: ${profile.fullName} - ${job.title} application (${job.company})

Hi ${job.company} Recruiting Team,

I recently applied for the ${job.title} opening at ${job.company}. Given my background with ${profile.yearsOfExperience}+ years in ${topSkills} and building production systems at ${primaryCompany}, I was very excited to see this role open up.

I would love to connect briefly or answer any initial questions you might have.

Best regards,
${profile.fullName}`;

    const fallbackTalkingPoints = [
      `Demonstrating alignment with ${job.requirements[0] || 'key job requirements'} through recent production wins`,
      `How past experience at ${primaryCompany} prepares you for day-1 contribution at ${job.company}`,
      `Approach to maintainability, system speed, and team collaboration`
    ];

    const result: TailoredApplication = {
      coverLetter: fallbackCoverLetter,
      tailoredSummary: fallbackSummary,
      suggestedBulletPoints: fallbackBullets,
      outreachEmail: fallbackOutreach,
      keyTalkingPoints: fallbackTalkingPoints,
      status: 'pending_approval',
      updatedAt: new Date().toISOString().split('T')[0]
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error tailoring application:', error);
    return NextResponse.json({ error: 'Failed to tailor application' }, { status: 500 });
  }
}
