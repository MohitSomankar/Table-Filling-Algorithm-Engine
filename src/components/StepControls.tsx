import React, { useEffect, useState } from 'react';
import { AlgorithmStep } from '../types/dfa';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward, CheckCircle2 } from 'lucide-react';

interface StepControlsProps {
  steps: AlgorithmStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
}

export const StepControls: React.FC<StepControlsProps> = ({
  steps,
  currentStepIndex,
  onStepChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // 1000ms

  const totalSteps = steps.length;
  const currentStep = steps[currentStepIndex] || steps[0];
  const isAtEnd = currentStepIndex === totalSteps - 1;
  const isAtStart = currentStepIndex === 0;

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      if (currentStepIndex >= totalSteps - 1) {
        setIsPlaying(false);
      } else {
        timer = setTimeout(() => {
          onStepChange(currentStepIndex + 1);
        }, playbackSpeed);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStepIndex, totalSteps, playbackSpeed, onStepChange]);

  const togglePlay = () => {
    if (isAtEnd) {
      onStepChange(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Top row: Step Title & Step Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 border border-blue-800/50 px-2 py-0.5 rounded">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <h3 className="text-sm font-semibold text-white">{currentStep.title}</h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Step Status Chip */}
        <div className="shrink-0 flex items-center gap-2">
          {isAtEnd ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2.5 py-1 rounded-lg font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Minimization Complete</span>
            </span>
          ) : (
            <span className="text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-lg">
              {currentStep.unmarkedPairs.length} pairs unmarked
            </span>
          )}
        </div>
      </div>

      {/* Control Buttons & Timeline Slider */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStepChange(0)}
            disabled={isAtStart}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
            title="Reset to beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
            disabled={isAtStart}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
            title="Previous step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white shadow-md shadow-blue-600/30 transition active:scale-95"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isAtEnd ? 'Replay' : 'Auto Play'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => onStepChange(Math.min(totalSteps - 1, currentStepIndex + 1))}
            disabled={isAtEnd}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
            title="Next step"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => onStepChange(totalSteps - 1)}
            disabled={isAtEnd}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
            title="Jump to complete result"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Step Slider */}
        <div className="flex-1 max-w-xs flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={totalSteps - 1}
            value={currentStepIndex}
            onChange={(e) => {
              setIsPlaying(false);
              onStepChange(Number(e.target.value));
            }}
            className="w-full accent-blue-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-mono text-slate-400 shrink-0">
            {currentStepIndex + 1}/{totalSteps}
          </span>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Speed:</span>
          <button
            onClick={() => setPlaybackSpeed(1400)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono ${
              playbackSpeed === 1400 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
            }`}
          >
            0.7x
          </button>
          <button
            onClick={() => setPlaybackSpeed(800)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono ${
              playbackSpeed === 800 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
            }`}
          >
            1x
          </button>
          <button
            onClick={() => setPlaybackSpeed(400)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono ${
              playbackSpeed === 400 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
            }`}
          >
            2x
          </button>
        </div>
      </div>
    </div>
  );
};
