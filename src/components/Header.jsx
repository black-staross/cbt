import React from 'react';
import { Sparkles, Moon, Sun, FileSpreadsheet } from 'lucide-react';
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
        return { label: '실전 CBT 모의고사', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' };
      case 'practice':
        return { label: '과목별 집중 학습', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
      case 'review':
        return { label: '오답노트 & 북마크', color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' };
      default:
        return { label: '홈', color: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30' };
    }
  };

  const modeInfo = getModeLabel();

  return (
    <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* 좌측 CBT 로고 및 국가공인 자격검정 CBT 문구 */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-2.5 text-slate-900 dark:text-white transition-opacity hover:opacity-85 cursor-pointer group"
          >
            {/* 유러피안 미니멀 CBT 배지 */}
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 text-white dark:text-slate-950 flex items-center justify-center font-black tracking-tighter text-xs shadow-md shadow-slate-900/10 dark:shadow-white/10 group-hover:scale-105 transition-transform border border-white/20 dark:border-transparent">
              CBT
            </div>
            
            {/* 사용자 요청 1: cbt 버튼 옆에 '국가공인 자격검정 CBT' 문구 */}
            <div className="text-left flex flex-col">
              <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                국가공인 자격검정 CBT
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">
                Official Examination Suite
              </span>
            </div>
          </button>

          {currentExam && (
            <div className="flex items-center gap-2 pl-3 ml-1 border-l border-slate-300/80 dark:border-white/15">
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate max-w-[140px] sm:max-w-[220px]">
                {currentExam.name}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border hidden sm:inline ${modeInfo.color}`}>
                {modeInfo.label}
              </span>
            </div>
          )}
        </div>

        {/* 우측 영역: 타이머, 다크모드 스위치 및 모바일 컨트롤 */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* 다크모드 토글 스위치 */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
            className="p-2.5 rounded-2xl text-slate-700 dark:text-slate-200 bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 transition-all cursor-pointer border border-slate-200/80 dark:border-white/10 flex items-center justify-center min-w-[38px] min-h-[38px]"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {currentExam && (
            <>
              {/* 타이머 */}
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
                className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black transition-all shadow-md shadow-slate-900/10 min-h-[38px]"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>OMR</span>
                {unansweredCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
