import React from 'react';
import { Layers, ChevronRight } from 'lucide-react';

export default function SubjectTabBar({
  subjects = [],
  questions = [],
  currentIndex = 0,
  onSelectIndex,
  answers = {}
}) {
  if (!subjects || subjects.length <= 1) return null;

  // 현재 문제의 과목 id 판별
  const currentQuestion = questions[currentIndex];
  const currentSubjectId = currentQuestion?.subject_id || 1;

  // 각 과목별 첫 문제 인덱스 및 답변 완료 수 계산
  const subjectMeta = subjects.map((sub) => {
    // 해당 과목에 속하는 문제들
    const subQuestions = questions.filter(q => q.subject_id === sub.id);
    const firstIndex = questions.findIndex(q => q.subject_id === sub.id);
    
    // 마킹 완료된 문항 수
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
    <div className="w-full bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md px-3 sm:px-4 py-2 select-none">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex items-center gap-1 text-[11px] font-black text-slate-500 dark:text-slate-400 shrink-0 mr-1 hidden sm:flex">
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span>과목:</span>
        </div>

        {subjectMeta.map((sub, idx) => {
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => {
                if (sub.firstIndex >= 0) {
                  onSelectIndex(sub.firstIndex);
                }
              }}
              title={`${sub.name} (클릭 시 1번 문제로 이동)`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer min-h-[34px] shrink-0 border ${
                sub.isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-[1.02]'
                  : sub.isComplete
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-black ${
                sub.isActive 
                  ? 'bg-white text-blue-600' 
                  : sub.isComplete
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}>
                {idx + 1}
              </span>
              <span className="truncate max-w-[120px] sm:max-w-[180px]">{sub.name}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                sub.isActive 
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
    </div>
  );
}
