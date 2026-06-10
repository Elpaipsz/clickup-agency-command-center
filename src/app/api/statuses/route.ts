import { NextRequest, NextResponse } from 'next/server';
import { getListStatuses } from '@/utils/clickup';

export async function GET(request: NextRequest) {
  try {
    let token = request.headers.get('Authorization') || request.headers.get('x-clickup-token');
    if (!token) {
      token = process.env.CLICKUP_API_TOKEN || null;
    }

    if (!token || token.includes('your_clickup_api_token_here')) {
      return NextResponse.json(
        { error: 'Token de ClickUp no configurado.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId');

    if (!listId) {
      return NextResponse.json({ error: 'listId es requerido' }, { status: 400 });
    }

    const statuses = await getListStatuses(listId, token);
    return NextResponse.json(statuses);
  } catch (error: any) {
    console.error('Error fetching list statuses:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener estados de la lista.' },
      { status: 500 }
    );
  }
}
