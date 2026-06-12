import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

function readSettings(): Record<string, string> {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return {};
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeSettings(data: Record<string, string>) {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET: Returns current settings (masked token)
export async function GET() {
  const settings = readSettings();
  const token = settings.clickup_token || process.env.CLICKUP_API_TOKEN || '';
  return NextResponse.json({
    hasToken: !!token,
    // Return a masked version so the UI can show it's configured
    tokenMasked: token ? `${token.slice(0, 6)}${'•'.repeat(20)}${token.slice(-4)}` : '',
  });
}

// POST: Save settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clickup_token } = body;

    if (!clickup_token || typeof clickup_token !== 'string') {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 400 });
    }

    const settings = readSettings();
    settings.clickup_token = clickup_token.trim();
    writeSettings(settings);

    return NextResponse.json({ success: true, message: 'Token guardado correctamente en el servidor.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove token
export async function DELETE() {
  const settings = readSettings();
  delete settings.clickup_token;
  writeSettings(settings);
  return NextResponse.json({ success: true });
}
