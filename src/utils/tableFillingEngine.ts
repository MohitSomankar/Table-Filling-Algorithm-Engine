import { DFA, TableFillingResult, AlgorithmStep, TableCellState, EquivalenceClass, MinimizedDFA } from '../types/dfa';

/**
 * Standardizes a pair key such that the state with higher index in stateOrder comes first.
 */
export function getCanonicalPair(p: string, q: string, stateOrder: string[]): [string, string] {
  const indexP = stateOrder.indexOf(p);
  const indexQ = stateOrder.indexOf(q);
  return indexP > indexQ ? [p, q] : [q, p];
}

export function getPairKey(p: string, q: string, stateOrder: string[]): string {
  const [higher, lower] = getCanonicalPair(p, q, stateOrder);
  return `${higher},${lower}`;
}

/**
 * Disjoint Set Union (DSU) helper for grouping equivalent states into partitions.
 */
class UnionFind {
  private parent: Map<string, string> = new Map();

  constructor(elements: string[]) {
    for (const el of elements) {
      this.parent.set(el, el);
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
      this.parent.set(rootI, rootJ);
    }
  }
}

/**
 * Runs the Myhill-Nerode Table-Filling Algorithm on an input DFA.
 * Returns the complete step-by-step trace and minimized DFA.
 */
export function runTableFillingAlgorithm(dfa: DFA): TableFillingResult {
  const allStates = [...dfa.states];
  const alphabet = [...dfa.alphabet];
  const startState = dfa.startState;
  const finalStatesSet = new Set(dfa.finalStates);

  // 1. Compute Reachable States from Start State using BFS
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

  const reachableStates = allStates.filter((s) => reachableSet.has(s));
  const unreachableStates = allStates.filter((s) => !reachableSet.has(s));

  // Initialize lower triangular table cells
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

  // Step 0: Initial Unmarked Table
  steps.push({
    stepIndex: 0,
    title: 'Table Initialization',
    description: `Constructed lower triangular table with ${allPairs.length} state pairs for ${reachableStates.length} reachable states.`,
    round: -1,
    newlyMarkedPairs: [],
    tableSnapshot: JSON.parse(JSON.stringify(tableCells)),
    unmarkedPairs: [...allPairs],
  });

  // Step 1: Base Case (Round 0) - Distinguish Final vs Non-Final States (0-Equivalence)
  const round0Marked: [string, string][] = [];

  for (const [stateA, stateB] of allPairs) {
    const key = `${stateA},${stateB}`;
    const aIsFinal = finalStatesSet.has(stateA);
    const bIsFinal = finalStatesSet.has(stateB);

    if (aIsFinal !== bIsFinal) {
      tableCells[key].marked = true;
      tableCells[key].roundMarked = 0;
      tableCells[key].reason = {
        round: 0,
        distinguishingString: 'ε',
        description: `${aIsFinal ? stateA : stateB} ∈ F (accepting), while ${!aIsFinal ? stateA : stateB} ∉ F (rejecting). Distinguished by empty string ε.`,
      };
      round0Marked.push([stateA, stateB]);
    }
  }

  steps.push({
    stepIndex: 1,
    title: 'Round 0: Final vs Non-Final States (0-Equivalence)',
    description: `Marked ${round0Marked.length} pairs where exactly one state is accepting (in F) and the other is rejecting. These are distinguished by the empty string ε.`,
    round: 0,
    newlyMarkedPairs: round0Marked,
    tableSnapshot: JSON.parse(JSON.stringify(tableCells)),
    unmarkedPairs: allPairs.filter(([a, b]) => !tableCells[`${a},${b}`].marked),
  });

  // Step 2..k: Iterative Propagation (k-Equivalence)
  let round = 1;
  let keepIterating = true;

  while (keepIterating) {
    let markedInThisRound: [string, string][] = [];
    const pendingMarks: Array<{
      key: string;
      pair: [string, string];
      symbol: string;
      targetPair: [string, string];
      distinguishingString: string;
      desc: string;
    }> = [];

    // Find unmarked pairs that transition to an already-marked pair on any symbol
    for (const [stateA, stateB] of allPairs) {
      const key = `${stateA},${stateB}`;
      if (tableCells[key].marked) continue;

      for (const sym of alphabet) {
        const nextA = dfa.transitions[stateA]?.[sym];
        const nextB = dfa.transitions[stateB]?.[sym];

        if (nextA && nextB && nextA !== nextB) {
          const targetKey = getPairKey(nextA, nextB, reachableStates);
          const targetCell = tableCells[targetKey];

          if (targetCell && targetCell.marked) {
            const prevDistString = targetCell.reason?.distinguishingString || '';
            const newDistString = prevDistString === 'ε' ? sym : `${sym}${prevDistString}`;

            pendingMarks.push({
              key,
              pair: [stateA, stateB],
              symbol: sym,
              targetPair: [nextA, nextB],
              distinguishingString: newDistString,
              desc: `On input '${sym}', δ(${stateA}, ${sym}) = ${nextA} and δ(${stateB}, ${sym}) = ${nextB}. The pair {${nextA}, ${nextB}} is already marked. Distinguished by string '${newDistString}'.`,
            });
            break; // Stop checking other symbols for this pair in this round
          }
        }
      }
    }

    if (pendingMarks.length > 0) {
      for (const item of pendingMarks) {
        tableCells[item.key].marked = true;
        tableCells[item.key].roundMarked = round;
        tableCells[item.key].reason = {
          round,
          symbol: item.symbol,
          targetPair: item.targetPair,
          distinguishingString: item.distinguishingString,
          description: item.desc,
        };
        markedInThisRound.push(item.pair);
      }

      steps.push({
        stepIndex: steps.length,
        title: `Round ${round}: Input Symbol Propagation`,
        description: `Marked ${markedInThisRound.length} pairs whose transitions on input symbols lead to previously distinguished pairs.`,
        round,
        newlyMarkedPairs: markedInThisRound,
        tableSnapshot: JSON.parse(JSON.stringify(tableCells)),
        unmarkedPairs: allPairs.filter(([a, b]) => !tableCells[`${a},${b}`].marked),
      });

      round++;
    } else {
      keepIterating = false;
    }
  }

  // Final Step: Remaining unmarked pairs are equivalent
  const remainingUnmarked = allPairs.filter(([a, b]) => !tableCells[`${a},${b}`].marked);

  // Group equivalent states using DSU
  const dsu = new UnionFind(reachableStates);
  for (const [a, b] of remainingUnmarked) {
    dsu.union(a, b);
  }

  const classMap = new Map<string, string[]>();
  for (const st of reachableStates) {
    const root = dsu.find(st);
    if (!classMap.has(root)) {
      classMap.set(root, []);
    }
    classMap.get(root)!.push(st);
  }

  // Format equivalence classes
  const rawClasses = Array.from(classMap.values());
  // Sort classes by lowest state index
  rawClasses.sort((c1, c2) => {
    const min1 = Math.min(...c1.map((s) => reachableStates.indexOf(s)));
    const min2 = Math.min(...c2.map((s) => reachableStates.indexOf(s)));
    return min1 - min2;
  });

  const equivalenceClasses: EquivalenceClass[] = rawClasses.map((members, idx) => {
    const isStart = members.includes(startState);
    const isFinal = members.some((s) => finalStatesSet.has(s));
    const representative = members[0];
    const id = members.length === 1 ? members[0] : `[${members.join(', ')}]`;

    return {
      id,
      states: members,
      isStart,
      isFinal,
      representative,
    };
  });

  // Construct Minimized DFA transitions
  const minTransitions: Record<string, Record<string, string>> = {};
  const startClass = equivalenceClasses.find((c) => c.isStart)?.id || equivalenceClasses[0]?.id || '';
  const finalClassIds = equivalenceClasses.filter((c) => c.isFinal).map((c) => c.id);

  for (const eqClass of equivalenceClasses) {
    minTransitions[eqClass.id] = {};
    const repState = eqClass.representative;

    for (const sym of alphabet) {
      const nextOriginal = dfa.transitions[repState]?.[sym];
      if (nextOriginal) {
        // Find which equivalence class contains nextOriginal
        const targetClass = equivalenceClasses.find((c) => c.states.includes(nextOriginal));
        if (targetClass) {
          minTransitions[eqClass.id][sym] = targetClass.id;
        }
      }
    }
  }

  const minimizedDFA: MinimizedDFA = {
    originalStateCount: allStates.length,
    minimizedStateCount: equivalenceClasses.length,
    unreachableStates,
    classes: equivalenceClasses,
    transitions: minTransitions,
    startClassId: startClass,
    finalClassIds,
  };

  steps.push({
    stepIndex: steps.length,
    title: 'Completed: Fixed Point & Equivalence Classes',
    description: `No new pairs could be distinguished. Found ${remainingUnmarked.length} equivalent state pairs grouped into ${equivalenceClasses.length} distinct equivalence classes.`,
    round,
    newlyMarkedPairs: [],
    tableSnapshot: JSON.parse(JSON.stringify(tableCells)),
    unmarkedPairs: remainingUnmarked,
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
 * Simulates a string on a DFA (original or minimized).
 * Returns the path of states traversed and whether it accepted or rejected.
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
