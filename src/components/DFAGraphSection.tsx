import React, { useState, useMemo } from 'react';
import { DFA, MinimizedDFA } from '../types/dfa';
import { DFAGraphCanvas, GraphNode, GraphEdge } from './DFAGraphCanvas';
import { GitCompare, LayoutGrid, Square, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface DFAGraphSectionProps {
  originalDFA: DFA;
  minimizedDFA: MinimizedDFA;
}

type ViewMode = 'side-by-side' | 'original' | 'minimized';

export const DFAGraphSection: React.FC<DFAGraphSectionProps> = ({
  originalDFA,
  minimizedDFA,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');

  // Convert Original DFA to Graph Nodes & Combined Edges
  const originalGraphData = useMemo(() => {
    const nodes: GraphNode[] = originalDFA.states.map((st) => ({
      id: st,
      label: st,
      isStart: st === originalDFA.startState,
      isFinal: originalDFA.finalStates.includes(st),
    }));

    // Group transitions by from->to to combine symbols: e.g. "0, 1"
    const edgeMap = new Map<string, { from: string; to: string; labels: string[] }>();

    for (const fromState of originalDFA.states) {
      const stateTrans = originalDFA.transitions[fromState] || {};
      for (const symbol of originalDFA.alphabet) {
        const toState = stateTrans[symbol];
        if (toState) {
          const key = `${fromState}->${toState}`;
          if (!edgeMap.has(key)) {
            edgeMap.set(key, { from: fromState, to: toState, labels: [] });
          }
          if (!edgeMap.get(key)!.labels.includes(symbol)) {
            edgeMap.get(key)!.labels.push(symbol);
          }
        }
      }
    }

    const edges: GraphEdge[] = Array.from(edgeMap.values());
    return { nodes, edges };
  }, [originalDFA]);

  // Convert Minimized DFA to Graph Nodes & Combined Edges
  const minimizedGraphData = useMemo(() => {
    // Each equivalence class is one minimized state
    const nodes: GraphNode[] = minimizedDFA.classes.map((cls) => {
      // Sublabel format: [q0] or [q1, q2]
      const memberStr = cls.states.join(', ');
      return {
        id: cls.label,
        label: cls.label,
        sublabel: `[${memberStr}]`,
        isStart: cls.isStart,
        isFinal: cls.isFinal,
      };
    });

    // Group transitions by fromClassLabel -> toClassLabel to combine symbols: e.g. "a, b"
    const edgeMap = new Map<string, { from: string; to: string; labels: string[] }>();

    for (const cls of minimizedDFA.classes) {
      const fromLabel = cls.label;
      const classTrans = minimizedDFA.labelTransitions[fromLabel] || {};

      for (const symbol of originalDFA.alphabet) {
        const toLabel = classTrans[symbol];
        if (toLabel) {
          const key = `${fromLabel}->${toLabel}`;
          if (!edgeMap.has(key)) {
            edgeMap.set(key, { from: fromLabel, to: toLabel, labels: [] });
          }
          if (!edgeMap.get(key)!.labels.includes(symbol)) {
            edgeMap.get(key)!.labels.push(symbol);
          }
        }
      }
    }

    const edges: GraphEdge[] = Array.from(edgeMap.values());
    return { nodes, edges };
  }, [minimizedDFA, originalDFA.alphabet]);

  return (
    <section id="dfa-graphs" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 md:p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              DFA State Transition Graphs
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950 border border-cyan-800/60 text-cyan-300">
              Interactive Diagrams
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Side-by-side transition graphs comparing the original automaton against the canonical minimal automaton. 
            Equivalent states are merged into unified partition nodes with combined transition symbols.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'side-by-side'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare Both</span>
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'original'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>Original DFA</span>
          </button>
          <button
            onClick={() => setViewMode('minimized')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'minimized'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Minimized DFA</span>
          </button>
        </div>
      </div>

      {/* Quick Comparison Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/40 border border-slate-800/70 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Original Automaton</div>
          <div className="text-lg font-bold text-white font-mono mt-0.5">
            {originalDFA.states.length} <span className="text-xs text-slate-400 font-normal">states</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {originalGraphData.edges.length} transition edges
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/70 rounded-xl p-3">
          <div className="text-[11px] text-emerald-400 font-medium">Minimized Automaton</div>
          <div className="text-lg font-bold text-emerald-300 font-mono mt-0.5">
            {minimizedDFA.minimizedStateCount} <span className="text-xs text-emerald-500/80 font-normal">classes</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {minimizedGraphData.edges.length} transition edges
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/70 rounded-xl p-3">
          <div className="text-[11px] text-cyan-400 font-medium">Redundant States Removed</div>
          <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">
            -{minimizedDFA.statesRemoved} <span className="text-xs text-cyan-500/80 font-normal">states</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {minimizedDFA.reductionPercentage}% state compression
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/70 rounded-xl p-3">
          <div className="text-[11px] text-purple-400 font-medium">Equivalence Theorem</div>
          <div className="text-xs font-semibold text-purple-300 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>Myhill–Nerode Minimal</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Exact canonical representation
          </div>
        </div>
      </div>

      {/* Graph Visualizers based on ViewMode */}
      {viewMode === 'side-by-side' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DFAGraphCanvas
            title="Original DFA Graph"
            subtitle={`${originalDFA.states.length} states · Start: ${originalDFA.startState}`}
            badge="Original"
            nodes={originalGraphData.nodes}
            edges={originalGraphData.edges}
            height={460}
          />
          <DFAGraphCanvas
            title="Minimized DFA Graph"
            subtitle={`${minimizedDFA.minimizedStateCount} equivalence classes · Minimal representation`}
            badge="Minimal"
            nodes={minimizedGraphData.nodes}
            edges={minimizedGraphData.edges}
            height={460}
          />
        </div>
      )}

      {viewMode === 'original' && (
        <DFAGraphCanvas
          title="Original DFA Graph (Full View)"
          subtitle={`States: ${originalDFA.states.join(', ')} · Alphabet: Σ = {${originalDFA.alphabet.join(', ')}}`}
          badge="Original"
          nodes={originalGraphData.nodes}
          edges={originalGraphData.edges}
          height={520}
        />
      )}

      {viewMode === 'minimized' && (
        <DFAGraphCanvas
          title="Minimized DFA Graph (Full View)"
          subtitle={`Partitions: ${minimizedDFA.classes.map((c) => `${c.label}=[${c.states.join(',')}]`).join(' · ')}`}
          badge="Minimal"
          nodes={minimizedGraphData.nodes}
          edges={minimizedGraphData.edges}
          height={520}
        />
      )}

      {/* Educational Note */}
      <div className="p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-xl flex items-start gap-2.5 text-xs text-slate-400">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-200 font-semibold">Viva / Exam Tip: </span>
          Unmarked state pairs in the table-filling algorithm are mutually equivalent under the Myhill-Nerode relation (
          <span className="font-mono text-cyan-300">p ≡ q</span>
          ). Each connected component in the equivalence partition merges into exactly one state in the minimized DFA (
          e.g. <span className="font-mono text-emerald-300">B = [q1, q2]</span>
          ), producing an automaton that accepts the exact same formal language with the minimal possible number of states.
        </div>
      </div>
    </section>
  );
};
