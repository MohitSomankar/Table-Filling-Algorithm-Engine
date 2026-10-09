import React, { useState } from 'react';
import { MinimizedDFA, DFA } from '../types/dfa';
import { Table, ShieldCheck, CheckCircle2, ArrowRight, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

interface MinimizedDFATableProps {
  minimizedDFA: MinimizedDFA;
  originalDFA: DFA;
}

export const MinimizedDFATable: React.FC<MinimizedDFATableProps> = ({
  minimizedDFA,
  originalDFA,
}) => {
  const [notationMode, setNotationMode] = useState<'labels' | 'sets'>('labels');

  return (
    <div id="minimized-table" className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6">
        {/* Title & View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                <Table className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                Minimized DFA Transition Table (M')
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Each Myhill–Nerode equivalence class contracts into exactly one state in the canonical minimized machine.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Notation mode switch */}
            <div className="p-0.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
              <button
                onClick={() => setNotationMode('labels')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  notationMode === 'labels'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Labels (A, B, C)
              </button>
              <button
                onClick={() => setNotationMode('sets')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  notationMode === 'sets'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Class Sets [q...]
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-xl font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Minimal DFA (Homomorphic Quotient)</span>
            </div>
          </div>
        </div>

        {/* Minimized Transition Table Matrix */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Minimized State (q')</th>
                <th className="py-3.5 px-5 font-semibold">Equivalence Class [q]</th>
                <th className="py-3.5 px-5 font-semibold">State Classification</th>
                {originalDFA.alphabet.map((sym) => (
                  <th key={sym} className="py-3.5 px-5 font-semibold font-mono text-center">
                    δ'(q', {sym})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-mono">
              {minimizedDFA.classes.map((cls) => {
                const isStart = cls.id === minimizedDFA.startClassId;
                const isFinal = minimizedDFA.finalClassIds.includes(cls.id);

                return (
                  <tr key={cls.id} className="hover:bg-slate-900/50 transition-colors">
                    {/* Canonical State Label */}
                    <td className="py-4 px-5 font-bold text-white flex items-center gap-2.5">
                      {isStart && (
                        <span className="text-blue-400 font-extrabold text-sm" title="Start State">
                          →
                        </span>
                      )}
                      {isFinal && (
                        <span className="text-emerald-400 font-extrabold text-sm" title="Accepting State">
                          *
                        </span>
                      )}
                      <span className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-xs">
                        {cls.label}
                      </span>
                      <span className="text-sm font-extrabold text-slate-200">
                        {cls.label}
                      </span>
                    </td>

                    {/* Full Equivalence Class */}
                    <td className="py-4 px-5 text-slate-300 font-mono text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                        [{cls.states.join(', ')}]
                      </span>
                    </td>

                    {/* State Classification */}
                    <td className="py-4 px-5 font-sans text-xs">
                      {isStart && isFinal ? (
                        <span className="text-cyan-400 font-semibold">→ Start & * Accepting</span>
                      ) : isStart ? (
                        <span className="text-blue-400 font-semibold">→ Start State</span>
                      ) : isFinal ? (
                        <span className="text-emerald-400 font-semibold">* Accepting State</span>
                      ) : (
                        <span className="text-slate-500">Regular State</span>
                      )}
                    </td>

                    {/* Transitions for each symbol */}
                    {originalDFA.alphabet.map((sym) => {
                      const nextClassId = minimizedDFA.transitions[cls.id]?.[sym] || '—';
                      const nextLabel = minimizedDFA.labelTransitions[cls.label]?.[sym] || '—';
                      const targetClassObj = minimizedDFA.classes.find(
                        (c) => c.id === nextClassId || c.label === nextLabel
                      );

                      return (
                        <td key={sym} className="py-4 px-5 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700/80 text-white font-mono font-bold text-xs shadow-xs">
                              {notationMode === 'labels' ? nextLabel : nextClassId}
                            </span>
                            {notationMode === 'labels' && targetClassObj && (
                              <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                [{targetClassObj.states.join(',')}]
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* College Viva / Examination Reference Notes */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-blue-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Viva & Exam Summary: Formal Minimized Automaton Definition</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 leading-relaxed">
            <li>
              <strong>State Set Q':</strong> The quotient set <code className="text-blue-300 font-mono">Q / ≡ = {'{' + minimizedDFA.classes.map((c) => c.label).join(', ') + '}'}</code>, contracting each equivalence class of indistinguishable states into a single state.
            </li>
            <li>
              <strong>Alphabet Σ':</strong> Identical input alphabet <code className="text-blue-300 font-mono">{'{' + originalDFA.alphabet.join(', ') + '}'}</code>.
            </li>
            <li>
              <strong>Start State q₀':</strong> The unique equivalence class containing the original start state <code className="text-blue-300 font-mono">{originalDFA.startState}</code>, which is <code className="text-emerald-300 font-mono font-bold">{minimizedDFA.startClassLabel} = {minimizedDFA.startClassId}</code>.
            </li>
            <li>
              <strong>Accepting States F':</strong> All classes containing accepting states: <code className="text-emerald-300 font-mono font-bold">{'{' + minimizedDFA.finalClassLabels.join(', ') + '}'}</code>.
            </li>
            <li>
              <strong>Transition Function δ':</strong> Well-defined homomorphism: <code className="text-blue-300 font-mono">δ'([q], a) = [δ(q, a)]</code> for any representative state q ∈ [q].
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
