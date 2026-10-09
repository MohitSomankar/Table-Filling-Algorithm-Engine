import React from 'react';
import { EquivalenceClass, MinimizedDFA, DFA } from '../types/dfa';
import {
  Layers,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Percent,
  Split,
  FileCheck2,
  BookOpen,
  GitMerge,
  ShieldCheck,
} from 'lucide-react';

interface EquivalenceClassesViewProps {
  equivalenceClasses: EquivalenceClass[];
  minimizedDFA: MinimizedDFA;
  originalDFA?: DFA;
}

export const EquivalenceClassesView: React.FC<EquivalenceClassesViewProps> = ({
  equivalenceClasses,
  minimizedDFA,
  originalDFA,
}) => {
  return (
    <div id="equivalence-classes" className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-7">
        {/* Banner: "Minimization Complete ✓" */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Equivalence Classes & Minimization Derivation</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-xl">
                  Minimization Complete ✓
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              <strong>Theorem Insight:</strong> Unmarked state pairs are equivalent and can be merged. By the Myhill–Nerode theorem, states that cannot be distinguished by any input string belong to the same equivalence class and contract into a single canonical state in the minimal DFA.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div className="text-left font-mono">
              <span className="text-xs block text-emerald-400/80">Reduction achieved:</span>
              <span className="text-base font-extrabold">
                {minimizedDFA.reductionPercentage > 0
                  ? `${minimizedDFA.reductionPercentage}% State Reduction`
                  : 'Already Minimal'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. STATISTICS DASHBOARD (6 Core Metrics) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Automaton Minimization Statistics
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">
              Total State Pairs Evaluated: {minimizedDFA.totalPairs}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Original States */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-slate-400 block">Original States</span>
              <span className="text-xl font-extrabold font-mono text-white">
                {minimizedDFA.originalStateCount}
              </span>
            </div>

            {/* 2. Minimized States */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-emerald-400 block font-semibold">
                Minimized States
              </span>
              <span className="text-xl font-extrabold font-mono text-emerald-400">
                {minimizedDFA.minimizedStateCount}
              </span>
            </div>

            {/* 3. Equivalent Pairs */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-emerald-400 block">Equivalent Pairs</span>
              <span className="text-xl font-extrabold font-mono text-emerald-300">
                {minimizedDFA.equivalentPairsCount}
              </span>
            </div>

            {/* 4. Distinguishable Pairs */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-rose-400 block">Distinguishable Pairs</span>
              <span className="text-xl font-extrabold font-mono text-rose-400">
                {minimizedDFA.distinguishablePairsCount}
              </span>
            </div>

            {/* 5. States Removed */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-blue-400 block">States Removed</span>
              <span className="text-xl font-extrabold font-mono text-blue-300">
                {minimizedDFA.statesRemoved}
              </span>
            </div>

            {/* 6. Reduction % */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-amber-400 block">Reduction %</span>
              <span className="text-xl font-extrabold font-mono text-amber-300">
                {minimizedDFA.reductionPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* 1. EQUIVALENT PAIRS LIST */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Equivalent Pairs (Unmarked in Table)
              </h4>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              {minimizedDFA.equivalentPairsCount} pair{minimizedDFA.equivalentPairsCount !== 1 ? 's' : ''}
            </span>
          </div>

          {minimizedDFA.equivalentPairs.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1 font-mono">
              {minimizedDFA.equivalentPairs.map(([a, b], idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>({a}, {b})</span>
                  <span className="text-emerald-500 font-normal text-[11px]">≡</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No equivalent pairs found. Every pair of states is distinguishable by at least one string. The DFA is already minimal!
            </p>
          )}

          <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
            <strong>Viva Tip:</strong> An unmarked cell in the Myhill–Nerode table means the two states cannot be distinguished by any string in Σ*. They satisfy the equivalence relation p ≡ q.
          </p>
        </div>

        {/* 2 & 4. MATHEMATICALLY CORRECT EQUIVALENCE CLASSES (A = [q0], B = [q1, q2]) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Equivalence Classes & Minimized State Mapping
              </h4>
            </div>
            <span className="text-xs font-mono text-blue-400">
              Partition: Q / ≡ = {'{ '}{equivalenceClasses.map((c) => c.label).join(', ')}{' }'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {equivalenceClasses.map((cls) => {
              const isMerged = cls.states.length > 1;

              return (
                <div
                  key={cls.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isMerged
                      ? 'bg-emerald-950/20 border-emerald-800/70 shadow-md'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  {/* Top line: Canonical State Label = [q_i, ...] */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-mono font-bold text-sm flex items-center justify-center">
                        {cls.label}
                      </span>
                      <div>
                        <span className="text-sm font-extrabold text-white font-mono">
                          {cls.label} = [{cls.states.join(', ')}]
                        </span>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {isMerged ? 'Merged Equivalence Class' : 'Singleton Class'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-[10px]">
                      {cls.isStart && (
                        <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                          Start
                        </span>
                      )}
                      {cls.isFinal && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                          * Final
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Class details */}
                  <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Composed of:</span>
                      <div className="flex items-center gap-1 font-mono">
                        {cls.states.map((st) => (
                          <span
                            key={st}
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                              isMerged
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                                : 'bg-slate-800 text-slate-200'
                            }`}
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Canonical Rep:</span>
                      <span className="font-mono text-slate-200 font-bold">{cls.representative}</span>
                    </div>

                    {isMerged && (
                      <div className="pt-1 text-[11px] text-emerald-400/90 leading-tight">
                        ✓ Transitive closure: all {cls.states.length} states are mutually equivalent.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. CLEAR HEAD-TO-HEAD COMPARISON: ORIGINAL DFA vs MINIMIZED DFA */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Automaton Comparison (Original vs Minimized)
            </h4>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Language Equivalence Preserved: L(M) = L(M')</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Original DFA */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-200 font-bold font-sans">
                <span>ORIGINAL DFA (M)</span>
                <span className="text-slate-400 font-mono text-xs">{minimizedDFA.originalStateCount} States</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>States Count:</span>
                <span className="font-bold text-white">{minimizedDFA.originalStateCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Total Transitions:</span>
                <span className="font-bold text-white">{minimizedDFA.originalTransitionsCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Start State:</span>
                <span className="text-blue-400 font-bold">{originalDFA?.startState || 'q0'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Final States:</span>
                <span className="text-emerald-400 font-bold">
                  {'{' + (originalDFA?.finalStates.join(', ') || '') + '}'}
                </span>
              </div>
            </div>

            {/* Minimized DFA */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/60 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-800/60 text-emerald-300 font-bold font-sans">
                <span>MINIMIZED DFA (M')</span>
                <span className="text-emerald-400 font-mono text-xs">{minimizedDFA.minimizedStateCount} States</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>States Count:</span>
                <span className="font-bold text-emerald-400">{minimizedDFA.minimizedStateCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Total Transitions:</span>
                <span className="font-bold text-emerald-400">{minimizedDFA.minimizedTransitionsCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Start Class:</span>
                <span className="text-blue-400 font-bold">
                  {minimizedDFA.startClassLabel} = {minimizedDFA.startClassId}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Final Classes:</span>
                <span className="text-emerald-400 font-bold">
                  {'{' + minimizedDFA.finalClassLabels.join(', ') + '}'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
