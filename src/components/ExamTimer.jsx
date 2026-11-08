import React, { useState, useEffect } from 'react';
import { Clock, Pause, Play, AlertTriangle } from 'lucide-react';

export default function ExamTimer({ 
  initialMinutes, 
  onTimeUp, 
  isExamMode = true,
  isPaused = false,
  onTogglePause 
}) {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    setSecondsLeft(initialMinutes * 60);
  }, [initialMinutes]);

  useEffect(() => {
    if (!isExamMode || isPaused) return;

    if (secondsLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, isExamMode, isPaused, onTimeUp]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const formattedTime = `${hours > 0 ? String(hours).padStart(2, '0') + ':' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // 10분 이하: 주황색, 5분 이하: 빨간색 및 점멸
  const isUrgent = secondsLeft <= 300; // 5분
  const isWarning = secondsLeft <= 600 && secondsLeft > 300; // 10분

  return (
    <div className={`flex items-center justify-between gap-1.5 sm:gap-2.5 px-2.5 py-1 sm:px-3.5 sm:py-2 rounded-xl transition-all border shrink-0 min-h-[34px] sm:min-h-[38px] ${
      isUrgent 
        ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 animate-pulse font-bold' 
        : isWarning 
          ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold' 
          : 'bg-slate-900 dark:bg-slate-900/90 border-slate-700/80 text-white shadow-md'
    }`}>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isUrgent ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-blue-400'}`} />
        <span className="text-[11px] sm:text-xs font-bold tracking-wide uppercase opacity-90 hidden xs:inline">
          {isExamMode ? '남은 시간' : '시험 시간'}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        <span className="font-mono text-sm sm:text-base font-black tracking-wider">
          {formattedTime}
        </span>

        {isExamMode && onTogglePause && (
          <button
            type="button"
            onClick={onTogglePause}
            title={isPaused ? '계속하기' : '일시정지'}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
          </button>
        )}
      </div>
    </div>
  );
}