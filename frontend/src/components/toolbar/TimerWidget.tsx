import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { Play, Pause, RotateCcw, X, Clock, Plus } from 'lucide-react';

export const TimerWidget: React.FC = () => {
  const isTimerActive = useUIStore((s) => s.isTimerActive);
  const toggleTimer = useUIStore((s) => s.toggleTimer);

  const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutes default
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => Math.max(prev - 1, 0));
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  if (!isTimerActive) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const addMinutes = (mins: number) => {
    setSecondsLeft((prev) => prev + mins * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(300);
  };

  return (
    <div className="fixed top-18 right-6 z-50 bg-[#12141e]/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-3 flex items-center gap-3 text-slate-100 select-none animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-2">
        <Clock className={`w-4 h-4 ${isRunning ? 'text-amber-400 animate-spin' : 'text-slate-400'}`} />
        <span className="font-mono text-xl font-bold tracking-wider text-amber-300">
          {formattedTime}
        </span>
      </div>

      <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`p-1.5 rounded-lg text-white font-bold transition-colors ${
            isRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
          }`}
          title={isRunning ? 'Pause timer' : 'Start countdown'}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => addMinutes(1)}
          className="px-1.5 py-1 text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
          title="Add 1 minute"
        >
          +1m
        </button>

        <button
          onClick={handleReset}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Reset to 5:00"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={toggleTimer}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-red-900/40 rounded transition-colors ml-1"
          title="Close timer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
