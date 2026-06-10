import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaces, getWorkspaceHierarchy, getWorkspaceMembers } from '@/utils/clickup';

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

    const workspaces = await getWorkspaces(token);
    const result: any[] = [];

    for (const ws of workspaces) {
      try {
        const hierarchy = await getWorkspaceHierarchy(ws.id, token);
        const members = await getWorkspaceMembers(ws.id, token);
        result.push({
          workspaceId: ws.id,
          workspaceName: ws.name,
          hierarchy,
          members
        });
      } catch (err) {
        console.error(`Error loading configuration for workspace ${ws.name}:`, err);
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching dashboard configuration:', error);
    return NextResponse.json(
      { error: error.message || 'Ha ocurrido un error inesperado al obtener la configuración.' },
      { status: 500 }
    );
  }
}
