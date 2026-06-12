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
      <div className="col-span-12 md:col-span-3 glass-card p-lg flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-300 group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/50 to-transparent"></div>
        <div className="flex justify-between items-start mb-md">
          <h3 className="font-label-md text-label-md text-on-surface-variant/70 uppercase tracking-[0.12em]">Total Activas</h3>
          <span className="material-symbols-outlined text-primary text-[20px]">cases</span>
        </div>
        <div>
          <div className="font-display-lg text-display-lg text-on-surface font-black tracking-tight">{summary.totalTasks}</div>
          <div className="font-body-sm text-body-sm text-on-surface-variant/50 mt-xs flex items-center gap-xs">
            Sincronizado con ClickUp
          </div>
        </div>
      </div>
      
      <div className="col-span-12 md:col-span-3 glass-card p-lg flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-300 group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-error/50 to-transparent"></div>
        <div className="flex justify-between items-start mb-md">
          <h3 className="font-label-md text-label-md text-on-surface-variant/70 uppercase tracking-[0.12em]">Tareas Críticas</h3>
          <span className="material-symbols-outlined text-error text-[20px]">warning</span>
        </div>
        <div>
          <div className="font-display-lg text-display-lg text-error font-black tracking-tight">{summary.criticalTasks}</div>
          <div className="font-body-sm text-body-sm text-error/80 mt-xs flex items-center gap-xs">
            Requieren atención inmediata
          </div>
        </div>
      </div>
      
      <div className="col-span-12 md:col-span-3 glass-card p-lg flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-300 group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF9800]/50 to-transparent"></div>
        <div className="flex justify-between items-start mb-md">
          <h3 className="font-label-md text-label-md text-on-surface-variant/70 uppercase tracking-[0.12em]">Vencidas</h3>
          <span className="material-symbols-outlined text-[#FF9800] text-[20px]">timer_off</span>
        </div>
        <div>
          <div className="font-display-lg text-display-lg text-on-surface font-black tracking-tight">{summary.expiredTasks}</div>
          <div className="font-body-sm text-body-sm text-on-surface-variant/50 mt-xs flex items-center gap-xs">
            Pasadas de fecha límite
          </div>
        </div>
      </div>
      
      <div className="col-span-12 md:col-span-3 glass-card p-lg flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-300 group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#3FB950]/50 to-transparent"></div>
        <div className="flex justify-between items-start mb-md">
          <h3 className="font-label-md text-label-md text-on-surface-variant/70 uppercase tracking-[0.12em]">Completadas</h3>
          <span className="material-symbols-outlined text-[#3FB950] text-[20px]">task_alt</span>
        </div>
        <div>
          <div className="font-display-lg text-display-lg text-[#3FB950] font-black tracking-tight">{summary.completedTasks}</div>
          <div className="font-body-sm text-body-sm text-[#3FB950]/80 mt-xs flex items-center gap-xs">
            Logradas (Últimos 30 días)
          </div>
        </div>
      </div>

      {/* Workload Distribution */}
      <div className="col-span-12 md:col-span-6 glass-card flex flex-col h-[350px]">
        <div className="p-lg border-b border-outline-variant/30">
          <h3 className="font-headline-md text-headline-md text-on-surface">Distribución de Carga</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Porcentaje de tareas por departamento</p>
        </div>
        <div className="p-lg flex-1 flex flex-col justify-center gap-md">
          {Object.entries(areas).map(([name, data]: [string, any], index) => {
             const percent = getPercent(data.total);
             const colors = ['bg-[#B47CFD]', 'bg-indigo-400', 'bg-pink-400', 'bg-purple-500'];
             return (
               <div key={name}>
                 <div className="flex justify-between mb-xs">
                   <span className="font-label-md text-label-md text-on-surface">{name}</span>
                   <span className="font-mono-data text-mono-data text-on-surface-variant">{percent}% ({data.total})</span>
                 </div>
                 <div className="w-full bg-surface-container-low rounded-full h-2">
                   <div className={`${colors[index % colors.length]} h-2 rounded-full shadow-[0_0_8px_rgba(180,124,253,0.3)]`} style={{ width: `${percent}%` }}></div>
                 </div>
               </div>
             );
          })}
        </div>
      </div>

      {/* Bottleneck Heatmap */}
      <div className="col-span-12 md:col-span-6 glass-card flex flex-col h-[350px]">
        <div className="p-lg border-b border-white/[0.08] flex justify-between items-center bg-white/[0.02] sticky top-0">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">Radar de Cuellos de Botella</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Tareas críticas o vencidas por departamento</p>
          </div>
          <span className="material-symbols-outlined text-error">warning</span>
        </div>
        <div className="p-md md:p-lg flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-md">
          {Object.entries(areas).map(([name, data]: [string, any]) => {
             if (data.critical === 0) return null;
             
             // Calculate severity relative to maximum bottleneck
             const maxCritical = Math.max(...Object.values(areas).map((a: any) => a.critical)) || 1;
             const ratio = data.critical / maxCritical;
             
             let severityLabel = 'Bajo';
             let severityColors = 'text-primary border border-primary/30 bg-primary/10';
             let rowColors = 'bg-white/[0.02] border-white/10';
             let numberColors = 'text-primary';
             let barGradient = 'from-primary/50 to-primary';

             if (ratio >= 0.7) {
               severityLabel = 'Crítico';
               severityColors = 'text-error border border-error/30 bg-error/10 shadow-[0_0_8px_rgba(248,81,73,0.15)]';
               rowColors = 'bg-error-container/10 border-error/30';
               numberColors = 'text-error';
               barGradient = 'from-error/50 to-error';
             } else if (ratio >= 0.3) {
               severityLabel = 'Alto';
               severityColors = 'text-[#FF9800] border border-[#FF9800]/30 bg-[#FF9800]/10 shadow-[0_0_8px_rgba(255,152,0,0.15)]';
               rowColors = 'bg-[#FF9800]/5 border-[#FF9800]/20';
               numberColors = 'text-[#FF9800]';
               barGradient = 'from-[#FF9800]/50 to-[#FF9800]';
             } else {
               severityLabel = 'Medio';
               severityColors = 'text-[#D29922] border border-[#D29922]/30 bg-[#D29922]/10';
               rowColors = 'bg-white/[0.02] border-white/10';
               numberColors = 'text-[#D29922]';
               barGradient = 'from-[#D29922]/50 to-[#D29922]';
             }
             
             const widthPercent = Math.max(5, Math.round(ratio * 100));
             
             return (
               <div key={`critical-${name}`} className={`flex items-center justify-between p-md rounded-xl border transition-all ${rowColors} hover:bg-white/[0.05] relative overflow-hidden group`}>
                 <div className="font-label-md text-label-md text-on-surface tracking-wide relative z-10">{name}</div>
                 <div className="flex items-center gap-md relative z-10">
                   <span className={`font-mono-data text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${severityColors}`}>
                     {severityLabel}
                   </span>
                   <span className={`font-mono-data text-[18px] font-black ${numberColors}`}>
                     {data.critical}
                   </span>
                 </div>
                 
                 {/* Progress Bar (Absolute at bottom) */}
                 <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50 overflow-hidden">
                   <div 
                     className={`h-full transition-all duration-1000 ease-out bg-gradient-to-r ${barGradient}`} 
                     style={{ width: `${widthPercent}%` }}
                   />
                 </div>
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
      <div className="col-span-12 glass-card flex flex-col max-h-[600px] mt-md">
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
