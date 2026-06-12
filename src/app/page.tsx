'use client';

import AgencyDashboard from '../components/AgencyDashboard';

export default function Page() {
  return (
    <main className="flex-1 flex flex-col overflow-y-auto w-full">
      {/* TopAppBar (Mobile) */}
      <header className="md:hidden bg-surface-container-lowest dark:bg-surface-container-highest shadow-sm border-b border-outline-variant p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="font-headline-md text-headline-md font-bold text-on-surface">Command Center</div>
        <span className="material-symbols-outlined text-on-surface">menu</span>
      </header>

      {/* Dashboard Canvas */}
      <div className="p-6 md:p-8 flex-1 max-w-container-max w-full">
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
    </main>
  );
}
