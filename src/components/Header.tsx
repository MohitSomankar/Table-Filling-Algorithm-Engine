import React, { useState } from 'react';
import { Download, RotateCcw, Check, Sun, Moon, Menu, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface HeaderProps {
  onResetToDefault: () => void;
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onResetToDefault,
  activeSection,
  onNavigateSection,
  theme = 'dark',
  onToggleTheme,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowInstallModal(true);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'dfa-input', label: 'DFA Input' },
    { id: 'table-grid', label: 'Table Filling' },
    { id: 'equivalence-classes', label: 'Equivalence Classes' },
    { id: 'minimized-dfa', label: 'Minimized DFA' },
    { id: 'learn-theory', label: 'Learn / Theory' },
  ];

  const handleNavClick = (id: string) => {
    onNavigateSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Brand title */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => handleNavClick('home')}
              className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2.5 group cursor-pointer text-left"
            >
              <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-mono font-bold text-sm shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                MN
              </span>
              <span className="whitespace-nowrap font-extrabold tracking-tight">
                TABLE-FILLING ALGORITHM ENGINE
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs sm:text-sm font-medium text-slate-400">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`hover:text-white transition-colors pb-0.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-blue-400 border-b-2 border-blue-400 font-semibold'
                      : ''
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1-2 primary actions: [Theme] [Install App] [Reset] */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-1.5 text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition active:scale-95 cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
              </button>
            )}

            {/* Install App Button - Exactly ONE location in entire app */}
            {!isInstalled ? (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-500/20 transition whitespace-nowrap active:scale-95 cursor-pointer"
                title="Install application onto your system"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 rounded-lg">
                <Check className="w-3.5 h-3.5" />
                <span>Installed</span>
              </div>
            )}

            {/* Reset Button */}
            <button
              onClick={onResetToDefault}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition whitespace-nowrap active:scale-95 cursor-pointer"
              title="Reset to default textbook example"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs font-medium animate-in fade-in slide-in-from-top-1 duration-150">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-2 rounded-lg text-left transition ${
                  activeSection === item.id
                    ? 'bg-blue-600/20 text-blue-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onInstallDirect={install}
        canInstallDirect={isInstallable}
        isIOS={isIOS}
      />
    </>
  );
};
