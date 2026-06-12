'use client';
import TaskBoard from '@/components/TaskBoard';

export default function Page() {
  return (
    <div className="p-6 md:p-8 flex-1 max-w-container-max w-full">
      <TaskBoard departmentTitle="Pauta Publicitaria" departmentKey="Pauta Publicitaria" />
    </div>
  );
}