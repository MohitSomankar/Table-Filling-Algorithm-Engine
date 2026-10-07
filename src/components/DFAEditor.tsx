import React, { useState } from 'react';
import { DFA, DFAPreset } from '../types/dfa';
import { DFA_PRESETS } from '../utils/presets';
import { Plus, Trash2, Play, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';

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
  const handleAddState = () => {
    if (dfa.states.length >= 8) return;
    const nextIndex = dfa.states.length;
    let nextName = `q${nextIndex}`;
    while (dfa.states.includes(nextName)) {
      nextName = `q${Math.floor(Math.random() * 100)}`;
    }
    const newStates = [...dfa.states, nextName];
    // Default transitions to itself
    const newTransitions = { ...dfa.transitions };
    newTransitions[nextName] = {};
    for (const sym of dfa.alphabet) {
      newTransitions[nextName][sym] = nextName;
    }
    onChange({
      ...dfa,
      states: newStates,
      transitions: newTransitions,
    });
  };

  // Helper to remove last state
  const handleRemoveState = (stateToRemove: string) => {
    if (dfa.states.length <= 2) return;
    const newStates = dfa.states.filter((s) => s !== stateToRemove);
    const newFinalStates = dfa.finalStates.filter((s) => s !== stateToRemove);
    const newStartState = dfa.startState === stateToRemove ? newStates[0] : dfa.startState;

    const newTransitions: Record<string, Record<string, string>> = {};
    for (const st of newStates) {
      newTransitions[st] = {};
      for (const sym of dfa.alphabet) {
        const currTarget = dfa.transitions[st]?.[sym];
        newTransitions[st][sym] = currTarget === stateToRemove ? newStates[0] : (currTarget || newStates[0]);
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

  // Quick switch alphabet: {0, 1} vs {a, b}
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
              <strong>0-Equivalence:</strong> First, states in Final set <code className="text-emerald-400">F</code> are distinguished from states in Non-Final set <code className="text-slate-300">Q \ F</code> because the empty string ε distinguishes them.
            </li>
            <li>
              <strong>k-Equivalence:</strong> Iteratively, an unmarked pair <code className="text-slate-300">{"{p, q}"}</code> is marked if for any input symbol <code className="text-blue-400">a</code>, the next states <code className="text-slate-300">{"{δ(p, a), δ(q, a)}"}</code> are already marked as distinguishable.
            </li>
            <li>
              <strong>Equivalence Classes:</strong> All pairs left unmarked at termination cannot be distinguished by any string, hence <code className="text-amber-400">p ≡ q</code> and can be collapsed into a single state.
            </li>
          </ul>
        </div>
      )}

      {/* Main DFA Input Card */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 lg:p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">Unminimized DFA Configuration</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Edit states, alphabet, start state, accepting states, and the transition table below.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddState}
              disabled={dfa.states.length >= 8}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg border border-slate-700 transition"
              title="Add a state (Max 8)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add State</span>
            </button>
            <button
              onClick={onRunMinimization}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30 transition active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Algorithm</span>
            </button>
          </div>
        </div>

        {/* Unreachable states warning if any */}
        {unreachableStates.length > 0 && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-200">
                Unreachable States Detected: {unreachableStates.join(', ')}
              </p>
              <p className="text-amber-400/80 mt-0.5">
                These states cannot be reached from the start state <code className="font-mono">{dfa.startState}</code>. The Table-Filling algorithm automatically eliminates unreachable states so the minimal DFA contains only productive reachable states.
              </p>
            </div>
          </div>
        )}

        {/* Global DFA Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Alphabet Configuration */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
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
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {dfa.alphabet.map((sym) => (
                <span
                  key={sym}
                  className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono font-bold text-sm text-blue-400"
                >
                  {sym}
                </span>
              ))}
            </div>
          </div>

          {/* Start State Selection */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <span className="text-xs font-semibold text-slate-300">Start State (q₀)</span>
            <div className="pt-1">
              <select
                value={dfa.startState}
                onChange={(e) => handleSetStartState(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-slate-200 focus:outline-hidden focus:border-blue-500"
              >
                {dfa.states.map((st) => (
                  <option key={st} value={st}>
                    {st} (Start)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Accepting / Final States Toggle */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Final States (F)</span>
              <span className="text-[11px] text-slate-500">Click state to toggle</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {dfa.states.map((st) => {
                const isFinal = dfa.finalStates.includes(st);
                return (
                  <button
                    key={st}
                    onClick={() => handleToggleFinalState(st)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition ${
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
          </div>
        </div>

        {/* Transition Table Matrix */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              State Transition Table (δ)
            </h4>
            <span className="text-xs text-slate-500">
              Legend: <span className="text-blue-400 font-semibold">→ Start</span> · <span className="text-emerald-400 font-semibold">* Final</span>
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">State (q)</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  {dfa.alphabet.map((sym) => (
                    <th key={sym} className="py-3 px-4 font-semibold font-mono text-center">
                      δ(q, {sym})
                    </th>
                  ))}
                  <th className="py-3 px-3 font-semibold text-right">Actions</th>
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

                      {/* State status */}
                      <td className="py-2.5 px-4 font-sans text-[11px] text-slate-400">
                        {isStart && isFinal ? (
                          <span className="text-cyan-400">Start & Final</span>
                        ) : isStart ? (
                          <span className="text-blue-400">Start State</span>
                        ) : isFinal ? (
                          <span className="text-emerald-400">Accepting</span>
                        ) : (
                          <span className="text-slate-500">Regular</span>
                        )}
                      </td>

                      {/* Transitions for each symbol */}
                      {dfa.alphabet.map((sym) => {
                        const target = dfa.transitions[st]?.[sym] || dfa.states[0];
                        return (
                          <td key={sym} className="py-2.5 px-4 text-center">
                            <select
                              value={target}
                              onChange={(e) => handleTransitionChange(st, sym, e.target.value)}
                              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500 transition cursor-pointer"
                            >
                              {dfa.states.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </td>
                        );
                      })}

                      {/* Delete action */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleRemoveState(st)}
                          disabled={dfa.states.length <= 2}
                          className="p-1 rounded text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:pointer-events-none transition"
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
    </div>
  );
};
