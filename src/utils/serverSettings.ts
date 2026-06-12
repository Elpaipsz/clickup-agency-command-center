import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

/**
 * Reads the stored settings from the local JSON file.
 */
function readSettings(): Record<string, string> {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return {};
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Returns the ClickUp API token, checking in order:
 * 1. The local data/settings.json file (saved via the settings UI)
 * 2. The CLICKUP_API_TOKEN environment variable (.env.local)
 * 3. The request header 'x-clickup-token' (passed from the browser)
 */
export function resolveClickUpToken(requestToken?: string | null): string | null {
  // 1. Server-persisted file (highest priority)
  const settings = readSettings();
  if (settings.clickup_token) return settings.clickup_token;

  // 2. Environment variable
  if (process.env.CLICKUP_API_TOKEN) return process.env.CLICKUP_API_TOKEN;

  // 3. Request header (browser localStorage fallback)
  if (requestToken) return requestToken;

  return null;
}
