'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import SettingsModal from './SettingsModal';

export default function Sidebar() {
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);

  const links = [
    { href: '/', icon: 'dashboard', label: 'Dashboard' },
    { href: '/web', icon: 'language', label: 'Web' },
    { href: '/pauta', icon: 'campaign', label: 'Pauta Publicitaria' },
    { href: '/diseno', icon: 'palette', label: 'Diseño' },
    { href: '/nucleo', icon: 'hub', label: 'Núcleo' },
  ];

  return (
    <nav className="hidden md:flex fixed left-0 top-0 h-full flex-col p-md gap-sm w-[280px] z-40 bg-surface-container-low shadow-md">
      {/* Header */}
      <div className="px-md py-lg mb-md flex flex-col gap-sm border-b border-outline-variant/30">
        <div className="w-[180px] h-[60px] relative">
          <img src="/logo.png" alt="Command Center Logo" className="object-contain w-full h-full" />
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md font-black text-on-surface tracking-tight">Command Center</h1>
          <p className="font-label-md text-label-md text-on-surface-variant">Control Ejecutivo</p>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 flex flex-col gap-xs overflow-y-auto px-xs">
        {links.map((link) => {
          const isActive = pathname === link.href;
          
          if (isActive) {
            return (
              <Link key={link.href} href={link.href} className="flex items-center gap-md px-md py-md bg-white/[0.05] text-primary border border-primary/30 rounded-xl shadow-md duration-300 ease-in-out relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-l-xl"></div>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{link.icon}</span>
                <span className="font-label-md text-label-md font-bold">{link.label}</span>
              </Link>
            );
          }
          
          return (
            <Link key={link.href} href={link.href} className="flex items-center gap-md px-md py-md rounded-xl text-on-surface-variant hover:bg-white/[0.02] hover:text-primary hover:border-white/[0.08] border border-transparent hover:translate-x-1 transition-all duration-300 ease-in-out group">
              <span className="material-symbols-outlined group-hover:text-primary transition-colors">{link.icon}</span>
              <span className="font-label-md text-label-md group-hover:text-primary transition-colors">{link.label}</span>
            </Link>
          );
        })}
      </div>
      
      {/* Footer Navigation */}
      <div className="mt-auto pt-md border-t border-outline-variant/20 flex flex-col gap-xs px-xs">
        <button onClick={() => setShowSettings(true)} className="flex items-center gap-md px-md py-md rounded-xl text-on-surface-variant hover:bg-white/[0.02] hover:text-primary hover:border-white/[0.08] border border-transparent hover:translate-x-1 transition-all duration-300 ease-in-out w-full text-left">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md text-label-md">Configuración</span>
        </button>
        <Link href="#" className="flex items-center gap-md px-md py-md rounded-xl text-on-surface-variant hover:bg-white/[0.02] hover:text-primary hover:border-white/[0.08] border border-transparent hover:translate-x-1 transition-all duration-300 ease-in-out">
          <span className="material-symbols-outlined">help</span>
          <span className="font-label-md text-label-md">Ayuda</span>
        </Link>
      </div>
      
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </nav>
  );
}
