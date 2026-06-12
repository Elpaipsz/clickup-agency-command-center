import { NextRequest, NextResponse } from 'next/server';
import { resolveClickUpToken, writeSettings, isVercel } from '@/utils/serverSettings';

// GET: Returns current token status
export async function GET() {
  const token = resolveClickUpToken();
  return NextResponse.json({
    hasToken: !!token,
    isVercel: isVercel(),
    tokenMasked: token ? `${token.slice(0, 6)}${'•'.repeat(20)}${token.slice(-4)}` : '',
  });
}

// POST: Save settings (only works locally, not on Vercel)
export async function POST(request: NextRequest) {
  try {
    if (isVercel()) {
      return NextResponse.json(
        { error: 'VERCEL_ENV', message: 'En Vercel, configura CLICKUP_API_TOKEN en las variables de entorno del proyecto.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { clickup_token } = body;

    if (!clickup_token || typeof clickup_token !== 'string') {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 400 });
    }

    const success = writeSettings({ clickup_token: clickup_token.trim() });
    if (!success) {
      return NextResponse.json({ error: 'No se pudo escribir el archivo de configuración.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Token guardado correctamente en el servidor.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove token
export async function DELETE() {
  if (isVercel()) {
    return NextResponse.json({ error: 'En Vercel, elimina la variable desde el dashboard.' }, { status: 400 });
  }
  writeSettings({});
  return NextResponse.json({ success: true });
}
