import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  CheckCircle2,
  HelpCircle,
  Code2,
  Clock,
  Compass,
  Lightbulb,
  ArrowRight,
  Split,
  GitMerge,
  Table,
  Check,
  Zap,
} from 'lucide-react';

export const TheorySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'steps' | 'viva'>('concepts');
  const [openVivaIndex, setOpenVivaIndex] = useState<number | null>(0);

  // 8 Core Concepts
  const coreConcepts = [
    {
      id: 'dfa',
      num: '01',
      title: 'Deterministic Finite Automaton (DFA)',
      badge: '5-Tuple Machine',
      summary: 'A state machine that processes an input string symbol-by-symbol with no ambiguity.',
      explanation:
        'A DFA is formally defined as M = (Q, Σ, δ, q0, F). For every current state and every input symbol, there is exactly one deterministic transition to a next state. It contains no ε-moves and no branching choices.',
      studentTakeaway:
        'Think of a DFA like a strict turnstile: insert a coin, it unlocks; push, it locks. There is never any guessing what happens next.',
      formula: 'δ: Q × Σ → Q',
    },
    {
      id: 'minimization',
      num: '02',
      title: 'DFA Minimization',
      badge: 'Optimization',
      summary: 'Reducing a DFA to the smallest number of states that accepts the identical language.',
      explanation:
        'Many constructed DFAs have duplicate, redundant, or unreachable states. Minimization eliminates unreachable states and collapses equivalent states into single composite states, producing the canonical minimal DFA.',
      studentTakeaway:
        'Less hardware, less memory, faster execution—while accepting the exact same set of strings.',
      formula: 'L(M_min) = L(M) with minimum |Q|',
    },
    {
      id: 'myhill-nerode',
      num: '03',
      title: 'Myhill–Nerode Theorem',
      badge: 'Foundational Theorem',
      summary: 'The mathematical proof that every regular language has a unique minimal DFA.',
      explanation:
        'The Myhill–Nerode theorem states that a language L is regular if and only if the number of equivalence classes of its indistinguishability relation (~L) is finite. The number of classes equals the exact number of states in the minimal DFA.',
      studentTakeaway:
        'This theorem proves that the minimal DFA is not just small—it is mathematically optimal and unique up to state renaming.',
      formula: '|Q_min| = Index of ~L',
    },
    {
      id: 'equivalent-states',
      num: '04',
      title: 'Equivalent States',
      badge: 'Indistinguishable',
      summary: 'Two states that behave identically on every possible input string.',
      explanation:
        'States p and q are equivalent (p ~ q) if for all strings w ∈ Σ*, both states either reach an accept state or both reach a reject state: δ̂(p, w) ∈ F ⟺ δ̂(q, w) ∈ F. No experiment can tell them apart.',
      studentTakeaway:
        'If you clone a computer into two states and feed them any program ever written, they will always give the same accept/reject result.',
      formula: '∀ w ∈ Σ*: δ̂(p, w) ∈ F ⟺ δ̂(q, w) ∈ F',
    },
    {
      id: 'distinguishable-states',
      num: '05',
      title: 'Distinguishable States',
      badge: 'Separable',
      summary: 'Two states that can be told apart by at least one distinguishing string.',
      explanation:
        'States p and q are distinguishable if there exists at least one string w ∈ Σ* such that one state accepts and the other rejects (δ̂(p, w) ∈ F and δ̂(q, w) ∉ F, or vice-versa). The string w is called the distinguishing string.',
      studentTakeaway:
        'If even a single string gives different results from states p and q, they cannot be merged—they must remain separate states.',
      formula: '∃ w ∈ Σ*: [δ̂(p, w) ∈ F] ⊕ [δ̂(q, w) ∈ F]',
    },
    {
      id: 'table-filling',
      num: '06',
      title: 'Table-Filling Algorithm',
      badge: 'Moore / Hopcroft',
      summary: 'An iterative matrix algorithm that marks all distinguishable state pairs.',
      explanation:
        'We construct a triangular table of all state pairs {p, q}. We first mark pairs that are obviously distinguishable by ε (final vs non-final). Then, we propagate marks: if a symbol transitions {p, q} into an already-marked pair, {p, q} is also marked.',
      studentTakeaway:
        'Start with obvious differences (Round 0). Then work backward symbol-by-symbol until no new differences can be found.',
      formula: '{p, q} marked if {δ(p, a), δ(q, a)} is marked',
    },
    {
      id: 'equivalence-classes',
      num: '07',
      title: 'Equivalence Classes',
      badge: 'Partition Q / ~',
      summary: 'Disjoint groups of mutually equivalent states that collapse together.',
      explanation:
        'Because equivalence (~) is reflexive, symmetric, and transitive, it partitions the reachable state set Q into disjoint equivalence classes [q]. All states in a class are indistinguishable from one another.',
      studentTakeaway:
        'If q1 ~ q2 and q2 ~ q3, they form a single class [q1, q2, q3]. All three will be fused into one state.',
      formula: '[p] = { q ∈ Q | p ~ q }',
    },
    {
      id: 'minimized-dfa',
      num: '08',
      title: 'Minimized DFA',
      badge: 'Quotient Automaton',
      summary: 'The final compact automaton whose states are the equivalence classes.',
      explanation:
        'The quotient DFA M\' = (Q\', Σ, δ\', [q0], F\') has states Q\' = Q / ~. Transitions are defined by δ\'([p], a) = [δ(p, a)]. It is guaranteed to be isomorphic to any other minimal DFA for the language.',
      studentTakeaway:
        'The final result: a clean, minimal machine with zero redundancy, ready for hardware circuits or compiler scanners.',
      formula: 'M\' = M / ~',
    },
  ];

  // 7-Step Algorithm Breakdown
  const algorithmSteps = [
    {
      step: 1,
      title: 'Generate All Unordered Pairs',
      badge: 'Grid Setup',
      desc: 'Create the lower-triangular table for all reachable state pairs {p, q} with p ≠ q.',
      details:
        'For a DFA with n reachable states, construct a matrix containing exactly n(n - 1) / 2 cells. Each cell corresponds to an unordered pair {p, q}. Prune any unreachable states before building this table.',
      tag: 'n(n - 1) / 2 Pairs',
    },
    {
      step: 2,
      title: 'Mark Final/Non-Final Pairs',
      badge: 'Base Case (ε)',
      desc: 'Mark with an ✗ every pair where one state is accepting and the other is non-accepting.',
      details:
        'If p ∈ F (final) and q ∉ F (non-final), mark {p, q}. These states are immediately distinguished by the empty string ε because δ̂(p, ε) = p ∈ F while δ̂(q, ε) = q ∉ F.',
      tag: 'Distinguished by ε',
    },
    {
      step: 3,
      title: 'Check Transitions for Every Unmarked Pair',
      badge: 'Symbol Scan',
      desc: 'For each remaining blank cell {p, q}, inspect its transitions on all alphabet symbols a ∈ Σ.',
      details:
        'For every symbol a in the alphabet Σ, compute the destination states δ(p, a) and δ(q, a) to find the resulting target pair {r, s} = {δ(p, a), δ(q, a)}.',
      tag: '∀ a ∈ Σ: examine {δ(p, a), δ(q, a)}',
    },
    {
      step: 4,
      title: 'Mark Pairs Whose Destination Pair is Already Distinguishable',
      badge: 'Propagation',
      desc: 'If the target pair {δ(p, a), δ(q, a)} is already marked, mark {p, q} with an ✗.',
      details:
        'If target pair {r, s} is distinguished by some string w, then {p, q} is distinguished by the string aw. Place an ✗ in cell {p, q} and record the symbol a and target pair.',
      tag: 'If target has ✗, mark {p, q}',
    },
    {
      step: 5,
      title: 'Repeat Until No New Pairs Are Marked',
      badge: 'Fixed-Point Iteration',
      desc: 'Perform consecutive passes over all unmarked pairs until a full pass makes zero new marks.',
      details:
        'Because each round may mark pairs that enable further propagation in subsequent rounds, loop Steps 3 and 4 until a pass completes with 0 new marks. The algorithm terminates in at most O(|Q|²) iterations.',
      tag: 'Convergence guaranteed',
    },
    {
      step: 6,
      title: 'Unmarked Pairs Are Equivalent',
      badge: 'Indistinguishability',
      desc: 'Any cells remaining blank at the end represent equivalent states: p ~ q.',
      details:
        'If a pair {p, q} cannot be distinguished after exhaustive propagation across all symbols, no string in Σ* can ever distinguish them. By Myhill–Nerode theorem, p ~ q.',
      tag: 'p ~ q (Indistinguishable)',
    },
    {
      step: 7,
      title: 'Merge Equivalent States',
      badge: 'Quotient Construction',
      desc: 'Group equivalent pairs into equivalence classes and construct the minimal DFA.',
      details:
        'Use union-find (transitivity) to form partition classes like [q1, q2]. Set [q0] as the new start state. Any class containing a final state becomes a final state. The resulting DFA has the minimum possible states.',
      tag: 'Canonical Minimal DFA',
    },
  ];

  // 9 Viva Quick Answers
  const vivaAnswers = [
    {
      q: 'What is Myhill–Nerode theorem?',
      a: 'The Myhill–Nerode theorem states that a language L is regular if and only if the number of equivalence classes of its indistinguishability relation (~L) is finite. Furthermore, the number of equivalence classes is exactly equal to the number of states in the minimal DFA accepting L.',
      key: 'Regularity test & minimal state count',
    },
    {
      q: 'What is a distinguishable pair?',
      a: 'A pair of states (p, q) is distinguishable if there exists at least one string w ∈ Σ* such that when both states read w, one state ends in an accepting state (F) and the other ends in a non-accepting state (Q - F). The string w is called the distinguishing string.',
      key: 'Separated by at least one string w',
    },
    {
      q: 'What is an equivalent pair?',
      a: 'An equivalent pair (p, q) consists of two states that cannot be distinguished by any string in Σ*. For every string w ∈ Σ*, both states either both accept or both reject (δ̂(p, w) ∈ F ⟺ δ̂(q, w) ∈ F). They exhibit identical external behavior.',
      key: 'Indistinguishable on all inputs',
    },
    {
      q: 'Why do we mark final/non-final pairs first?',
      a: 'Because they are trivially distinguishable by the empty string ε (length 0). A final state accepts ε immediately (δ̂(f, ε) = f ∈ F), while a non-final state rejects ε (δ̂(q, ε) = q ∉ F). This provides the base case for distinguishability.',
      key: 'Distinguished immediately by ε',
    },
    {
      q: 'Why do we repeat the table-filling process?',
      a: 'Because distinguishability propagates backward across input symbols. A pair (p, q) might not seem distinguishable initially, but once its destination pair (δ(p, a), δ(q, a)) is marked in round k, pair (p, q) becomes distinguishable in round k + 1. We must repeat until all ripple effects finish.',
      key: 'Propagate distinguishability until fixpoint',
    },
    {
      q: 'What happens to unmarked pairs?',
      a: 'Unmarked pairs at the end of the algorithm are proven to be equivalent under the Myhill–Nerode relation. They can never be separated by any input string and are merged together into a single state in the minimal DFA.',
      key: 'Merged into equivalence classes',
    },
    {
      q: 'Why are equivalent states merged?',
      a: 'Because having multiple states that produce the exact same transitions and accept/reject outcomes on all strings is redundant. Merging them reduces state count, memory consumption, and circuit complexity without altering the accepted language.',
      key: 'Eliminate redundancy without altering language',
    },
    {
      q: 'What is the purpose of DFA minimization?',
      a: 'To produce the unique canonical DFA with the smallest possible number of states. This optimizes lexical analyzers in compilers, saves hardware gates in digital circuits, and makes formal language analysis simpler and faster.',
      key: 'Optimal size, unique canonical automaton',
    },
    {
      q: 'What is the time complexity?',
      a: 'The Table-Filling algorithm runs in O(|Σ| · |Q|²) time. There are O(|Q|²) pairs in the table, each round checks |Σ| alphabet transitions, and at most O(|Q|²) rounds can mark new pairs before terminating. Space complexity is O(|Q|²) for the triangular table.',
      key: 'Time: O(|Σ| · |Q|²), Space: O(|Q|²)',
    },
  ];

  return (
    <section id="learn-theory" className="space-y-6 pt-4 scroll-mt-20">
      {/* Header card with academic badges */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Title bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shadow-md shadow-blue-500/10">
                <GraduationCap className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    Learn & Theory Reference
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/50 text-blue-300 border border-blue-700/50">
                    B.Tech TOC / FLAT Guide
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Easy-to-understand, exam-ready explanations of DFA Minimization, Myhill–Nerode Theorem, and Table-Filling Algorithm.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-emerald-400">●</span>
              <span>Theory of Computation PBL</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('concepts')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'concepts'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>1. Core Concepts (8 Pillars)</span>
            </button>

            <button
              onClick={() => setActiveTab('steps')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'steps'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>2. Step-by-Step Algorithm (7 Steps)</span>
            </button>

            <button
              onClick={() => setActiveTab('viva')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'viva'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>3. Viva Quick Answers (9 Q&As)</span>
            </button>
          </div>

          {/* TAB 1: 8 Core Concepts */}
          {activeTab === 'concepts' && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>The 8 fundamental concepts of DFA state reduction explained clearly:</span>
                <span className="font-mono text-blue-400 font-semibold">Concepts 1 to 8</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coreConcepts.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 transition space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-950 text-blue-400 border border-blue-800/60 text-xs font-mono font-bold flex items-center justify-center">
                            {item.num}
                          </span>
                          <h3 className="text-sm font-bold text-white tracking-tight">
                            {item.title}
                          </h3>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                          {item.badge}
                        </span>
                      </div>

                      <p className="text-xs text-blue-300/90 font-medium">
                        {item.summary}
                      </p>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {item.explanation}
                      </p>

                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" />
                          <span>Student Takeaway:</span>
                        </span>
                        <p className="text-slate-400 leading-relaxed">
                          {item.studentTakeaway}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Formula:</span>
                      <span className="text-blue-400 font-semibold">{item.formula}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Step-by-Step Algorithm (7 Steps) */}
          {activeTab === 'steps' && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>The complete Table-Filling minimization procedure in 7 sequential steps:</span>
                <span className="font-mono text-blue-400 font-semibold">Steps 1 → 7</span>
              </div>

              <div className="space-y-3">
                {algorithmSteps.map((stepItem) => (
                  <div
                    key={stepItem.step}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-start gap-4"
                  >
                    {/* Step Number Badge */}
                    <div className="flex sm:flex-col items-center gap-2 sm:gap-1 shrink-0">
                      <span className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-mono font-extrabold text-base flex items-center justify-center shadow-md shadow-blue-500/10">
                        {stepItem.step}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold hidden sm:inline">
                        Step
                      </span>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                          <span>{stepItem.title}</span>
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-blue-300 border border-slate-700">
                          {stepItem.badge}
                        </span>
                      </div>

                      <p className="text-xs text-blue-300 font-medium">
                        {stepItem.desc}
                      </p>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {stepItem.details}
                      </p>

                      <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                        <span className="text-emerald-400">Rule:</span>
                        <span className="bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 text-slate-300">
                          {stepItem.tag}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Viva Quick Answers (9 Q&As) */}
          {activeTab === 'viva' && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>Direct, concise answers to common viva voce examination questions:</span>
                <span className="font-mono text-amber-400 font-semibold">9 Questions & Answers</span>
              </div>

              <div className="space-y-3">
                {vivaAnswers.map((item, idx) => {
                  const isOpen = openVivaIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-800/80 bg-slate-950/60 overflow-hidden transition"
                    >
                      <button
                        onClick={() => setOpenVivaIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left gap-4 hover:bg-slate-900/60 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-blue-950 text-blue-400 border border-blue-800/60 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                            Q{idx + 1}
                          </span>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-200">
                              {item.q}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Key takeaway: {item.key}
                            </span>
                          </div>
                        </div>

                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 pt-2 text-xs text-slate-300 border-t border-slate-800/60 bg-slate-900/40 leading-relaxed pl-13 space-y-2">
                          <p>{item.a}</p>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 font-medium">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Quick Exam Answer: {item.key}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
