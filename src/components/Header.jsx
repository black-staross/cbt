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
        {/* 좌측 CBT 로고 및 '언제나 CBT' 브랜딩 */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onGoHome}
            title="언제나 CBT 홈으로 이동"
            className="flex items-center gap-2 text-slate-900 dark:text-white transition-opacity hover:opacity-85 cursor-pointer group shrink-0"
          >
            {/* 유러피안 미니멀 CBT 배지 */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 text-white dark:text-slate-950 flex items-center justify-center font-black tracking-tighter text-[11px] sm:text-xs shadow-md shadow-slate-900/10 dark:shadow-white/10 group-hover:scale-105 transition-transform border border-white/20 dark:border-transparent shrink-0">
              CBT
            </div>
            
            {/* 언제나 CBT 메인 타이틀 (시험 응시 중 모바일 좁은 화면에서는 아이콘 배지에 공간 집중) */}
            <div className={`text-left flex-col ${currentExam ? 'hidden sm:flex' : 'flex'}`}>
              <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                언제나 CBT
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider">
                국가공인 자격검정
              </span>
            </div>
          </button>

          {currentExam && (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l border-slate-300/80 dark:border-white/15 min-w-0">
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate max-w-[100px] xs:max-w-[130px] sm:max-w-[200px]">
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
