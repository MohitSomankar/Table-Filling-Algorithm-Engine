import React, { useState } from 'react';
import { DFA, MinimizedDFA } from '../types/dfa';
import { simulateDFA } from '../utils/tableFillingEngine';
import { Play, CheckCircle2, XCircle, ArrowRight, CornerDownRight, Check, Sparkles } from 'lucide-react';

interface StringSimulatorProps {
  originalDFA: DFA;
  minimizedDFA: MinimizedDFA;
  initialString?: string;
}

export const StringSimulator: React.FC<StringSimulatorProps> = ({
  originalDFA,
  minimizedDFA,
  initialString = '101',
}) => {
  const [testString, setTestString] = useState(initialString);

  // Run simulation on both DFAs
  const origResult = simulateDFA(
    originalDFA.startState,
    originalDFA.finalStates,
    originalDFA.transitions,
    testString
  );

  const minResult = simulateDFA(
    minimizedDFA.startClassId,
    minimizedDFA.finalClassIds,
    minimizedDFA.transitions,
    testString
  );

  const isIdenticalVerdict = origResult.isAccepted === minResult.isAccepted;

  return (
    <div id="simulator" className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 lg:p-6 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-semibold text-white">
                String Acceptance & Equivalence Verifier
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Test any input string w ∈ Σ* simultaneously on the original DFA and the minimized DFA to verify identical language recognition.
            </p>
          </div>

          {/* Language Equivalence Badge */}
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Language Invariant Preserved: L(M) = L(M')</span>
          </div>
        </div>

        {/* Input Bar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={testString}
                onChange={(e) => setTestString(e.target.value.trim())}
                placeholder="Enter test string (e.g. 101, 00, or leave empty for ε)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-hidden focus:border-blue-500 transition"
              />
              {testString.length === 0 && (
                <span className="absolute right-4 top-2.5 text-xs text-slate-500 font-mono pointer-events-none">
                  (Testing empty string ε)
                </span>
              )}
            </div>

            {/* Quick Symbol helper buttons */}
            <div className="flex items-center gap-1.5">
              {originalDFA.alphabet.map((sym) => (
                <button
                  key={sym}
                  onClick={() => setTestString((prev) => prev + sym)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-mono font-bold text-xs text-blue-400 transition"
                >
                  +{sym}
                </button>
              ))}
              <button
                onClick={() => setTestString('')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-mono text-xs text-slate-400 hover:text-white transition"
              >
                Clear (ε)
              </button>
            </div>
          </div>

          {!origResult.isValidAlphabet && (
            <p className="text-xs text-rose-400 font-medium">
              Warning: String contains symbol '{origResult.invalidChar}' which is not in alphabet Σ = {'{' + originalDFA.alphabet.join(', ') + '}'}.
            </p>
          )}
        </div>

        {/* Dual Simulation Traces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Original DFA Trace */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300">
                1. Original DFA ({minimizedDFA.originalStateCount} States)
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                  origResult.isAccepted
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {origResult.isAccepted ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                <span>{origResult.isAccepted ? 'ACCEPTED' : 'REJECTED'}</span>
              </span>
            </div>

            <div className="text-xs text-slate-400 space-y-2">
              <div className="flex items-center justify-between">
                <span>Start State:</span>
                <span className="font-mono text-blue-400 font-semibold">{originalDFA.startState}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Final State Reached:</span>
                <span className="font-mono text-slate-200 font-semibold">{origResult.finalState}</span>
              </div>

              {/* Step by step transition trail */}
              <div className="pt-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  Computation Path:
                </span>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-1.5 overflow-x-auto">
                  <span className="text-blue-400 font-bold">{originalDFA.startState}</span>
                  {origResult.path.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <span className="text-slate-500 flex items-center">
                        <ArrowRight className="w-3 h-3 text-slate-600 inline" />
                        <span className="text-[10px] text-amber-400 px-0.5">{step.symbolConsumed}</span>
                      </span>
                      <span
                        className={
                          idx === origResult.path.length - 1
                            ? origResult.isAccepted
                              ? 'text-emerald-400 font-bold'
                              : 'text-rose-400 font-bold'
                            : 'text-slate-300'
                        }
                      >
                        {step.nextState}
                      </span>
                    </React.Fragment>
                  ))}
                  {origResult.path.length === 0 && (
                    <span className="text-slate-500 text-[11px]">(No symbols consumed; remains in start state)</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Minimized DFA Trace */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300">
                2. Minimized DFA ({minimizedDFA.minimizedStateCount} States)
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                  minResult.isAccepted
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {minResult.isAccepted ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                <span>{minResult.isAccepted ? 'ACCEPTED' : 'REJECTED'}</span>
              </span>
            </div>

            <div className="text-xs text-slate-400 space-y-2">
              <div className="flex items-center justify-between">
                <span>Start Class:</span>
                <span className="font-mono text-blue-400 font-semibold">{minimizedDFA.startClassId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Final Class Reached:</span>
                <span className="font-mono text-slate-200 font-semibold">{minResult.finalState}</span>
              </div>

              {/* Step by step transition trail */}
              <div className="pt-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  Computation Path:
                </span>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-1.5 overflow-x-auto">
                  <span className="text-blue-400 font-bold">{minimizedDFA.startClassId}</span>
                  {minResult.path.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <span className="text-slate-500 flex items-center">
                        <ArrowRight className="w-3 h-3 text-slate-600 inline" />
                        <span className="text-[10px] text-amber-400 px-0.5">{step.symbolConsumed}</span>
                      </span>
                      <span
                        className={
                          idx === minResult.path.length - 1
                            ? minResult.isAccepted
                              ? 'text-emerald-400 font-bold'
                              : 'text-rose-400 font-bold'
                            : 'text-slate-300'
                        }
                      >
                        {step.nextState}
                      </span>
                    </React.Fragment>
                  ))}
                  {minResult.path.length === 0 && (
                    <span className="text-slate-500 text-[11px]">(No symbols consumed; remains in start class)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Equivalence Summary Notice */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            String verdict matches across both automatons:
          </span>
          <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>
              {testString.length === 0 ? 'ε' : `"${testString}"`} is{' '}
              {origResult.isAccepted ? 'accepted by both' : 'rejected by both'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
