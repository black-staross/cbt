import React from 'react';
import { Sparkles, Moon, Sun } from 'lucide-react';

export default function Header({
  currentExam,
  currentMode,
  onGoHome,
  onTimeUp,
  isPaused,
  onTogglePause,
  isDarkMode = false,
  onToggleDarkMode,
  examSecondsLeft
}) {
  const getModeLabel = () => {
    switch (currentMode) {
      case 'exam':
        return { label: '실전 CBT 모의고사', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' };
      case 'practice':
        return { label: '', color: '' }; // 요구사항: 연습하기에서 과목별 집중학습 문구 제거
      case 'unlimited':
        return { label: '무제한 연습', color: 'bg-blue-50/70 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-500/30' };
      case 'wrong':
        return { label: '오답노트 복습', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' };
      case 'bookmark':
        return { label: '북마크 복습', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' };
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
        {/* 좌측: 간결한 '어디서나 CBT' 메인 제목 (클릭 시 첫 화면 전체 자격증으로 복귀) */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onGoHome}
            title="첫 화면(전체 자격증)으로 이동"
            className="text-slate-900 dark:text-white hover:opacity-70 transition-opacity cursor-pointer shrink-0 py-1"
          >
            <span className="font-black text-base sm:text-lg tracking-tight leading-none">
              어디서나 CBT
            </span>
          </button>

          {currentExam && (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l border-slate-300 dark:border-white/15 min-w-0">
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[220px]">
                {currentExam.name}
              </span>
              {modeInfo.label && (
                <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border hidden md:inline shrink-0 ${modeInfo.color}`}>
                  {modeInfo.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 우측 영역: 다크모드 스위치 (요구사항: 상단 타이머는 제거하고 하단 바에만 배치) */}
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
        </div>
      </div>
    </header>
  );
}
