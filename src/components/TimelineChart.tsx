import { ProcessedTask } from '../types';

interface Props {
  tasks: ProcessedTask[];
}

export default function TimelineChart({ tasks }: Props) {
  // Sort tasks by due date
  const sortedTasks = [...tasks]
    .filter(t => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 10); // Show next 10 tasks

  if (sortedTasks.length === 0) {
    return <div className="text-sm text-slate-400 p-4">No hay tareas con fecha límite próxima.</div>;
  }

  return (
    <div className="flex flex-col gap-3 py-2">
      {sortedTasks.map(task => {
        const dueDate = new Date(task.dueDate!);
        const isExpired = task.isExpired;
        
        return (
          <div key={task.id} className="flex items-center gap-4">
            <div className={`w-24 text-right text-xs font-semibold ${isExpired ? 'text-red-400' : 'text-slate-300'}`}>
              {dueDate.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
            </div>
            
            {/* Timeline line */}
            <div className="relative flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${isExpired ? 'bg-red-500' : 'bg-purple-500'} shadow-[0_0_8px_rgba(180,124,253,0.4)] z-10`} />
              <div className="absolute top-3 bottom-[-16px] w-0.5 bg-purple-500/20" />
            </div>

            <div className="flex-1 glass-panel p-2.5 hover:bg-slate-800 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-semibold truncate ${isExpired ? 'text-red-400' : 'text-slate-200'}`}>
                  {task.name}
                </span>
                <span 
                  className="text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap"
                  style={{ color: task.status.color, borderColor: `${task.status.color}40`, backgroundColor: `${task.status.color}10` }}
                >
                  {task.status.name}
                </span>
              </div>
              <div className="text-xs text-slate-400 truncate">
                {task.client} • {task.assignees.map(a => a.name).join(', ') || 'Sin Asignar'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
