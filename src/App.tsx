/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { DFA, DFAPreset, AlgorithmStage } from './types/dfa';
import { DFA_PRESETS } from './utils/presets';
import { runTableFillingAlgorithm } from './utils/tableFillingEngine';
import { validateDFA } from './utils/dfaValidator';
import { Header } from './components/Header';
import { DFAEditor } from './components/DFAEditor';
import { ProgressPipeline } from './components/ProgressPipeline';
import { TableGrid } from './components/TableGrid';
import { EquivalenceClassesView } from './components/EquivalenceClassesView';
import { MinimizedDFATable } from './components/MinimizedDFATable';
import { DFAGraphSection } from './components/DFAGraphSection';
import { StringSimulator } from './components/StringSimulator';
import { TheorySection } from './components/TheorySection';
import { Sparkles, FilePlus2, BookOpen, AlertTriangle } from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('toc_dfa_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('toc_dfa_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Current active DFA
  const [currentDFA, setCurrentDFA] = useState<DFA>(DFA_PRESETS[0].dfa);
  const [activePresetId, setActivePresetId] = useState<string>(DFA_PRESETS[0].id);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [sampleString, setSampleString] = useState<string>(DFA_PRESETS[0].sampleTestString || '101');

  // Live validation
  const validation = useMemo(() => validateDFA(currentDFA), [currentDFA]);

  // Compute Table Filling Result only when valid
  const result = useMemo(() => {
    if (!validation.isValid) return null;
    return runTableFillingAlgorithm(currentDFA);
  }, [currentDFA, validation.isValid]);

  // Step-by-step playback state (defaults to final step for immediate visibility)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // When result changes, set currentStepIndex to the last step
  React.useEffect(() => {
    if (result && result.steps.length > 0) {
      setCurrentStepIndex(result.steps.length - 1);
    }
  }, [result]);

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
    if (!validation.isValid) return;
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

  const currentStep = result ? result.steps[currentStepIndex] || result.steps[result.steps.length - 1] : null;
  const isComplete = result ? currentStepIndex === result.steps.length - 1 : false;

  // Determine current stage for ProgressPipeline
  const currentStage: AlgorithmStage = useMemo(() => {
    if (!validation.isValid || !result || currentStepIndex === 0) return 'INPUT';
    if (currentStep?.round === 0) return 'INITIAL_MARKING';
    if (isComplete) return 'EQUIVALENCE';
    return 'ITERATION';
  }, [validation.isValid, result, currentStepIndex, currentStep, isComplete]);

  const handleSelectStage = (stage: AlgorithmStage) => {
    if (stage === 'INPUT') {
      handleNavigateSection('dfa-input');
    } else if (stage === 'INITIAL_MARKING' && result) {
      setCurrentStepIndex(1);
      handleNavigateSection('table-grid');
    } else if (stage === 'ITERATION' && result) {
      setCurrentStepIndex(Math.min(2, result.steps.length - 1));
      handleNavigateSection('table-grid');
    } else if (stage === 'EQUIVALENCE' && result) {
      setCurrentStepIndex(result.steps.length - 1);
      handleNavigateSection('equivalence-classes');
    } else if (stage === 'MINIMIZED' && result) {
      handleNavigateSection('minimized-dfa');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 3-Zone Top Bar Contract */}
      <Header
        onResetToDefault={handleResetToDefault}
        activeSection={activeSection}
        onNavigateSection={handleNavigateSection}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div id="home" className="relative overflow-hidden rounded-3xl bg-linear-to-b from-slate-900 to-slate-950 border border-slate-800/90 p-6 md:p-8 shadow-2xl scroll-mt-20">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              {/* Unboxed metadata with typographic separators */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-medium">
                <span className="text-blue-400 font-bold bg-blue-950/60 border border-blue-800/50 px-2 py-0.5 rounded-lg">
                  B.Tech TOC PBL Project
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Myhill–Nerode Theorem</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>DFA State Minimization</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Table-Filling Algorithm</span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white uppercase">
                TABLE-FILLING ALGORITHM ENGINE
              </h1>

              <p className="text-base md:text-lg text-blue-300/90 font-medium tracking-wide">
                Myhill–Nerode Theorem • DFA Minimization • Theory of Computation
              </p>

              <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl pt-1">
                Input any unminimized Deterministic Finite Automaton (DFA) transition table. 
                The engine iteratively partitions indistinguishable state pairs using the 
                Myhill-Nerode equivalence theorem, producing the canonical minimal DFA and distinct equivalence classes.
              </p>

              {/* Action Buttons in Hero Block: Start New DFA and Load Example */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    handleDFAChange({
                      states: ['q0', 'q1'],
                      alphabet: ['0', '1'],
                      startState: 'q0',
                      finalStates: ['q1'],
                      transitions: {
                        q0: { '0': 'q0', '1': 'q1' },
                        q1: { '0': 'q0', '1': 'q1' },
                      },
                    });
                    handleNavigateSection('dfa-input');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs sm:text-sm text-white shadow-lg shadow-blue-600/25 transition active:scale-95 cursor-pointer"
                  title="Start a new blank DFA"
                >
                  <FilePlus2 className="w-4 h-4" />
                  <span>Start New DFA</span>
                </button>

                <button
                  onClick={() => {
                    handleLoadPreset(DFA_PRESETS[0]);
                    handleNavigateSection('dfa-input');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 font-medium text-xs sm:text-sm text-slate-200 hover:text-white transition active:scale-95 cursor-pointer"
                  title="Load standard textbook example DFA"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Load Example</span>
                </button>
              </div>
            </div>

            {/* Quick Summary Pill on the right */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 shadow-inner">
                <span>Total states:</span>
                <span className="font-mono text-slate-200 font-bold">
                  {currentDFA.states.length}
                </span>
                <span>→</span>
                <span>Minimal classes:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {result ? result.equivalenceClasses.length : '—'}
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
          unreachableStates={result?.unreachableStates || []}
        />

        {/* EDUCATIONAL PROGRESS PIPELINE */}
        <ProgressPipeline
          currentStage={currentStage}
          onSelectStage={handleSelectStage}
        />

        {result && currentStep ? (
          <>
            {/* SECTION 2 & 3: Table-Filling Educational Centerpiece */}
            <TableGrid
              dfa={currentDFA}
              reachableStates={result.reachableStates}
              steps={result.steps}
              currentStepIndex={currentStepIndex}
              onStepChange={setCurrentStepIndex}
              isComplete={isComplete}
            />

            {/* SECTION 4: Distinct Equivalence Classes of States */}
            <EquivalenceClassesView
              equivalenceClasses={result.equivalenceClasses}
              minimizedDFA={result.minimizedDFA}
              originalDFA={currentDFA}
            />

            {/* SECTION 5 & 6: Minimized DFA Container */}
            <div id="minimized-dfa" className="space-y-8 scroll-mt-20">
              {/* SECTION 5: Minimized DFA Transition Table */}
              <MinimizedDFATable
                minimizedDFA={result.minimizedDFA}
                originalDFA={currentDFA}
              />

              {/* SECTION 6: State Transition Graphs (Original vs Minimized DFA) */}
              <DFAGraphSection
                originalDFA={currentDFA}
                minimizedDFA={result.minimizedDFA}
              />

              {/* SECTION 7: String Acceptance & Equivalence Verifier */}
              <StringSimulator
                originalDFA={currentDFA}
                minimizedDFA={result.minimizedDFA}
                initialString={sampleString}
              />
            </div>
          </>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">Algorithm Suspended: Invalid DFA</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              The Table-Filling algorithm requires a well-defined DFA. Please resolve the validation error(s) shown in the red banner above to compute the lower-triangular matrix and equivalence classes.
            </p>
          </div>
        )}

        {/* SECTION 8: Theory & Academic PBL Reference Guide */}
        <TheorySection />
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
    </div>
  );
}
