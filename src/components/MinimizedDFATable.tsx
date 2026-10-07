import React from 'react';
import { MinimizedDFA, DFA } from '../types/dfa';
import { Table, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface MinimizedDFATableProps {
  minimizedDFA: MinimizedDFA;
  originalDFA: DFA;
}

export const MinimizedDFATable: React.FC<MinimizedDFATableProps> = ({
  minimizedDFA,
  originalDFA,
}) => {
  return (
    <div id="minimized-table" className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 lg:p-6 shadow-xl space-y-5">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Table className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">
                Minimized DFA Transition Table (M')
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Constructed by contracting each Myhill-Nerode equivalence class into a single canonical state.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-xl font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Guaranteed Unique Minimal State Automaton</span>
          </div>
        </div>

        {/* Transition Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Class / State [q]</th>
                <th className="py-3 px-4 font-semibold">Composed Of</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                {originalDFA.alphabet.map((sym) => (
                  <th key={sym} className="py-3 px-4 font-semibold font-mono text-center">
                    δ'([q], {sym})
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
                    {/* Class Name */}
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      {isStart && <span className="text-blue-400 font-bold" title="Start State">→</span>}
                      {isFinal && <span className="text-emerald-400 font-bold" title="Accepting State">*</span>}
                      <span className="text-blue-300 font-mono">{cls.id}</span>
                    </td>

                    {/* Original States */}
                    <td className="py-3 px-4 text-slate-400 font-sans text-xs">
                      {'{' + cls.states.join(', ') + '}'}
                    </td>

                    {/* State Type */}
                    <td className="py-3 px-4 font-sans text-[11px]">
                      {isStart && isFinal ? (
                        <span className="text-cyan-400">Start & Accepting</span>
                      ) : isStart ? (
                        <span className="text-blue-400">Start State</span>
                      ) : isFinal ? (
                        <span className="text-emerald-400">Accepting</span>
                      ) : (
                        <span className="text-slate-500">Regular</span>
                      )}
                    </td>

                    {/* Transition Columns */}
                    {originalDFA.alphabet.map((sym) => {
                      const nextClass = minimizedDFA.transitions[cls.id]?.[sym] || '—';
                      return (
                        <td key={sym} className="py-3 px-4 text-center">
                          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs">
                            {nextClass}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
