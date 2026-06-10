import { ClickUpTask } from '../types';

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';

/**
 * Realiza una petición HTTPS autorizada a la API de ClickUp.
 */
async function clickUpFetch<T>(
  endpoint: string, 
  token: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  if (!token) {
    throw new Error('No se proporcionó un Token de ClickUp.');
  }

  const options: RequestInit = {
    method,
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${CLICKUP_API_BASE}${endpoint}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ClickUp API Error (${response.status}): ${errorText}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Obtiene todos los Workspaces (Teams) de ClickUp asociados al token.
 */
export async function getWorkspaces(token: string): Promise<Array<{ id: string; name: string }>> {
  const data = await clickUpFetch<{ teams: Array<{ id: string; name: string }> }>('/team', token);
  if (!data.teams || data.teams.length === 0) {
    throw new Error('No se encontraron workspaces asociados a este token de ClickUp.');
  }
  return data.teams;
}

/**
 * Obtiene los miembros de un Workspace para poder asignarlos en las tareas.
 */
export async function getWorkspaceMembers(teamId: string, token: string) {
  const data = await clickUpFetch<{ 
    teams: Array<{ 
      id: string; 
      name: string; 
      members: Array<{ 
        user: { 
          id: number; 
          username: string; 
          initials: string; 
          color: string; 
          profilePicture?: string;
        } 
      }> 
    }> 
  }>('/team', token);
  
  const team = data.teams.find(t => t.id === teamId);
  return team?.members.map(m => m.user) || [];
}

/**
 * Obtiene la jerarquía completa (Spaces -> Folders -> Lists) de un Workspace.
 */
export async function getWorkspaceHierarchy(teamId: string, token: string) {
  // 1. Obtener Spaces del Team
  const spacesData = await clickUpFetch<{ spaces: Array<{ id: string; name: string }> }>(
    `/team/${teamId}/space?archived=false`, 
    token
  );
  
  const hierarchy = [];

  for (const space of spacesData.spaces || []) {
    const spaceNode: any = {
      id: space.id,
      name: space.name,
      folders: [],
      lists: [] // Listas sin carpeta (folderless)
    };

    // 2. Obtener Folders del Space
    try {
      const foldersData = await clickUpFetch<{ folders: Array<{ id: string; name: string }> }>(
        `/space/${space.id}/folder?archived=false`, 
        token
      );
      for (const folder of foldersData.folders || []) {
        const folderNode: any = {
          id: folder.id,
          name: folder.name,
          lists: []
        };

        // 3. Obtener Lists de la carpeta
        try {
          const listsData = await clickUpFetch<{ lists: Array<{ id: string; name: string }> }>(
            `/folder/${folder.id}/list?archived=false`, 
            token
          );
          folderNode.lists = listsData.lists.map(l => ({ id: l.id, name: l.name }));
        } catch (e) {
          console.error(`Error loading lists for folder ${folder.name}:`, e);
        }

        spaceNode.folders.push(folderNode);
      }
    } catch (e) {
      console.error(`Error loading folders for space ${space.name}:`, e);
    }

    // 4. Obtener Lists del Space sin carpeta (folderless)
    try {
      const folderlessData = await clickUpFetch<{ lists: Array<{ id: string; name: string }> }>(
        `/space/${space.id}/list?archived=false`, 
        token
      );
      spaceNode.lists = folderlessData.lists.map(l => ({ id: l.id, name: l.name }));
    } catch (e) {
      console.error(`Error loading folderless lists for space ${space.name}:`, e);
    }

    hierarchy.push(spaceNode);
  }

  return hierarchy;
}

/**
 * Obtiene todas las tareas activas de ClickUp, incluyendo sub-tareas, paginando si es necesario.
 */
export async function fetchAllTasks(teamId: string, token: string): Promise<ClickUpTask[]> {
  let allTasks: ClickUpTask[] = [];
  let page = 0;
  let hasMore = true;
  const limit = 100;

  while (hasMore) {
    const endpoint = `/team/${teamId}/task?page=${page}&limit=${limit}&subtasks=true`;
    const data = await clickUpFetch<{ tasks: ClickUpTask[] }>(endpoint, token);
    
    if (data.tasks && data.tasks.length > 0) {
      allTasks = allTasks.concat(data.tasks);
      if (data.tasks.length < limit) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }

    if (page > 10) {
      break;
    }
  }

  return allTasks;
}

export async function getListStatuses(listId: string, token: string) {
  const response = await fetch(`https://api.clickup.com/api/v2/list/${listId}`, {
    method: 'GET',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Error al obtener lista ${listId}: ${errText}`);
  }

  const data = await response.json();
  return data.statuses || [];
}

/**
 * Crea una nueva tarea en una lista de ClickUp.
 */
export async function createTask(listId: string, taskData: any, token: string) {
  return clickUpFetch(`/list/${listId}/task`, token, 'POST', taskData);
}

/**
 * Modifica una tarea existente de ClickUp.
 */
export async function updateTask(taskId: string, taskData: any, token: string) {
  return clickUpFetch(`/task/${taskId}`, token, 'PUT', taskData);
}

/**
 * Elimina una tarea de ClickUp.
 */
export async function deleteTask(taskId: string, token: string) {
  return clickUpFetch(`/task/${taskId}`, token, 'DELETE');
}
