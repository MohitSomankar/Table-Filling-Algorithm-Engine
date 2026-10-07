import React from 'react';
import { EquivalenceClass, MinimizedDFA } from '../types/dfa';
import { Layers, ArrowRight, CheckCircle, Sparkles, Binary } from 'lucide-react';

interface EquivalenceClassesViewProps {
  equivalenceClasses: EquivalenceClass[];
  minimizedDFA: MinimizedDFA;
}

export const EquivalenceClassesView: React.FC<EquivalenceClassesViewProps> = ({
  equivalenceClasses,
  minimizedDFA,
}) => {
  const reductionPercent = Math.round(
    ((minimizedDFA.originalStateCount - minimizedDFA.minimizedStateCount) /
      minimizedDFA.originalStateCount) *
      100
  );

  return (
    <div id="equivalence-classes" className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 lg:p-6 shadow-xl space-y-6">
        {/* Title and stats bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-semibold text-white">
                Distinct Equivalence Classes of States (Myhill-Nerode Theorem)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              States grouped by equivalence relation ≡ where no string can distinguish them.
            </p>
          </div>

          {/* Reduction Metric badge */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
              <span className="text-xs text-slate-400">States:</span>
              <span className="font-mono font-bold text-xs text-slate-200">
                {minimizedDFA.originalStateCount}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono font-bold text-xs text-emerald-400">
                {minimizedDFA.minimizedStateCount}
              </span>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {reductionPercent > 0 ? `${reductionPercent}% Reduction` : 'Already Minimal'}
              </span>
            </div>
          </div>
        </div>

        {/* Quotient Set Formula */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Equivalence Partition Q / ≡
            </span>
            <span className="text-xs text-blue-400 font-mono">
              |Q / ≡| = {equivalenceClasses.length} classes
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-sm text-slate-200 overflow-x-auto">
            <span>Q / ≡ = {'{ '}</span>
            {equivalenceClasses.map((cls, idx) => (
              <span key={cls.id}>
                <span
                  className={
                    cls.states.length > 1
                      ? 'text-emerald-400 font-bold'
                      : 'text-slate-300'
                  }
                >
                  {'{' + cls.states.join(', ') + '}'}
                </span>
                {idx < equivalenceClasses.length - 1 ? ', ' : ''}
              </span>
            ))}
            <span>{' }'}</span>
          </div>
        </div>

        {/* Individual Class Cards Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Equivalence Classes Breakdown
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {equivalenceClasses.map((cls, index) => {
              const isMerged = cls.states.length > 1;

              return (
                <div
                  key={cls.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isMerged
                      ? 'bg-emerald-950/15 border-emerald-800/60 shadow-xs'
                      : 'bg-slate-950/50 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-blue-400">
                        {index + 1}
                      </span>
                      <span className="font-mono font-bold text-sm text-white">
                        Class {cls.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {cls.isStart && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/50 font-medium">
                          Start
                        </span>
                      )}
                      {cls.isFinal && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 font-medium">
                          Accepting
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Members list */}
                  <div className="space-y-1.5 mt-3 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Original States:</span>
                      <div className="flex items-center gap-1 font-mono font-semibold">
                        {cls.states.map((st) => (
                          <span
                            key={st}
                            className={`px-1.5 py-0.5 rounded text-[11px] ${
                              isMerged
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                                : 'bg-slate-800 text-slate-200'
                            }`}
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>Representative:</span>
                      <span className="font-mono text-slate-200 font-medium">
                        {cls.representative}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>Type:</span>
                      <span className={isMerged ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                        {isMerged ? `Merged (${cls.states.length} equivalent states)` : 'Single state'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
