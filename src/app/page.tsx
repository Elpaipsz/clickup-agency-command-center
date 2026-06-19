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
          <div className="mb-8 p-lg glass-card border border-red-500/20 bg-gradient-to-r from-red-500/5 via-primary/5 to-transparent relative overflow-hidden rounded-2xl shadow-md animate-fade-in">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 via-primary to-transparent"></div>
            <div className="flex items-center gap-xs mb-2">
              <span className="text-xl">🔥</span>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Atención Hoy</h3>
            </div>
            <p className="font-label-md text-label-md text-red-500 uppercase tracking-wider font-extrabold mb-sm">
              {sortedAttentionTasks.length} {sortedAttentionTasks.length === 1 ? 'tarea crítica' : 'tareas críticas'}
            </p>
            <ul className="flex flex-col gap-xs max-w-2xl">
              {sortedAttentionTasks.slice(0, 5).map((task) => (
                <li key={task.id} className="flex items-center gap-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse"></span>
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="font-body-md text-body-md text-on-surface-variant hover:text-red-500 text-left transition-colors font-medium border-b border-transparent hover:border-red-500/30"
                  >
                    {task.name} <span className="text-xs text-on-surface-variant/40 ml-xs uppercase font-mono-data">({task.client})</span>
                  </button>
                </li>
              ))}
              {sortedAttentionTasks.length > 5 && (
                <li className="text-xs text-on-surface-variant/50 italic mt-xs">
                  Y {sortedAttentionTasks.length - 5} tareas más críticas abajo...
                </li>
              )}
            </ul>
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

      {selectedTask && (
        <TaskModal
          task={selectedTask}
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
