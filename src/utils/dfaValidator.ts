import { DFA } from '../types/dfa';

export type DFAValidationErrorType =
  | 'EMPTY_STATES'
  | 'EMPTY_ALPHABET'
  | 'EMPTY_STATE_NAME'
  | 'DUPLICATE_STATE'
  | 'DUPLICATE_ALPHABET'
  | 'MISSING_START_STATE'
  | 'INVALID_START_STATE'
  | 'INVALID_FINAL_STATE'
  | 'MISSING_TRANSITION'
  | 'INVALID_TRANSITION_TARGET';

export interface DFAValidationError {
  type: DFAValidationErrorType;
  message: string;
  details?: string;
}

export interface DFAValidationResult {
  isValid: boolean;
  errors: DFAValidationError[];
}

/**
 * Validates a DFA configuration against all formal DFA definition rules.
 * Detects:
 * - Empty states set
 * - Empty alphabet
 * - Empty state names
 * - Duplicate state names
 * - Duplicate alphabet symbols
 * - Missing start state
 * - Invalid start state
 * - Invalid final states
 * - Missing transitions δ(q, a)
 * - Invalid transition destinations δ(q, a) -> q_unknown
 */
export function validateDFA(dfa: DFA): DFAValidationResult {
  const errors: DFAValidationError[] = [];

  // 1. Check for empty state set
  if (!dfa.states || dfa.states.length === 0) {
    errors.push({
      type: 'EMPTY_STATES',
      message: 'Empty state set. The DFA must have at least 1 state.',
    });
  }

  // 2. Check for empty state names & duplicate states
  const stateCounts = new Map<string, number>();
  if (dfa.states) {
    for (const s of dfa.states) {
      const trimmed = s.trim();
      if (!trimmed) {
        errors.push({
          type: 'EMPTY_STATE_NAME',
          message: 'Empty state name detected. All states must have non-empty names.',
        });
      }
      stateCounts.set(trimmed, (stateCounts.get(trimmed) || 0) + 1);
    }

    for (const [st, count] of stateCounts.entries()) {
      if (count > 1 && st) {
        errors.push({
          type: 'DUPLICATE_STATE',
          message: `Duplicate state name: "${st}" appears ${count} times.`,
        });
      }
    }
  }

  // 3. Check for empty alphabet & duplicate symbols
  if (!dfa.alphabet || dfa.alphabet.length === 0) {
    errors.push({
      type: 'EMPTY_ALPHABET',
      message: 'Empty alphabet. The DFA must have at least 1 input symbol.',
    });
  }

  const alphabetCounts = new Map<string, number>();
  if (dfa.alphabet) {
    for (const a of dfa.alphabet) {
      const trimmed = a.trim();
      if (!trimmed) {
        errors.push({
          type: 'EMPTY_ALPHABET',
          message: 'Empty alphabet symbol detected. All symbols must be non-empty.',
        });
      }
      alphabetCounts.set(trimmed, (alphabetCounts.get(trimmed) || 0) + 1);
    }

    for (const [sym, count] of alphabetCounts.entries()) {
      if (count > 1 && sym) {
        errors.push({
          type: 'DUPLICATE_ALPHABET',
          message: `Duplicate alphabet symbol: "${sym}" appears ${count} times.`,
        });
      }
    }
  }

  const validStatesSet = new Set(
    (dfa.states || []).map((s) => s.trim()).filter(Boolean)
  );

  // 4. Check for missing or invalid start state
  if (!dfa.startState || !dfa.startState.trim()) {
    errors.push({
      type: 'MISSING_START_STATE',
      message: 'Missing start state. Please specify a start state.',
    });
  } else if (!validStatesSet.has(dfa.startState.trim())) {
    errors.push({
      type: 'INVALID_START_STATE',
      message: `Invalid start state: "${dfa.startState}" does not exist in the state set.`,
    });
  }

  // 5. Check for invalid final states
  if (dfa.finalStates) {
    for (const f of dfa.finalStates) {
      const trimmed = f.trim();
      if (trimmed && !validStatesSet.has(trimmed)) {
        errors.push({
          type: 'INVALID_FINAL_STATE',
          message: `Invalid final state: "${trimmed}" does not exist in the state set.`,
        });
      }
    }
  }

  // 6. Check for missing transitions and invalid transition destinations
  if (dfa.states && dfa.alphabet && dfa.states.length > 0 && dfa.alphabet.length > 0) {
    for (const st of dfa.states) {
      const stateTrimmed = st.trim();
      if (!stateTrimmed) continue;

      const stateTransitions = dfa.transitions?.[stateTrimmed];

      for (const sym of dfa.alphabet) {
        const symTrimmed = sym.trim();
        if (!symTrimmed) continue;

        const target = stateTransitions?.[symTrimmed];

        if (target === undefined || target === null || target === '') {
          errors.push({
            type: 'MISSING_TRANSITION',
            message: `Missing transition: ${stateTrimmed} --${symTrimmed}--> ?`,
            details: `State "${stateTrimmed}" has no transition defined for symbol "${symTrimmed}".`,
          });
        } else if (!validStatesSet.has(target.trim())) {
          errors.push({
            type: 'INVALID_TRANSITION_TARGET',
            message: `Invalid transition: ${stateTrimmed} --${symTrimmed}--> ${target}`,
            details: `Target state "${target}" does not exist in the state set.`,
          });
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
