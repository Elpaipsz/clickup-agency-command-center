'use client';

import { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [currentTokenMasked, setCurrentTokenMasked] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setToken('');
      loadCurrentToken();
    }
  }, [isOpen]);

  const loadCurrentToken = () => {
    // Always check localStorage first (works everywhere: local + Vercel)
    const stored = localStorage.getItem('CLICKUP_TOKEN');
    if (stored) {
      setHasToken(true);
      setCurrentTokenMasked(`${stored.slice(0, 6)}${'•'.repeat(20)}${stored.slice(-4)}`);
    } else {
      setHasToken(false);
      setCurrentTokenMasked('');
    }
  };

  const handleSave = async () => {
    const trimmed = token.trim();
    if (!trimmed) return;
    setStatus('saving');
    setErrorMsg('');

    // 1. Always save to localStorage (persistent, works on Vercel)
    localStorage.setItem('CLICKUP_TOKEN', trimmed);

    // 2. Also try to save to server file (works locally, silently fails on Vercel)
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clickup_token: trimmed }),
      });
    } catch {
      // Silently ignore if server can't save (Vercel) — localStorage is enough
    }

    setStatus('saved');
    setHasToken(true);
    setCurrentTokenMasked(`${trimmed.slice(0, 6)}${'•'.repeat(20)}${trimmed.slice(-4)}`);
    setToken('');
    setTimeout(() => window.location.reload(), 1200);
  };

  const handleRemove = () => {
    localStorage.removeItem('CLICKUP_TOKEN');
    // Also try server
    fetch('/api/settings', { method: 'DELETE' }).catch(() => {});
    setHasToken(false);
    setCurrentTokenMasked('');
    setToken('');
    setStatus('idle');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col bg-[#0A0118] border border-white/10 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-lg border-b border-white/[0.08] flex justify-between items-start bg-white/[0.02]">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary">settings</span>
              Configuración
            </h2>
            <p className="font-body-sm text-on-surface-variant">Conecta tu cuenta de ClickUp</p>
          </div>
          <button onClick={onClose} className="p-xs hover:bg-white/10 rounded-full text-white/50 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-lg flex flex-col gap-lg">

          {/* Current token status */}
          <div className={`flex items-center gap-md p-md rounded-xl border ${hasToken ? 'bg-[#0d2e0d] border-green-500/30' : 'bg-white/[0.03] border-white/10'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${hasToken ? 'bg-green-500/20' : 'bg-white/10'}`}>
              <span className={`material-symbols-outlined text-[18px] ${hasToken ? 'text-green-400' : 'text-white/40'}`}>
                {hasToken ? 'check_circle' : 'link_off'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-label-md font-bold ${hasToken ? 'text-green-300' : 'text-white/50'}`}>
                {hasToken ? '✅ ClickUp conectado' : 'Sin token configurado'}
              </p>
              {hasToken && currentTokenMasked && (
                <p className="font-mono-data text-[11px] text-white/40 mt-0.5 truncate">{currentTokenMasked}</p>
              )}
            </div>
            {hasToken && (
              <button
                onClick={handleRemove}
                className="text-red-400/70 hover:text-red-400 transition-colors flex-shrink-0"
                title="Quitar token"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            )}
          </div>

          {/* Token Input */}
          <div className="flex flex-col gap-sm">
            <label className="font-label-md text-white/70 text-sm">
              {hasToken ? 'Actualizar API Token' : 'Ingresar API Token'}
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                id="clickup_token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="pk_..."
                className="w-full bg-[#1f162d] border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-md py-md pr-12 text-white font-mono-data text-sm outline-none transition-all placeholder:text-white/20"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showToken ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <p className="text-[11px] text-white/40 leading-tight">
              Obtén tu token en ClickUp → Settings → Apps → API Token.<br />
              El token se guarda en este navegador y no necesitas volver a ingresarlo.
            </p>
          </div>

          {/* Status feedback */}
          {status === 'saved' && (
            <div className="flex items-center gap-sm p-sm rounded-lg bg-green-500/10 border border-green-500/30 text-green-300 font-label-md">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              ¡Token guardado! Recargando el dashboard...
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-sm p-sm rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 font-label-md">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-md border-t border-white/[0.08] bg-white/[0.02] flex justify-end gap-sm">
          <button
            onClick={onClose}
            className="px-md py-sm rounded-lg font-label-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!token.trim() || status === 'saving'}
            className="px-md py-sm rounded-lg font-label-md bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-xs"
          >
            {status === 'saving' ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                Guardando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">save</span>
                Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
