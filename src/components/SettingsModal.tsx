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
          <label className="block font-label-md text-on-surface-variant mb-2">
            ClickUp API Token
          </label>
          <input 
            type="password" 
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="pk_..."
            className="w-full bg-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-md py-sm text-on-surface font-body-md outline-none transition-colors"
          />
          <p className="mt-2 text-[11px] text-on-surface-variant/70 leading-tight">
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
            className="px-md py-sm rounded-lg font-label-md bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm"
          >
            Guardar y Recargar
          </button>
        </div>
      </div>
    </div>
  );
}
