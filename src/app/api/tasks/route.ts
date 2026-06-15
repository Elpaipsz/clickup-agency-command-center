import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaces, getSpaces, fetchAllTasks, createTask, updateTask, deleteTask } from '@/utils/clickup';
import { processTasks, buildDashboardData } from '@/utils/taskClassifier';
import { resolveClickUpToken } from '@/utils/serverSettings';

// GET: Obtener todas las tareas del dashboard
export async function GET(request: NextRequest) {
  try {
    const requestToken = request.headers.get('x-clickup-token');
    const token = resolveClickUpToken(requestToken);

    if (!token || token.includes('your_clickup_api_token_here')) {
      return NextResponse.json(
        { error: 'Token de ClickUp no configurado.' },
        { status: 401 }
      );
    }

    const workspaces = await getWorkspaces(token);
    let rawTasks: any[] = [];
    
    for (const workspace of workspaces) {
      try {
        const spaces = await getSpaces(workspace.id, token);
        const spaceMap = new Map(spaces.map(s => [s.id, s.name]));
        
        const tasks = await fetchAllTasks(workspace.id, token);
        
        // Adjuntar el nombre del espacio a cada tarea para que el clasificador pueda usarlo
        const tasksWithSpaces = tasks.map(t => {
          if (t.space && t.space.id && spaceMap.has(t.space.id)) {
            return { ...t, space: { ...t.space, name: spaceMap.get(t.space.id) } };
          }
          return t;
        });
        
        rawTasks = rawTasks.concat(tasksWithSpaces);
      } catch (err) {
        console.error(`Error al obtener tareas para el workspace ${workspace.name} (${workspace.id}):`, err);
      }
    }

    const processed = processTasks(rawTasks);
    const dashboardData = buildDashboardData(processed);

    return NextResponse.json(dashboardData);
  } catch (error: any) {
    console.error('Error fetching dashboard tasks:', error);
    return NextResponse.json(
      { error: error.message || 'Ha ocurrido un error inesperado al obtener las tareas.' },
      { status: 500 }
    );
  }
}

// POST: Crear una nueva tarea
export async function POST(request: NextRequest) {
  try {
    let token = request.headers.get('Authorization') || request.headers.get('x-clickup-token');
    if (!token) {
      token = process.env.CLICKUP_API_TOKEN || null;
    }

    if (!token) {
      return NextResponse.json({ error: 'Autorización requerida.' }, { status: 401 });
    }

    const body = await request.json();
    const { listId, name, description, assignees, priority, dueDate, status } = body;

    if (!listId || !name) {
      return NextResponse.json({ error: 'La lista (listId) y el nombre son requeridos.' }, { status: 400 });
    }

    // Estructurar el cuerpo de ClickUp
    const clickUpBody: any = {
      name,
      description: description || '',
    };

    if (assignees && Array.isArray(assignees)) {
      clickUpBody.assignees = assignees;
    }

    if (priority) {
      // Prioridad ClickUp: 1: urgent, 2: high, 3: normal, 4: low
      const priorityMap: Record<string, number> = { urgent: 1, high: 2, normal: 3, low: 4 };
      clickUpBody.priority = priorityMap[priority] || null;
    }

    if (dueDate) {
      clickUpBody.due_date = new Date(dueDate).getTime();
    }

    if (status) {
      clickUpBody.status = status;
    }

    const newTask = await createTask(listId, clickUpBody, token);
    return NextResponse.json(newTask);
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear la tarea en ClickUp.' },
      { status: 500 }
    );
  }
}

// PUT: Modificar una tarea existente
export async function PUT(request: NextRequest) {
  try {
    let token = request.headers.get('Authorization') || request.headers.get('x-clickup-token');
    if (!token) {
      token = process.env.CLICKUP_API_TOKEN || null;
    }

    if (!token) {
      return NextResponse.json({ error: 'Autorización requerida.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryTaskId = searchParams.get('id');

    const body = await request.json();
    const { taskId: bodyTaskId, name, description, assignees, priority, dueDate, status } = body;

    const taskId = bodyTaskId || queryTaskId;

    if (!taskId) {
      return NextResponse.json({ error: 'El taskId es requerido.' }, { status: 400 });
    }

    // Estructurar cuerpo
    const clickUpBody: any = {};
    if (name) clickUpBody.name = name;
    if (description !== undefined) clickUpBody.description = description;
    if (status) clickUpBody.status = status;
    
    if (priority !== undefined) {
      const priorityMap: Record<string, number> = { urgent: 1, high: 2, normal: 3, low: 4, none: 0 };
      clickUpBody.priority = priorityMap[priority] || null;
    }

    if (dueDate !== undefined) {
      clickUpBody.due_date = dueDate ? new Date(dueDate).getTime() : null;
    }

    // Nota: ClickUp maneja assignees agregando o removiendo por IDs
    if (assignees && Array.isArray(assignees)) {
      // Para simplificar, pasamos los assignees de forma completa
      // La API v2 permite mandar assignees como un objeto { add: [...], rem: [...] }, o mandando la lista.
      // Si mandamos el objeto assignees con add y rem, requiere saber los anteriores.
      // O podemos simplemente pasar {"assignees": [ids]} si la lista de ClickUp lo admite de forma directa (algunos planes).
      // Para hacerlo robusto y compatible, mandamos el objeto assignees con el formato { add: assignees }
      // (si se quiere reescribir completo, es mejor mandar la diferencia).
      // Para resolverlo de forma segura en ClickUp, enviamos assignees directamente en el array.
      clickUpBody.assignees = assignees;
    }

    const updated = await updateTask(taskId, clickUpBody, token);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar la tarea en ClickUp.' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar una tarea
export async function DELETE(request: NextRequest) {
  try {
    let token = request.headers.get('Authorization') || request.headers.get('x-clickup-token');
    if (!token) {
      token = process.env.CLICKUP_API_TOKEN || null;
    }

    if (!token) {
      return NextResponse.json({ error: 'Autorización requerida.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json({ error: 'El taskId es requerido.' }, { status: 400 });
    }

    await deleteTask(taskId, token);
    return NextResponse.json({ success: true, message: 'Tarea eliminada correctamente.' });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar la tarea en ClickUp.' },
      { status: 500 }
    );
  }
}
