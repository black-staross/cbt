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
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/10 transition-colors duration-300 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* 좌측: 간결한 '언제나 CBT' 메인 제목 (클릭 시 첫 화면 전체 자격증으로 복귀) */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onGoHome}
            title="첫 화면(전체 자격증)으로 이동"
            className="text-slate-900 dark:text-white hover:opacity-70 transition-opacity cursor-pointer shrink-0 py-1"
          >
            <span className="font-black text-base sm:text-lg tracking-tight leading-none">
              언제나 CBT
            </span>
          </button>

          {currentExam && (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l border-slate-300 dark:border-white/15 min-w-0">
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[220px]">
                {currentExam.name}
              </span>
              <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border hidden md:inline shrink-0 ${modeInfo.color}`}>
                {modeInfo.label}
              </span>
            </div>
          )}
        </div>

        {/* 우측 영역: 타이머, 다크모드 스위치 및 모바일 컨트롤 */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* 다크모드 토글 스위치 */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
            className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-slate-700 dark:text-slate-200 bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 transition-all cursor-pointer border border-slate-200/80 dark:border-white/10 flex items-center justify-center min-w-[34px] min-h-[34px] sm:min-w-[38px] sm:min-h-[38px]"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-blue-500 fill-blue-500/20" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {currentExam && (
            <>
              {/* 타이머: 시험보기(exam) 모드일 때만 자동 실행 및 노출, 연습하기 모드는 타이머 없는 버전 */}
              {currentMode === 'exam' && (
                <ExamTimer
                  initialMinutes={currentExam.time_limit}
                  onTimeUp={onTimeUp}
                  isExamMode={true}
                  isPaused={isPaused}
                  onTogglePause={onTogglePause}
                />
              )}

              {/* 모바일 OMR 토글 버튼 */}
              <button
                type="button"
                onClick={onToggleMobileOmr}
                className="md:hidden flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black transition-all shadow-md shadow-slate-900/10 min-h-[34px] sm:min-h-[38px]"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
