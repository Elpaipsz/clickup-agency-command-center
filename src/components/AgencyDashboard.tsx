'use client';

import useSWR from 'swr';
import React, { useState } from 'react';
import TaskModal from './TaskModal';
import Loader from './Loader';
import { ProcessedTask } from '@/types';

export default function AgencyDashboard() {
  const [filterArea, setFilterArea] = useState<string>('Todas');
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

  const { data, error, isLoading: loading, mutate } = useSWR('/api/tasks', fetcher, {
    revalidateOnFocus: false,
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] w-full glass-panel p-lg rounded-xl">
        <Loader />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-error-container text-on-error-container rounded-xl font-body-md border border-error">
        <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined">error</span> Error</div>
        <p>{error?.message || 'Error desconocido'}</p>
      </div>
    );
  }

  const { summary, areas } = data;
  
  // Calculate area distribution percentages
  const totalAreaTasks = summary.totalTasks || 1; // prevent divide by zero
  const getPercent = (num: number) => Math.round((num / totalAreaTasks) * 100);

  return (
    <div className="bento-grid">
      {/* KPI Cards Row */}
      <div className="col-span-12 md:col-span-3 glass-card rounded-xl p-lg flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-md">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Activas</h3>
          <span className="material-symbols-outlined text-secondary">cases</span>
        </div>
        <div>
          <div className="font-display-lg text-display-lg text-on-surface">{summary.totalTasks}</div>
          <div className="font-body-sm text-body-sm text-surface-tint mt-xs flex items-center gap-xs">
            Este mes
          </div>
        </div>
      </div>
      
      <div className="col-span-12 md:col-span-3 glass-card rounded-xl p-lg flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-md">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Tareas Críticas</h3>
          <span className="material-symbols-outlined text-error">warning</span>
        </div>
        <div>
          <div className="font-display-lg text-display-lg text-error">{summary.criticalTasks}</div>
          <div className="font-body-sm text-body-sm text-error mt-xs flex items-center gap-xs">
            <span className="material-symbols-outlined text-[16px]">priority_high</span>
            Requieren atención
          </div>
        </div>
      </div>
      
      <div className="col-span-12 md:col-span-3 glass-card rounded-xl p-lg flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-md">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Vencidas</h3>
          <span className="material-symbols-outlined text-on-surface-variant">timer_off</span>
        </div>
        <div>
          <div className="font-display-lg text-display-lg text-on-surface">{summary.expiredTasks}</div>
          <div className="font-body-sm text-body-sm text-surface-tint mt-xs flex items-center gap-xs">
            Pasadas de la fecha
          </div>
        </div>
      </div>
      
      <div className="col-span-12 md:col-span-3 glass-card rounded-xl p-lg flex flex-col justify-between hover:shadow-md transition-shadow bg-secondary-container text-on-secondary-container border-none">
        <div className="flex justify-between items-start mb-md">
          <h3 className="font-label-md text-label-md text-secondary-fixed-dim uppercase tracking-wider">Completadas</h3>
          <span className="material-symbols-outlined text-on-secondary-container">task_alt</span>
        </div>
        <div>
          <div className="font-display-lg text-display-lg">{summary.completedTasks}</div>
          <div className="font-body-sm text-body-sm text-secondary-fixed-dim mt-xs flex items-center gap-xs">
            Logradas recientemente
          </div>
        </div>
      </div>

      {/* Workload Distribution */}
      <div className="col-span-12 md:col-span-6 glass-card rounded-xl flex flex-col h-[350px]">
        <div className="p-lg border-b border-outline-variant/30">
          <h3 className="font-headline-md text-headline-md text-on-surface">Distribución de Carga</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Porcentaje de tareas por departamento</p>
        </div>
        <div className="p-lg flex-1 flex flex-col justify-center gap-md">
          {Object.entries(areas).map(([name, data]: [string, any], index) => {
             const percent = getPercent(data.total);
             const colors = ['bg-secondary', 'bg-primary-fixed-dim', 'bg-tertiary-fixed-dim', 'bg-outline-variant'];
             return (
               <div key={name}>
                 <div className="flex justify-between mb-xs">
                   <span className="font-label-md text-label-md text-on-surface">{name}</span>
                   <span className="font-mono-data text-mono-data text-on-surface-variant">{percent}% ({data.total})</span>
                 </div>
                 <div className="w-full bg-surface-container-low rounded-full h-2">
                   <div className={`${colors[index % colors.length]} h-2 rounded-full`} style={{ width: `${percent}%` }}></div>
                 </div>
               </div>
             );
          })}
        </div>
      </div>

      {/* Bottleneck Heatmap */}
      <div className="col-span-12 md:col-span-6 glass-card rounded-xl flex flex-col h-[350px]">
        <div className="p-lg border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest sticky top-0">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">Radar de Cuellos de Botella</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Tareas críticas o vencidas por departamento</p>
          </div>
          <span className="material-symbols-outlined text-error">warning</span>
        </div>
        <div className="p-lg flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-sm">
          {Object.entries(areas).map(([name, data]: [string, any]) => {
             if (data.critical === 0) return null;
             // Calculate severity
             const maxCritical = Math.max(...Object.values(areas).map((a: any) => a.critical)) || 1;
             const widthPercent = Math.max(10, Math.round((data.critical / maxCritical) * 100));
             const isHigh = data.critical >= 5;
             
             return (
               <div key={`critical-${name}`} className={`flex items-center gap-md p-sm rounded border ${isHigh ? 'bg-error-container/20 border-error-container/50' : 'bg-surface-container-highest border-outline-variant/30'}`}>
                 <div className="w-24 font-label-md text-label-md text-on-surface">{name}</div>
                 <div className="flex-1 flex gap-xs">
                   <div className={`h-6 rounded flex items-center justify-center font-mono-data text-xs ${isHigh ? 'bg-error-container text-on-error-container' : 'bg-surface-tint/20 text-on-surface-variant'}`} style={{ width: `${widthPercent}%` }}>
                     {isHigh ? 'Alto' : 'Medio'}
                   </div>
                 </div>
                 <div className={`font-mono-data text-mono-data font-bold ${isHigh ? 'text-on-error-container' : 'text-on-surface-variant'}`}>{data.critical}</div>
               </div>
             );
          })}
          
          {summary.criticalTasks === 0 && (
            <div className="flex-1 flex items-center justify-center font-body-sm text-on-surface-variant italic">
              No hay tareas críticas ni vencidas. ¡Excelente trabajo!
            </div>
          )}
        </div>
      </div>



      {/* Global Pipeline Table */}
      <div className="col-span-12 glass-card rounded-xl flex flex-col max-h-[600px] mt-md">
        <div className="p-lg border-b border-outline-variant/30 flex flex-col gap-md bg-surface-container-lowest sticky top-0 z-30">
          <div className="flex justify-between items-start md:items-center">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary">view_list</span>
                Pipeline Global Activo
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Vista general tabular de todas las tareas en curso ({summary.totalTasks})</p>
            </div>
            {/* Area Filters */}
            <div className="flex flex-wrap gap-sm mt-sm md:mt-0">
              <button 
                onClick={() => setFilterArea('Todas')}
                className={`px-sm py-xs font-label-md text-label-md rounded border transition-colors ${filterArea === 'Todas' ? 'bg-primary text-on-primary border-primary' : 'bg-surface hover:bg-surface-variant border-outline-variant text-on-surface-variant'}`}
              >
                Todas
              </button>
              {Object.keys(areas).map(area => (
                <button 
                  key={area}
                  onClick={() => setFilterArea(area)}
                  className={`px-sm py-xs font-label-md text-label-md rounded border transition-colors ${filterArea === area ? 'bg-primary text-on-primary border-primary' : 'bg-surface hover:bg-surface-variant border-outline-variant text-on-surface-variant'}`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar bg-surface/50">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-surface-container-lowest sticky top-0 z-20 shadow-sm">
              <tr className="text-on-surface-variant border-b border-outline-variant/30 font-label-md text-label-md uppercase tracking-wider">
                <th className="p-md pl-lg font-medium w-[15%]">Cliente</th>
                <th className="p-md font-medium w-[30%]">Tarea</th>
                <th className="p-md font-medium w-[15%]">Área</th>
                <th className="p-md font-medium w-[15%]">Estado</th>
                <th className="p-md font-medium w-[15%]">Responsables</th>
                <th className="p-md pr-lg font-medium text-right w-[10%]">Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(areas).map(([areaName, areaData]: [string, any]) => {
                if (filterArea !== 'Todas' && filterArea !== areaName) return null;

                const areaTasks = Object.values(areaData.clients).flatMap((tasks: any) => tasks);
                if (areaTasks.length === 0) return null;

                const sortedAreaTasks = areaTasks.sort((a: any, b: any) => {
                  if (a.isCritical && !b.isCritical) return -1;
                  if (!a.isCritical && b.isCritical) return 1;
                  return a.client.localeCompare(b.client);
                });

                return (
                  <React.Fragment key={areaName}>
                    {/* Area Section Header */}
                    <tr className="bg-surface-container-highest border-y border-outline-variant/50">
                      <td colSpan={6} className="p-md pl-lg font-headline-sm text-on-surface uppercase tracking-widest flex items-center gap-sm">
                        <span className="w-2 h-6 bg-secondary rounded-full inline-block"></span>
                        {areaName}
                        <span className="bg-surface text-on-surface-variant px-2 py-0.5 rounded font-mono-data text-xs ml-2 shadow-sm border border-outline-variant/50">
                          {areaTasks.length} {areaTasks.length === 1 ? 'tarea' : 'tareas'}
                        </span>
                      </td>
                    </tr>
                    {/* Area Tasks */}
                    {sortedAreaTasks.map((task: any) => (
                      <tr 
                        key={task.id} 
                        onClick={() => setSelectedTask(task)}
                        className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors group cursor-pointer"
                        title="Ver detalles de la tarea"
                      >
                        <td className="p-md pl-lg text-on-surface-variant font-label-md truncate max-w-[150px]">{task.client}</td>
                        <td className="p-md text-on-surface font-body-md">
                          <div className="flex items-center gap-xs">
                            {task.isCritical && <span className="w-2 h-2 rounded-full bg-error flex-shrink-0" title="Crítica"></span>}
                            <span className="line-clamp-1 group-hover:text-primary transition-colors flex items-center gap-1">
                              {task.name}
                              <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                            </span>
                          </div>
                        </td>
                        <td className="p-md text-on-surface-variant font-body-sm">{areaName}</td>
                        <td className="p-md">
                          <span className="px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border" style={{ backgroundColor: `${task.status.color}15`, color: task.status.color, borderColor: `${task.status.color}40` }}>
                            {task.status.name}
                          </span>
                        </td>
                        <td className="p-md">
                          <div className="flex -space-x-2">
                            {task.assignees.length > 0 ? task.assignees.slice(0, 3).map((a: any, i: number) => (
                              <div key={i} title={a.name} className="w-6 h-6 rounded-full border border-outline-variant bg-surface-variant flex items-center justify-center text-[10px] font-bold overflow-hidden z-0 relative">
                                {a.avatar ? <img src={a.avatar} alt={a.name} /> : a.initials}
                              </div>
                            )) : (
                              <span className="text-error font-label-sm">Sin asignar</span>
                            )}
                          </div>
                        </td>
                        <td className="p-md pr-lg text-right font-mono-data text-xs">
                          {task.dueDate ? (
                            <span className={task.isExpired ? 'text-error font-bold' : 'text-on-surface-variant'}>
                              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          ) : (
                            <span className="text-outline">--</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskModal 
          task={selectedTask}
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
