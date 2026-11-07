import React from 'react';
import { Sparkles, Home, ListOrdered, FileSpreadsheet, ArrowLeft, Menu, Moon, Sun } from 'lucide-react';
import ExamTimer from './ExamTimer';

export default function Header({
  currentExam,
  currentMode,
  onGoHome,
  onTimeUp,
  isPaused,
  onTogglePause,
  onToggleMobileOmr,
  unansweredCount = 0,
  isDarkMode = false,
  onToggleDarkMode
}) {
  const getModeLabel = () => {
    switch (currentMode) {
      case 'exam':
        return { label: '실전 CBT 모의고사', color: 'bg-rose-500/10 text-rose-500 border-rose-500/30' };
      case 'practice':
        return { label: '단원별 즉시 학습', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' };
      case 'review':
        return { label: '오답노트 & 북마크', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30' };
      default:
        return { label: '홈', color: 'bg-slate-500/10 text-slate-500 border-slate-500/30' };
    }
  };

  const modeInfo = getModeLabel();

  return (
    <header className="sticky top-0 z-40 glass-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* 좌측 로고 및 시험 정보 */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-2 text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black tracking-tighter text-sm shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              CBT
            </div>
            <div className="text-left hidden sm:block">
              <span className="font-extrabold text-base tracking-tight block leading-tight text-slate-900 dark:text-white">PASS</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">자격검정 시뮬레이터</span>
            </div>
          </button>

          {currentExam && (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-300 dark:border-slate-700">
              <span className="font-extrabold text-slate-900 dark:text-slate-50 text-sm sm:text-base truncate max-w-[150px] sm:max-w-[240px]">
                {currentExam.name}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border hidden sm:inline ${modeInfo.color}`}>
                {modeInfo.label}
              </span>
            </div>
          )}
        </div>

        {/* 우측 영역: 타이머, 다크모드 스위치 및 컨트롤 */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* 다크모드 토글 버튼 */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
            className="p-2.5 rounded-xl text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 transition-all cursor-pointer border border-slate-300/80 dark:border-slate-700 flex items-center justify-center min-w-[40px] min-h-[40px]"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            ) : (
              <Moon className="w-4 h-4 text-slate-800" />
            )}
          </button>

          {currentExam && (
            <>
              {/* 모의고사 모드 시 카운트다운 타이머 */}
              <ExamTimer
                initialMinutes={currentExam.time_limit}
                onTimeUp={onTimeUp}
                isExamMode={currentMode === 'exam'}
                isPaused={isPaused}
                onTogglePause={onTogglePause}
              />

              {/* 모바일 OMR 토글 버튼 */}
              <button
                type="button"
                onClick={onToggleMobileOmr}
                className="md:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-500/20 min-h-[40px]"
              >
                <FileSpreadsheet className="w-4 h-4 text-white" />
                <span>OMR</span>
                {unansweredCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse"></span>
                )}
              </button>

              {/* 홈으로 나가기 버튼 */}
              <button
                type="button"
                onClick={onGoHome}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-200/70 dark:bg-slate-800/80 hover:bg-slate-300/70 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer min-h-[40px]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">종료/홈</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}