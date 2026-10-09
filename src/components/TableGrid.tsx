import React, { useState, useEffect } from 'react';
import { AlgorithmStep, TableCellState, DFA } from '../types/dfa';
import { getPairKey, getCanonicalPair } from '../utils/tableFillingEngine';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Check,
  X,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Eye,
  Layers,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';

interface TableGridProps {
  dfa: DFA;
  reachableStates: string[];
  steps: AlgorithmStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  isComplete: boolean;
}

export const TableGrid: React.FC<TableGridProps> = ({
  dfa,
  reachableStates,
  steps,
  currentStepIndex,
  onStepChange,
  isComplete,
}) => {
  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [tableOrientation, setTableOrientation] = useState<'upper' | 'lower'>('upper');

  // Currently focused pair for inspection
  const [activePairKey, setActivePairKey] = useState<string | null>(null);
  const [subPairIndex, setSubPairIndex] = useState<number>(0);

  const speedMs = speed === 'slow' ? 1800 : speed === 'normal' ? 1000 : 450;
  const totalSteps = steps.length;
  const currentStep = steps[currentStepIndex] || steps[0];

  // Auto-select first newly marked pair when step changes
  useEffect(() => {
    if (currentStep.newlyMarkedPairs && currentStep.newlyMarkedPairs.length > 0) {
      const [firstA, firstB] = currentStep.newlyMarkedPairs[0];
      setActivePairKey(getPairKey(firstA, firstB, reachableStates));
      setSubPairIndex(0);
    } else if (currentStep.unmarkedPairs && currentStep.unmarkedPairs.length > 0) {
      const [firstA, firstB] = currentStep.unmarkedPairs[0];
      setActivePairKey(getPairKey(firstA, firstB, reachableStates));
      setSubPairIndex(0);
    }
  }, [currentStepIndex, currentStep, reachableStates]);

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      if (currentStepIndex >= totalSteps - 1) {
        setIsPlaying(false);
      } else {
        timer = setTimeout(() => {
          onStepChange(currentStepIndex + 1);
        }, speedMs);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStepIndex, totalSteps, speedMs, onStepChange]);

  const handleTogglePlay = () => {
    if (currentStepIndex >= totalSteps - 1) {
      onStepChange(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    setIsPlaying(false);
    onStepChange(0);
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (currentStepIndex < totalSteps - 1) {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
  };

  if (reachableStates.length < 2) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
        Need at least 2 reachable states to construct the Table-Filling grid.
      </div>
    );
  }

  // Active cell data from the current step snapshot
  const activeCellState: TableCellState | null = activePairKey
    ? currentStep.tableSnapshot[activePairKey] || null
    : null;

  // Destination pair (if distinguished in round >= 1)
  const targetPair = activeCellState?.reason?.targetPair;
  const targetPairKey = targetPair ? getPairKey(targetPair[0], targetPair[1], reachableStates) : null;

  // Upper Triangular Matrix setup:
  // Rows: q0 to q_{n-2}
  // Columns: q1 to q_{n-1}
  const upperRowStates = reachableStates.slice(0, reachableStates.length - 1);
  const upperColStates = reachableStates.slice(1);

  // Lower Triangular Matrix setup:
  // Rows: q1 to q_{n-1}
  // Columns: q0 to q_{n-2}
  const lowerRowStates = reachableStates.slice(1);
  const lowerColStates = reachableStates.slice(0, reachableStates.length - 1);

  // Helper to cycle through newly marked pairs in this step
  const handleNextSubPair = () => {
    if (!currentStep.newlyMarkedPairs || currentStep.newlyMarkedPairs.length === 0) return;
    const nextIdx = (subPairIndex + 1) % currentStep.newlyMarkedPairs.length;
    setSubPairIndex(nextIdx);
    const [a, b] = currentStep.newlyMarkedPairs[nextIdx];
    setActivePairKey(getPairKey(a, b, reachableStates));
  };

  const handlePrevSubPair = () => {
    if (!currentStep.newlyMarkedPairs || currentStep.newlyMarkedPairs.length === 0) return;
    const prevIdx =
      (subPairIndex - 1 + currentStep.newlyMarkedPairs.length) % currentStep.newlyMarkedPairs.length;
    setSubPairIndex(prevIdx);
    const [a, b] = currentStep.newlyMarkedPairs[prevIdx];
    setActivePairKey(getPairKey(a, b, reachableStates));
  };

  return (
    <div id="table-grid" className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 lg:p-7 shadow-2xl space-y-6">
        {/* Header & Controls Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                MN
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Triangular State-Pair Table (Myhill–Nerode Engine)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Every unique unordered state pair appears exactly once. Click any cell to trace its distinction reason.
            </p>
          </div>

          {/* Matrix view toggle */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <span className="text-xs text-slate-400 font-medium">Layout:</span>
            <div className="p-0.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-0.5 text-xs">
              <button
                onClick={() => setTableOrientation('upper')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  tableOrientation === 'upper'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Upper-Triangular
              </button>
              <button
                onClick={() => setTableOrientation('lower')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  tableOrientation === 'lower'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Lower-Triangular
              </button>
            </div>
          </div>
        </div>

        {/* ALGORITHM ROUNDS INDICATOR BANNER */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-3">
            <div
              className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs shrink-0 ${
                currentStep.round === -1
                  ? 'bg-slate-800 text-slate-300'
                  : currentStep.round === 0
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : isComplete
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {currentStep.round === -1
                ? 'INITIALIZATION'
                : currentStep.round === 0
                ? 'ROUND 0'
                : isComplete
                ? 'FINAL'
                : `ROUND ${currentStep.round}`}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">
                {currentStep.round === 0
                  ? 'ROUND 0: Initial Final / Non-Final Marking'
                  : isComplete
                  ? 'FINAL: Fixed Point (No More Pairs Can Be Marked)'
                  : currentStep.title}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Sub-pair stepper when multiple pairs marked in this step */}
          {currentStep.newlyMarkedPairs.length > 1 && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl shrink-0">
              <span className="text-[11px] text-slate-400">
                Marked Pair {subPairIndex + 1} of {currentStep.newlyMarkedPairs.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevSubPair}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Previous marked pair in this round"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextSubPair}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Next marked pair in this round"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* STEP CONTROLS & SPEED CONTROLLER */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          {/* Main Execution Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition active:scale-95"
              title="Restart from beginning"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>

            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl border border-slate-700 transition active:scale-95"
              title="Previous Step"
            >
              <SkipBack className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </button>

            <button
              onClick={handleTogglePlay}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/30 transition active:scale-95"
              title={isPlaying ? 'Pause execution' : 'Run automatically'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Automatically</span>
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIndex === totalSteps - 1}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl border border-slate-700 transition active:scale-95"
              title="Next Step"
            >
              <span>Next Step</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed Controls: Slow / Normal / Fast */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Speed:</span>
            <div className="p-0.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-1 font-mono text-[11px]">
              <button
                onClick={() => setSpeed('slow')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  speed === 'slow'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Slow
              </button>
              <button
                onClick={() => setSpeed('normal')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  speed === 'normal'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setSpeed('fast')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  speed === 'fast'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Fast
              </button>
            </div>
          </div>
        </div>

        {/* VISUAL STATE LEGEND BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
          <span className="font-semibold text-slate-400">Visual States:</span>
          <div className="flex flex-wrap items-center gap-4">
            {/* Unprocessed */}
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-slate-400">
                ?
              </span>
              <div>
                <span className="font-semibold text-slate-300">Unprocessed</span>
                <span className="text-[10px] text-slate-500 ml-1.5">(Candidate pair)</span>
              </div>
            </div>

            {/* Distinguishable */}
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-rose-950 border border-rose-800 flex items-center justify-center font-mono font-bold text-xs text-rose-400">
                ✕
              </span>
              <div>
                <span className="font-semibold text-rose-300">Distinguishable</span>
                <span className="text-[10px] text-rose-400/80 ml-1.5">(Marked with round subscript)</span>
              </div>
            </div>

            {/* Equivalent */}
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
                ≡
              </span>
              <div>
                <span className="font-semibold text-emerald-300">Equivalent</span>
                <span className="text-[10px] text-emerald-400/80 ml-1.5">(Unmarked at fixed point)</span>
              </div>
            </div>
          </div>
        </div>

        {/* TRIANGULAR STATE-PAIR MATRIX */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-block min-w-full">
            <table className="border-collapse select-none mx-auto">
              <thead>
                <tr>
                  <th className="w-14 h-12 p-2 text-slate-600 font-mono text-xs text-center border-b border-r border-slate-800">
                    q_i \ q_j
                  </th>
                  {(tableOrientation === 'upper' ? upperColStates : lowerColStates).map((col) => (
                    <th
                      key={col}
                      className="w-20 h-12 p-2 font-mono font-bold text-xs text-blue-400 text-center border-b border-slate-800 bg-slate-950/80"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(tableOrientation === 'upper' ? upperRowStates : lowerRowStates).map((rowState, rIdx) => {
                  const actualRowIdx = reachableStates.indexOf(rowState);

                  return (
                    <tr key={rowState}>
                      {/* Row Header */}
                      <th className="w-14 h-16 p-2 font-mono font-bold text-xs text-blue-400 text-center border-r border-slate-800 bg-slate-950/80">
                        {rowState}
                      </th>

                      {/* Cells */}
                      {(tableOrientation === 'upper' ? upperColStates : lowerColStates).map((colState, cIdx) => {
                        const actualColIdx = reachableStates.indexOf(colState);

                        // UPPER TRIANGULAR LOGIC
                        if (tableOrientation === 'upper') {
                          // Diagonal: identity pair (q_i, q_i)
                          if (actualRowIdx === actualColIdx) {
                            return (
                              <td
                                key={colState}
                                className="w-20 h-16 bg-slate-950/90 border border-slate-900 text-center text-slate-600 font-mono text-sm"
                                title={`Identity pair (${rowState}, ${colState})`}
                              >
                                —
                              </td>
                            );
                          }

                          // Below diagonal in upper-triangular: omitted
                          if (actualRowIdx > actualColIdx) {
                            return (
                              <td
                                key={colState}
                                className="w-20 h-16 bg-slate-950/20 border border-slate-950"
                              />
                            );
                          }
                        } else {
                          // LOWER TRIANGULAR LOGIC
                          // Above diagonal in lower-triangular: omitted
                          if (actualRowIdx <= actualColIdx) {
                            return (
                              <td
                                key={colState}
                                className="w-20 h-16 bg-slate-950/20 border border-slate-950"
                              />
                            );
                          }
                        }

                        // Active Unordered Pair
                        const canonicalPair = getCanonicalPair(rowState, colState, reachableStates);
                        const cellKey = `${canonicalPair[0]},${canonicalPair[1]}`;
                        const cellData = currentStep.tableSnapshot[cellKey] || {
                          stateA: canonicalPair[0],
                          stateB: canonicalPair[1],
                          marked: false,
                        };

                        const isCurrentlyFocused = activePairKey === cellKey;
                        const isDestinationTarget = targetPairKey === cellKey;
                        const isMarkedInThisStep = currentStep.newlyMarkedPairs.some(
                          ([a, b]) => getPairKey(a, b, reachableStates) === cellKey
                        );

                        return (
                          <td
                            key={colState}
                            onClick={() => setActivePairKey(cellKey)}
                            className={`w-20 h-16 border border-slate-800 text-center transition-all cursor-pointer relative ${
                              isCurrentlyFocused
                                ? 'ring-4 ring-blue-500 ring-offset-2 ring-offset-slate-950 z-20 shadow-lg shadow-blue-500/20'
                                : isDestinationTarget
                                ? 'ring-3 ring-amber-400 ring-dashed z-10 animate-pulse'
                                : 'hover:border-slate-600'
                            } ${
                              isMarkedInThisStep
                                ? 'bg-amber-500/20'
                                : cellData.marked
                                ? cellData.roundMarked === 0
                                  ? 'bg-rose-950/40 hover:bg-rose-900/40'
                                  : 'bg-amber-950/40 hover:bg-amber-900/40'
                                : isComplete
                                ? 'bg-emerald-950/40 hover:bg-emerald-900/40'
                                : 'bg-slate-950/60 hover:bg-slate-900/60'
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center h-full p-1">
                              {/* Pair mini-tag */}
                              <span className="text-[9px] font-mono text-slate-500 block mb-0.5">
                                ({rowState},{colState})
                              </span>

                              {cellData.marked ? (
                                <div className="flex items-center gap-0.5">
                                  <span
                                    className={`font-mono font-extrabold text-base ${
                                      cellData.roundMarked === 0 ? 'text-rose-400' : 'text-amber-400'
                                    }`}
                                  >
                                    ✕
                                  </span>
                                  <span
                                    className={`text-[10px] font-mono font-bold ${
                                      cellData.roundMarked === 0
                                        ? 'text-rose-400/90'
                                        : 'text-amber-400/90'
                                    }`}
                                  >
                                    {cellData.roundMarked ?? 0}
                                  </span>
                                </div>
                              ) : isComplete ? (
                                <div className="flex items-center gap-1 text-emerald-400">
                                  <span className="font-mono font-bold text-base">≡</span>
                                  <span className="text-[9px] font-bold uppercase tracking-wider">
                                    Equiv
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-slate-400">
                                  <span className="font-mono font-bold text-sm">?</span>
                                  <span className="text-[9px] text-slate-500">Unproc</span>
                                </div>
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
        </div>

        {/* DETAIL PANEL FOR FOCUSED PAIR */}
        {activeCellState && (() => {
          const stateA = activeCellState.stateA;
          const stateB = activeCellState.stateB;
          const isMarked = activeCellState.marked;
          const reason = activeCellState.reason;

          return (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-700 shadow-2xl space-y-5 animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      State Pair Detail Inspector
                    </h4>
                    <p className="text-base font-bold text-white font-mono">
                      PAIR ({stateA}, {stateB})
                    </p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">STATUS:</span>
                  {isMarked ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs bg-rose-950 text-rose-300 border border-rose-800">
                      <X className="w-3.5 h-3.5 text-rose-400" />
                      <span>Distinguishable (Marked in Round {reason?.round})</span>
                    </span>
                  ) : isComplete ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs bg-emerald-950 text-emerald-300 border border-emerald-800">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Equivalent ({stateA} ≡ {stateB})</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs bg-slate-800 text-slate-300 border border-slate-700">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Unprocessed (Candidate Pair)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Step-by-Step Reason Section */}
              <div className="space-y-4 text-xs">
                {isMarked && reason ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-slate-400">
                        REASON & WITNESS DERIVATION:
                      </span>
                      {reason.distinguishingString && (
                        <span className="text-xs font-mono text-amber-300">
                          Shortest Witness String:{' '}
                          <code className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-bold">
                            {reason.distinguishingString === 'ε' ? 'ε (empty string)' : `"${reason.distinguishingString}"`}
                          </code>
                        </span>
                      )}
                    </div>

                    {reason.round === 0 ? (
                      /* Round 0 Explanation */
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                            On empty string ε:
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed font-sans text-xs">
                          {dfa.finalStates.includes(stateA) ? (
                            <>
                              State <strong className="text-emerald-400 font-mono">{stateA}</strong> ∈ F (accepting), while state <strong className="text-slate-300 font-mono">{stateB}</strong> ∉ F (rejecting).
                            </>
                          ) : (
                            <>
                              State <strong className="text-emerald-400 font-mono">{stateB}</strong> ∈ F (accepting), while state <strong className="text-slate-300 font-mono">{stateA}</strong> ∉ F (rejecting).
                            </>
                          )}
                        </p>
                        <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-800/80">
                          Therefore, pair <span className="font-mono font-bold text-white">({stateA}, {stateB})</span> is distinguishable by string <span className="font-mono text-amber-300">ε</span> at Round 0.
                        </p>
                      </div>
                    ) : (
                      /* Round >= 1 Iterative Propagation Explanation */
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-slate-400 font-medium">On symbol:</span>
                          <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-mono font-bold">
                            '{reason.symbol}'
                          </span>
                        </div>

                        {/* Transition highlights */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400">δ({stateA}, '{reason.symbol}')</span>
                            <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                            <span className="font-bold text-white">{reason.targetNextA}</span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400">δ({stateB}, '{reason.symbol}')</span>
                            <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                            <span className="font-bold text-white">{reason.targetNextB}</span>
                          </div>
                        </div>

                        {/* Destination pair highlight */}
                        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-slate-300 font-sans">
                              Destination Pair in Table:{' '}
                              <strong className="text-amber-300 font-mono">
                                ({reason.targetPair?.[0]}, {reason.targetPair?.[1]})
                              </strong>
                            </span>
                          </div>
                          <span className="text-amber-400 text-[11px] font-sans font-medium">
                            Already marked distinguishable in a previous round
                          </span>
                        </div>

                        <p className="text-slate-300 leading-relaxed font-sans pt-1">
                          Since <span className="font-mono font-bold text-white">({reason.targetPair?.[0]}, {reason.targetPair?.[1]})</span> is already distinguishable, transitions on symbol <span className="font-mono text-blue-400 font-bold">'{reason.symbol}'</span> guarantee that <span className="font-mono font-bold text-white">({stateA}, {stateB})</span> is also distinguishable!
                        </p>
                      </div>
                    )}
                  </div>
                ) : isComplete ? (
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 space-y-2">
                    <p className="text-emerald-300 font-bold">
                      States {stateA} and {stateB} are proven EQUIVALENT (Indistinguishable).
                    </p>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      The Table-Filling algorithm reached a fixed point without marking ({stateA}, {stateB}). By the Myhill–Nerode theorem, for all strings w ∈ Σ*, δ*({stateA}, w) leads to an accepting state if and only if δ*({stateB}, w) leads to an accepting state.
                    </p>
                    <p className="text-emerald-400 text-[11px] font-mono pt-1">
                      {stateA} ≡ {stateB} · Unified into the same equivalence class in M'.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-slate-300">
                    <p className="font-semibold text-slate-200">
                      Candidate Pair: ({stateA}, {stateB})
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      This pair has not yet been distinguished as of Step {currentStep.round >= 0 ? `Round ${currentStep.round}` : '0'}. Subsequent rounds will test transitions on all input symbols Σ.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
