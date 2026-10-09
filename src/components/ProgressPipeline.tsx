import React from 'react';
import { AlgorithmStage } from '../types/dfa';
import { ArrowRight, CheckCircle2, Circle, Disc3, Layers, Sparkles, Table, Terminal } from 'lucide-react';

interface ProgressPipelineProps {
  currentStage: AlgorithmStage;
  onSelectStage?: (stage: AlgorithmStage) => void;
}

interface StageItem {
  id: AlgorithmStage;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

export const ProgressPipeline: React.FC<ProgressPipelineProps> = ({
  currentStage,
  onSelectStage,
}) => {
  const stages: StageItem[] = [
    {
      id: 'INPUT',
      label: 'Input DFA',
      sublabel: 'Automaton definition',
      icon: <Terminal className="w-3.5 h-3.5" />,
    },
    {
      id: 'INITIAL_MARKING',
      label: 'Initial Marking',
      sublabel: 'Round 0: Final vs Non-Final',
      icon: <Disc3 className="w-3.5 h-3.5" />,
    },
    {
      id: 'ITERATION',
      label: 'Iteration',
      sublabel: 'Rounds 1..k: Symbol propagation',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      id: 'EQUIVALENCE',
      label: 'Equivalence Classes',
      sublabel: 'Partition Q / ≡',
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: 'MINIMIZED',
      label: 'Minimized DFA',
      sublabel: 'Contracted minimal M\'',
      icon: <Table className="w-3.5 h-3.5" />,
    },
  ];

  const stageOrder: AlgorithmStage[] = [
    'INPUT',
    'INITIAL_MARKING',
    'ITERATION',
    'EQUIVALENCE',
    'MINIMIZED',
  ];

  const currentIdx = stageOrder.indexOf(currentStage);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Minimization Pipeline Progress
        </span>
        <span className="text-xs font-mono text-blue-400 font-medium">
          Phase {Math.max(1, currentIdx + 1)} of 5: {stages[currentIdx]?.label || 'Execution'}
        </span>
      </div>

      {/* Responsive pipeline steps */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
        {stages.map((stage, idx) => {
          const isPassed = currentIdx > idx;
          const isCurrent = currentIdx === idx;

          return (
            <div
              key={stage.id}
              onClick={() => onSelectStage && onSelectStage(stage.id)}
              className={`p-3 rounded-xl border transition-all select-none ${
                isCurrent
                  ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/50'
                  : isPassed
                  ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-300/80'
                  : 'bg-slate-950/50 border-slate-800/80 opacity-60 text-slate-400'
              } ${onSelectStage ? 'cursor-pointer hover:border-slate-600' : ''}`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isPassed
                      ? 'bg-emerald-600/30 text-emerald-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                </div>

                <span className="text-[10px] font-mono text-slate-500">
                  {idx < 4 ? '↓' : '✓'}
                </span>
              </div>

              <p
                className={`text-xs font-bold truncate ${
                  isCurrent
                    ? 'text-white'
                    : isPassed
                    ? 'text-emerald-300'
                    : 'text-slate-400'
                }`}
              >
                {stage.label}
              </p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                {stage.sublabel}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
