import { ClickUpTask, ProcessedTask, TaskArea, DashboardData } from '../types';

/**
 * Normaliza y extrae el nombre del cliente a partir del nombre de la tarea o de su padre.
 */
export function extractClient(task: ClickUpTask, parentName?: string | null): string {
  if (task.folder && task.folder.name && task.folder.name.toLowerCase() !== 'hidden') {
    return task.folder.name.trim();
  }
  if (task.list && task.list.name) {
    return task.list.name.trim();
  }
  return 'General';
}

/**
 * Clasifica una tarea en una de las 4 áreas principales: Web, Pauta Publicitaria, Diseño y contenido, o Núcleo.
 */
export function classifyArea(task: ClickUpTask, parentName?: string | null): TaskArea {
  const name = task.name.toLowerCase();
  const desc = (task.description || '').toLowerCase();
  const parent = (parentName || '').toLowerCase();
  
  // Obtener valor del custom field "Tipo"
  let customFieldTipo = '';
  if (task.custom_fields) {
    const cf = task.custom_fields.find(f => f.name.toLowerCase() === 'tipo');
    if (cf && cf.value !== undefined) {
      if (cf.type === 'drop_down' && cf.type_config?.options) {
        // En ClickUp, el value puede ser el ID o el índice de la opción
        const opt = cf.type_config.options.find(o => o.id === cf.value || o.orderindex === cf.value);
        if (opt) customFieldTipo = opt.name.toLowerCase();
      } else if (typeof cf.value === 'string') {
        customFieldTipo = cf.value.toLowerCase();
      }
    }
  }

  // 1. Web
  if (
    name.includes('web') || 
    name.includes('seo') || 
    name.includes('blog') || 
    name.includes('hosting') || 
    name.includes('desarrollo') ||
    desc.includes('web') ||
    parent.includes('web') ||
    parent.includes('blog')
  ) {
    return 'Web';
  }

  // 2. Pauta Publicitaria
  if (
    name.includes('pauta') ||
    name.includes('campaña') ||
    name.includes('campana') ||
    name.includes('ads') ||
    name.includes('anuncio') ||
    customFieldTipo.includes('pauta') ||
    desc.includes('pauta') ||
    parent.includes('pauta') ||
    parent.includes('ads')
  ) {
    return 'Pauta Publicitaria';
  }

  // 3. Diseño y contenido
  if (
    name.includes('reels') ||
    name.includes('logotipo') ||
    name.includes('branding') ||
    name.includes('copy') ||
    name.includes('videos') ||
    name.includes('video') ||
    name.includes('diseño') ||
    name.includes('diseno') ||
    name.includes('boletín') ||
    name.includes('boletin') ||
    name.includes('email') ||
    name.includes('carta') ||
    name.includes('redactar') ||
    name.includes('grabar') ||
    name.includes('editar') ||
    name.includes('contenido') ||
    customFieldTipo.includes('contenido') ||
    customFieldTipo.includes('email') ||
    customFieldTipo.includes('comunidad') ||
    parent.includes('reels') ||
    parent.includes('contenido') ||
    parent.includes('boletín')
  ) {
    return 'Diseño y contenido';
  }

  // 4. Núcleo (Por defecto)
  return 'Núcleo';
}

export function processTasks(clickUpTasks: ClickUpTask[]): ProcessedTask[] {
  const now = Date.now();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  
  // Limpieza de tareas antiguas o irrelevantes (del mes pasado)
  const filteredTasks = clickUpTasks.filter(t => {
    const statusName = t.status?.status?.toLowerCase() || '';
    const isCompleted = t.status?.type === 'closed' || t.status?.type === 'done' || statusName === 'completado' || statusName === 'hecho' || statusName === 'closed' || statusName.includes('aprobado');
    
    // 1. Tareas completadas: solo mantener si se cerraron/actualizaron recientemente (últimos 30 días)
    if (isCompleted) {
      const closedDate = t.date_closed ? parseInt(t.date_closed) : (t.date_done ? parseInt(t.date_done) : parseInt(t.date_updated));
      if (now - closedDate > THIRTY_DAYS_MS) {
        return false;
      }
    }
    
    return true;
  });

  // Crear un mapa de tareas para buscar padres rápidamente
  const taskMap = new Map<string, ClickUpTask>();
  clickUpTasks.forEach(t => taskMap.set(t.id, t));

  return filteredTasks.map(t => {
    // Resolver nombre del padre
    let parentName: string | null = null;
    if (t.parent) {
      const parentId = typeof t.parent === 'string' ? t.parent : t.parent.id;
      const parentTask = taskMap.get(parentId);
      if (parentTask) {
        parentName = parentTask.name;
      }
    }

    const client = extractClient(t, parentName);
    const area = classifyArea(t, parentName);
    
    // Parsear fecha de vencimiento
    const dueDate = t.due_date ? new Date(parseInt(t.due_date)) : null;
    const dueDateTimeStamp = t.due_date ? parseInt(t.due_date) : null;

    // Alertas críticas (Semáforo Rojo)
    const now = new Date();
    const isExpired = dueDate ? (dueDate < now && t.status?.type !== 'closed') : false;
    const isUnassigned = !t.assignees || t.assignees.length === 0;
    const isNoDueDate = !t.due_date;
    const isCritical = isExpired || isUnassigned || isNoDueDate;

    // Normalizar prioridad
    let priority: 'urgent' | 'high' | 'normal' | 'low' | 'none' = 'none';
    let priorityColor = '#b0bec5'; // Gris
    
    if (t.priority) {
      const p = t.priority.priority;
      if (p === 'urgent') {
        priority = 'urgent';
        priorityColor = '#f44336'; // Rojo
      } else if (p === 'high') {
        priority = 'high';
        priorityColor = '#ff9800'; // Naranja
      } else if (p === 'normal') {
        priority = 'normal';
        priorityColor = '#2196f3'; // Azul
      } else if (p === 'low') {
        priority = 'low';
        priorityColor = '#8bc34a'; // Verde
      }
    }

    return {
      id: t.id,
      name: t.name,
      description: t.description || '',
      status: {
        name: t.status?.status || 'pendiente',
        color: t.status?.color || '#87909e'
      },
      priority,
      priorityColor,
      dueDate,
      dueDateTimeStamp,
      assignees: t.assignees?.map(a => ({
        name: a.username,
        avatar: a.profilePicture,
        initials: a.initials
      })) || [],
      area,
      client,
      url: t.url,
      parentName,
      isExpired,
      isUnassigned,
      isNoDueDate,
      isCritical,
      listId: t.list?.id || '',
      dateUpdated: parseInt(t.date_updated || '0')
    };
  });
}

/**
 * Agrupa y ordena las tareas procesadas para el Dashboard.
 */
export function buildDashboardData(processedTasks: ProcessedTask[]): DashboardData {
  // Inicializar estructura de la data
  const data: DashboardData = {
    summary: {
      totalTasks: 0,
      criticalTasks: 0,
      expiredTasks: 0,
      unassignedTasks: 0,
      noDueDateTasks: 0,
      completedTasks: 0
    },
    areas: {
      'Web': { total: 0, critical: 0, clients: {} },
      'Pauta Publicitaria': { total: 0, critical: 0, clients: {} },
      'Diseño y contenido': { total: 0, critical: 0, clients: {} },
      'Núcleo': { total: 0, critical: 0, clients: {} }
    },
    allClients: [],
    availableStatuses: [],
    recentActivity: []
  };

  const clientSet = new Set<string>();
  const statusSet = new Set<string>();

  // Collect all unique clients and statuses first
  processedTasks.forEach(task => {
    clientSet.add(task.client);
    if (task.status?.name) {
      statusSet.add(task.status.name.toUpperCase());
    }
  });

  data.allClients = Array.from(clientSet).sort();
  data.availableStatuses = Array.from(statusSet).sort();

  // Seed every area with every client so they appear even if they have 0 tasks
  (Object.keys(data.areas) as TaskArea[]).forEach(area => {
    data.allClients.forEach(client => {
      data.areas[area].clients[client] = [];
    });
  });

  // Collect recent activity (most recently updated tasks)
  data.recentActivity = [...processedTasks]
    .sort((a, b) => b.dateUpdated - a.dateUpdated)
    .slice(0, 15);

  processedTasks.forEach(task => {
    // Filtrar tareas completadas para métricas
    const statusName = task.status.name.toLowerCase();
    const isCompleted = statusName === 'completado' || statusName === 'closed' || statusName === 'hecho' || statusName.includes('aprobado');
    
    data.summary.totalTasks++;
    if (isCompleted) {
      data.summary.completedTasks++;
    }

    if (task.isCritical) data.summary.criticalTasks++;
    if (task.isExpired) data.summary.expiredTasks++;
    if (task.isUnassigned) data.summary.unassignedTasks++;
    if (task.isNoDueDate) data.summary.noDueDateTasks++;

    clientSet.add(task.client);

    // Agrupar por Area y Cliente
    const areaGroup = data.areas[task.area];
    areaGroup.total++;
    if (task.isCritical) areaGroup.critical++;

    // (No need to initialize it here anymore since we seeded it above)
    areaGroup.clients[task.client].push(task);
  });

  // Sort clients inside each area by task count descending
  (Object.keys(data.areas) as TaskArea[]).forEach(area => {
    const areaGroup = data.areas[area];
    const sortedClients: Record<string, ProcessedTask[]> = {};
    
    // Sort clients by number of tasks descending
    const sortedClientKeys = Object.keys(areaGroup.clients).sort((a, b) => {
      return areaGroup.clients[b].length - areaGroup.clients[a].length;
    });

    sortedClientKeys.forEach(key => {
      sortedClients[key] = areaGroup.clients[key];
    });

    areaGroup.clients = sortedClients;
  });

  // Ordenamiento de las tareas dentro de cada cliente:
  // 1. Tareas críticas primero.
  // 2. Ordenadas por prioridad (urgent -> high -> normal -> low -> none).
  // 3. Ordenadas por fecha de vencimiento más próxima.
  const priorityWeights = { urgent: 4, high: 3, normal: 2, low: 1, none: 0 };

  (Object.keys(data.areas) as TaskArea[]).forEach(area => {
    const areaGroup = data.areas[area];
    Object.keys(areaGroup.clients).forEach(client => {
      areaGroup.clients[client].sort((a, b) => {
        // Críticas primero
        if (a.isCritical && !b.isCritical) return -1;
        if (!a.isCritical && b.isCritical) return 1;

        // Prioridad de ClickUp
        const aWeight = priorityWeights[a.priority];
        const bWeight = priorityWeights[b.priority];
        if (aWeight !== bWeight) return bWeight - aWeight;

        // Fecha de vencimiento más próxima (null al final)
        if (a.dueDateTimeStamp !== null && b.dueDateTimeStamp !== null) {
          return a.dueDateTimeStamp - b.dueDateTimeStamp;
        }
        if (a.dueDateTimeStamp !== null && b.dueDateTimeStamp === null) return -1;
        if (a.dueDateTimeStamp === null && b.dueDateTimeStamp !== null) return 1;

        return 0;
      });
    });
  });

  return data;
}
