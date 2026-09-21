import { NextRequest, NextResponse } from 'next/server';
import { prepareTailoredApplicationAI } from '@/lib/ai-services';
import { UserProfile, Job, TailoredApplication } from '@/lib/types';
import { JobProfile, JobRecord } from '@/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  return NextResponse.json({ status: 'active', service: 'ApplyPilot Application Tailoring API' });
}

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
    }

    const { 
      profile, 
      job, 
      tone = 'professional' 
    }: { 
      profile: UserProfile; 
      job: Job; 
      tone?: 'professional' | 'conversational' | 'bold' 
    } = body;

    if (!profile || !job) {
      return NextResponse.json({ error: 'Missing profile or job data' }, { status: 400 });
    }

    const convertedProfile: JobProfile = {
      name: profile.fullName,
      email: profile.email,
      phone: profile.phone || '',
      location: profile.location || 'Remote',
      currentRole: profile.targetRole || 'Software Professional',
      yearsOfExperience: profile.yearsOfExperience || 3,
      skills: profile.skills || [],
      education: [],
      previousRoles: [],
      companies: [],
      industryExperience: [],
      preferredLocations: [profile.location || 'Remote'],
    };

    const convertedJob: JobRecord = {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      workplaceType: job.type ? job.type.toLowerCase() : 'remote',
      description: job.description,
      requirements: job.requirements,
    };

    const tailored = await prepareTailoredApplicationAI(profile, convertedJob);

    const topSkills = profile.skills.slice(0, 4).join(', ');
    const primaryCompany = profile.workHistory && profile.workHistory.length > 0 ? profile.workHistory[0].company : 'leading engineering teams';

    const fallbackSummary = `${profile.targetRole} with ${profile.yearsOfExperience}+ years of proven success in ${topSkills}. Track record of accelerating product delivery and architecting reliable systems for ${job.company}.`;

    const fallbackBullets = [
      `Delivered high-performance features utilizing ${profile.skills.slice(0, 2).join(' and ') || 'modern frameworks'}, driving significant gains in reliability and velocity.`,
      `Collaborated cross-functionally across engineering, product, and design to ship workflows aligned with ${job.company}'s mission.`,
      `Championed best practices in code quality, automated testing, and CI/CD pipelines.`
    ];

    const fallbackOutreach = `Subject: ${profile.fullName} - ${job.title} application (${job.company})\n\nHi ${job.company} Recruiting Team,\n\nI recently applied for the ${job.title} opening at ${job.company}. Given my background with ${profile.yearsOfExperience}+ years in ${topSkills}, I was very excited to see this role open up.\n\nI would love to connect briefly or answer any initial questions you might have.\n\nBest regards,\n${profile.fullName}`;

    const fallbackTalkingPoints = [
      `Demonstrating alignment with ${job.requirements[0] || 'key job requirements'} through recent production wins`,
      `How past experience at ${primaryCompany} prepares you for day-1 contribution at ${job.company}`,
      `Approach to maintainability, system speed, and team collaboration`
    ];

    const result: TailoredApplication = {
      coverLetter: tailored.coverLetter || '',
      tailoredSummary: fallbackSummary,
      suggestedBulletPoints: tailored.suggestedBulletPoints && tailored.suggestedBulletPoints.length > 0 ? tailored.suggestedBulletPoints : fallbackBullets,
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

