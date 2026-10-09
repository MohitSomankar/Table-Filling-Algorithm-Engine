import {
  DFA,
  TableFillingResult,
  AlgorithmStep,
  TableCellState,
  EquivalenceClass,
  MinimizedDFA,
  PairMarkReason,
} from '../types/dfa';

/**
 * Standardizes a state pair such that the state with higher index in stateOrder comes first.
 * This guarantees (q0, q1) and (q1, q0) are strictly treated as the identical unordered pair.
 */
export function getCanonicalPair(p: string, q: string, stateOrder: string[]): [string, string] {
  const indexP = stateOrder.indexOf(p);
  const indexQ = stateOrder.indexOf(q);
  return indexP > indexQ ? [p, q] : [q, p];
}

/**
 * Generates the unique canonical key for an unordered pair of states.
 */
export function getPairKey(p: string, q: string, stateOrder: string[]): string {
  const [higher, lower] = getCanonicalPair(p, q, stateOrder);
  return `${higher},${lower}`;
}

/**
 * Disjoint Set Union (DSU / Union-Find) with path compression and rank optimization.
 * Correctly groups all transitively equivalent states:
 * If (q1, q2) is equivalent and (q2, q3) is equivalent -> result is [q1, q2, q3].
 */
export class UnionFind {
  private parent: Map<string, string> = new Map();
  private rank: Map<string, number> = new Map();

  constructor(elements: string[]) {
    for (const el of elements) {
      this.parent.set(el, el);
      this.rank.set(el, 0);
    }
  }

  find(i: string): string {
    const root = this.parent.get(i) ?? i;
    if (root === i) return i;
    const actualRoot = this.find(root);
    this.parent.set(i, actualRoot);
    return actualRoot;
  }

  union(i: string, j: string): void {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI !== rootJ) {
      const rankI = this.rank.get(rootI) ?? 0;
      const rankJ = this.rank.get(rootJ) ?? 0;
      if (rankI < rankJ) {
        this.parent.set(rootI, rootJ);
      } else if (rankI > rankJ) {
        this.parent.set(rootJ, rootI);
      } else {
        this.parent.set(rootJ, rootI);
        this.rank.set(rootI, rankI + 1);
      }
    }
  }
}

/**
 * Helper to compute the equivalence partition at any snapshot state.
 */
function computePartition(
  states: string[],
  unmarkedPairs: [string, string][]
): string[][] {
  const dsu = new UnionFind(states);
  for (const [a, b] of unmarkedPairs) {
    dsu.union(a, b);
  }

  const map = new Map<string, string[]>();
  for (const s of states) {
    const root = dsu.find(s);
    if (!map.has(root)) map.set(root, []);
    map.get(root)!.push(s);
  }

  const classes = Array.from(map.values()).map((members) =>
    [...members].sort((x, y) => states.indexOf(x) - states.indexOf(y))
  );

  classes.sort((c1, c2) => states.indexOf(c1[0]) - states.indexOf(c2[0]));
  return classes;
}

/**
 * Core Implementation of the Myhill-Nerode Table-Filling Algorithm.
 * Strictly adheres to standard automata theory:
 * 1. Reachability analysis (BFS).
 * 2. Enumeration of unique unordered pairs {p, q} with p != q.
 * 3. Round 0 (0-equivalence): Distinguishes final states from non-final states (witness ε).
 * 4. Rounds 1..k (k-equivalence): Iteratively marks pairs whose transitions lead to previously
 *    distinguished pairs, selecting the shortest distinguishing string.
 * 5. Fixed-point termination when no new marks occur.
 * 6. Disjoint Set Union (transitive closure) grouping into distinct equivalence classes.
 * 7. Canonical minimized DFA construction.
 */
export function runTableFillingAlgorithm(dfa: DFA): TableFillingResult {
  const allStates = [...dfa.states];
  const alphabet = [...dfa.alphabet];
  const startState = dfa.startState;
  const finalStatesSet = new Set(dfa.finalStates);

  // 1. REACHABLE STATES (BFS)
  const reachableSet = new Set<string>();
  const queue: string[] = [];

  if (allStates.includes(startState)) {
    reachableSet.add(startState);
    queue.push(startState);
  }

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const stateTransitions = dfa.transitions[curr] || {};
    for (const sym of alphabet) {
      const next = stateTransitions[sym];
      if (next && allStates.includes(next) && !reachableSet.has(next)) {
        reachableSet.add(next);
        queue.push(next);
      }
    }
  }

  // Preserve original relative order
  const reachableStates = allStates.filter((s) => reachableSet.has(s));
  const unreachableStates = allStates.filter((s) => !reachableSet.has(s));

  // 2. GENERATE ALL UNIQUE UNORDERED PAIRS
  // Pair {reachableStates[i], reachableStates[j]} where i > j
  // (q0, q1) and (q1, q0) are strictly identical
  const tableCells: Record<string, TableCellState> = {};
  const allPairs: [string, string][] = [];

  for (let i = 1; i < reachableStates.length; i++) {
    for (let j = 0; j < i; j++) {
      const stateA = reachableStates[i];
      const stateB = reachableStates[j];
      const key = `${stateA},${stateB}`;
      allPairs.push([stateA, stateB]);
      tableCells[key] = {
        stateA,
        stateB,
        marked: false,
      };
    }
  }

  const steps: AlgorithmStep[] = [];

  // Step 0: Initial Table (All pairs unmarked)
  steps.push({
    stepIndex: 0,
    title: 'Table Initialization',
    description:
      reachableStates.length <= 1
        ? `DFA has ${reachableStates.length} reachable state. No state pairs to compare.`
        : `Constructed triangular state-pair table containing ${allPairs.length} unique unordered state pairs for ${reachableStates.length} reachable states.`,
    round: -1,
    stage: 'INPUT',
    newlyMarkedPairs: [],
    tableSnapshot: JSON.parse(JSON.stringify(tableCells)),
    unmarkedPairs: [...allPairs],
    stepPartitions: computePartition(reachableStates, allPairs),
  });

  // Handle edge case: One-state DFA or empty reachable states
  if (reachableStates.length <= 1) {
    const isFinal = reachableStates.length === 1 && finalStatesSet.has(reachableStates[0]);
    const singleClass: EquivalenceClass = {
      id: reachableStates[0] || 'q0',
      label: 'A',
      states: reachableStates.length === 1 ? [reachableStates[0]] : [],
      isStart: true,
      isFinal,
      representative: reachableStates[0] || 'q0',
    };

    const minTransitions: Record<string, Record<string, string>> = {};
    const labelTransitions: Record<string, Record<string, string>> = {};
    if (reachableStates.length === 1) {
      minTransitions[singleClass.id] = {};
      labelTransitions['A'] = {};
      for (const sym of alphabet) {
        minTransitions[singleClass.id][sym] = singleClass.id;
        labelTransitions['A'][sym] = 'A';
      }
    }

    const minDFA: MinimizedDFA = {
      originalStateCount: allStates.length,
      minimizedStateCount: reachableStates.length,
      unreachableStates,
      classes: reachableStates.length === 1 ? [singleClass] : [],
      transitions: minTransitions,
      labelTransitions,
      startClassId: singleClass.id,
      startClassLabel: 'A',
      finalClassIds: isFinal ? [singleClass.id] : [],
      finalClassLabels: isFinal ? ['A'] : [],
      totalPairs: 0,
      equivalentPairsCount: 0,
      distinguishablePairsCount: 0,
      equivalentPairs: [],
      distinguishablePairs: [],
      statesRemoved: allStates.length - reachableStates.length,
      reductionPercentage: Math.round(((allStates.length - reachableStates.length) / Math.max(1, allStates.length)) * 100),
      originalTransitionsCount: allStates.length * alphabet.length,
      minimizedTransitionsCount: reachableStates.length * alphabet.length,
    };

    steps.push({
      stepIndex: 1,
      title: 'Minimization Complete (Trivial DFA)',
      description: `DFA has ${reachableStates.length} reachable state and is already minimal.`,
      round: 0,
      newlyMarkedPairs: [],
      tableSnapshot: {},
      unmarkedPairs: [],
      stepPartitions: [reachableStates],
    });

    return {
      reachableStates,
      unreachableStates,
      steps,
      finalTable: {},
      equivalenceClasses: reachableStates.length === 1 ? [singleClass] : [],
      minimizedDFA: minDFA,
    };
  }

  // 3. ROUND 0: INITIAL MARKING (0-Equivalence)
  // Mark every pair where exactly one state is final and the other is non-final
  const round0Marked: [string, string][] = [];

  for (const [stateA, stateB] of allPairs) {
    const key = `${stateA},${stateB}`;
    const aIsFinal = finalStatesSet.has(stateA);
    const bIsFinal = finalStatesSet.has(stateB);

    if (aIsFinal !== bIsFinal) {
      tableCells[key].marked = true;
      tableCells[key].roundMarked = 0;
      const finalState = aIsFinal ? stateA : stateB;
      const nonFinalState = !aIsFinal ? stateA : stateB;

      tableCells[key].reason = {
        round: 0,
        distinguishingString: 'ε',
        description: `On empty string ε: state ${finalState} ∈ F (accepting), while state ${nonFinalState} ∉ F (non-accepting). Therefore (${stateA}, ${stateB}) is distinguishable by string ε.`,
      };
      round0Marked.push([stateA, stateB]);
    }
  }

  const unmarkedAfterRound0 = allPairs.filter(([a, b]) => !tableCells[`${a},${b}`].marked);

  steps.push({
    stepIndex: 1,
    title: 'Round 0: Initial Final/Non-Final Marking (0-Equivalence)',
    description: `Marked ${round0Marked.length} pair(s) where exactly one state is accepting (∈ F) and the other is non-accepting (∉ F). Distinguishable by the empty string ε.`,
    round: 0,
    stage: 'INITIAL_MARKING',
    newlyMarkedPairs: round0Marked,
    tableSnapshot: JSON.parse(JSON.stringify(tableCells)),
    unmarkedPairs: unmarkedAfterRound0,
    stepPartitions: computePartition(reachableStates, unmarkedAfterRound0),
  });

  // 4. ITERATIVE MARKING (Rounds 1, 2, ... / k-Equivalence)
  // For every unmarked pair (p, q), test each alphabet symbol a in Σ.
  // If δ(p, a) != δ(q, a) and (δ(p, a), δ(q, a)) is already marked distinguishable,
  // then (p, q) is distinguishable.
  // Repeat until no new pairs are marked in a full pass.
  let currentRound = 1;
  let keepIterating = true;

  while (keepIterating) {
    // Snapshot of marks prior to this round
    // A pair is marked in round currentRound based on targets marked in rounds < currentRound
    const previousMarks = new Map<string, { round: number; distString: string }>();
    for (const key of Object.keys(tableCells)) {
      if (tableCells[key].marked) {
        previousMarks.set(key, {
          round: tableCells[key].roundMarked ?? 0,
          distString: tableCells[key].reason?.distinguishingString ?? 'ε',
        });
      }
    }

    interface PendingMark {
      key: string;
      pair: [string, string];
      symbol: string;
      targetPair: [string, string];
      nextA: string;
      nextB: string;
      targetRound: number;
      targetDistString: string;
      distString: string;
    }

    const pendingMarks: PendingMark[] = [];

    // Evaluate all currently unmarked pairs
    for (const [stateA, stateB] of allPairs) {
      const key = `${stateA},${stateB}`;
      if (tableCells[key].marked) continue;

      // Find all distinguishing symbols and choose the one with shortest distinguishing string
      let bestCandidate: {
        symbol: string;
        targetPair: [string, string];
        nextA: string;
        nextB: string;
        targetRound: number;
        targetDistString: string;
        distString: string;
      } | null = null;

      for (const sym of alphabet) {
        const nextA = dfa.transitions[stateA]?.[sym];
        const nextB = dfa.transitions[stateB]?.[sym];

        // Self-loops or transitions to the exact same state do NOT distinguish (p, q)
        if (nextA && nextB && nextA !== nextB) {
          const targetKey = getPairKey(nextA, nextB, reachableStates);
          const targetMarkInfo = previousMarks.get(targetKey);

          if (targetMarkInfo) {
            const candidateDistString =
              targetMarkInfo.distString === 'ε' ? sym : `${sym}${targetMarkInfo.distString}`;

            // Select candidate with minimal distinguishing string length
            if (
              !bestCandidate ||
              candidateDistString.length < bestCandidate.distString.length ||
              (candidateDistString.length === bestCandidate.distString.length &&
                targetMarkInfo.round < bestCandidate.targetRound)
            ) {
              bestCandidate = {
                symbol: sym,
                targetPair: getCanonicalPair(nextA, nextB, reachableStates),
                nextA,
                nextB,
                targetRound: targetMarkInfo.round,
                targetDistString: targetMarkInfo.distString,
                distString: candidateDistString,
              };
            }
          }
        }
      }

      if (bestCandidate) {
        pendingMarks.push({
          key,
          pair: [stateA, stateB],
          ...bestCandidate,
        });
      }
    }

    if (pendingMarks.length > 0) {
      const markedInThisRound: [string, string][] = [];

      for (const item of pendingMarks) {
        const desc = `On symbol '${item.symbol}': δ(${item.pair[0]}, '${item.symbol}') = ${item.nextA} and δ(${item.pair[1]}, '${item.symbol}') = ${item.nextB}. Pair (${item.targetPair[0]}, ${item.targetPair[1]}) was already distinguishable (marked in Round ${item.targetRound} with witness '${item.targetDistString}'). Therefore (${item.pair[0]}, ${item.pair[1]}) is distinguishable with witness string '${item.distString}'.`;

        const reason: PairMarkReason = {
          round: currentRound,
          symbol: item.symbol,
          targetPair: item.targetPair,
          targetNextA: item.nextA,
          targetNextB: item.nextB,
          distinguishingString: item.distString,
          description: desc,
        };

        tableCells[item.key].marked = true;
        tableCells[item.key].roundMarked = currentRound;
        tableCells[item.key].reason = reason;
        markedInThisRound.push(item.pair);
      }

      const unmarkedNow = allPairs.filter(([a, b]) => !tableCells[`${a},${b}`].marked);

      steps.push({
        stepIndex: steps.length,
        title: `Round ${currentRound}: Newly Marked Pairs`,
        description: `Marked ${markedInThisRound.length} pair(s) whose transitions on alphabet symbols lead to previously distinguished pairs.`,
        round: currentRound,
        stage: 'ITERATION',
        newlyMarkedPairs: markedInThisRound,
        tableSnapshot: JSON.parse(JSON.stringify(tableCells)),
        unmarkedPairs: unmarkedNow,
        stepPartitions: computePartition(reachableStates, unmarkedNow),
      });

      currentRound++;
    } else {
      // Fixed point reached: no new pairs marked in this round
      keepIterating = false;
    }
  }

  // 5. EQUIVALENCE CLASSES (TRANSITIVE CLOSURE VIA UNION-FIND)
  // All remaining unmarked pairs represent equivalent states (p ≡ q).
  const finalUnmarkedPairs = allPairs.filter(([a, b]) => !tableCells[`${a},${b}`].marked);

  const dsu = new UnionFind(reachableStates);
  for (const [a, b] of finalUnmarkedPairs) {
    dsu.union(a, b);
  }

  // Group states by their DSU root
  const classMap = new Map<string, string[]>();
  for (const st of reachableStates) {
    const root = dsu.find(st);
    if (!classMap.has(root)) {
      classMap.set(root, []);
    }
    classMap.get(root)!.push(st);
  }

  // Sort member states inside each class according to reachableStates order
  const rawClasses = Array.from(classMap.values()).map((members) =>
    members.sort((x, y) => reachableStates.indexOf(x) - reachableStates.indexOf(y))
  );

  // Sort classes by lowest member index
  rawClasses.sort((c1, c2) => {
    const min1 = reachableStates.indexOf(c1[0]);
    const min2 = reachableStates.indexOf(c2[0]);
    return min1 - min2;
  });

  const equivalenceClasses: EquivalenceClass[] = rawClasses.map((members, idx) => {
    const isStart = members.includes(startState);
    const isFinal = members.some((s) => finalStatesSet.has(s));
    const representative = members[0];
    const id = members.length === 1 ? members[0] : `[${members.join(', ')}]`;
    const label = String.fromCharCode(65 + idx); // A, B, C...

    return {
      id,
      label,
      states: members,
      isStart,
      isFinal,
      representative,
    };
  });

  // 6. MINIMIZED DFA CONSTRUCTION
  const minTransitions: Record<string, Record<string, string>> = {};
  const labelTransitions: Record<string, Record<string, string>> = {};
  const startClass =
    equivalenceClasses.find((c) => c.isStart) || equivalenceClasses[0] || { id: '', label: 'A' };
  const finalClasses = equivalenceClasses.filter((c) => c.isFinal);

  // For each class C and each symbol a in Σ: δ'(C, a) = [δ(rep, a)]
  for (const eqClass of equivalenceClasses) {
    minTransitions[eqClass.id] = {};
    labelTransitions[eqClass.label] = {};
    const repState = eqClass.representative;

    for (const sym of alphabet) {
      const nextOriginal = dfa.transitions[repState]?.[sym];
      if (nextOriginal) {
        const targetClass = equivalenceClasses.find((c) => c.states.includes(nextOriginal));
        if (targetClass) {
          minTransitions[eqClass.id][sym] = targetClass.id;
          labelTransitions[eqClass.label][sym] = targetClass.label;
        } else {
          // If transition points to an unreachable state, keep canonical target
          minTransitions[eqClass.id][sym] = nextOriginal;
          labelTransitions[eqClass.label][sym] = nextOriginal;
        }
      }
    }
  }

  const distinguishablePairs = allPairs.filter(([a, b]) => tableCells[`${a},${b}`].marked);
  const statesRemoved = allStates.length - equivalenceClasses.length;
  const reductionPercentage = Math.round(
    ((allStates.length - equivalenceClasses.length) / Math.max(1, allStates.length)) * 100
  );

  const minimizedDFA: MinimizedDFA = {
    originalStateCount: allStates.length,
    minimizedStateCount: equivalenceClasses.length,
    unreachableStates,
    classes: equivalenceClasses,
    transitions: minTransitions,
    labelTransitions,
    startClassId: startClass.id,
    startClassLabel: startClass.label,
    finalClassIds: finalClasses.map((c) => c.id),
    finalClassLabels: finalClasses.map((c) => c.label),
    totalPairs: allPairs.length,
    equivalentPairsCount: finalUnmarkedPairs.length,
    distinguishablePairsCount: distinguishablePairs.length,
    equivalentPairs: finalUnmarkedPairs,
    distinguishablePairs,
    statesRemoved,
    reductionPercentage,
    originalTransitionsCount: allStates.length * alphabet.length,
    minimizedTransitionsCount: equivalenceClasses.length * alphabet.length,
  };

  steps.push({
    stepIndex: steps.length,
    title: 'FINAL: Fixed Point (No More Pairs Can Be Marked)',
    description: `No new pairs could be distinguished. Identified ${finalUnmarkedPairs.length} equivalent pair(s), grouped into ${equivalenceClasses.length} distinct equivalence class(es).`,
    round: currentRound,
    stage: 'EQUIVALENCE',
    newlyMarkedPairs: [],
    tableSnapshot: JSON.parse(JSON.stringify(tableCells)),
    unmarkedPairs: finalUnmarkedPairs,
    stepPartitions: rawClasses,
  });

  return {
    reachableStates,
    unreachableStates,
    steps,
    finalTable: tableCells,
    equivalenceClasses,
    minimizedDFA,
  };
}

/**
 * Simulates string execution on a DFA (original or minimized).
 */
export function simulateDFA(
  startState: string,
  finalStates: string[],
  transitions: Record<string, Record<string, string>>,
  inputString: string
): {
  path: Array<{ state: string; symbolConsumed: string; nextState: string }>;
  finalState: string;
  isAccepted: boolean;
  isValidAlphabet: boolean;
  invalidChar?: string;
} {
  const path: Array<{ state: string; symbolConsumed: string; nextState: string }> = [];
  let current = startState;

  for (let i = 0; i < inputString.length; i++) {
    const sym = inputString[i];
    const next = transitions[current]?.[sym];

    if (!next) {
      return {
        path,
        finalState: current,
        isAccepted: false,
        isValidAlphabet: false,
        invalidChar: sym,
      };
    }

    path.push({
      state: current,
      symbolConsumed: sym,
      nextState: next,
    });
    current = next;
  }

  return {
    path,
    finalState: current,
    isAccepted: finalStates.includes(current),
    isValidAlphabet: true,
  };
}
