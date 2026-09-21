import { NextRequest, NextResponse } from 'next/server';
import * as mammoth from 'mammoth';
import { processResumePipeline } from '@/lib/resume-pipeline';

// Helper to extract text from PDF streams when text layer is available
function extractTextFromPdf(buffer: Buffer): string {
  const content = buffer.toString('binary');
  const textBlocks: string[] = [];

  // Match text within parentheses in PDF streams (Tj and TJ operators)
  const regex = /\(([^)]+)\)\s*T[jJ]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[1] && match[1].length > 1) {
      const decoded = match[1]
        .replace(/\\([()\\])/g, '$1')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\t/g, ' ');
      textBlocks.push(decoded);
    }
  }

  // Also check for Hex strings <48656c6c6f> Tj
  const hexRegex = /<([0-9a-fA-F]+)>\s*T[jJ]/g;
  while ((match = hexRegex.exec(content)) !== null) {
    const hex = match[1];
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      const code = parseInt(hex.substr(i, 2), 16);
      if (code >= 32 && code <= 126) {
        str += String.fromCharCode(code);
      }
    }
    if (str.length > 2) {
      textBlocks.push(str);
    }
  }

  // Clean and filter out PDF binary noise
  const rawText = textBlocks.join(' ');
  const lines = rawText
    .split(/[\r\n]+/)
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 0 &&
        !l.startsWith('/Font') &&
        !l.startsWith('/ProcSet') &&
        !l.startsWith('<<') &&
        !l.startsWith('>>') &&
        !l.startsWith('endobj') &&
        !l.startsWith('obj') &&
        !/\b(Tf|Td|Tj|TJ|BT|ET)\b/.test(l)
    );

  return lines.join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let extractedText = '';
    let fileName = 'Uploaded_Resume.txt';
    let fileBuffer: Buffer | undefined = undefined;
    let mimeType = 'text/plain';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      extractedText = body.text || '';
      fileName = 'Pasted_Resume.txt';
      mimeType = 'text/plain';
    } else {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const directText = formData.get('text') as string | null;

      if (file) {
        fileName = file.name;
        mimeType = file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'text/plain');
        fileBuffer = Buffer.from(await file.arrayBuffer());

        if (file.name.toLowerCase().endsWith('.docx')) {
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          extractedText = result.value;
        } else if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
          // Attempt raw text extraction as supplementary context for Gemini
          extractedText = extractTextFromPdf(fileBuffer);
        } else {
          // Plain text, markdown, or similar
          extractedText = fileBuffer.toString('utf-8');
        }
      } else if (directText) {
        extractedText = directText;
        fileName = 'Pasted_Profile.txt';
        mimeType = 'text/plain';
      }
    }

    if (!extractedText.trim() && !fileBuffer) {
      return NextResponse.json({ error: 'No resume text or file provided' }, { status: 400 });
    }

    // Execute the complete two-stage understanding & structured extraction pipeline
    const pipelineResult = await processResumePipeline({
      buffer: fileBuffer,
      mimeType,
      text: extractedText,
      fileName,
    });

    const { structuredProfile, rawExtractedText, qualityAssessment, evidenceLayer } = pipelineResult;

    // Map to UserProfile for backward-compatibility while preserving full structured data
    return NextResponse.json({
      fullName: structuredProfile.personal.name || 'Candidate Name',
      email: structuredProfile.personal.email || '',
      phone: structuredProfile.personal.phone || '',
      location: structuredProfile.personal.location || 'Remote',
      targetRole: structuredProfile.current_role.title || 'Software Professional',
      yearsOfExperience: structuredProfile.total_experience_years || 0,
      experienceCalculatedText: structuredProfile.experience_formatted,
      skills: structuredProfile.skills.map((s) => s.name),
      summary: structuredProfile.professional_summary || '',
      workHistory: structuredProfile.experience.map((e) => ({
        company: e.company,
        role: e.title,
        duration: e.start_date && e.end_date ? `${e.start_date} - ${e.end_date}` : e.start_date || 'Past',
        highlights: [...e.responsibilities, ...e.achievements],
      })),
      education: structuredProfile.education
        .map((e) => [e.degree, e.institution].filter(Boolean).join(' - '))
        .filter(Boolean)
        .join(', '),
      portfolioUrl: structuredProfile.personal.portfolio || '',
      linkedinUrl: structuredProfile.personal.linkedin || '',
      resumeRawText: rawExtractedText || extractedText,
      resumeFileName: fileName,
      // Rich structured representations
      structuredProfile,
      documentQuality: qualityAssessment,
      evidenceLayer,
      verificationStatus: 'unconfirmed',
    });
  } catch (error: any) {
    console.error('Error parsing resume:', error);
    return NextResponse.json(
      { error: 'Failed to process resume', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
