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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(180, 124, 253, 0.15)" vertical={false} />
          <XAxis dataKey="name" stroke="#E9E9E9" tick={{ fill: '#E9E9E9' }} />
          <YAxis stroke="#E9E9E9" tick={{ fill: '#E9E9E9' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#120A24', border: '1px solid rgba(180, 124, 253, 0.35)', borderRadius: '8px' }}
            itemStyle={{ color: '#E9E9E9' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="pending" name="Pendiente" stackId="a" fill="#D29922" radius={[0, 0, 4, 4]} />
          <Bar dataKey="inProgress" name="En Progreso" stackId="a" fill="#B47CFD" />
          <Bar dataKey="completed" name="Completado" stackId="a" fill="#3FB950" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
