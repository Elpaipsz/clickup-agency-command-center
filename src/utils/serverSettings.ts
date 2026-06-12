import fs from 'fs';
import path from 'path';

// On Vercel and similar serverless platforms, the filesystem is read-only.
// We detect this and gracefully fall back to env vars only.
const IS_VERCEL = process.env.VERCEL === '1';
const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

function readSettings(): Record<string, string> {
  if (IS_VERCEL) return {}; // No file system on Vercel
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return {};
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function writeSettings(data: Record<string, string>): boolean {
  if (IS_VERCEL) return false; // Can't write on Vercel
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns the ClickUp API token, checking in order:
 * 1. Local data/settings.json (only works locally, not on Vercel)
 * 2. CLICKUP_API_TOKEN environment variable (.env.local or Vercel dashboard)
 * 3. The request header 'x-clickup-token' (passed from the browser's localStorage)
 */
export function resolveClickUpToken(requestToken?: string | null): string | null {
  // 1. Server-persisted file (local development only)
  const settings = readSettings();
  if (settings.clickup_token) return settings.clickup_token;

  // 2. Environment variable (works everywhere: local .env.local AND Vercel dashboard)
  if (process.env.CLICKUP_API_TOKEN) return process.env.CLICKUP_API_TOKEN;

  // 3. Request header (browser localStorage fallback)
  if (requestToken) return requestToken;

  return null;
}

export function isVercel(): boolean {
  return IS_VERCEL;
}
