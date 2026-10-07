/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { DFA, DFAPreset } from './types/dfa';
import { DFA_PRESETS } from './utils/presets';
import { runTableFillingAlgorithm } from './utils/tableFillingEngine';
import { Header } from './components/Header';
import { DFAEditor } from './components/DFAEditor';
import { StepControls } from './components/StepControls';
import { TableGrid } from './components/TableGrid';
import { EquivalenceClassesView } from './components/EquivalenceClassesView';
import { MinimizedDFATable } from './components/MinimizedDFATable';
import { StringSimulator } from './components/StringSimulator';
import { usePWAInstall } from './hooks/usePWAInstall';
import { PWAInstallModal } from './components/PWAInstallModal';
import { Download, Check, Sparkles, BookOpen } from 'lucide-react';

export default function App() {
  // Current active DFA
  const [currentDFA, setCurrentDFA] = useState<DFA>(DFA_PRESETS[0].dfa);
  const [activePresetId, setActivePresetId] = useState<string>(DFA_PRESETS[0].id);
  const [activeSection, setActiveSection] = useState<string>('dfa-input');
  const [sampleString, setSampleString] = useState<string>(DFA_PRESETS[0].sampleTestString || '101');

  // PWA install hook
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Compute Table Filling Result
  const result = useMemo(() => {
    return runTableFillingAlgorithm(currentDFA);
  }, [currentDFA]);

  // Step-by-step playback state (defaults to final step for immediate visibility)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(result.steps.length - 1);

  // When DFA changes, keep currentStepIndex in bounds
  React.useEffect(() => {
    setCurrentStepIndex(result.steps.length - 1);
  }, [result.steps.length]);

  // Handlers
  const handleLoadPreset = (preset: DFAPreset) => {
    setCurrentDFA(preset.dfa);
    setActivePresetId(preset.id);
    if (preset.sampleTestString) {
      setSampleString(preset.sampleTestString);
    }
  };

  const handleResetToDefault = () => {
    handleLoadPreset(DFA_PRESETS[0]);
  };

  const handleDFAChange = (updatedDFA: DFA) => {
    setCurrentDFA(updatedDFA);
    setActivePresetId(''); // custom modified
  };

  const handleRunMinimization = () => {
    // Jump to step 0 and scroll to table grid
    setCurrentStepIndex(0);
    const element = document.getElementById('table-grid');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentStep = result.steps[currentStepIndex] || result.steps[result.steps.length - 1];
  const isComplete = currentStepIndex === result.steps.length - 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Top Bar Contract */}
      <Header
        onResetToDefault={handleResetToDefault}
        activeSection={activeSection}
        onNavigateSection={handleNavigateSection}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-b from-slate-900 to-slate-950 border border-slate-800/90 p-6 md:p-8 shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              {/* Unboxed metadata with typographic separators */}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span className="text-blue-400 font-semibold">Theory of Computation</span>
                <span aria-hidden="true">·</span>
                <span>Myhill-Nerode Theorem</span>
                <span aria-hidden="true">·</span>
                <span>DFA State Minimization</span>
                <span aria-hidden="true">·</span>
                <span>Table-Filling Algorithm</span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                Table-Filling Algorithm Engine
              </h1>

              <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
                Input any unminimized Deterministic Finite Automaton (DFA) transition table. 
                The engine iteratively partitions indistinguishable state pairs using the 
                Myhill-Nerode equivalence theorem, producing the canonical minimal DFA and distinct equivalence classes.
              </p>
            </div>

            {/* Desktop Install Callout & Quick Stats */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
              {!isInstalled && (
                <button
                  onClick={() => {
                    if (isInstallable) {
                      install();
                    } else {
                      setShowInstallModal(true);
                    }
                  }}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white shadow-lg shadow-blue-600/25 transition active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Install Desktop App</span>
                </button>
              )}

              {isInstalled && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-xs font-semibold text-emerald-300">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Installed as Desktop App</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Total states:</span>
                <span className="font-mono text-slate-200 font-bold">
                  {currentDFA.states.length}
                </span>
                <span>→</span>
                <span>Minimal classes:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {result.equivalenceClasses.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: Unminimized DFA Editor & Matrix */}
        <DFAEditor
          dfa={currentDFA}
          onChange={handleDFAChange}
          onRunMinimization={handleRunMinimization}
          onLoadPreset={handleLoadPreset}
          activePresetId={activePresetId}
          unreachableStates={result.unreachableStates}
        />

        {/* SECTION 2: Step-by-Step Playback Controller */}
        <StepControls
          steps={result.steps}
          currentStepIndex={currentStepIndex}
          onStepChange={setCurrentStepIndex}
        />

        {/* SECTION 3: Lower Triangular Table-Filling Grid */}
        <TableGrid
          reachableStates={result.reachableStates}
          step={currentStep}
          isComplete={isComplete}
        />

        {/* SECTION 4: Distinct Equivalence Classes of States */}
        <EquivalenceClassesView
          equivalenceClasses={result.equivalenceClasses}
          minimizedDFA={result.minimizedDFA}
        />

        {/* SECTION 5: Minimized DFA Transition Table */}
        <MinimizedDFATable
          minimizedDFA={result.minimizedDFA}
          originalDFA={currentDFA}
        />

        {/* SECTION 6: String Acceptance & Equivalence Verifier */}
        <StringSimulator
          originalDFA={currentDFA}
          minimizedDFA={result.minimizedDFA}
          initialString={sampleString}
        />
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-900 bg-slate-950 py-8 px-4 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Table-Filling Algorithm Engine</span>
            <span>·</span>
            <span>Myhill-Nerode DFA Minimization</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Runs 100% locally in browser</span>
            <span>·</span>
            <span>PWA Offline Capable</span>
          </div>
        </div>
      </footer>

      {/* Desktop Install Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onInstallDirect={install}
        canInstallDirect={isInstallable}
        isIOS={isIOS}
      />
    </div>
  );
}
