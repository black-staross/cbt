import React, { useState } from 'react';
import { CheckCircle2, Bookmark, AlertCircle, X, ChevronRight, FileCheck, Layers } from 'lucide-react';

export default function OMRCard({
  questions = [],
  currentIndex = 0,
  onSelectQuestion,
  answers = {},
  bookmarks = [],
  onSubmitExam,
  isSubjective = false,
  isMobileOpen = false,
  onCloseMobile
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'unanswered' | 'bookmarks'

  const totalCount = questions.length;
  
  // 마킹 완료 여부 계산
  const isQuestionAnswered = (q) => {
    const ans = answers[q.id];
    if (ans === undefined || ans === null) return false;
    if (typeof ans === 'string') return ans.trim().length > 0;
    return true;
  };

  const answeredCount = questions.filter(isQuestionAnswered).length;
  const unansweredCount = totalCount - answeredCount;

  // 필터링 적용 목록
  const filteredQuestions = questions.filter((q) => {
    if (filter === 'unanswered') return !isQuestionAnswered(q);
    if (filter === 'bookmarks') return bookmarks.includes(q.id);
    return true;
  });

  // 과목별 그룹핑 (과목이 2개 이상일 때)
  const hasMultipleSubjects = new Set(questions.map(q => q.subject_id || q.subject_name)).size > 1;

  // 과목별 문항 분할 매핑
  const subjectGroups = [];
  if (hasMultipleSubjects && filter === 'all') {
    const map = new Map();
    questions.forEach((q, idx) => {
      const subKey = q.subject_id || 1;
      const subName = q.subject_name || q.chapter || `제${subKey}과목`;
      if (!map.has(subKey)) {
        map.set(subKey, {
          id: subKey,
          name: subName,
          items: []
        });
      }
      map.get(subKey).items.push({ q, realIndex: idx });
    });
    subjectGroups.push(...map.values());
  }

  const getSubIndex = (q) => {
    if (!q || q.subject_id == null) return null;
    const sameSub = questions.filter(item => item.subject_id === q.subject_id);
    const idx = sameSub.findIndex(item => item.id === q.id);
    return idx >= 0 ? idx + 1 : null;
  };

  const renderQuestionItem = (q, realIndex, customSubIndex) => {
    const isCurrent = realIndex === currentIndex;
    const hasAnswer = isQuestionAnswered(q);
    const currentAnswer = answers[q.id];
    const isBookmarked = bookmarks.includes(q.id);
    const subIdx = customSubIndex !== undefined ? customSubIndex : getSubIndex(q);
    const displayNum = subIdx != null ? subIdx : realIndex + 1;

    return (
      <div
        key={q.id}
        onClick={() => {
          onSelectQuestion(realIndex);
          if (isMobileOpen && onCloseMobile) onCloseMobile();
        }}
        className={`flex items-center justify-between px-3.5 py-2.5 sm:py-3 rounded-2xl cursor-pointer text-xs sm:text-sm transition-all border min-h-[46px] ${
          isCurrent
            ? 'bg-blue-50/95 dark:bg-blue-950/90 border-blue-600 dark:border-blue-400 text-blue-950 dark:text-blue-50 ring-2 ring-blue-500/40 font-black shadow-md'
            : hasAnswer
              ? 'bg-slate-50/90 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700'
              : 'bg-white/60 dark:bg-slate-900/60 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={`w-7 text-left font-mono font-black text-xs sm:text-sm ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
            {String(displayNum).padStart(2, '0')}
          </span>
          {isBookmarked && (
            <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
          )}
        </div>

        {/* 마킹 표시 */}
        <div className="flex items-center gap-1.5">
          {isSubjective ? (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono truncate max-w-[130px] ${
              hasAnswer 
                ? 'bg-slate-900 dark:bg-slate-700 text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 italic'
            }`}>
              {hasAnswer ? currentAnswer : '미작성'}
            </span>
          ) : (
            // 4지선다 OMR 마킹 시각화 (손가락으로 쉽게 인지할 수 있는 크기)
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((num) => {
                const isSelected = currentAnswer === num;
                return (
                  <span
                    key={num}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-mono text-xs font-black border transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30'
                        : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 bg-white/90 dark:bg-slate-800/90'
                    }`}
                  >
                    {num}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full glass-card rounded-3xl shadow-xl overflow-hidden select-none transition-colors ${
      isMobileOpen ? 'fixed inset-0 z-50 p-4 bg-slate-950/70 backdrop-blur-xl' : ''
    }`}>
      {/* 모바일 컨테이너 래퍼 */}
      <div className={`flex flex-col h-full glass-card rounded-3xl overflow-hidden ${
        isMobileOpen ? 'max-w-md w-full mx-auto my-auto max-h-[90vh] shadow-2xl' : ''
      }`}>
        {/* OMR 상단 헤더 (요구사항 7: OMR과 문항 바로보기 기능 통합) */}
        <div className="p-4 bg-slate-50/60 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">OMR 답안 및 문항 바로보기</h3>
            </div>
            
            {isMobileOpen && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1 rounded-xl text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* 마킹 진행률 바 & 요약 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold">
              <span>작성 완료: <strong className="text-blue-600 dark:text-blue-400 font-black">{answeredCount}</strong> / {totalCount}</span>
              <span className={unansweredCount > 0 ? "text-amber-600 dark:text-amber-400 font-black" : "text-emerald-600 dark:text-emerald-400 font-black"}>
                {unansweredCount > 0 ? `미표기 ${unansweredCount}문항` : '전 문항 표기완료'}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${totalCount > 0 ? (answeredCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* 필터 탭 */}
          <div className="grid grid-cols-3 gap-1 mt-3.5 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm font-bold backdrop-blur-md">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                filter === 'all' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-black' 
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              전체 ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unanswered')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                filter === 'unanswered' 
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm font-black' 
                  : 'text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              미표기 ({unansweredCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('bookmarks')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                filter === 'bookmarks' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-black' 
                  : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              북마크 ({bookmarks.length})
            </button>
          </div>
        </div>

        {/* 문항 번호 그리드 리스트 (과목별 섹션 헤더 포함) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-3">
          {hasMultipleSubjects && filter === 'all' ? (
            // 과목별로 묶어서 표시
            subjectGroups.map((group) => {
              const subAnswered = group.items.filter(({ q }) => isQuestionAnswered(q)).length;
              const subTotal = group.items.length;
              const isSubDone = subAnswered >= subTotal;

              return (
                <div key={group.id} className="space-y-1.5 pt-1">
                  {/* 과목 구분 헤더 */}
                  <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/40 dark:border-slate-700/60 text-xs font-black text-slate-800 dark:text-slate-200">
                    <span className="truncate">{group.name}</span>
                    <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                      isSubDone ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {subAnswered}/{subTotal}
                    </span>
                  </div>

                  {/* 해당 과목 문항 리스트 (과목별 1부터 문항번호 매김) */}
                  <div className="space-y-1.5">
                    {group.items.map(({ q, realIndex }, itemIdx) => renderQuestionItem(q, realIndex, itemIdx + 1))}
                  </div>
                </div>
              );
            })
          ) : filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="w-8 h-8 stroke-[1.5] mb-2 text-slate-400" />
              해당하는 문항이 없습니다.
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const realIndex = questions.findIndex(item => item.id === q.id);
              return renderQuestionItem(q, realIndex);
            })
          )}
        </div>

        {/* OMR 하단 최종 제출 버튼 */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800 space-y-2 backdrop-blur-md">
          {unansweredCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 justify-center">
              <AlertCircle className="w-4 h-4" />
              <span>미표기 문항이 {unansweredCount}개 남아있습니다.</span>
            </div>
          )}
          <button
            type="button"
            onClick={onSubmitExam}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm sm:text-base font-black rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer min-h-[48px]"
          >
            <FileCheck className="w-5 h-5" />
            <span>최종 답안 제출하기</span>
            <ChevronRight className="w-5 h-5 opacity-80 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
