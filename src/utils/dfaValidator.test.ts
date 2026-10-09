import { validateDFA } from './dfaValidator';
import { DFA } from '../types/dfa';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    throw new Error(msg);
  }
}

console.log('--- TESTING DFA VALIDATOR ---');

// 1. Valid DFA test
{
  const validDfa: DFA = {
    states: ['q0', 'q1'],
    alphabet: ['0', '1'],
    startState: 'q0',
    finalStates: ['q1'],
    transitions: {
      q0: { '0': 'q0', '1': 'q1' },
      q1: { '0': 'q0', '1': 'q1' },
    },
  };
  const res = validateDFA(validDfa);
  assert(res.isValid, 'Valid DFA must pass validation');
  assert(res.errors.length === 0, 'No errors for valid DFA');
  console.log('✔ Valid DFA check passed');
}

// 2. Missing transition detection
{
  const dfa: DFA = {
    states: ['q0', 'q1'],
    alphabet: ['0', '1'],
    startState: 'q0',
    finalStates: ['q1'],
    transitions: {
      q0: { '0': 'q0' }, // missing transition on '1'
      q1: { '0': 'q0', '1': 'q1' },
    },
  };
  const res = validateDFA(dfa);
  assert(!res.isValid, 'DFA with missing transition must fail');
  assert(
    res.errors.some((e) => e.type === 'MISSING_TRANSITION' && e.message.includes('q0 --1--> ?')),
    'Identifies missing transition q0 --1--> ?'
  );
  console.log('✔ Missing transition detected correctly');
}

// 3. Invalid transition destination
{
  const dfa: DFA = {
    states: ['q0', 'q1'],
    alphabet: ['0', '1'],
    startState: 'q0',
    finalStates: ['q1'],
    transitions: {
      q0: { '0': 'q0', '1': 'q8' }, // q8 doesn't exist!
      q1: { '0': 'q0', '1': 'q1' },
    },
  };
  const res = validateDFA(dfa);
  assert(!res.isValid, 'DFA with invalid transition destination must fail');
  assert(
    res.errors.some((e) => e.type === 'INVALID_TRANSITION_TARGET' && e.message.includes('q0 --1--> q8')),
    'Identifies invalid destination q0 --1--> q8'
  );
  console.log('✔ Invalid transition destination detected correctly');
}

// 4. Duplicate state names
{
  const dfa: DFA = {
    states: ['q0', 'q1', 'q0'],
    alphabet: ['0', '1'],
    startState: 'q0',
    finalStates: ['q1'],
    transitions: {
      q0: { '0': 'q0', '1': 'q1' },
      q1: { '0': 'q0', '1': 'q1' },
    },
  };
  const res = validateDFA(dfa);
  assert(!res.isValid, 'Duplicate states must fail');
  assert(res.errors.some((e) => e.type === 'DUPLICATE_STATE'), 'Identifies duplicate state name');
  console.log('✔ Duplicate state names detected correctly');
}

// 5. Duplicate alphabet symbols
{
  const dfa: DFA = {
    states: ['q0', 'q1'],
    alphabet: ['a', 'b', 'a'],
    startState: 'q0',
    finalStates: ['q1'],
    transitions: {
      q0: { a: 'q0', b: 'q1' },
      q1: { a: 'q0', b: 'q1' },
    },
  };
  const res = validateDFA(dfa);
  assert(!res.isValid, 'Duplicate alphabet symbols must fail');
  assert(res.errors.some((e) => e.type === 'DUPLICATE_ALPHABET'), 'Identifies duplicate alphabet symbol');
  console.log('✔ Duplicate alphabet symbols detected correctly');
}

// 6. Invalid final states
{
  const dfa: DFA = {
    states: ['q0', 'q1'],
    alphabet: ['0', '1'],
    startState: 'q0',
    finalStates: ['q99'],
    transitions: {
      q0: { '0': 'q0', '1': 'q1' },
      q1: { '0': 'q0', '1': 'q1' },
    },
  };
  const res = validateDFA(dfa);
  assert(!res.isValid, 'Invalid final state must fail');
  assert(res.errors.some((e) => e.type === 'INVALID_FINAL_STATE'), 'Identifies invalid final state');
  console.log('✔ Invalid final state detected correctly');
}

// 7. Missing start state
{
  const dfa: DFA = {
    states: ['q0', 'q1'],
    alphabet: ['0', '1'],
    startState: '',
    finalStates: ['q1'],
    transitions: {
      q0: { '0': 'q0', '1': 'q1' },
      q1: { '0': 'q0', '1': 'q1' },
    },
  };
  const res = validateDFA(dfa);
  assert(!res.isValid, 'Missing start state must fail');
  assert(res.errors.some((e) => e.type === 'MISSING_START_STATE'), 'Identifies missing start state');
  console.log('✔ Missing start state detected correctly');
}

// 8. Invalid start state
{
  const dfa: DFA = {
    states: ['q0', 'q1'],
    alphabet: ['0', '1'],
    startState: 'q_invalid',
    finalStates: ['q1'],
    transitions: {
      q0: { '0': 'q0', '1': 'q1' },
      q1: { '0': 'q0', '1': 'q1' },
    },
  };
  const res = validateDFA(dfa);
  assert(!res.isValid, 'Invalid start state must fail');
  assert(res.errors.some((e) => e.type === 'INVALID_START_STATE'), 'Identifies invalid start state');
  console.log('✔ Invalid start state detected correctly');
}

console.log('--- ALL DFA VALIDATOR TESTS PASSED! ---');
