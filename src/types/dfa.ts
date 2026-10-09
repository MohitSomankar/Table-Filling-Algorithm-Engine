export interface DFA {
  states: string[];
  alphabet: string[];
  transitions: Record<string, Record<string, string>>; // state -> symbol -> nextState
  startState: string;
  finalStates: string[];
}

export interface PairMarkReason {
  round: number;
  symbol?: string;
  targetPair?: [string, string];
  targetNextA?: string;
  targetNextB?: string;
  distinguishingString: string;
  description: string;
}

export interface TableCellState {
  stateA: string; // row state (higher index)
  stateB: string; // col state (lower index)
  marked: boolean;
  roundMarked?: number;
  reason?: PairMarkReason;
}

export type AlgorithmStage = 'INPUT' | 'INITIAL_MARKING' | 'ITERATION' | 'EQUIVALENCE' | 'MINIMIZED';

export interface AlgorithmStep {
  stepIndex: number;
  title: string;
  description: string;
  round: number;
  stage?: AlgorithmStage;
  newlyMarkedPairs: [string, string][]; // pairs marked in this step
  tableSnapshot: Record<string, TableCellState>; // key: "stateA,stateB"
  unmarkedPairs: [string, string][];
  stepPartitions?: string[][]; // equivalence partition at this step
}

export interface EquivalenceClass {
  id: string; // e.g. "[q1, q2]" or "q0"
  label: string; // e.g. "A", "B", "C"
  states: string[];
  isStart: boolean;
  isFinal: boolean;
  representative: string;
}

export interface MinimizedDFA {
  originalStateCount: number;
  minimizedStateCount: number;
  unreachableStates: string[];
  classes: EquivalenceClass[];
  transitions: Record<string, Record<string, string>>; // classId -> symbol -> nextClassId
  labelTransitions: Record<string, Record<string, string>>; // label -> symbol -> nextLabel
  startClassId: string;
  startClassLabel: string;
  finalClassIds: string[];
  finalClassLabels: string[];
  // Statistics
  totalPairs: number;
  equivalentPairsCount: number;
  distinguishablePairsCount: number;
  equivalentPairs: [string, string][];
  distinguishablePairs: [string, string][];
  statesRemoved: number;
  reductionPercentage: number;
  originalTransitionsCount: number;
  minimizedTransitionsCount: number;
}

export interface TableFillingResult {
  reachableStates: string[];
  unreachableStates: string[];
  steps: AlgorithmStep[];
  finalTable: Record<string, TableCellState>;
  equivalenceClasses: EquivalenceClass[];
  minimizedDFA: MinimizedDFA;
}

export interface DFAPreset {
  id: string;
  name: string;
  description: string;
  dfa: DFA;
  sampleTestString?: string;
}
