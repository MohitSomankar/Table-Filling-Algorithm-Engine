import React from 'react';
import { Download, Monitor, Smartphone, X, Check, Laptop } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallDirect: () => void;
  canInstallDirect: boolean;
  isIOS: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstallDirect,
  canInstallDirect,
  isIOS,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Install Desktop App</h3>
              <p className="text-xs text-slate-400">Run standalone without browser toolbars</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          {canInstallDirect ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-300">
                Your browser supports direct 1-click desktop installation.
              </p>
              <button
                onClick={() => {
                  onInstallDirect();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium text-sm text-white shadow-lg shadow-blue-600/25 transition active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                Install on Desktop Now
              </button>
            </div>
          ) : isIOS ? (
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <Smartphone className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-200">How to install on iOS Safari:</p>
                  <ol className="list-decimal list-inside text-xs text-slate-400 mt-1 space-y-1">
                    <li>Tap the <span className="font-medium text-slate-200">Share</span> button in Safari toolbar</li>
                    <li>Scroll down and tap <span className="font-medium text-slate-200">Add to Home Screen</span></li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <Laptop className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-200">How to install on Chrome / Edge / Brave:</p>
                  <ol className="list-decimal list-inside text-xs text-slate-400 mt-1.5 space-y-1">
                    <li>Look at the top-right of your browser URL address bar</li>
                    <li>Click the <span className="font-medium text-slate-200">Install app</span> icon (or <span className="font-medium text-slate-200">App available</span>)</li>
                    <li>Click <span className="font-medium text-blue-400">Install</span> in the browser prompt</li>
                  </ol>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-950/40 border border-blue-900/40 text-xs text-blue-300">
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Works offline and launches from your OS desktop or dock.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
