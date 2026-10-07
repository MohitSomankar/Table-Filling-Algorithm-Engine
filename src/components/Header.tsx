import React, { useState } from 'react';
import { Download, RotateCcw, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface HeaderProps {
  onResetToDefault: () => void;
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onResetToDefault,
  activeSection,
  onNavigateSection,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);

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

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Brand title, single line text element */}
          <a
            href="/"
            className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5 group shrink-0"
          >
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-mono font-bold text-sm shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              MN
            </span>
            <span>Table-Filling Engine</span>
          </a>

          {/* Zone 2: 4-6 nav links, 1-2 word labels, single-line */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <button
              onClick={() => onNavigateSection('dfa-input')}
              className={`hover:text-white transition-colors pb-0.5 whitespace-nowrap ${
                activeSection === 'dfa-input' ? 'text-blue-400 border-b-2 border-blue-400 font-semibold' : ''
              }`}
            >
              DFA Table
            </button>
            <button
              onClick={() => onNavigateSection('table-grid')}
              className={`hover:text-white transition-colors pb-0.5 whitespace-nowrap ${
                activeSection === 'table-grid' ? 'text-blue-400 border-b-2 border-blue-400 font-semibold' : ''
              }`}
            >
              Triangular Grid
            </button>
            <button
              onClick={() => onNavigateSection('equivalence-classes')}
              className={`hover:text-white transition-colors pb-0.5 whitespace-nowrap ${
                activeSection === 'equivalence-classes' ? 'text-blue-400 border-b-2 border-blue-400 font-semibold' : ''
              }`}
            >
              Equivalence Classes
            </button>
            <button
              onClick={() => onNavigateSection('minimized-table')}
              className={`hover:text-white transition-colors pb-0.5 whitespace-nowrap ${
                activeSection === 'minimized-table' ? 'text-blue-400 border-b-2 border-blue-400 font-semibold' : ''
              }`}
            >
              Minimized DFA
            </button>
            <button
              onClick={() => onNavigateSection('simulator')}
              className={`hover:text-white transition-colors pb-0.5 whitespace-nowrap ${
                activeSection === 'simulator' ? 'text-blue-400 border-b-2 border-blue-400 font-semibold' : ''
              }`}
            >
              String Tester
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Install Desktop App Button */}
            {!isInstalled ? (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-500/20 transition whitespace-nowrap active:scale-95"
                title="Install application onto your desktop computer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install Desktop App</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 rounded-lg">
                <Check className="w-3.5 h-3.5" />
                <span>Installed</span>
              </div>
            )}

            <button
              onClick={onResetToDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition whitespace-nowrap active:scale-95"
              title="Reset to default textbook example"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
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
