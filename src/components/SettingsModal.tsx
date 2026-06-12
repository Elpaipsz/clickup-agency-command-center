'use client';

import { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [token, setToken] = useState('');

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('CLICKUP_TOKEN');
      if (stored) setToken(stored);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (token.trim()) {
      localStorage.setItem('CLICKUP_TOKEN', token.trim());
    } else {
      localStorage.removeItem('CLICKUP_TOKEN');
    }
    // Reload the page to apply the token globally and refresh SWR cache
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="p-lg border-b border-outline-variant/30 flex justify-between items-start bg-surface-container-lowest">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary">settings</span>
              Configuración
            </h2>
            <p className="font-body-sm text-on-surface-variant">Conecta tu cuenta de ClickUp</p>
          </div>
          <button onClick={onClose} className="p-xs hover:bg-surface-variant rounded-full text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-lg bg-surface/50">
          <div className="relative mt-2">
            <input 
              type="password" 
              id="clickup_token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder=" "
              className="peer w-full bg-background border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-md py-md text-on-surface font-body-md outline-none transition-all placeholder-transparent"
            />
            <label 
              htmlFor="clickup_token"
              className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant/70 font-body-md transition-all pointer-events-none px-xs bg-[#241A30]
              peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-primary peer-focus:font-semibold
              peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary"
            >
              ClickUp API Token
            </label>
          </div>
          <p className="mt-3 text-[11px] text-on-surface-variant/70 leading-tight">
            Puedes obtener tu token de API en ClickUp yendo a Settings {'>'} Apps. 
            El token se guarda de forma segura únicamente en tu navegador (localStorage).
          </p>
        </div>

        <div className="p-md border-t border-outline-variant/30 bg-surface-container-lowest flex justify-end gap-sm">
          <button 
            onClick={onClose} 
            className="px-md py-sm rounded-lg font-label-md text-on-surface-variant hover:bg-surface-variant transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            className="px-md py-sm rounded-lg font-label-md bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm btn-glint"
          >
            Guardar y Recargar
          </button>
        </div>
      </div>
    </div>
  );
}
