import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely parses a fetch Response to JSON, gracefully handling HTML error pages,
 * non-JSON content types, and server crashes without throwing uncaught SyntaxError.
 */
export async function parseJsonResponse<T>(
  res: Response,
  fallbackError = 'Request failed'
): Promise<T> {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  const rawText = await res.text();
  const text = rawText.trim();

  // 1. Attempt JSON parsing if content type indicates JSON, or payload starts with { or [
  if (contentType.includes('application/json') || text.startsWith('{') || text.startsWith('[')) {
    try {
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) {
        const message = data?.error || data?.message || `${fallbackError} (${res.status})`;
        throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
      }
      return data as T;
    } catch (parseErr: any) {
      // If error was already our parsed server error message, rethrow it
      if (parseErr.message && !parseErr.message.includes('JSON.parse') && !parseErr.message.includes('is not valid JSON')) {
        throw parseErr;
      }
      // Otherwise fall through to HTML/text checking below
    }
  }

  // 2. Identify if an HTML page was returned (e.g. Next.js cold-start compilation, 502/503 proxy splash)
  const isHtml =
    text.startsWith('<') ||
    text.toLowerCase().includes('<!doctype') ||
    text.toLowerCase().includes('<html') ||
    contentType.includes('text/html');

  if (isHtml) {
    if (!res.ok) {
      throw new Error(`${fallbackError} (${res.status} ${res.statusText || 'Server Error'})`);
    }
    throw new Error('The server is temporarily initializing. Please retry in a moment.');
  }

  // 3. Fallback for non-HTML non-JSON responses
  if (!res.ok) {
    throw new Error(`${fallbackError} (${res.status}): ${text.slice(0, 150) || 'Unknown server response'}`);
  }

  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    throw new Error(`${fallbackError}: Unexpected response format.`);
  }
}

/**
 * Resilient API fetch that automatically retries if the server returns an HTML page
 * (e.g. during dev-server compilation, cold-start, or transient proxy response).
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
  fallbackError = 'Request failed',
  maxRetries = 2
): Promise<T> {
  let attempt = 0;
  let lastError: any = null;

  while (attempt <= maxRetries) {
    try {
      const res = await fetch(url, options);
      return await parseJsonResponse<T>(res, fallbackError);
    } catch (err: any) {
      lastError = err;
      const isHtmlOrWarmingUp =
        err.message?.includes('initializing') ||
        err.message?.includes('HTML page') ||
        err.message?.includes('502') ||
        err.message?.includes('503') ||
        err.message?.includes('Failed to fetch');

      if (attempt < maxRetries && isHtmlOrWarmingUp) {
        attempt++;
        // Exponential backoff wait (500ms, 1000ms)
        await new Promise(r => setTimeout(r, attempt * 500));
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error(fallbackError);
}

