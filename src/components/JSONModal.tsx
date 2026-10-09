import React, { useState } from 'react';
import { DFA } from '../types/dfa';
import { validateDFA } from '../utils/dfaValidator';
import { X, Copy, Check, Upload, Download, AlertCircle } from 'lucide-react';

interface JSONModalProps {
  isOpen: boolean;
  onClose: () => void;
  dfa: DFA;
  onImportDFA: (imported: DFA) => void;
  mode: 'import' | 'export';
}

export const JSONModal: React.FC<JSONModalProps> = ({
  isOpen,
  onClose,
  dfa,
  onImportDFA,
  mode,
}) => {
  const [jsonText, setJsonText] = useState(
    mode === 'export' ? JSON.stringify(dfa, null, 2) : ''
  );
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Update text when dfa or mode changes
  React.useEffect(() => {
    if (mode === 'export') {
      setJsonText(JSON.stringify(dfa, null, 2));
    } else {
      setJsonText('');
    }
    setErrorMsg(null);
    setCopied(false);
  }, [mode, dfa, isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dfa-configuration-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      setErrorMsg(null);
    };
    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    try {
      const parsed = JSON.parse(jsonText);

      // Basic structure check
      if (
        !parsed ||
        !Array.isArray(parsed.states) ||
        !Array.isArray(parsed.alphabet) ||
        typeof parsed.startState !== 'string' ||
        !Array.isArray(parsed.finalStates) ||
        typeof parsed.transitions !== 'object'
      ) {
        setErrorMsg('Invalid JSON format: Must contain states, alphabet, startState, finalStates, and transitions.');
        return;
      }

      const candidateDFA: DFA = {
        states: parsed.states.map(String),
        alphabet: parsed.alphabet.map(String),
        startState: String(parsed.startState),
        finalStates: parsed.finalStates.map(String),
        transitions: parsed.transitions,
      };

      const validation = validateDFA(candidateDFA);
      if (!validation.isValid) {
        setErrorMsg(`Imported DFA failed validation: ${validation.errors[0]?.message}`);
        return;
      }

      onImportDFA(candidateDFA);
      onClose();
    } catch (e: any) {
      setErrorMsg(`JSON Parse Error: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">
              {mode === 'export' ? 'Export DFA (JSON)' : 'Import DFA (JSON)'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'export'
                ? 'Copy or download the complete DFA specification in JSON format.'
                : 'Upload or paste a valid DFA JSON specification to load it into the engine.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Import file picker */}
        {mode === 'import' && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
            <Upload className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="flex-1">
              <span className="font-medium text-slate-200">Load from file:</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="ml-2 text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200 file:cursor-pointer hover:file:bg-slate-700"
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Text Area */}
        <div>
          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setErrorMsg(null);
            }}
            readOnly={mode === 'export'}
            rows={10}
            placeholder='Paste DFA JSON definition here... e.g. { "states": ["q0", "q1"], "alphabet": ["0", "1"], ... }'
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-hidden focus:border-blue-500 leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {mode === 'export' ? (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </>
            ) : (
              <span className="text-[11px] text-slate-500">
                JSON will be validated before applying.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg transition"
            >
              Cancel
            </button>
            {mode === 'import' && (
              <button
                onClick={handleApplyImport}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white shadow-md shadow-blue-600/30 transition"
              >
                Apply Import
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
