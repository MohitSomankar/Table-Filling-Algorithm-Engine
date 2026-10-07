import React, { useState } from 'react';
import { AlgorithmStep, TableCellState } from '../types/dfa';
import { Info, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

interface TableGridProps {
  reachableStates: string[];
  step: AlgorithmStep;
  isComplete: boolean;
}

export const TableGrid: React.FC<TableGridProps> = ({
  reachableStates,
  step,
  isComplete,
}) => {
  const [selectedCell, setSelectedCell] = useState<{
    stateA: string;
    stateB: string;
    cellData: TableCellState;
  } | null>(null);

  if (reachableStates.length < 2) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
        Need at least 2 reachable states to construct the Table-Filling grid.
      </div>
    );
  }

  // Row states: index 1 to n-1
  const rowStates = reachableStates.slice(1);
  // Column states: index 0 to n-2
  const colStates = reachableStates.slice(0, reachableStates.length - 1);

  const newlyMarkedSet = new Set(
    step.newlyMarkedPairs.map(([a, b]) => `${a},${b}`)
  );

  return (
    <div id="table-grid" className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 lg:p-6 shadow-xl space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">
                Myhill-Nerode Table-Filling Grid
              </h3>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/70 px-2 py-0.5 rounded">
                Lower Triangular Table
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Click any cell to inspect why the state pair is distinguishable or equivalent.
            </p>
          </div>

          {/* Quick Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-rose-950/70 border border-rose-800/60 flex items-center justify-center text-rose-400 font-mono font-bold text-[11px]">
                ✕₀
              </span>
              <span>0-Equiv (Final vs Non-Final)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-amber-950/70 border border-amber-800/60 flex items-center justify-center text-amber-400 font-mono font-bold text-[11px]">
                ✕ₖ
              </span>
              <span>k-Equiv (Symbol Propagated)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-mono font-bold text-[11px]">
                ≡
              </span>
              <span>Equivalent (Merged)</span>
            </div>
          </div>
        </div>

        {/* Lower Triangular Grid Table */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-block min-w-full">
            <table className="border-collapse select-none">
              <thead>
                <tr>
                  {/* Empty top-left cell */}
                  <th className="w-12 h-10 p-2 text-slate-600 font-mono text-xs text-center border-b border-r border-slate-800">
                    q_i \ q_j
                  </th>
                  {colStates.map((col) => (
                    <th
                      key={col}
                      className="w-16 h-10 p-2 font-mono font-bold text-xs text-blue-400 text-center border-b border-slate-800/80 bg-slate-950/60"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowStates.map((rowState, rowIdx) => {
                  const actualRowIndex = rowIdx + 1; // index in reachableStates
                  return (
                    <tr key={rowState}>
                      {/* Row Header */}
                      <th className="w-12 h-14 p-2 font-mono font-bold text-xs text-blue-400 text-center border-r border-slate-800/80 bg-slate-950/60">
                        {rowState}
                      </th>

                      {/* Cells */}
                      {colStates.map((colState, colIdx) => {
                        // Only display lower-triangular cells (where actualRowIndex > colIdx)
                        if (actualRowIndex <= colIdx) {
                          return (
                            <td
                              key={colState}
                              className="w-16 h-14 bg-slate-950/30 border border-slate-900/60"
                            />
                          );
                        }

                        const cellKey = `${rowState},${colState}`;
                        const cellData = step.tableSnapshot[cellKey] || {
                          stateA: rowState,
                          stateB: colState,
                          marked: false,
                        };

                        const isNewlyMarked = newlyMarkedSet.has(cellKey);
                        const isSelected =
                          selectedCell?.stateA === rowState && selectedCell?.stateB === colState;

                        return (
                          <td
                            key={colState}
                            onClick={() =>
                              setSelectedCell({
                                stateA: rowState,
                                stateB: colState,
                                cellData,
                              })
                            }
                            className={`w-16 h-14 border border-slate-800/80 text-center transition-all cursor-pointer relative ${
                              isSelected
                                ? 'ring-2 ring-blue-400 z-10'
                                : 'hover:border-slate-600'
                            } ${
                              isNewlyMarked
                                ? 'bg-amber-500/20 animate-pulse'
                                : cellData.marked
                                ? cellData.roundMarked === 0
                                  ? 'bg-rose-950/30 hover:bg-rose-900/40'
                                  : 'bg-amber-950/30 hover:bg-amber-900/40'
                                : isComplete
                                ? 'bg-emerald-950/40 hover:bg-emerald-900/50'
                                : 'bg-slate-950/50 hover:bg-slate-900/60'
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center h-full">
                              {cellData.marked ? (
                                <div className="flex items-center gap-0.5">
                                  <span
                                    className={`font-mono font-extrabold text-sm ${
                                      cellData.roundMarked === 0 ? 'text-rose-400' : 'text-amber-400'
                                    }`}
                                  >
                                    ✕
                                  </span>
                                  <span
                                    className={`text-[10px] font-mono font-semibold ${
                                      cellData.roundMarked === 0 ? 'text-rose-400/80' : 'text-amber-400/80'
                                    }`}
                                  >
                                    {cellData.roundMarked ?? 0}
                                  </span>
                                </div>
                              ) : isComplete ? (
                                <span className="text-emerald-400 font-mono font-bold text-base">
                                  ≡
                                </span>
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
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

        {/* Selected Cell Inspector Popover / Card */}
        {selectedCell && (
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-700 shadow-xl space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-semibold text-white">
                  Inspecting State Pair: <span className="font-mono text-blue-400">({selectedCell.stateA}, {selectedCell.stateB})</span>
                </h4>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Classification:</span>
                {selectedCell.cellData.marked ? (
                  <span className="flex items-center gap-1 font-semibold text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800/40">
                    <X className="w-3 h-3" />
                    <span>Distinguishable (Not Equivalent)</span>
                  </span>
                ) : isComplete ? (
                  <span className="flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                    <Check className="w-3 h-3" />
                    <span>Equivalent ({selectedCell.stateA} ≡ {selectedCell.stateB})</span>
                  </span>
                ) : (
                  <span className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                    Currently Unmarked (Candidate Equivalent)
                  </span>
                )}
              </div>

              {selectedCell.cellData.marked && selectedCell.cellData.reason && (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>
                      Distinguished in <strong>Round {selectedCell.cellData.reason.round}</strong>
                    </span>
                    <span className="font-mono text-amber-300">
                      Distinguishing string: <code className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{selectedCell.cellData.reason.distinguishingString}</code>
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    {selectedCell.cellData.reason.description}
                  </p>
                </div>
              )}

              {!selectedCell.cellData.marked && isComplete && (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <p className="text-emerald-300 font-semibold">
                    States {selectedCell.stateA} and {selectedCell.stateB} belong to the same equivalence class!
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    By Myhill-Nerode theorem, for all strings w ∈ Σ*, δ*({selectedCell.stateA}, w) ∈ F ⇔ δ*({selectedCell.stateB}, w) ∈ F. They can be unified into a single state in the minimal DFA.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
