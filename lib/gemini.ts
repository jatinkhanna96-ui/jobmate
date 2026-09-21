import { GoogleGenAI } from '@google/genai';

let cachedClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedClient;
}

export function cleanJsonText(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

/**
 * Robust model execution with automatic failover across official Gemini models.
 * Handles transient spikes (503 High Demand / UNAVAILABLE) and rate limits (429).
 */
export async function generateWithFallback({
  contents,
  preferredModel = 'gemini-3.1-flash-lite',
  responseMimeType = 'application/json',
  systemInstruction,
}: {
  contents: any;
  preferredModel?: string;
  responseMimeType?: string;
  systemInstruction?: string;
}): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  // Ordered candidate models starting from preferred, falling back to other supported models
  const candidateModels = Array.from(
    new Set([
      preferredModel,
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
    ])
  );

  let lastError: any = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    try {
      const config: any = {};
      if (responseMimeType) {
        config.responseMimeType = responseMimeType;
      }
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      const response = await client.models.generateContent({
        model,
        contents,
        config,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      const errorMsg = String(err?.message || err);
      const isTransient =
        errorMsg.includes('503') ||
        errorMsg.includes('high demand') ||
        errorMsg.includes('UNAVAILABLE') ||
        errorMsg.includes('429') ||
        errorMsg.includes('RESOURCE_EXHAUSTED') ||
        errorMsg.includes('quota');

      console.info(
        `[Gemini] Model ${model} ${isTransient ? 'rate-limited/transient' : 'encountered issue'}, checking next candidate...`
      );

      // If there are further models available, brief pause and try next model
      if (i < candidateModels.length - 1) {
        await new Promise((res) => setTimeout(res, 200 * (i + 1)));
      }
    }
  }

  throw lastError || new Error('All candidate AI models were temporarily unreachable.');
}
