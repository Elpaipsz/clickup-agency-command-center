'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import TaskModal from './TaskModal';
import Loader from './Loader';

import { ProcessedTask, DashboardData } from '../types';

export default function TaskBoard({ departmentTitle, departmentKey }: { departmentTitle: string, departmentKey: string }) {
  const [selectedTask, setSelectedTask] = useState<ProcessedTask | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  
  // Create Task State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetcher = async (url: string) => {
    const token = localStorage.getItem('CLICKUP_TOKEN');
    const res = await fetch(url, {
      headers: token ? { 'x-clickup-token': token } : {}
    });
    
    if (res.status === 401) {
      throw new Error('No hay token de ClickUp configurado o es inválido. Por favor configúralo.');
    }
    if (!res.ok) throw new Error('Error al obtener tareas de ClickUp.');
    
    return res.json();
  };

  const { data, error, isLoading: loading, mutate } = useSWR('/api/tasks', fetcher, {
    revalidateOnFocus: false, // Evitar recargar cada vez que cambia de pestaña del navegador
    dedupingInterval: 60000, // Mantener cache por 60 segundos antes de intentar refetch de fondo
  });

  const getPriorityBadge = (task: ProcessedTask) => {
    if (task.isCritical) {
      return (
        <span className="px-3 py-1 rounded-full bg-error/20 border border-error/50 text-error font-label-lg font-black uppercase tracking-widest shadow-[0_0_12px_rgba(248,81,73,0.3)] flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">warning</span>
          CRÍTICA
        </span>
      );
    }
    if (task.priority === 'urgent') return <span className="px-sm py-xs rounded-full bg-[#f44336]/10 text-[#f44336] font-mono-data text-[10px] uppercase tracking-wider">Urgente</span>;
    if (task.priority === 'high') return <span className="px-sm py-xs rounded-full bg-[#ff9800]/10 text-[#ff9800] font-mono-data text-[10px] uppercase tracking-wider">Alta</span>;
    if (task.priority === 'normal') return <span className="px-sm py-xs rounded-full bg-surface-variant text-on-surface-variant font-mono-data text-[10px] uppercase tracking-wider">Normal</span>;
    if (task.priority === 'low') return <span className="px-sm py-xs rounded-full bg-[#8bc34a]/10 text-[#8bc34a] font-mono-data text-[10px] uppercase tracking-wider">Baja</span>;
    return <span className="px-sm py-xs rounded-full bg-surface-container text-on-surface-variant font-mono-data text-[10px] uppercase tracking-wider">Sin Prioridad</span>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] w-full glass-panel p-lg rounded-xl">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-error-container text-on-error-container rounded-xl font-body-md border border-error">
        <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined">error</span> Error</div>
        <p>{error}</p>
      </div>
    );
  }

  const areaData = data?.areas[departmentKey];
  const clients = areaData ? Object.keys(areaData.clients) : [];

  // Default to first client if none selected
  if (clients.length > 0 && !selectedClient) {
    setSelectedClient(clients[0]);
  }

  const handleDelete = async () => {
    if (!selectedTask) return;
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('CLICKUP_TOKEN');
      const res = await fetch(`/api/tasks?id=${selectedTask.id}`, {
        method: 'DELETE',
        headers: token ? { 'x-clickup-token': token } : {}
      });
      if (!res.ok) throw new Error('Error al eliminar');
      setSelectedTask(null);
      mutate(); // Refresh the cache via SWR
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !areaData.clients[selectedClient]) return;
    
    // Attempt to get listId from an existing task of this client
    const clientTasks = areaData.clients[selectedClient];
    const listId = clientTasks.length > 0 ? clientTasks[0].listId : null;
    
    if (!listId) {
      alert('Este cliente no tiene tareas activas de donde heredar la Lista de ClickUp. Debes crear la primera tarea directamente en ClickUp.');
      return;
    }
    
    setIsCreating(true);
    try {
      const token = localStorage.getItem('CLICKUP_TOKEN');
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: token ? { 'x-clickup-token': token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listId,
          name: newTaskName,
          description: newTaskDesc
        })
      });
      if (!res.ok) throw new Error('Error al crear la tarea en ClickUp');
      
      setShowCreateModal(false);
      setNewTaskName('');
      setNewTaskDesc('');
      mutate(); // Refresh tasks globally!
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const token = localStorage.getItem('CLICKUP_TOKEN');
      const res = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'PUT',
        headers: token ? { 'x-clickup-token': token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toLowerCase() })
      });
      if (!res.ok) throw new Error('Error al actualizar el estado');
      
      // Update local selectedTask state immediately for better UX
      if (selectedTask) {
         setSelectedTask({ ...selectedTask, status: { ...selectedTask.status, name: newStatus } });
      }
      mutate(); // Refresh global data
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="flex flex-col gap-lg w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-md gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg md:font-display-lg md:text-display-lg text-on-surface">{departmentTitle}</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">Gestión de Tareas y Operaciones</p>
        </div>
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-xs px-md py-sm bg-surface-container rounded-full border border-outline-variant">
            <span className="material-symbols-outlined text-[#008a00] text-[18px]">check_circle</span>
            <span className="font-mono-data text-mono-data text-on-surface-variant">Sincronizado</span>
          </div>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">check_circle</span>
          <h3 className="font-headline-md text-on-surface">No hay tareas activas</h3>
          <p className="text-on-surface-variant font-body-sm">Todo está al día en este departamento.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-lg flex-1 min-h-0">
          {/* Client List (Sidebar on Desktop, Horizontal on Mobile) */}
          <div className="flex flex-row md:flex-col gap-sm overflow-x-auto md:overflow-y-auto md:w-[280px] flex-shrink-0 pb-sm md:pb-0 md:pr-sm custom-scrollbar">
            {clients.map(clientName => {
              const clientTasks: ProcessedTask[] = areaData.clients[clientName];
              const taskCount = clientTasks.length;
              const criticalCount = clientTasks.filter((t: ProcessedTask) => t.isCritical).length;
              const isSelected = selectedClient === clientName;
              
              return (
                <button 
                  key={clientName} 
                  onClick={() => setSelectedClient(clientName)} 
                  className={`flex flex-col text-left p-md transition-all duration-300 min-w-[200px] md:min-w-0 ${isSelected ? 'glass-card bg-primary/20 border-primary/50 shadow-md scale-[1.02]' : 'glass-card hover:bg-white/[0.08]'}`}
                >
                  <div className="flex justify-between items-start mb-xs">
                    <span className="font-label-md text-label-md truncate pr-2">{clientName}</span>
                    {criticalCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-error flex-shrink-0 mt-1"></span>
                    )}
                  </div>
                  <div className={`font-mono-data text-[12px] ${isSelected ? 'text-on-secondary/80' : 'text-on-surface-variant'}`}>
                    {taskCount} {taskCount === 1 ? 'tarea' : 'tareas'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Task List for Selected Client */}
          <div className="flex-1 flex flex-col glass-card overflow-hidden">
            {selectedClient && areaData.clients[selectedClient] ? (
              <>
                <div className="px-lg py-md border-b border-white/[0.08] flex justify-between items-center bg-white/[0.02] sticky top-0 z-10">
                  <div className="flex items-center gap-md">
                    <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-headline-md text-headline-md">
                      {selectedClient.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">{selectedClient}</h3>
                  </div>
                </div>
                <div className="p-md md:p-lg flex flex-col gap-sm overflow-y-auto custom-scrollbar flex-1">
                  {(areaData.clients[selectedClient] as ProcessedTask[]).map(task => {
                    const dotColor = task.status.color;
                    const hexColor = dotColor.startsWith('#') ? dotColor : '#cccccc';

                    return (
                      <div 
                        key={task.id} 
                        onClick={() => setSelectedTask(task)} 
                        className="flex flex-col md:flex-row items-start md:items-center justify-between p-lg transition-all cursor-pointer group gap-md glass-card relative overflow-hidden"
                      >
                        {/* Status Color Strip */}
                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: hexColor }}></div>
                        
                        <div className="flex flex-col gap-sm flex-1 overflow-hidden w-full pl-2">
                          <span className="font-headline-sm text-headline-sm text-on-surface line-clamp-2">{task.name}</span>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hexColor }}></div>
                            <span className="font-label-md text-label-md uppercase font-bold tracking-wider" style={{ color: hexColor }}>
                              {task.status.name}
                            </span>
                            {task.isExpired && <span className="font-label-md text-error flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">timer_off</span> • Vencida</span>}
                            {task.isNoDueDate && <span className="font-label-md text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">event_busy</span> • Sin fecha</span>}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between md:justify-end gap-lg w-full md:w-auto flex-shrink-0 mt-2 md:mt-0">
                          <div>
                            {getPriorityBadge(task)}
                          </div>
                          
                          {/* Assignees with Names */}
                          <div className="flex flex-wrap items-center gap-2">
                            {task.assignees.length > 0 ? (
                              task.assignees.map((a, i) => (
                                <div key={i} className="flex items-center gap-2 bg-surface rounded-full pr-3 border border-outline-variant/50" title={a.name}>
                                  {a.avatar ? (
                                    <img src={a.avatar} alt={a.name} className="w-8 h-8 rounded-full border border-outline-variant bg-surface" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full border border-outline-variant bg-surface-variant flex items-center justify-center text-[12px] font-bold">
                                      {a.initials}
                                    </div>
                                  )}
                                  <span className="font-label-sm text-on-surface-variant hidden md:block">{a.name.split(' ')[0]}</span>
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center gap-2 bg-error-container/30 text-on-error-container rounded-full px-3 py-1 border border-error-container" title="Sin asignar">
                                <span className="material-symbols-outlined text-[16px]">person_add</span>
                                <span className="font-label-sm">Sin asignar</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskModal 
          task={selectedTask}
          departmentTitle={departmentTitle}
          availableStatuses={data?.availableStatuses || []}
          onClose={() => setSelectedTask(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          isUpdatingStatus={isUpdatingStatus}
          isDeleting={isDeleting}
        />
      )}

    </div>
  );
}
