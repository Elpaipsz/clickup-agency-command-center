'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import SettingsModal from './SettingsModal';

export default function MobileNav() {
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);

  const links = [
    { href: '/', icon: 'dashboard', label: 'Dash' },
    { href: '/web', icon: 'language', label: 'Web' },
    { href: '/pauta', icon: 'campaign', label: 'Pauta' },
    { href: '/diseno', icon: 'palette', label: 'Diseño' },
    { href: '/nucleo', icon: 'hub', label: 'Núcleo' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-low border-t border-outline-variant/30 z-50 px-2 py-2 flex justify-around items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      {links.map((link) => {
        const isActive = pathname === link.href;
        
        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`flex flex-col items-center gap-1 p-2 rounded-lg min-w-[60px] transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant hover:bg-surface-variant/50'}`}
          >
            <div className={`flex items-center justify-center w-12 h-8 rounded-full ${isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-transparent'}`}>
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {link.icon}
              </span>
            </div>
            <span className={`text-[10px] font-label-sm ${isActive ? 'font-bold' : ''}`}>
              {link.label}
            </span>
          </Link>
        );
      })}
      
      {/* Settings Button */}
      <button 
        onClick={() => setShowSettings(true)}
        className={`flex flex-col items-center gap-1 p-2 rounded-lg min-w-[50px] transition-colors text-on-surface-variant hover:bg-surface-variant/50`}
      >
        <div className="flex items-center justify-center w-10 h-8 rounded-full bg-transparent">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>
            settings
          </span>
        </div>
        <span className="text-[9px] font-label-sm">
          Ajustes
        </span>
      </button>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </nav>
  );
}
