export interface ClickUpAssignee {
  id: number;
  username: string;
  color: string;
  initials: string;
  email: string;
  profilePicture?: string;
}

export interface ClickUpStatus {
  status: string;
  id: string;
  color: string;
  type: string;
  orderindex: number;
}

export interface ClickUpPriority {
  id?: string;
  priority: 'urgent' | 'high' | 'normal' | 'low' | 'none';
  color: string;
  orderindex: string;
}

export interface ClickUpCustomField {
  id: string;
  name: string;
  type: string;
  type_config?: {
    options?: Array<{
      id: string;
      name: string;
      color: string;
      orderindex: number;
    }>;
  };
  value?: any;
}

export interface ClickUpTask {
  id: string;
  name: string;
  text_content?: string;
  description?: string;
  status: ClickUpStatus;
  date_created: string;
  date_updated: string;
  date_closed: string | null;
  date_done: string | null;
  archived: boolean;
  assignees?: ClickUpAssignee[];
  priority: ClickUpPriority | null;
  due_date: string | null;
  start_date: string | null;
  custom_fields?: ClickUpCustomField[];
  parent: string | { id: string } | null;
  list: {
    id: string;
    name: string;
  };
  folder: {
    id: string;
    name: string;
  };
  space: {
    id: string;
  };
  url: string;
}

export type TaskArea = 'Web' | 'Pauta Publicitaria' | 'Diseño y contenido' | 'Núcleo';

export interface ProcessedTask {
  id: string;
  name: string;
  description: string;
  status: {
    name: string;
    color: string;
  };
  priority: 'urgent' | 'high' | 'normal' | 'low' | 'none';
  priorityColor: string;
  dueDate: Date | null;
  dueDateTimeStamp: number | null;
  assignees: Array<{
    name: string;
    avatar?: string;
    initials: string;
  }>;
  area: TaskArea;
  client: string;
  url: string;
  parentName: string | null;
  // Alertas semáforo
  isExpired: boolean;
  isUnassigned: boolean;
  isNoDueDate: boolean;
  isCritical: boolean; // Si cumple alguna de las anteriores alertas rojas
  listId: string;
  dateUpdated: number;
}

export interface DashboardData {
  summary: {
    totalTasks: number;
    criticalTasks: number;
    expiredTasks: number;
    unassignedTasks: number;
    noDueDateTasks: number;
    completedTasks: number;
  };
  areas: {
    [key in TaskArea]: {
      total: number;
      critical: number;
      clients: {
        [clientName: string]: ProcessedTask[];
      };
    };
  };
  allClients: string[];
  availableStatuses: string[];
  recentActivity: ProcessedTask[];
}
