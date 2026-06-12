import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaces, getSpaces, fetchAllTasks } from '@/utils/clickup';

export async function GET(request: NextRequest) {
  try {
    let token = process.env.CLICKUP_API_TOKEN;
    const workspaces = await getWorkspaces(token as string);
    let allTasks: any[] = [];
    
    for (const workspace of workspaces) {
      const spaces = await getSpaces(workspace.id, token as string);
      const spaceMap = new Map(spaces.map(s => [s.id, s.name]));
      
      const tasks = await fetchAllTasks(workspace.id, token as string);
      
      const tasksWithSpaces = tasks.map(t => {
        if (t.space && t.space.id && spaceMap.has(t.space.id)) {
          return { ...t, space: { ...t.space, name: spaceMap.get(t.space.id) } };
        }
        return t;
      });
      allTasks = allTasks.concat(tasksWithSpaces);
    }
    
    const traitsTasks = allTasks.filter(t => {
      const str = JSON.stringify(t).toLowerCase();
      return str.includes('trait');
    });

    return NextResponse.json({ total: allTasks.length, traits: traitsTasks.length, data: traitsTasks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
