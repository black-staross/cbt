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
  mode = 'practice', // 'practice' | 'exam' | 'review' | 'wrong' | 'bookmark'
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
  const isReviewMode = mode === 'review' || mode === 'wrong' || mode === 'bookmark';
  const [showExplanation, setShowExplanation] = useState(isReviewMode);
  const [subjectiveInput, setSubjectiveInput] = useState(userAnswer || '');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const inputRef = useRef(null);

  // 문제 변경 시 상태 동기화
  useEffect(() => {
    setSubjectiveInput(userAnswer || '');
    if (isReviewMode) {
      setShowExplanation(true);
    } else if (mode === 'exam') {
      setShowExplanation(false);
    }
  }, [question?.id, userAnswer, mode, isReviewMode]);

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

  // 요구사항 6: 전체 시험볼 때 과목 내 몇 번째 문제인지 계산하여 구분 표시
  const currentSubjectId = question?.subject_id;
  const sameSubjectQuestions = currentSubjectId != null && questions?.length > 0
    ? questions.filter(q => q.subject_id === currentSubjectId)
    : [];

  const isSubjectGrouped = sameSubjectQuestions.length > 0;
  const subjectQuestionIndex = isSubjectGrouped
    ? sameSubjectQuestions.findIndex(q => q.id === question.id) + 1
    : index + 1;
  const subjectQuestionTotal = isSubjectGrouped
    ? sameSubjectQuestions.length
    : totalCount;

  let subjectLabel = question?.chapter || question?.subject_name || '';
  if (!subjectLabel && currentSubjectId != null) {
    const subObj = subjects?.find(s => s.id === currentSubjectId);
    subjectLabel = subObj?.name || `${currentSubjectId}과목`;
  }
  const subjectNumMatch = subjectLabel.match(/(?:제\s*)?([0-9]+)\s*과목/);
  const subjectPrefix = subjectNumMatch ? `${subjectNumMatch[1]}과목` : (currentSubjectId ? `${currentSubjectId}과목` : '');

  const handleSubjectiveSubmit = (e) => {
    e?.preventDefault();
    if (!subjectiveInput.trim()) return;
    onAnswer(question.id, subjectiveInput.trim());
    setShowExplanation(true);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden transition-colors relative">
      {/* 상단 문항 메타 정보 바 (요구사항 6: 과목별 몇 번째 문항인지 명확히 구분 표시) */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <div className="flex items-center gap-2">
          {question.session && (
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {question.session}
            </span>
          )}
          <span>•</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {subjectLabel || '기본 과목'}
          </span>
        </div>
        <div className="font-mono font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 text-xs sm:text-sm">
          {isSubjectGrouped ? (
            <>
              <span className="text-blue-600 dark:text-blue-400 font-black">
                {subjectPrefix ? `${subjectPrefix} ` : ''}{subjectQuestionIndex}번
              </span>
              <span className="text-slate-400 font-normal">/ {subjectQuestionTotal}문항</span>
              <span className="text-slate-400 font-normal text-[11px] ml-1 hidden xs:inline">
                (전체 {index + 1}/{totalCount})
              </span>
            </>
          ) : (
            <span>{index + 1} / {totalCount}</span>
          )}
        </div>
      </div>

      {/* 문항 본문 (스크롤 영역) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
        {/* 요구사항 6, 8: 문제번호 지문 왼쪽에 배치 + 과목 내 번호 안내 */}
        <div className="flex items-start gap-2.5 sm:gap-3 text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-slate-50 leading-relaxed tracking-tight break-keep">
          <div className="flex flex-col items-start shrink-0">
            <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-lg sm:text-2xl leading-relaxed">
              Q{index + 1}.
            </span>
            {isSubjectGrouped && (
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap -mt-1">
                {subjectPrefix} {subjectQuestionIndex}번
              </span>
            )}
          </div>
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
                  <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-mono text-xs font-black shrink-0 transition-colors mt-0.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
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
          요구사항 4: 사진 스타일의 바닥에서 띄운 둥근 플로팅 캡슐 상태창 바
          [≡] | [<] 1 / 12 [>] | [정답 및 해설] [북마크]
         ========================================================================= */}
      <div className="p-2.5 sm:p-4 bg-transparent flex justify-center items-center shrink-0 z-20">
        <div className="w-fit max-w-[calc(100%-0.5rem)] sm:max-w-[calc(100%-1rem)] px-2 sm:px-3 py-1.5 sm:py-2 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-white/10 shadow-xl shadow-slate-900/10 dark:shadow-black/40 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {/* 1. 햄버거 메뉴 버튼 (둥근 원형) */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(prev => !prev)}
            title="과목 선택 및 문항 이동 메뉴"
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
              isMenuOpen
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* 세로 구분선 */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5 sm:mx-1 shrink-0" />

          {/* 2. < 이전 버튼 */}
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            title="이전 문제"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer shrink-0 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* 3. 문항 표시 (1 / 12 또는 과목 내 문항 수) */}
          <div className="font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 px-1.5 sm:px-2.5 whitespace-nowrap select-none">
            {isSubjectGrouped ? (
              <span title={`전체 ${index + 1} / ${totalCount}`}>
                <span className="text-blue-600 dark:text-blue-400">{subjectQuestionIndex}</span>
                <span className="text-slate-400 mx-1">/</span>
                <span>{subjectQuestionTotal}</span>
              </span>
            ) : (
              <span>
                <span className="text-blue-600 dark:text-blue-400">{index + 1}</span>
                <span className="text-slate-400 mx-1">/</span>
                <span>{totalCount}</span>
              </span>
            )}
          </div>

          {/* 4. 다음 > 버튼 */}
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            title="다음 문제"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer shrink-0 transition-colors"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* 세로 구분선 */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5 sm:mx-1 shrink-0" />

          {/* 5. 정답 및 해설 버튼 (둥근 알약형) */}
          <button
            type="button"
            onClick={() => setShowExplanation(prev => !prev)}
            title="정답 및 상세 해설 보기"
            className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              showExplanation
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/80 dark:border-blue-800/80 hover:bg-blue-100 dark:hover:bg-blue-900/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>정답 및 해설</span>
          </button>

          {/* 6. 북마크 버튼 (둥근 원형) */}
          <button
            type="button"
            onClick={() => onToggleBookmark(question.id)}
            title={isBookmarked ? "북마크 해제" : "북마크 추가"}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border transition-all flex items-center justify-center cursor-pointer shrink-0 ${
              isBookmarked
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Bookmark className={`w-4 h-4 transition-colors ${
              isBookmarked ? 'fill-blue-600 text-blue-600' : ''
            }`} />
          </button>
        </div>
      </div>

      {/* =========================================================================
          요구사항 2, 3, 5: 햄버거 메뉴 모달 (전체보기 제거 & 과목별 바로가기)
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

            {/* 과목 선택 탭 (요구사항 5: 과목 문항 안에서 '전체보기'는 없앰) */}
            {subjects && subjects.length > 0 && (
              <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {subjects.map((sub, sIdx) => {
                    const isSubActive = activeSubjectId === sub.id || (!activeSubjectId && question?.subject_id === sub.id);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          if (onFilterSubject && activeSubjectId !== null) {
                            onFilterSubject(sub.id);
                          } else {
                            const firstIdx = questions.findIndex(q => q.subject_id === sub.id);
                            if (firstIdx >= 0 && onSelectIndex) onSelectIndex(firstIdx);
                          }
                          // 요구사항 2: 상태창 내려가지 않고 유지!
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                          isSubActive
                            ? 'border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-black bg-blue-50/50 dark:bg-blue-950/40'
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

            {/* 문항 번호 리스트 (요구사항 3: 콜론 : 삭제하여 '문항 바로 이동') */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">문항 바로 이동</div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {questions.map((q, qIdx) => {
                  const isCurrent = qIdx === index;
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
