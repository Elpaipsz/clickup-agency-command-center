'use client';

import { useState, useEffect } from 'react';
import { ProcessedTask } from '@/types';

interface TaskModalProps {
  task: ProcessedTask;
  departmentTitle?: string;
  availableStatuses: string[];
  onClose: () => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onDelete: (taskId: string) => void;
  isUpdatingStatus: boolean;
  isDeleting: boolean;
}

export default function TaskModal({
  task,
  departmentTitle,
  availableStatuses,
  onClose,
  onStatusChange,
  onDelete,
  isUpdatingStatus,
  isDeleting
}: TaskModalProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [listStatuses, setListStatuses] = useState<any[]>([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);
  const [statusSearch, setStatusSearch] = useState('');

  const fetchStatuses = async () => {
    if (!task.listId) return;
    setIsLoadingStatuses(true);
    try {
      const token = localStorage.getItem('CLICKUP_TOKEN');
      const res = await fetch(`/api/statuses?listId=${task.listId}`, {
        headers: token ? { 'x-clickup-token': token } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setListStatuses(data);
      }
    } catch (err) {
      console.error('Error fetching list statuses:', err);
    } finally {
      setIsLoadingStatuses(false);
    }
  };

  useEffect(() => {
    if (isDropdownOpen && listStatuses.length === 0) {
      fetchStatuses();
    }
  }, [isDropdownOpen]);

  const getPriorityBadge = (t: ProcessedTask) => {
    if (t.isCritical) return (
      <span className="px-3 py-1 rounded-full bg-error/20 border border-error/50 text-error font-label-lg font-black uppercase tracking-widest shadow-[0_0_12px_rgba(248,81,73,0.3)] flex items-center gap-1">
        <span className="material-symbols-outlined text-[16px]">warning</span>
        CRÍTICA
      </span>
    );
    if (t.priority === 'urgent') return <span className="px-sm py-xs rounded-full bg-[#f44336]/10 text-[#f44336] font-mono-data text-[10px] uppercase tracking-wider">Urgente</span>;
    if (t.priority === 'high') return <span className="px-sm py-xs rounded-full bg-[#ff9800]/10 text-[#ff9800] font-mono-data text-[10px] uppercase tracking-wider">Alta</span>;
    if (t.priority === 'normal') return <span className="px-sm py-xs rounded-full bg-surface-variant text-on-surface-variant font-mono-data text-[10px] uppercase tracking-wider">Normal</span>;
    if (t.priority === 'low') return <span className="px-sm py-xs rounded-full bg-[#8bc34a]/10 text-[#8bc34a] font-mono-data text-[10px] uppercase tracking-wider">Baja</span>;
    return <span className="px-sm py-xs rounded-full bg-surface-container text-on-surface-variant font-mono-data text-[10px] uppercase tracking-wider">Sin Prioridad</span>;
  };

  const handleStatusSelect = (status: string) => {
    setIsDropdownOpen(false);
    onStatusChange(task.id, status);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col bg-[var(--bg-main)] border border-[var(--border-glass)] relative">
        <div className="p-lg md:p-xl border-b border-[var(--border-glass)] flex justify-between items-start bg-surface/50">
          <div className="flex-1 pr-lg">
            <div className="flex items-center gap-xs mb-sm">
              <span className="font-mono-data text-mono-data text-on-surface-variant uppercase">{departmentTitle || task.area}</span>
              <span className="text-on-surface-variant material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="font-mono-data text-mono-data text-on-surface-variant uppercase">{task.client}</span>
            </div>
            <h2 className="font-black text-[28px] md:text-[34px] text-on-surface mb-2 leading-tight">{task.name}</h2>
            <div className="flex flex-wrap items-center gap-sm relative">
              {isUpdatingStatus && <span className="material-symbols-outlined animate-spin text-on-surface-variant text-[14px]">progress_activity</span>}
              
              {/* Beautiful Custom Dropdown for Status */}
              <div className="relative">
                <button 
                  onClick={() => !isUpdatingStatus && setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isUpdatingStatus}
                  className="flex items-center gap-2 px-md py-xs rounded-lg text-xs font-mono-data bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] transition-all shadow-md border border-[var(--border-glass)]"
                  style={{ borderLeft: `4px solid ${task.status.color}` }}
                >
                  <span style={{ color: task.status.color }} className="font-bold tracking-wider">{task.status.name.toUpperCase()}</span>
                  <span className="material-symbols-outlined text-[14px] text-on-surface/50">{isDropdownOpen ? 'expand_less' : 'expand_more'}</span>
                </button>
 
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                    <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--bg-surface)] border border-[var(--border-glass)] rounded-xl shadow-2xl z-20 py-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      
                      {/* Search Bar */}
                      <div className="px-sm pb-sm border-b border-[var(--border-glass)]">
                        <input 
                          type="text" 
                          placeholder="Buscar..." 
                          value={statusSearch}
                          onChange={(e) => setStatusSearch(e.target.value)}
                          className="w-full bg-[var(--bg-main)] border border-[var(--border-glass)] focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-sm py-xs text-[var(--text-primary)] font-body-sm outline-none transition-colors placeholder:text-[var(--text-muted)]"
                        />
                      </div>
 
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {isLoadingStatuses ? (
                          <div className="p-md flex justify-center items-center">
                            <span className="material-symbols-outlined animate-spin text-secondary">progress_activity</span>
                          </div>
                        ) : (() => {
                          // Group statuses by type
                          const typesMap: Record<string, string> = {
                            'open': 'Sin iniciar',
                            'custom': 'Activa',
                            'done': 'Terminada',
                            'closed': 'Cerrada'
                          };
                          
                          // Use fetched statuses or fallback to the current one
                          const statusesToUse = listStatuses.length > 0 
                            ? listStatuses 
                            : [{ status: task.status.name, color: task.status.color, type: 'custom' }];
                          
                          const filtered = statusesToUse.filter(s => s.status.toLowerCase().includes(statusSearch.toLowerCase()));
                          
                          const grouped: Record<string, any[]> = {};
                          filtered.forEach(s => {
                            if (!grouped[s.type]) grouped[s.type] = [];
                            grouped[s.type].push(s);
                          });
 
                          return ['open', 'custom', 'done', 'closed'].map(type => {
                            if (!grouped[type] || grouped[type].length === 0) return null;
                            return (
                              <div key={type} className="mb-xs">
                                <div className="px-md py-xs text-[11px] font-bold text-on-surface/40 flex justify-between items-center mt-1">
                                  <span>{typesMap[type]}</span>
                                  <span className="material-symbols-outlined text-[14px]">more_horiz</span>
                                </div>
                                {grouped[type].map((s: any) => {
                                  const isSelected = s.status.toLowerCase() === task.status.name.toLowerCase();
                                  return (
                                    <button
                                      key={s.id || s.status}
                                      onClick={() => handleStatusSelect(s.status)}
                                      className={`w-full text-left px-md py-xs font-label-md transition-colors flex items-center justify-between group ${isSelected ? 'bg-primary/20 text-on-surface' : 'text-on-surface/60 hover:bg-surface-variant hover:text-on-surface'}`}
                                    >
                                      <div className="flex items-center gap-xs">
                                        {/* Status Icon Indicator based on type */}
                                        {type === 'open' && <span className="material-symbols-outlined text-[14px]" style={{ color: s.color }}>radio_button_unchecked</span>}
                                        {type === 'custom' && <span className="material-symbols-outlined text-[14px]" style={{ color: s.color }}>timelapse</span>}
                                        {type === 'done' && <span className="material-symbols-outlined text-[14px]" style={{ color: s.color }}>check_circle</span>}
                                        {type === 'closed' && <span className="material-symbols-outlined text-[14px]" style={{ color: s.color }}>check_circle</span>}
                                        
                                        <span className={`uppercase font-bold tracking-wider text-[11px] ${isSelected ? 'text-on-surface font-extrabold' : 'group-hover:text-on-surface text-on-surface/60'}`}>{s.status}</span>
                                      </div>
                                      {isSelected && <span className="material-symbols-outlined text-[16px] text-primary">check</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {getPriorityBadge(task)}
            </div>
          </div>
          <button onClick={onClose} className="p-xs hover:bg-surface-variant rounded-full text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-lg md:p-xl flex-1 overflow-y-auto bg-surface/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-xl">
            <div className="p-md rounded-xl bg-surface border border-outline-variant/50 shadow-sm">
              <span className="block font-label-md text-on-surface-variant mb-2">Fecha de Vencimiento</span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">calendar_today</span>
                <span className={`font-headline-sm ${task.isExpired ? 'text-error font-bold' : 'text-on-surface'}`}>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-xl">
            <h3 className="font-label-lg text-label-lg text-on-surface-variant mb-sm">Asignados</h3>
            <div className="flex flex-wrap gap-sm">
              {task.assignees.length > 0 ? (
                task.assignees.map((a, i) => (
                  <div key={i} className="flex items-center gap-sm bg-surface rounded-full pr-md border border-outline-variant shadow-sm">
                    {a.avatar ? (
                      <img src={a.avatar} alt={a.name} className="w-10 h-10 rounded-full border border-outline-variant bg-surface" />
                    ) : (
                      <div className="w-10 h-10 rounded-full border border-outline-variant bg-surface-variant flex items-center justify-center font-bold">
                        {a.initials}
                      </div>
                    )}
                    <span className="font-label-md text-on-surface">{a.name}</span>
                  </div>
                ))
              ) : (
                <span className="font-body-md text-error bg-error-container/20 px-3 py-1 rounded">Nadie asignado</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-label-lg text-label-lg text-on-surface-variant mb-sm">Descripción</h3>
            <div className="bg-surface p-lg rounded-xl border border-outline-variant/50 font-body-lg text-on-surface whitespace-pre-wrap leading-relaxed shadow-sm">
              {task.description || <span className="italic text-on-surface-variant">Sin descripción.</span>}
            </div>
          </div>
        </div>

        <div className="p-lg border-t border-outline-variant/30 bg-surface-container-lowest flex justify-between items-center gap-sm">
          <button onClick={() => onDelete(task.id)} disabled={isDeleting} className="px-md py-sm rounded-lg font-label-md text-error hover:bg-error/10 transition-colors flex items-center gap-2 btn-glint">
            <span className="material-symbols-outlined text-[18px]">delete</span>
            {isDeleting ? 'Eliminando...' : 'Eliminar Tarea'}
          </button>
          
          <a href={task.url} target="_blank" rel="noreferrer" className="px-md py-sm rounded-lg font-label-md text-secondary hover:bg-secondary/10 transition-colors flex items-center gap-2 btn-glint">
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            Abrir en ClickUp
          </a>
        </div>
      </div>
    </div>
  );
}
