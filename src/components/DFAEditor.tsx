import React, { useState, useId } from 'react';
import { DFA, DFAPreset } from '../types/dfa';
import { DFA_PRESETS } from '../utils/presets';
import { validateDFA, DFAValidationResult } from '../utils/dfaValidator';
import { JSONModal } from './JSONModal';
import {
  Plus,
  Trash2,
  Play,
  Sparkles,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Upload,
  Download,
  RotateCcw,
  FilePlus2,
  Eraser,
  Tag,
  AlertTriangle,
} from 'lucide-react';

interface DFAEditorProps {
  dfa: DFA;
  onChange: (updatedDFA: DFA) => void;
  onRunMinimization: () => void;
  onLoadPreset: (preset: DFAPreset) => void;
  activePresetId?: string;
  unreachableStates?: string[];
}

export const DFAEditor: React.FC<DFAEditorProps> = ({
  dfa,
  onChange,
  onRunMinimization,
  onLoadPreset,
  activePresetId,
  unreachableStates = [],
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [jsonModalMode, setJsonModalMode] = useState<'import' | 'export' | null>(null);
  const [newSymbolInput, setNewSymbolInput] = useState('');
  const [newStateInput, setNewStateInput] = useState('');

  // Live DFA Validation
  const validation: DFAValidationResult = validateDFA(dfa);

  // Helper to update a transition
  const handleTransitionChange = (fromState: string, symbol: string, toState: string) => {
    const nextTransitions = {
      ...dfa.transitions,
      [fromState]: {
        ...(dfa.transitions[fromState] || {}),
        [symbol]: toState,
      },
    };
    onChange({
      ...dfa,
      transitions: nextTransitions,
    });
  };

  // Helper to toggle a final state
  const handleToggleFinalState = (state: string) => {
    const isCurrentlyFinal = dfa.finalStates.includes(state);
    const newFinalStates = isCurrentlyFinal
      ? dfa.finalStates.filter((s) => s !== state)
      : [...dfa.finalStates, state];
    onChange({
      ...dfa,
      finalStates: newFinalStates,
    });
  };

  // Helper to set start state
  const handleSetStartState = (state: string) => {
    onChange({
      ...dfa,
      startState: state,
    });
  };

  // Helper to add a state
  const handleAddState = (customName?: string) => {
    if (dfa.states.length >= 10) return;
    const nameToAdd = customName?.trim() || `q${dfa.states.length}`;
    if (!nameToAdd || dfa.states.includes(nameToAdd)) return;

    const newStates = [...dfa.states, nameToAdd];
    const newTransitions = { ...dfa.transitions };
    newTransitions[nameToAdd] = {};
    for (const sym of dfa.alphabet) {
      newTransitions[nameToAdd][sym] = nameToAdd;
    }
    onChange({
      ...dfa,
      states: newStates,
      transitions: newTransitions,
    });
    setNewStateInput('');
  };

  // Helper to remove a state
  const handleRemoveState = (stateToRemove: string) => {
    if (dfa.states.length <= 1) return;
    const newStates = dfa.states.filter((s) => s !== stateToRemove);
    const newFinalStates = dfa.finalStates.filter((s) => s !== stateToRemove);
    const newStartState =
      dfa.startState === stateToRemove ? newStates[0] || '' : dfa.startState;

    const newTransitions: Record<string, Record<string, string>> = {};
    for (const st of newStates) {
      newTransitions[st] = {};
      for (const sym of dfa.alphabet) {
        const currTarget = dfa.transitions[st]?.[sym];
        newTransitions[st][sym] =
          currTarget === stateToRemove ? newStates[0] || '' : (currTarget || newStates[0] || '');
      }
    }

    onChange({
      ...dfa,
      states: newStates,
      startState: newStartState,
      finalStates: newFinalStates,
      transitions: newTransitions,
    });
  };

  // Helper to add a symbol to alphabet
  const handleAddSymbol = (sym: string) => {
    const cleanSym = sym.trim();
    if (!cleanSym || dfa.alphabet.includes(cleanSym)) return;
    const newAlphabet = [...dfa.alphabet, cleanSym];
    const newTransitions: Record<string, Record<string, string>> = {};
    for (const st of dfa.states) {
      newTransitions[st] = {
        ...(dfa.transitions[st] || {}),
        [cleanSym]: st, // default transition to itself
      };
    }
    onChange({
      ...dfa,
      alphabet: newAlphabet,
      transitions: newTransitions,
    });
    setNewSymbolInput('');
  };

  // Helper to remove a symbol from alphabet
  const handleRemoveSymbol = (symToRemove: string) => {
    if (dfa.alphabet.length <= 1) return;
    const newAlphabet = dfa.alphabet.filter((a) => a !== symToRemove);
    const newTransitions: Record<string, Record<string, string>> = {};
    for (const st of dfa.states) {
      newTransitions[st] = {};
      for (const a of newAlphabet) {
        newTransitions[st][a] = dfa.transitions[st]?.[a] || st;
      }
    }
    onChange({
      ...dfa,
      alphabet: newAlphabet,
      transitions: newTransitions,
    });
  };

  // Quick switch alphabet preset
  const handleSwitchAlphabet = (presetAlphabet: string[]) => {
    const newTransitions: Record<string, Record<string, string>> = {};
    for (const st of dfa.states) {
      newTransitions[st] = {};
      for (let i = 0; i < presetAlphabet.length; i++) {
        const newSym = presetAlphabet[i];
        const oldSym = dfa.alphabet[i] || dfa.alphabet[0];
        newTransitions[st][newSym] = dfa.transitions[st]?.[oldSym] || dfa.states[0];
      }
    }
    onChange({
      ...dfa,
      alphabet: presetAlphabet,
      transitions: newTransitions,
    });
  };

  // Action: New Blank DFA Template
  const handleNewDFA = () => {
    onChange({
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      startState: 'q0',
      finalStates: ['q1'],
      transitions: {
        q0: { '0': 'q0', '1': 'q1' },
        q1: { '0': 'q0', '1': 'q1' },
      },
    });
  };

  // Action: Clear All Transitions (to test missing transitions validation)
  const handleClearTransitions = () => {
    const emptyTransitions: Record<string, Record<string, string>> = {};
    for (const st of dfa.states) {
      emptyTransitions[st] = {};
    }
    onChange({
      ...dfa,
      transitions: emptyTransitions,
    });
  };

  return (
    <div id="dfa-input" className="space-y-6">
      {/* Quick Test Presets Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-semibold tracking-wider uppercase text-slate-400">
              Quick Test Presets
            </h2>
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How it works</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
          {DFA_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onLoadPreset(preset)}
                className={`p-3 text-left rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500/50 shadow-sm shadow-blue-500/10'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-semibold ${
                        isSelected ? 'text-blue-400' : 'text-slate-200'
                      }`}
                    >
                      {preset.name.split(' (')[0]}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {preset.dfa.states.length} states
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanatory banner if collapsed */}
      {showHelp && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2 animate-in fade-in">
          <p className="font-semibold text-slate-100">
            About the Myhill-Nerode Table-Filling Algorithm (State Minimization):
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>
              <strong>0-Equivalence (Round 0):</strong> Pairs with exactly one final state and one non-final state are marked distinguishable by the empty string ε.
            </li>
            <li>
              <strong>k-Equivalence (Rounds 1..k):</strong> An unmarked pair <code className="text-slate-300">{"{p, q}"}</code> is marked if on any symbol <code className="text-blue-400">a</code>, the transitions <code className="text-slate-300">{"{δ(p, a), δ(q, a)}"}</code> lead to an already distinguished pair.
            </li>
            <li>
              <strong>Equivalence Classes:</strong> Remaining unmarked pairs at fixed point are equivalent (<code className="text-amber-400">p ≡ q</code>) and unified via Union-Find into minimal DFA states.
            </li>
          </ul>
        </div>
      )}

      {/* Main DFA Input Card */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 lg:p-6 shadow-xl space-y-6">
        {/* Card Header & Global Operations Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">DFA Specification & Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Define states, alphabet, start state, final states, and transition table δ.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setJsonModalMode('import')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
              title="Import DFA from JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
            </button>

            <button
              onClick={() => setJsonModalMode('export')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
              title="Export DFA to JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handleNewDFA}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
              title="Start a new 2-state DFA"
            >
              <FilePlus2 className="w-3.5 h-3.5" />
              <span>New DFA</span>
            </button>

            <button
              onClick={handleClearTransitions}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
              title="Clear all transitions to test validation"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Clear δ</span>
            </button>

            <button
              onClick={onRunMinimization}
              disabled={!validation.isValid}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg shadow-md transition ${
                validation.isValid
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 active:scale-95 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              }`}
              title={validation.isValid ? 'Run Table-Filling Algorithm' : 'Fix validation errors before running'}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Algorithm</span>
            </button>
          </div>
        </div>

        {/* VALIDATION STATUS BANNER */}
        {validation.isValid ? (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">✓ Valid DFA</span>
              <span className="text-emerald-400/80">
                · All {dfa.states.length} states and {dfa.alphabet.length * dfa.states.length} transitions are complete and consistent.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>✕ Invalid DFA ({validation.errors.length} issue{validation.errors.length > 1 ? 's' : ''} detected)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-rose-300/90 pl-1 font-mono">
              {validation.errors.slice(0, 5).map((err, idx) => (
                <li key={idx} className="leading-relaxed">
                  <span className="font-semibold">{err.message}</span>
                  {err.details && <span className="text-[11px] text-rose-400/80 font-sans ml-2">({err.details})</span>}
                </li>
              ))}
              {validation.errors.length > 5 && (
                <li className="text-slate-400 font-sans">
                  ...and {validation.errors.length - 5} more issues.
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Unreachable states warning if any */}
        {unreachableStates.length > 0 && validation.isValid && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-200">
                Unreachable State(s) Detected: {unreachableStates.join(', ')}
              </p>
              <p className="text-amber-400/80 mt-0.5">
                These states cannot be reached from the start state <code className="font-mono">{dfa.startState}</code>. The Table-Filling algorithm automatically prunes unreachable states from the minimal machine.
              </p>
            </div>
          </div>
        )}

        {/* Global DFA Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Alphabet Configuration */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Alphabet (Σ)</span>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => handleSwitchAlphabet(['0', '1'])}
                  className={`px-2 py-0.5 rounded font-mono ${
                    dfa.alphabet.join(',') === '0,1'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-800'
                  }`}
                >
                  {'{0, 1}'}
                </button>
                <button
                  onClick={() => handleSwitchAlphabet(['a', 'b'])}
                  className={`px-2 py-0.5 rounded font-mono ${
                    dfa.alphabet.join(',') === 'a,b'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-800'
                  }`}
                >
                  {'{a, b}'}
                </button>
                <button
                  onClick={() => handleSwitchAlphabet(['0', '1', '2'])}
                  className={`px-2 py-0.5 rounded font-mono ${
                    dfa.alphabet.join(',') === '0,1,2'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-800'
                  }`}
                >
                  {'{0,1,2}'}
                </button>
              </div>
            </div>

            {/* Alphabet chips with removal */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {dfa.alphabet.map((sym) => (
                <span
                  key={sym}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono font-bold text-xs text-blue-400"
                >
                  <span>{sym}</span>
                  {dfa.alphabet.length > 1 && (
                    <button
                      onClick={() => handleRemoveSymbol(sym)}
                      className="text-slate-500 hover:text-rose-400 ml-0.5 transition"
                      title={`Remove symbol '${sym}'`}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {/* Add symbol input */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                maxLength={3}
                placeholder="New symbol"
                value={newSymbolInput}
                onChange={(e) => setNewSymbolInput(e.target.value.trim())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSymbol(newSymbolInput);
                }}
                className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-hidden focus:border-blue-500"
              />
              <button
                onClick={() => handleAddSymbol(newSymbolInput)}
                disabled={!newSymbolInput || dfa.alphabet.includes(newSymbolInput)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-slate-300 transition"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Start State Selection */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Start State (q₀)</span>
              <span className="text-[11px] font-mono text-blue-400">→ {dfa.startState || 'None'}</span>
            </div>
            <div>
              <select
                value={dfa.startState}
                onChange={(e) => handleSetStartState(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-medium text-slate-200 focus:outline-hidden focus:border-blue-500"
              >
                {dfa.states.map((st) => (
                  <option key={st} value={st}>
                    → {st} {dfa.finalStates.includes(st) ? '(* Final)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400">
              Initial state where computation begins.
            </p>
          </div>

          {/* Accepting / Final States Toggle */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Final States (F)</span>
              <span className="text-[11px] text-emerald-400 font-mono">
                {dfa.finalStates.length} of {dfa.states.length} accepting
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {dfa.states.map((st) => {
                const isFinal = dfa.finalStates.includes(st);
                return (
                  <button
                    key={st}
                    onClick={() => handleToggleFinalState(st)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition cursor-pointer ${
                      isFinal
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-xs'
                        : 'bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:text-slate-200'
                    }`}
                  >
                    {isFinal ? `* ${st}` : st}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400">
              Click state chips above to toggle acceptance.
            </p>
          </div>
        </div>

        {/* Transition Table Matrix */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                State Transition Table (δ)
              </h4>
              <span className="text-xs text-slate-500">
                ({dfa.states.length} states × {dfa.alphabet.length} symbols)
              </span>
            </div>

            {/* Quick Add State Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="State name"
                value={newStateInput}
                onChange={(e) => setNewStateInput(e.target.value.trim())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddState(newStateInput);
                }}
                className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-hidden focus:border-blue-500"
              />
              <button
                onClick={() => handleAddState(newStateInput)}
                disabled={dfa.states.length >= 10}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg border border-slate-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add State</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">State (q)</th>
                  <th className="py-3 px-4 font-semibold">Classification</th>
                  {dfa.alphabet.map((sym) => (
                    <th key={sym} className="py-3 px-4 font-semibold font-mono text-center">
                      δ(q, {sym})
                    </th>
                  ))}
                  <th className="py-3 px-3 font-semibold text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 font-mono">
                {dfa.states.map((st) => {
                  const isStart = dfa.startState === st;
                  const isFinal = dfa.finalStates.includes(st);
                  const isUnreachable = unreachableStates.includes(st);

                  return (
                    <tr
                      key={st}
                      className={`hover:bg-slate-900/50 transition-colors ${
                        isUnreachable ? 'bg-amber-950/20' : ''
                      }`}
                    >
                      {/* State label */}
                      <td className="py-2.5 px-4 font-bold text-slate-100 flex items-center gap-2">
                        {isStart && <span className="text-blue-400" title="Start State">→</span>}
                        {isFinal && <span className="text-emerald-400" title="Final State">*</span>}
                        <span>{st}</span>
                        {isUnreachable && (
                          <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded font-sans font-normal border border-amber-800/50">
                            unreachable
                          </span>
                        )}
                      </td>

                      {/* State classification */}
                      <td className="py-2.5 px-4 font-sans text-[11px] text-slate-400">
                        {isStart && isFinal ? (
                          <span className="text-cyan-400 font-medium">Start & Final</span>
                        ) : isStart ? (
                          <span className="text-blue-400 font-medium">Start State</span>
                        ) : isFinal ? (
                          <span className="text-emerald-400 font-medium">Accepting</span>
                        ) : (
                          <span className="text-slate-500">Non-Final</span>
                        )}
                      </td>

                      {/* Transition selectors for each alphabet symbol */}
                      {dfa.alphabet.map((sym) => {
                        const target = dfa.transitions[st]?.[sym] ?? '';
                        const hasError = !target || !dfa.states.includes(target);

                        return (
                          <td key={sym} className="py-2.5 px-4 text-center">
                            <select
                              value={target}
                              onChange={(e) => handleTransitionChange(st, sym, e.target.value)}
                              className={`rounded-lg px-2.5 py-1 text-xs font-mono transition cursor-pointer ${
                                hasError
                                  ? 'bg-rose-950/80 border border-rose-600 text-rose-300 font-bold focus:ring-1 focus:ring-rose-500'
                                  : 'bg-slate-900 border border-slate-700/80 text-slate-100 focus:outline-hidden focus:border-blue-500'
                              }`}
                            >
                              <option value="">— (missing)</option>
                              {dfa.states.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </td>
                        );
                      })}

                      {/* Delete state button */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleRemoveState(st)}
                          disabled={dfa.states.length <= 1}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none transition"
                          title="Delete this state"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* JSON Modal for Import/Export */}
      <JSONModal
        isOpen={jsonModalMode !== null}
        onClose={() => setJsonModalMode(null)}
        dfa={dfa}
        onImportDFA={onChange}
        mode={jsonModalMode || 'export'}
      />
    </div>
  );
};
