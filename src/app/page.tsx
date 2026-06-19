'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import AgencyDashboard from '../components/AgencyDashboard';
import TaskModal from '../components/TaskModal';
import { ProcessedTask } from '@/types';

export default function Page() {
  const [selectedTask, setSelectedTask] = useState<ProcessedTask | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetcher = async (url: string) => {
    const token = localStorage.getItem('CLICKUP_TOKEN');
    const res = await fetch(url, {
      headers: token ? { 'x-clickup-token': token } : {}
    });
    if (!res.ok) throw new Error('Error al obtener tareas de ClickUp.');
    return res.json();
  };

  const { data, mutate } = useSWR('/api/tasks', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 300000,
    dedupingInterval: 60000,
  });

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
      
      if (selectedTask) {
        setSelectedTask({ ...selectedTask, status: { ...selectedTask.status, name: newStatus } });
      }
      mutate();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('CLICKUP_TOKEN');
      const res = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE',
        headers: token ? { 'x-clickup-token': token } : {}
      });
      if (!res.ok) throw new Error('Error al eliminar');
      setSelectedTask(null);
      mutate();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter and sort tasks for Attention Today
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;

  const allTasks: ProcessedTask[] = [];
  if (data?.areas) {
    Object.values(data.areas).forEach((area: any) => {
      Object.values(area.clients).forEach((clientTasks: any) => {
        allTasks.push(...clientTasks);
      });
    });
  }

  const isTaskActive = (task: ProcessedTask) => {
    const statusName = task.status.name.toLowerCase();
    return !(statusName === 'completado' || statusName === 'closed' || statusName === 'hecho' || statusName.includes('aprobado'));
  };

  const activeTasks = allTasks.filter(isTaskActive);

  const attentionTasks = activeTasks.filter(task => {
    const isUrgent = task.priority === 'urgent';
    const isExpired = task.isExpired;
    const isToday = task.dueDateTimeStamp !== null && 
                    task.dueDateTimeStamp >= todayStart && 
                    task.dueDateTimeStamp <= todayEnd;
    return isUrgent || isExpired || isToday;
  });

  const sortedAttentionTasks = [...attentionTasks].sort((a, b) => {
    const aUrgent = a.priority === 'urgent' ? 1 : 0;
    const bUrgent = b.priority === 'urgent' ? 1 : 0;
    if (aUrgent !== bUrgent) return bUrgent - aUrgent;

    const aExpired = a.isExpired ? 1 : 0;
    const bExpired = b.isExpired ? 1 : 0;
    if (aExpired !== bExpired) return bExpired - aExpired;

    const aToday = (a.dueDateTimeStamp !== null && a.dueDateTimeStamp >= todayStart && a.dueDateTimeStamp <= todayEnd) ? 1 : 0;
    const bToday = (b.dueDateTimeStamp !== null && b.dueDateTimeStamp >= todayStart && b.dueDateTimeStamp <= todayEnd) ? 1 : 0;
    if (aToday !== bToday) return bToday - aToday;

    return 0;
  });

  const [isAllAttentionOpen, setIsAllAttentionOpen] = useState(false);
  const [attentionSearch, setAttentionSearch] = useState('');

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

  const filteredAttentionTasks = sortedAttentionTasks.filter(task => 
    task.name.toLowerCase().includes(attentionSearch.toLowerCase()) ||
    task.client.toLowerCase().includes(attentionSearch.toLowerCase())
  );

  return (
    <main className="flex-1 flex flex-col overflow-y-auto w-full">
      {/* TopAppBar (Mobile) */}
      <header className="md:hidden bg-surface-container-lowest dark:bg-surface-container-highest shadow-sm border-b border-outline-variant p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="font-headline-md text-headline-md font-bold text-on-surface">Command Center</div>
        <span className="material-symbols-outlined text-on-surface">menu</span>
      </header>

      {/* Dashboard Canvas */}
      <div className="p-6 md:p-8 flex-1 max-w-container-max w-full">
        {/* 🔥 Atención Hoy Widget */}
        {sortedAttentionTasks.length > 0 && (
          <div className="mb-8 p-lg glass-card border border-red-500/20 bg-gradient-to-r from-red-500/5 via-primary/5 to-transparent relative overflow-hidden rounded-2xl shadow-md animate-fade-in flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 via-primary to-transparent"></div>
            <div className="flex items-center justify-between mb-md">
              <div className="flex items-center gap-xs">
                <span className="text-xl">🔥</span>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Atención Hoy</h3>
              </div>
              <button 
                onClick={() => setIsAllAttentionOpen(true)}
                className="px-md py-xs rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 font-label-md transition-all text-xs btn-glint"
              >
                Ver listado completo ({sortedAttentionTasks.length})
              </button>
            </div>
            
            <p className="font-label-md text-label-md text-red-500 uppercase tracking-wider font-extrabold mb-sm">
              Mostrando las 3 tareas de mayor urgencia
            </p>
            
            {/* List with board-style cards */}
            <div className="flex flex-col gap-sm">
              {sortedAttentionTasks.slice(0, 3).map((task) => {
                const dotColor = task.status.color;
                const hexColor = dotColor.startsWith('#') ? dotColor : '#cccccc';

                return (
                  <div 
                    key={task.id} 
                    onClick={() => setSelectedTask(task)} 
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-lg transition-all cursor-pointer group gap-md glass-card relative overflow-hidden hover:bg-white/[0.04]"
                  >
                    {/* Status Color Strip */}
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: hexColor }}></div>
                    
                    <div className="flex flex-col gap-sm flex-1 overflow-hidden w-full pl-2">
                      <span className="font-mono-data text-[10px] text-on-surface-variant/60 uppercase tracking-wider">
                        {task.area} • {task.client}
                      </span>
                      <span className="font-bold text-[16px] text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                        {task.name}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hexColor }}></div>
                        <span className="font-label-md text-[11px] uppercase font-bold tracking-wider" style={{ color: hexColor }}>
                          {task.status.name}
                        </span>
                        {task.isExpired && <span className="font-label-md text-error text-[11px] flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">timer_off</span> • Vencida</span>}
                        {task.dueDate && <span className="font-label-md text-on-surface-variant text-[11px] flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">calendar_today</span> • {new Date(task.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-lg w-full md:w-auto flex-shrink-0 mt-1 md:mt-0">
                      <div>
                        {getPriorityBadge(task)}
                      </div>
                      
                      {/* Assignees */}
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
                              <span className="font-label-sm text-on-surface-variant hidden md:block text-[11px]">{a.name.split(' ')[0]}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-2 bg-error-container/30 text-on-error-container rounded-full px-3 py-1 border border-error-container" title="Sin asignar">
                            <span className="material-symbols-outlined text-[14px]">person_add</span>
                            <span className="font-label-sm text-[11px]">Sin asignar</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="font-display-lg text-display-lg text-on-surface mb-1">Resumen de Rendimiento</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Resumen ejecutivo de la velocidad de la agencia y asignación de recursos.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono-data text-mono-data text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-lg border border-outline-variant">
              Última actualización: Ahora mismo
            </span>
          </div>
        </header>

        <AgencyDashboard />
      </div>

      {/* Pop-up Modal for All Attention Tasks */}
      {isAllAttentionOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-6xl max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col bg-[var(--bg-main)] border border-[var(--border-glass)] relative">
            
            {/* Header */}
            <div className="p-lg border-b border-[var(--border-glass)] flex justify-between items-start bg-surface/50">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold flex items-center gap-xs">
                  <span className="text-xl">🔥</span>
                  Tareas de Hoy y Críticas
                </h2>
                <p className="font-body-sm text-on-surface-variant">
                  Listado completo de tareas urgentes, vencidas o programadas para hoy.
                </p>
              </div>
              <button 
                onClick={() => setIsAllAttentionOpen(false)} 
                className="p-xs hover:bg-surface-variant rounded-full text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Sub-header with search / metrics */}
            <div className="p-md px-lg bg-surface/30 border-b border-[var(--border-glass)] flex flex-col md:flex-row justify-between items-center gap-md">
              <div className="text-xs font-mono-data text-on-surface-variant/70 uppercase">
                {sortedAttentionTasks.length} tareas en total
              </div>
              <input
                type="text"
                placeholder="Buscar tarea..."
                value={attentionSearch}
                onChange={(e) => setAttentionSearch(e.target.value)}
                className="w-full md:w-72 bg-[var(--bg-surface)] border border-[var(--border-glass)] focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-md py-xs text-[var(--text-primary)] font-body-sm outline-none transition-all placeholder:text-[var(--text-muted)] animate-fade-in"
              />
            </div>

            {/* Scrollable list */}
            <div className="p-lg overflow-y-auto flex-1 flex flex-col gap-sm custom-scrollbar bg-surface/10">
              {filteredAttentionTasks.map((task) => {
                const dotColor = task.status.color;
                const hexColor = dotColor.startsWith('#') ? dotColor : '#cccccc';

                return (
                  <div 
                    key={task.id} 
                    onClick={() => {
                      setSelectedTask(task);
                    }} 
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-lg transition-all cursor-pointer group gap-md glass-card relative overflow-hidden hover:bg-white/[0.04]"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: hexColor }}></div>
                    
                    <div className="flex flex-col gap-sm flex-1 overflow-hidden w-full pl-2">
                      <span className="font-mono-data text-[10px] text-on-surface-variant/60 uppercase tracking-wider">
                        {task.area} • {task.client}
                      </span>
                      <span className="font-bold text-[16px] text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                        {task.name}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hexColor }}></div>
                        <span className="font-label-md text-[11px] uppercase font-bold tracking-wider" style={{ color: hexColor }}>
                          {task.status.name}
                        </span>
                        {task.isExpired && <span className="font-label-md text-error text-[11px] flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">timer_off</span> • Vencida</span>}
                        {task.dueDate && <span className="font-label-md text-on-surface-variant text-[11px] flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">calendar_today</span> • {new Date(task.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-lg w-full md:w-auto flex-shrink-0 mt-1 md:mt-0">
                      <div>
                        {getPriorityBadge(task)}
                      </div>
                      
                      {/* Assignees */}
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
                              <span className="font-label-sm text-on-surface-variant hidden md:block text-[11px]">{a.name.split(' ')[0]}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-2 bg-error-container/30 text-on-error-container rounded-full px-3 py-1 border border-error-container" title="Sin asignar">
                            <span className="material-symbols-outlined text-[14px]">person_add</span>
                            <span className="font-label-sm text-[11px]">Sin asignar</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredAttentionTasks.length === 0 && (
                <div className="p-xl text-center text-on-surface-variant/50 font-body-md">
                  No se encontraron tareas con ese nombre.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          availableStatuses={data?.availableStatuses || []}
          onClose={() => setSelectedTask(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          isDeleting={isDeleting}
          isUpdatingStatus={isUpdatingStatus}
        />
      )}
    </main>
  );
}
