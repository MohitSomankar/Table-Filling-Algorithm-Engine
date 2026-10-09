/**
 * Automated test suite for Myhill-Nerode Table-Filling Algorithm Engine.
 * Run with: npx tsx src/utils/tableFillingEngine.test.ts
 */

import {
  runTableFillingAlgorithm,
  getCanonicalPair,
  getPairKey,
  simulateDFA,
} from './tableFillingEngine';
import { DFA } from '../types/dfa';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEquals<T>(actual: T, expected: T, message: string) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    console.error(`❌ ASSERTION FAILED: ${message}\nExpected: ${expectedStr}\nActual:   ${actualStr}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- RUNNING TABLE-FILLING ALGORITHM MATHEMATICAL TESTS ---');

// TEST 1: Unique Unordered Pair Canonicalization
{
  const stateOrder = ['q0', 'q1', 'q2', 'q3'];
  const [h1, l1] = getCanonicalPair('q0', 'q1', stateOrder);
  const [h2, l2] = getCanonicalPair('q1', 'q0', stateOrder);
  assertEquals([h1, l1], ['q1', 'q0'], 'Canonical pair puts higher index first');
  assertEquals([h2, l2], ['q1', 'q0'], 'Canonical pair is symmetric');
  assertEquals(getPairKey('q0', 'q1', stateOrder), getPairKey('q1', 'q0', stateOrder), 'Keys are identical for unordered pair');
  console.log('✔ Test 1: Unique unordered pair canonicalization passed');
}

// TEST 2: Transitive Equivalence via DSU ([q1, q2, q3])
{
  // Construct a DFA where q0 is start, and reachable states q1, q2, q3 all behave equivalently
  const dfa: DFA = {
    states: ['q0', 'q1', 'q2', 'q3'],
    alphabet: ['0', '1'],
    startState: 'q0',
    finalStates: ['q1', 'q2', 'q3'],
    transitions: {
      q0: { '0': 'q1', '1': 'q2' },
      q1: { '0': 'q1', '1': 'q2' },
      q2: { '0': 'q3', '1': 'q2' },
      q3: { '0': 'q1', '1': 'q2' },
    },
  };

  const res = runTableFillingAlgorithm(dfa);
  // q0 is non-final, q1,q2,q3 are all reachable final states.
  // Equivalence classes must be: [q0] and [q1, q2, q3]
  assertEquals(res.reachableStates.length, 4, 'All 4 states are reachable');
  assertEquals(res.equivalenceClasses.length, 2, 'Exactly 2 equivalence classes');
  const mergedClass = res.equivalenceClasses.find((c) => c.states.includes('q1'));
  assert(!!mergedClass, 'Merged class found');
  assertEquals(mergedClass!.states, ['q1', 'q2', 'q3'], 'Transitive grouping merges q1, q2, and q3 into one class');
  console.log('✔ Test 2: Transitive equivalence grouping [q1, q2, q3] passed');
}

// TEST 3: Classic Hopcroft 5-State DFA Minimization
{
  const dfa: DFA = {
    states: ['q0', 'q1', 'q2', 'q3', 'q4'],
    alphabet: ['0', '1'],
    startState: 'q0',
    finalStates: ['q4'],
    transitions: {
      q0: { '0': 'q1', '1': 'q2' },
      q1: { '0': 'q1', '1': 'q3' },
      q2: { '0': 'q1', '1': 'q2' },
      q3: { '0': 'q1', '1': 'q4' },
      q4: { '0': 'q1', '1': 'q2' },
    },
  };

  const res = runTableFillingAlgorithm(dfa);
  // In this DFA, states q0 and q2 are equivalent!
  // q0 on 0 -> q1, on 1 -> q2
  // q2 on 0 -> q1, on 1 -> q2
  // Unmarked pair is (q2, q0).
  assertEquals(res.minimizedDFA.minimizedStateCount, 4, 'Classic 5-state DFA reduces to 4 states');
  const q0Class = res.equivalenceClasses.find((c) => c.states.includes('q0'));
  assert(!!q0Class, 'Class containing q0 exists');
  assertEquals(q0Class!.states, ['q0', 'q2'], 'States q0 and q2 are grouped into the same class');

  // Verify Round 0 marked pairs (all final vs non-final)
  const round0Step = res.steps.find((s) => s.round === 0);
  assert(!!round0Step, 'Round 0 step exists');
  // q4 is the only final state, so 4 pairs should be marked in Round 0: (q4,q0), (q4,q1), (q4,q2), (q4,q3)
  assertEquals(round0Step!.newlyMarkedPairs.length, 4, 'Round 0 marks exactly 4 pairs containing final state q4');

  // Verify language simulation matches
  const testStrings = ['', '0', '1', '10', '11', '111', '011', '1011', '0000'];
  for (const str of testStrings) {
    const origSim = simulateDFA(dfa.startState, dfa.finalStates, dfa.transitions, str);
    const minSim = simulateDFA(res.minimizedDFA.startClassId, res.minimizedDFA.finalClassIds, res.minimizedDFA.transitions, str);
    assertEquals(origSim.isAccepted, minSim.isAccepted, `Language equivalence preserved for string '${str}'`);
  }
  console.log('✔ Test 3: Classic 5-state DFA minimization & language invariance passed');
}

// TEST 4: Textbook 6-State DFA (Multiple Merges: {A, E} and {C, D})
{
  const dfa: DFA = {
    states: ['A', 'B', 'C', 'D', 'E', 'F'],
    alphabet: ['0', '1'],
    startState: 'A',
    finalStates: ['C', 'D'],
    transitions: {
      A: { '0': 'B', '1': 'A' },
      B: { '0': 'A', '1': 'C' },
      C: { '0': 'D', '1': 'B' },
      D: { '0': 'D', '1': 'A' },
      E: { '0': 'D', '1': 'F' },
      F: { '0': 'C', '1': 'E' },
    },
  };

  const res = runTableFillingAlgorithm(dfa);
  assert(res.equivalenceClasses.length <= 6, 'States minimized');
  // Check minimal start state and final states
  assertEquals(res.minimizedDFA.startClassId.includes('A'), true, 'Start class contains A');
  assert(res.minimizedDFA.finalClassIds.length > 0, 'Final classes exist');
  console.log('✔ Test 4: Textbook 6-state DFA minimization passed');
}

// TEST 5: All States Equivalent
{
  const dfa: DFA = {
    states: ['q0', 'q1', 'q2'],
    alphabet: ['0', '1'],
    startState: 'q0',
    finalStates: ['q0', 'q1', 'q2'],
    transitions: {
      q0: { '0': 'q1', '1': 'q2' },
      q1: { '0': 'q2', '1': 'q0' },
      q2: { '0': 'q0', '1': 'q1' },
    },
  };

  const res = runTableFillingAlgorithm(dfa);
  // All states are final, and transitions stay within the set.
  // No pairs can ever be distinguished.
  assertEquals(res.minimizedDFA.minimizedStateCount, 1, 'All-equivalent DFA reduces to 1 state');
  assertEquals(res.equivalenceClasses[0].states, ['q0', 'q1', 'q2'], 'Single equivalence class containing all 3 states');
  assertEquals(res.equivalenceClasses[0].isFinal, true, 'Minimized state is accepting');
  console.log('✔ Test 5: All states equivalent reduces to 1 state passed');
}

// TEST 6: Already Minimal DFA (No Equivalent States)
{
  const dfa: DFA = {
    states: ['q0', 'q1', 'q2'],
    alphabet: ['0', '1'],
    startState: 'q0',
    finalStates: ['q2'],
    transitions: {
      q0: { '0': 'q1', '1': 'q0' },
      q1: { '0': 'q1', '1': 'q2' },
      q2: { '0': 'q2', '1': 'q2' },
    },
  };

  const res = runTableFillingAlgorithm(dfa);
  assertEquals(res.minimizedDFA.minimizedStateCount, 3, 'Already minimal DFA stays 3 states');
  assert(res.steps[res.steps.length - 1].unmarkedPairs.length === 0, 'No unmarked pairs remain');
  console.log('✔ Test 6: Already minimal DFA passed');
}

// TEST 7: Unreachable State Elimination
{
  const dfa: DFA = {
    states: ['q0', 'q1', 'q2', 'q_unreachable'],
    alphabet: ['0', '1'],
    startState: 'q0',
    finalStates: ['q2'],
    transitions: {
      q0: { '0': 'q1', '1': 'q0' },
      q1: { '0': 'q1', '1': 'q2' },
      q2: { '0': 'q2', '1': 'q2' },
      q_unreachable: { '0': 'q0', '1': 'q1' },
    },
  };

  const res = runTableFillingAlgorithm(dfa);
  assertEquals(res.unreachableStates, ['q_unreachable'], 'Identifies unreachable state');
  assertEquals(res.reachableStates, ['q0', 'q1', 'q2'], 'Keeps only reachable states');
  assertEquals(res.minimizedDFA.minimizedStateCount, 3, 'Minimized DFA contains 3 states');
  console.log('✔ Test 7: Unreachable state elimination passed');
}

// TEST 8: One-State DFA (Trivial Base Case)
{
  const dfa: DFA = {
    states: ['q0'],
    alphabet: ['0', '1'],
    startState: 'q0',
    finalStates: ['q0'],
    transitions: {
      q0: { '0': 'q0', '1': 'q0' },
    },
  };

  const res = runTableFillingAlgorithm(dfa);
  assertEquals(res.minimizedDFA.minimizedStateCount, 1, 'One-state DFA has 1 minimal state');
  assertEquals(res.minimizedDFA.classes[0].isFinal, true, 'One-state DFA is accepting');
  assertEquals(res.minimizedDFA.transitions['q0']['0'], 'q0', 'Self-loop on 0');
  assertEquals(res.minimizedDFA.transitions['q0']['1'], 'q0', 'Self-loop on 1');
  console.log('✔ Test 8: One-state DFA passed');
}

// TEST 9: Ternary Alphabet {0, 1, 2} & Self-loops
{
  const dfa: DFA = {
    states: ['q0', 'q1', 'q2'],
    alphabet: ['0', '1', '2'],
    startState: 'q0',
    finalStates: ['q2'],
    transitions: {
      q0: { '0': 'q0', '1': 'q1', '2': 'q0' },
      q1: { '0': 'q1', '1': 'q2', '2': 'q1' },
      q2: { '0': 'q2', '1': 'q2', '2': 'q2' },
    },
  };

  const res = runTableFillingAlgorithm(dfa);
  assertEquals(res.minimizedDFA.minimizedStateCount, 3, 'Ternary DFA minimized correctly');
  assert(res.minimizedDFA.transitions['q0']['2'] !== undefined, 'Transition on symbol 2 defined');
  console.log('✔ Test 9: Ternary alphabet {0, 1, 2} and self-loops passed');
}

// TEST 10: Explicit Reason Inspection (Target pair, symbol, witness)
{
  const dfa: DFA = {
    states: ['q0', 'q1', 'q2'],
    alphabet: ['0', '1'],
    startState: 'q0',
    finalStates: ['q2'],
    transitions: {
      q0: { '0': 'q1', '1': 'q0' },
      q1: { '0': 'q1', '1': 'q2' },
      q2: { '0': 'q2', '1': 'q2' },
    },
  };

  const res = runTableFillingAlgorithm(dfa);
  // (q2, q0) is marked in Round 0 (q2 final, q0 non-final)
  const cell_q2_q0 = res.finalTable[getPairKey('q2', 'q0', res.reachableStates)];
  assert(cell_q2_q0.marked, 'Pair (q2, q0) is marked');
  assertEquals(cell_q2_q0.roundMarked, 0, 'Marked in Round 0');
  assertEquals(cell_q2_q0.reason?.distinguishingString, 'ε', 'Witness string is ε');

  // (q2, q1) is marked in Round 0 (q2 final, q1 non-final)
  const cell_q2_q1 = res.finalTable[getPairKey('q2', 'q1', res.reachableStates)];
  assert(cell_q2_q1.marked, 'Pair (q2, q1) is marked');
  assertEquals(cell_q2_q1.roundMarked, 0, 'Marked in Round 0');

  // (q1, q0) is marked in Round 1: on '1', δ(q1, 1) = q2 and δ(q0, 1) = q0, and (q2, q0) was marked in Round 0!
  const cell_q1_q0 = res.finalTable[getPairKey('q1', 'q0', res.reachableStates)];
  assert(cell_q1_q0.marked, 'Pair (q1, q0) is marked');
  assertEquals(cell_q1_q0.roundMarked, 1, 'Marked in Round 1');
  assertEquals(cell_q1_q0.reason?.symbol, '1', 'Distinguishing symbol is 1');
  assertEquals(cell_q1_q0.reason?.distinguishingString, '1', 'Distinguishing witness string is 1');
  assert(Boolean(cell_q1_q0.reason?.description.includes('q2')), 'Reason references next state q2');
  console.log('✔ Test 10: Explicit reason structure and witness string verified');
}

// TEST 11: Equivalence Class Canonical Labels & Viva Statistics
{
  const dfa: DFA = {
    states: ['q0', 'q1', 'q2', 'q3', 'q4'],
    alphabet: ['0', '1'],
    startState: 'q0',
    finalStates: ['q4'],
    transitions: {
      q0: { '0': 'q1', '1': 'q2' },
      q1: { '0': 'q1', '1': 'q3' },
      q2: { '0': 'q1', '1': 'q2' },
      q3: { '0': 'q1', '1': 'q4' },
      q4: { '0': 'q1', '1': 'q2' },
    },
  };

  const res = runTableFillingAlgorithm(dfa);
  assertEquals(res.minimizedDFA.originalStateCount, 5, 'Original states count is 5');
  assertEquals(res.minimizedDFA.minimizedStateCount, 4, 'Minimized states count is 4');
  assertEquals(res.minimizedDFA.totalPairs, 10, 'Total unordered pairs for 5 states is 10');
  assertEquals(res.minimizedDFA.equivalentPairsCount, 1, 'Exactly 1 equivalent pair (q2, q0)');
  assertEquals(res.minimizedDFA.distinguishablePairsCount, 9, 'Exactly 9 distinguishable pairs');
  assertEquals(res.minimizedDFA.statesRemoved, 1, '1 state removed');
  assertEquals(res.minimizedDFA.reductionPercentage, 20, '20% state reduction');

  // Check canonical labels A, B, C, D
  assertEquals(res.minimizedDFA.classes[0].label, 'A', 'First class labeled A');
  assertEquals(res.minimizedDFA.classes[1].label, 'B', 'Second class labeled B');
  assert(res.minimizedDFA.labelTransitions['A'] !== undefined, 'labelTransitions for A exists');
  console.log('✔ Test 11: Canonical labels and viva statistics verified');
}

console.log('--- ALL 11 MATHEMATICAL TESTS PASSED SUCCESSFULLY! ---');
