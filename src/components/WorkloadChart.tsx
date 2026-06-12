import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ProcessedTask } from '../types';

interface Props {
  tasks: ProcessedTask[];
}

export default function WorkloadChart({ tasks }: Props) {
  // Aggregate tasks by assignee and status
  const dataMap: Record<string, { name: string; pending: number; inProgress: number; completed: number; other: number }> = {};

  tasks.forEach(task => {
    task.assignees.forEach(assignee => {
      if (!dataMap[assignee.name]) {
        dataMap[assignee.name] = { name: assignee.name, pending: 0, inProgress: 0, completed: 0, other: 0 };
      }
      
      const status = task.status.name.toLowerCase();
      if (status.includes('pend') || status.includes('to do')) {
        dataMap[assignee.name].pending += 1;
      } else if (status.includes('prog') || status.includes('review')) {
        dataMap[assignee.name].inProgress += 1;
      } else if (status.includes('comp') || status.includes('done') || status.includes('clos')) {
        dataMap[assignee.name].completed += 1;
      } else {
        dataMap[assignee.name].other += 1;
      }
    });
  });

  const data = Object.values(dataMap);

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFA000" stopOpacity={0.85}/>
              <stop offset="95%" stopColor="#D29922" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#B47CFD" stopOpacity={0.85}/>
              <stop offset="95%" stopColor="#7C48C7" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E676" stopOpacity={0.85}/>
              <stop offset="95%" stopColor="#00B0FF" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(180, 124, 253, 0.1)" vertical={false} />
          <XAxis dataKey="name" stroke="#E9E9E9" tick={{ fill: '#E9E9E9', fontSize: 11 }} />
          <YAxis stroke="#E9E9E9" tick={{ fill: '#E9E9E9', fontSize: 11 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#120A24', border: '1px solid rgba(180, 124, 253, 0.35)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            itemStyle={{ color: '#E9E9E9' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: 12 }} />
          <Bar dataKey="pending" name="Pendiente" stackId="a" fill="url(#colorPending)" radius={[0, 0, 4, 4]} />
          <Bar dataKey="inProgress" name="En Progreso" stackId="a" fill="url(#colorInProgress)" />
          <Bar dataKey="completed" name="Completado" stackId="a" fill="url(#colorCompleted)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
