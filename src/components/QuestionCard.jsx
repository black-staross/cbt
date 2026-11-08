import React, { useEffect, useRef, useState } from 'react';
import { 
  Bookmark, 
  Check, 
  X, 
  HelpCircle, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Table as TableIcon,
  CheckCircle2,
  Menu,
  Eye,
  EyeOff
} from 'lucide-react';

export default function QuestionCard({
  question,
  index,
  totalCount,
  userAnswer,
  onAnswer,
  mode = 'practice', // 'practice' | 'exam' | 'review'
  isBookmarked = false,
  onToggleBookmark,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  selfGraded,
  onToggleSelfGraded,
  // 햄버거 메뉴 연동 props
  subjects = [],
  questions = [],
  onSelectIndex,
  onFilterSubject,
  activeSubjectId = null
}) {
  const [showExplanation, setShowExplanation] = useState(mode === 'review');
  const [showAnswerNumberOnly, setShowAnswerNumberOnly] = useState(false);
  const [subjectiveInput, setSubjectiveInput] = useState(userAnswer || '');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnswerPopoverOpen, setIsAnswerPopoverOpen] = useState(false);
  const inputRef = useRef(null);

  // 문제 변경 시 상태 동기화
  useEffect(() => {
    setSubjectiveInput(userAnswer || '');
    if (mode === 'review') {
      setShowExplanation(true);
    } else if (mode === 'exam') {
      setShowExplanation(false);
      setShowAnswerNumberOnly(false);
    }
  }, [question?.id, userAnswer, mode]);

  // 객관식 1, 2, 3, 4 키보드 단축키 지원
  useEffect(() => {
    if (!question || question.type === 'subjective') return;

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const selected = parseInt(e.key, 10);
        onAnswer(question.id, selected);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question?.id, question?.type, onAnswer]);

  if (!question) return null;

  const isSubjective = question.type === 'subjective';

  // 주관식 자동 채점 검사
  const checkSubjectiveMatch = (input) => {
    if (!input || !question.accepted_answers) return false;
    const cleanInput = input.trim().toLowerCase().replace(/\s+/g, ' ');
    return question.accepted_answers.some(ans => 
      ans.trim().toLowerCase().replace(/\s+/g, ' ') === cleanInput
    );
  };

  const isAutoCorrect = isSubjective 
    ? checkSubjectiveMatch(userAnswer)
    : userAnswer === question.correct_answer;

  const isFinalCorrect = selfGraded !== undefined ? selfGraded : isAutoCorrect;
  const isAnswered = userAnswer !== undefined && userAnswer !== null && userAnswer !== '';

  const handleSubjectiveSubmit = (e) => {
    e?.preventDefault();
    if (!subjectiveInput.trim()) return;
    onAnswer(question.id, subjectiveInput.trim());
    setShowExplanation(true);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden transition-colors relative">
      {/* 상단 문항 메타 정보 바 (듣기/북마크 제거, 순수 시험 정보만 간결하게 표시) */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <div className="flex items-center gap-2">
          {question.session && (
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {question.session}
            </span>
          )}
          <span>•</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {question.chapter || question.subject_name || '기본 과목'}
          </span>
        </div>
        <div className="font-mono font-bold text-slate-600 dark:text-slate-300">
          {index + 1} / {totalCount}
        </div>
      </div>

      {/* 문항 본문 (스크롤 영역) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
        {/* 요구사항 8: 문제번호는 문제 지문 왼쪽에 붙여 */}
        <div className="flex items-start gap-2.5 sm:gap-3 text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-slate-50 leading-relaxed tracking-tight break-keep">
          <span className="font-mono font-black text-blue-600 dark:text-blue-400 shrink-0 text-lg sm:text-2xl leading-relaxed">
            Q{index + 1}.
          </span>
          <span className="flex-1 leading-relaxed">
            {question.question}
          </span>
        </div>

        {/* 데이터 테이블 (존재할 경우) */}
        {question.table_data && (
          <div className="overflow-x-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 shadow-xs">
            {question.table_data.title && (
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <TableIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>[{question.table_data.title}]</span>
              </div>
            )}
            <table className="w-full text-left text-xs sm:text-sm border-collapse font-mono">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 font-bold">
                  {question.table_data.headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 border-r last:border-r-0 border-slate-300 dark:border-slate-700">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {question.table_data.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 border-r last:border-r-0 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 코드 스니펫 터미널 (존재할 경우) */}
        {(question.code_snippet || question.code) && (() => {
          const rawCode = typeof question.code_snippet === 'object' && question.code_snippet !== null
            ? (question.code_snippet.code || '')
            : (question.code_snippet || question.code || '');
          
          return (
            <div className="rounded-xl overflow-hidden border border-slate-700 shadow-md my-3 bg-black">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-700 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="ml-1 text-[11px] font-bold">Code Terminal</span>
                </div>
              </div>
              <pre className="p-3.5 sm:p-4 text-emerald-400 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto whitespace-pre">
                <code>{rawCode}</code>
              </pre>
            </div>
          );
        })()}

        {/* 렌더러 분기: 객관식 vs 주관식 */}
        {!isSubjective ? (
          // ================= [객관식 4지선다] =================
          <div className="space-y-2.5 pt-1">
            {question.options?.map((optionText, optIdx) => {
              const optionNumber = optIdx + 1;
              const isSelected = userAnswer === optionNumber;
              const isCorrectOpt = optionNumber === question.correct_answer;
              
              // 요구사항 5: 정답보기 모드 활성화 시 정답 번호만 파란색으로 칠해짐
              const isAnswerNumberOnlyMode = showAnswerNumberOnly && isCorrectOpt;

              let cardStyle = 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600 text-slate-900 dark:text-slate-100';

              if (mode === 'exam') {
                if (isSelected) {
                  cardStyle = 'border-blue-600 dark:border-blue-500 bg-blue-50/80 dark:bg-blue-950/70 text-blue-950 dark:text-blue-100 font-bold';
                }
              } else if (showExplanation) {
                if (isCorrectOpt) {
                  cardStyle = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-100 font-bold';
                } else if (isSelected && !isCorrectOpt) {
                  cardStyle = 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/70 text-rose-950 dark:text-rose-100';
                }
              } else if (isSelected) {
                cardStyle = 'border-blue-600 dark:border-blue-500 bg-blue-50/80 dark:bg-blue-950/70 text-blue-950 dark:text-blue-100 font-bold';
              }

              return (
                <button
                  key={optionNumber}
                  type="button"
                  onClick={() => onAnswer(question.id, optionNumber)}
                  className={`w-full flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border text-left text-sm sm:text-base transition-colors cursor-pointer min-h-[48px] ${cardStyle}`}
                >
                  {/* 번호 동그라미: 정답보기 모드에서는 정답 번호만 파란색으로 칠해짐 */}
                  <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-mono text-xs font-black shrink-0 transition-colors mt-0.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isAnswerNumberOnlyMode
                        ? 'bg-blue-600 text-white border-2 border-blue-600 font-black shadow-xs'
                        : 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/80'
                  }`}>
                    {optionNumber}
                  </span>
                  <span className="flex-1 leading-relaxed pt-0.5 break-keep">{optionText}</span>
                  {showExplanation && (
                    <span className="shrink-0 pt-1">
                      {isCorrectOpt && <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />}
                      {isSelected && !isCorrectOpt && <X className="w-4 h-4 text-rose-500 stroke-[3]" />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          // ================= [주관식 단답형/코드추적] =================
          <div className="space-y-3 pt-1">
            <form onSubmit={handleSubjectiveSubmit} className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                정답 입력
              </label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={subjectiveInput}
                  onChange={(e) => setSubjectiveInput(e.target.value)}
                  placeholder="답안을 입력하세요"
                  className="flex-1 px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden font-mono text-sm sm:text-base font-bold shadow-xs"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shrink-0 cursor-pointer shadow-xs"
                >
                  입력
                </button>
              </div>
            </form>

            {/* 정답 번호/모범답안 표시 모드 */}
            {showAnswerNumberOnly && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 rounded-xl text-xs sm:text-sm text-blue-900 dark:text-blue-200 font-mono font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>표준 정답: {question.correct_answer || question.answer}</span>
              </div>
            )}

            {/* 주관식 자가 채점 */}
            {(showExplanation || mode !== 'exam') && isAnswered && (
              <div className="p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    자동 채점: {' '}
                    <span className={isAutoCorrect ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-rose-600 dark:text-rose-400 font-black'}>
                      {isAutoCorrect ? '일치' : '불일치'}
                    </span>
                  </span>
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-slate-500 px-1">자가채점:</span>
                    <button
                      type="button"
                      onClick={() => onToggleSelfGraded(question.id, true)}
                      className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${
                        isFinalCorrect ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      맞음
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleSelfGraded(question.id, false)}
                      className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${
                        !isFinalCorrect ? 'bg-rose-600 text-white' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      틀림
                    </button>
                  </div>
                </div>
                <div className="font-mono text-slate-700 dark:text-slate-300 text-xs">
                  • 모범 정답: <strong className="text-blue-600 dark:text-blue-400">{question.correct_answer}</strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 상세 해설 섹션 (하단 바에서 '정답 및 해설' 열었을 때 표시) */}
        {showExplanation && (
          <div className="pt-4 space-y-3 border-t border-slate-200 dark:border-slate-800 text-xs sm:text-sm animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-black">
              <HelpCircle className="w-4 h-4 text-blue-500" />
              <span>정답 및 상세 해설</span>
            </div>

            <div className="p-3.5 sm:p-4 bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 rounded-xl leading-relaxed text-slate-800 dark:text-slate-200 break-keep">
              <span className="font-black text-blue-700 dark:text-blue-300 block mb-1">
                정답: {question.correct_answer || question.answer} {!isSubjective && question.options?.[(question.correct_answer || question.answer) - 1] ? `(${question.options[(question.correct_answer || question.answer) - 1]})` : ''}
              </span>
              <p className="whitespace-pre-line">{question.explanation}</p>
            </div>

            {question.trap_avoidance && (
              <div className="p-3 sm:p-3.5 bg-amber-50/80 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 rounded-xl leading-relaxed text-amber-950 dark:text-amber-200 break-keep">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 mb-0.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>실전 오답 피하기</span>
                </div>
                <p>{question.trap_avoidance}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          요구사항 3, 4, 5, 7: 새로운 정돈된 하단 컨트롤 바
          [이전문제]  ---  [메뉴(햄버거)] [정답 및 해설] [북마크(아이콘만)]  ---  [다음문제]
         ========================================================================= */}
      <div className="relative flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-50/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md gap-1.5 sm:gap-3">
        {/* 좌측: 이전 문제 */}
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer min-h-[40px] shrink-0"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">이전</span>
        </button>

        {/* 가운데 3개 버튼 순서: [메뉴(햄버거)] [정답 및 해설] [북마크(아이콘만)] */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 1. 메뉴 버튼 (햄버거): 과목 선택 & 문항 바로가기 시트 */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(prev => !prev)}
            title="과목 선택 및 문항 이동 메뉴"
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors flex items-center gap-1.5 min-h-[40px] cursor-pointer ${
              isMenuOpen
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">과목·문항</span>
          </button>

          {/* 2. 정답 및 해설 버튼 (클릭 시 팝오버로 정답번호만 보기 vs 해설보기 선택) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAnswerPopoverOpen(prev => !prev)}
              title="정답 및 해설 선택"
              className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors flex items-center gap-1.5 min-h-[40px] cursor-pointer ${
                showAnswerNumberOnly || showExplanation
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>정답 및 해설</span>
            </button>

            {/* 정답 및 해설 선택 팝오버 */}
            {isAnswerPopoverOpen && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAnswerNumberOnly(prev => !prev);
                    setIsAnswerPopoverOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between text-left transition-colors cursor-pointer ${
                    showAnswerNumberOnly
                      ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-black'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>정답 번호만 보기</span>
                  {showAnswerNumberOnly && <Check className="w-4 h-4 text-blue-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowExplanation(prev => !prev);
                    setIsAnswerPopoverOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between text-left transition-colors cursor-pointer ${
                    showExplanation
                      ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-black'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>상세 정답 및 해설</span>
                  {showExplanation && <Check className="w-4 h-4 text-blue-600" />}
                </button>

                {(showAnswerNumberOnly || showExplanation) && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAnswerNumberOnly(false);
                      setShowExplanation(false);
                      setIsAnswerPopoverOpen(false);
                    }}
                    className="w-full px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-center transition-colors cursor-pointer"
                  >
                    모두 숨기기
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 3. 북마크 버튼 (아이콘만 남김, 북마크되면 파란색 채움) */}
          <button
            type="button"
            onClick={() => onToggleBookmark(question.id)}
            title={isBookmarked ? "북마크 해제" : "북마크 추가"}
            className={`p-2 sm:p-2.5 rounded-xl border transition-colors flex items-center justify-center min-h-[40px] min-w-[40px] cursor-pointer ${
              isBookmarked
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Bookmark className={`w-5 h-5 transition-colors ${
              isBookmarked ? 'fill-blue-600 text-blue-600' : ''
            }`} />
          </button>
        </div>

        {/* 우측: 다음 문제 */}
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer min-h-[40px] shrink-0 shadow-xs"
        >
          <span className="hidden xs:inline">다음</span>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* =========================================================================
          요구사항 3: 햄버거 메뉴 모달 (연습하기 과목 선택 & 문항 바로가기)
         ========================================================================= */}
      {isMenuOpen && (
        <div className="absolute inset-0 z-40 bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl max-h-[80%] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* 메뉴 헤더 */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Menu className="w-4 h-4 text-blue-600" />
                <span className="font-black text-sm text-slate-900 dark:text-white">과목 및 문항 바로가기</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 과목 선택 탭 (과목이 있을 경우) */}
            {subjects && subjects.length > 0 && (
              <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40">
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">시험 과목 선택:</div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {onFilterSubject && (
                    <button
                      type="button"
                      onClick={() => {
                        onFilterSubject(null);
                        setIsMenuOpen(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                        activeSubjectId === null
                          ? 'border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-black'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      전체 과목
                    </button>
                  )}
                  {subjects.map((sub, sIdx) => {
                    const isSubActive = activeSubjectId === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          if (onFilterSubject) {
                            onFilterSubject(sub.id);
                          } else {
                            const firstIdx = questions.findIndex(q => q.subject_id === sub.id);
                            if (firstIdx >= 0 && onSelectIndex) onSelectIndex(firstIdx);
                          }
                          setIsMenuOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                          isSubActive
                            ? 'border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-black'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {sIdx + 1}과목. {sub.name.replace(/^[0-9제]+\s*과목\s*/, '')}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 문항 번호 리스트 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">문항 바로 이동:</div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {questions.map((q, qIdx) => {
                  const isCurrent = qIdx === index;
                  const isQAnswered = q.id in (question ? {} : {}); // 작성 여부
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        if (onSelectIndex) onSelectIndex(qIdx);
                        setIsMenuOpen(false);
                      }}
                      className={`h-9 rounded-xl font-mono text-xs font-bold transition-colors flex items-center justify-center cursor-pointer border ${
                        isCurrent
                          ? 'border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-black'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {qIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
