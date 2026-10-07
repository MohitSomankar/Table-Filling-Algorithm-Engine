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

export interface AlgorithmStep {
  stepIndex: number;
  title: string;
  description: string;
  round: number;
  newlyMarkedPairs: [string, string][]; // pairs marked in this step
  tableSnapshot: Record<string, TableCellState>; // key: "stateA,stateB"
  unmarkedPairs: [string, string][];
}

export interface EquivalenceClass {
  id: string;
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
  startClassId: string;
  finalClassIds: string[];
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
