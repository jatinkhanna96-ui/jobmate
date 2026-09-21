import { NextRequest, NextResponse } from 'next/server';
import { analyzeJobWithAI, formatMatchAnalysis } from '@/lib/ai-services';
import { UserProfile, Job } from '@/lib/types';
import { JobProfile } from '@/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  return NextResponse.json({ status: 'active', service: 'ApplyPilot Match Intelligence API' });
}

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
    }

    const { profile, job }: { profile: UserProfile; job: Job } = body;

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

    const analysis = await analyzeJobWithAI(convertedProfile, {
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description || '',
      requirements: job.requirements || [],
      workplaceType: job.type ? job.type.toLowerCase() : 'remote',
    });

    const formatted = formatMatchAnalysis(analysis, profile);

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error in match route:', error);
    return NextResponse.json({ error: 'Internal server error analyzing job match' }, { status: 500 });
  }
}
