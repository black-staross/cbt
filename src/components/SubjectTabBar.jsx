import React from 'react';
import { Layers, ChevronRight, CheckCircle2, Eye, Filter } from 'lucide-react';

export default function SubjectTabBar({
  subjects = [],
  questions = [],
  currentIndex = 0,
  onSelectIndex,
  answers = {},
  selectedYear,
  activeFilterSubjectId = null,
  onFilterSubject = null
}) {
  if (!subjects || subjects.length <= 1) return null;

  // 현재 문제의 과목 id 판별
  const currentQuestion = questions[currentIndex];
  const currentSubjectId = currentQuestion?.subject_id || 1;

  // 각 과목별 메타데이터 계산
  const subjectMeta = subjects.map((sub) => {
    const subQuestions = questions.filter(q => q.subject_id === sub.id);
    const firstIndex = questions.findIndex(q => q.subject_id === sub.id);
    
    // 마킹 완료 문항 수
    const answeredCount = subQuestions.filter(q => {
      const a = answers[q.id];
      if (a === undefined || a === null) return false;
      if (typeof a === 'string') return a.trim().length > 0;
      return true;
    }).length;

    const totalCount = subQuestions.length || sub.question_count;

    return {
      ...sub,
      firstIndex: firstIndex >= 0 ? firstIndex : 0,
      totalCount,
      answeredCount,
      isComplete: answeredCount >= totalCount && totalCount > 0,
      isActive: currentSubjectId === sub.id
    };
  });

  return (
    <div className="w-full bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md px-2.5 sm:px-4 py-1.5 sm:py-2 select-none sticky top-14 sm:top-16 z-30 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* 과목 바로가기 탭 리스트 */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5">
          {/* 전체 보기 탭 (전체 문항 모드일 때) */}
          {onFilterSubject && (
            <button
              type="button"
              onClick={() => onFilterSubject(null)}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer min-h-[32px] sm:min-h-[34px] shrink-0 border ${
                activeFilterSubjectId === null
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>전체 풀세트 ({questions.length}제)</span>
            </button>
          )}

          {subjectMeta.map((sub, idx) => {
            const isFilterActive = activeFilterSubjectId === sub.id;
            const isCurrentActive = activeFilterSubjectId === null && sub.isActive;

            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => {
                  if (onFilterSubject) {
                    if (sub.firstIndex >= 0) {
                      onSelectIndex(sub.firstIndex);
                    }
                  } else if (sub.firstIndex >= 0) {
                    onSelectIndex(sub.firstIndex);
                  }
                }}
                title={`${sub.name} (클릭 시 해당 과목으로 이동)`}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer min-h-[32px] sm:min-h-[34px] shrink-0 border ${
                  isCurrentActive || isFilterActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-[1.01]'
                    : sub.isComplete
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                      : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                }`}
              >
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-black shrink-0 ${
                  isCurrentActive || isFilterActive
                    ? 'bg-white text-blue-600' 
                    : sub.isComplete
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}>
                  {idx + 1}
                </span>
                <span className="truncate max-w-[100px] xs:max-w-[130px] sm:max-w-[180px]">{sub.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md shrink-0 ${
                  isCurrentActive || isFilterActive
                    ? 'bg-blue-700/80 text-white' 
                    : sub.isComplete
                      ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {sub.answeredCount}/{sub.totalCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* 연도 표기 배지 */}
        {selectedYear && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-black shrink-0">
            <span>{selectedYear}년 기출</span>
          </div>
        )}
      </div>
    </div>
  );
}
