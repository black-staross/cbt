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
  EyeOff,
  FileSpreadsheet,
  FileCheck
} from 'lucide-react';

export default function QuestionCard({
  question,
  index,
  totalCount,
  userAnswer,
  userAnswers = {},
  onAnswer,
  mode = 'practice', // 'practice' | 'exam' | 'review' | 'wrong' | 'bookmark'
  isBookmarked = false,
  bookmarks = [],
  onToggleBookmark,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  selfGraded,
  onToggleSelfGraded,
  subjects = [],
  questions = [],
  onSubmitExam
}) {
  const isReviewMode = mode === 'review' || mode === 'wrong' || mode === 'bookmark';
  const [showExplanation, setShowExplanation] = useState(isReviewMode);
  const [subjectiveInput, setSubjectiveInput] = useState(userAnswer || '');
  // 요구사항 2: 하단바 메뉴 누르면 왼쪽에서 열리는 OMR 드로어 상태
  const [isOmrOpen, setIsOmrOpen] = useState(false);
  const [omrFilter, setOmrFilter] = useState('all'); // 'all' | 'unanswered'
  const inputRef = useRef(null);

  // 문제 변경 시 상태 동기화
  useEffect(() => {
    setSubjectiveInput(userAnswer || '');
    if (isReviewMode) {
      setShowExplanation(true);
    } else if (mode === 'exam') {
      setShowExplanation(false);
    }
  }, [question?.id, question?.subject_id, userAnswer, mode, isReviewMode]);

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

  // OMR 마킹 상태 계산 (요구사항 2: 하단바 메뉴 안에 OMR 답안지 탑재)
  const isQuestionAnswered = (q) => {
    const ans = userAnswers ? userAnswers[q.id] : undefined;
    if (ans === undefined || ans === null) return false;
    if (typeof ans === 'string') return ans.trim().length > 0;
    return true;
  };

  const answeredCount = questions.filter(isQuestionAnswered).length;
  const unansweredCount = questions.length - answeredCount;

  // 과목별 문항 그룹핑 (과목별 1부터 번호 매김)
  const hasMultipleSubjects = new Set(questions.map(q => q.subject_id || q.subject_name)).size > 1;
  const subjectGroups = [];
  if (hasMultipleSubjects) {
    const map = new Map();
    questions.forEach((q, qIdx) => {
      const subKey = q.subject_id || 1;
      const matchedSubject = subjects.find(s => Number(s.id) === Number(subKey));
      const subName = matchedSubject?.name || q.subject_name || q.chapter || `${subKey}과목`;
      if (!map.has(subKey)) {
        map.set(subKey, {
          id: subKey,
          name: subName,
          items: []
        });
      }
      map.get(subKey).items.push({ q, realIndex: qIdx, subIndex: map.get(subKey).items.length + 1 });
    });
    subjectGroups.push(...map.values());
  }

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
        {/* 요구사항 4: 과목별로 1부터 새로 매겨서 문항번호 매김 */}
        <div className="flex items-start gap-2.5 sm:gap-3 text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-slate-50 leading-relaxed tracking-tight break-keep">
          <span className="font-mono font-black text-blue-600 dark:text-blue-400 shrink-0 text-lg sm:text-2xl leading-relaxed">
            Q{isSubjectGrouped ? subjectQuestionIndex : index + 1}.
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
          요구사항: 첨부 사진과 1:1 완벽 일치하는 바닥에서 띄운 둥근 플로팅 캡슐 상태창 바
          ( ≡ ) | <  1 / 12  > | [정답 및 해설] [북마크]
         ========================================================================= */}
      <div className="p-2 sm:p-3 sm:pb-4 bg-transparent flex justify-center items-center shrink-0 z-20">
        <div className="w-fit max-w-[calc(100%-0.5rem)] sm:max-w-[calc(100%-1rem)] px-2 sm:px-3 py-1.5 sm:py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-xl shadow-slate-900/10 dark:shadow-black/40 flex items-center gap-1 sm:gap-2.5 overflow-x-auto no-scrollbar">
          {/* 1. ( ≡ ) 원형 햄버거 메뉴 버튼 (누르면 왼쪽에서 OMR 답안지 드로어 오픈) */}
          <button
            type="button"
            onClick={() => setIsOmrOpen(prev => !prev)}
            title="OMR 실전 답안지 메뉴 열기"
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors shrink-0 relative ${
              isOmrOpen
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            <Menu className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            {unansweredCount > 0 && mode === 'exam' && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900"></span>
            )}
          </button>

          {/* 세로 구분선 | */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5 sm:mx-1 shrink-0" />

          {/* 2. < 이전 버튼 */}
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            title="이전 문제"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer shrink-0 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* 3. 문항 표시 (사진처럼 깔끔하고 굵은 1 / 12 스타일) */}
          <div className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white px-1 sm:px-2 whitespace-nowrap select-none">
            {isSubjectGrouped ? (
              <span title={`전체 ${index + 1} / ${totalCount}`}>
                <span className="text-blue-600 dark:text-blue-400">{subjectQuestionIndex}</span>
                <span className="text-slate-400 mx-1.5 font-normal">/</span>
                <span>{subjectQuestionTotal}</span>
              </span>
            ) : (
              <span>
                <span className="text-blue-600 dark:text-blue-400">{index + 1}</span>
                <span className="text-slate-400 mx-1.5 font-normal">/</span>
                <span>{totalCount}</span>
              </span>
            )}
          </div>

          {/* 4. > 다음 버튼 */}
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            title="다음 문제"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer shrink-0 transition-colors"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* 세로 구분선 | */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5 sm:mx-1 shrink-0" />

          {/* 5. 우측 액션 버튼들 */}
          {/* 시험 모드: 마지막 문제이거나 모든 문항 마킹 완료 시 시험 제출 버튼 노출 */}
          {mode === 'exam' && onSubmitExam && (!hasNext || unansweredCount === 0) && (
            <button
              type="button"
              onClick={onSubmitExam}
              title="시험 답안 최종 제출"
              className="px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-black border-2 border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20 cursor-pointer shrink-0 transition-all active:scale-95"
            >
              <span>제출</span>
            </button>
          )}

          {/* 연습 모드일 때: 정답 및 해설 알약 버튼 */}
          {mode !== 'exam' && (
            <button
              type="button"
              onClick={() => setShowExplanation(prev => !prev)}
              title="정답 및 상세 해설 보기"
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                showExplanation
                  ? 'border-2 border-blue-600 bg-blue-600 text-white shadow-xs'
                  : 'border-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>정답 및 해설</span>
            </button>
          )}

          {/* 6. 북마크 버튼 (원형 아이콘 버튼, 파란색 하이라이트) */}
          <button
            type="button"
            onClick={() => onToggleBookmark(question.id)}
            title={isBookmarked ? "북마크 해제" : "북마크 추가"}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border transition-all flex items-center justify-center cursor-pointer shrink-0 ${
              isBookmarked
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Bookmark className={`w-4 h-4 transition-colors ${
              isBookmarked ? 'fill-blue-600 text-blue-600' : ''
            }`} />
          </button>
        </div>
      </div>

      {/* =========================================================================
          요구사항 2: 버튼 눌렀을 때 하단에서 올라오지 않고 왼쪽에서 열리는 OMR 드로어
          (문항 바로가기 기능 모두 제거, 순수 OMR 답안 마킹 현황 확인용)
         ========================================================================= */}
      {isOmrOpen && (
        <div className="fixed inset-0 z-50">
          {/* 어두운 배경 오버레이 (클릭 시 닫힘) */}
          <div 
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
            onClick={() => setIsOmrOpen(false)}
          />

          {/* 왼쪽에서 슬라이드 인되는 OMR 답안지 패널 */}
          <div className="fixed inset-y-0 left-0 z-50 w-80 sm:w-96 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-left duration-250 select-none">
            {/* 드로어 상단 헤더 */}
            <div className="p-4 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">OMR 실전 답안지</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOmrOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 마킹 진행률 요약 & 필터 */}
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/20 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>작성 완료: <strong className="text-blue-600 dark:text-blue-400">{answeredCount}</strong> / {questions.length}</span>
                <span className={unansweredCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}>
                  {unansweredCount > 0 ? `미표기 ${unansweredCount}문항` : '전 문항 표기완료'}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }}
                />
              </div>

              {/* 필터 탭 (전체, 미표기 2개로 간결화 / 북마크 제거) */}
              <div className="grid grid-cols-2 gap-1.5 mt-2.5 p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl text-xs font-bold">
                {[
                  { id: 'all', label: `전체 (${questions.length})` },
                  { id: 'unanswered', label: `미표기 (${unansweredCount})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setOmrFilter(tab.id)}
                    className={`py-1.5 rounded-lg transition-all text-center cursor-pointer border ${
                      omrFilter === tab.id
                        ? 'border-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-700 font-black shadow-xs'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* OMR 마킹 시트 (스크롤 영역 - 문항 바로가기 기능 없이 순수 마킹 확인) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {omrFilter === 'unanswered' && unansweredCount === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    모든 문항의 답안이 표기되었습니다!
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {mode === 'exam' ? '하단의 최종 답안 제출하기 버튼을 누르시면 시험이 완료됩니다.' : '모든 문제 풀이가 완료되었습니다.'}
                  </p>
                </div>
              ) : hasMultipleSubjects ? (
                subjectGroups.map((group) => {
                  const filteredItems = group.items.filter(({ q }) => {
                    if (omrFilter === 'unanswered') return !isQuestionAnswered(q);
                    return true;
                  });

                  if (filteredItems.length === 0) return null;

                  const subAnswered = group.items.filter(({ q }) => isQuestionAnswered(q)).length;

                  return (
                    <div key={group.id} className="space-y-1.5 pt-1">
                      {/* 과목 구분 헤더 */}
                      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-200">
                        <span className="truncate">{group.name}</span>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0 ml-2">
                          {omrFilter === 'unanswered'
                            ? `미표기 ${filteredItems.length}문항`
                            : `${subAnswered}/${group.items.length}`}
                        </span>
                      </div>

                      {/* 문항 마킹 행 리스트 (과목별 1부터 번호 매김, 북마크 아이콘 제거, 줄바꿈 방지) */}
                      <div className="space-y-1">
                        {filteredItems.map(({ q, realIndex, subIndex }) => {
                          const currentAnswer = userAnswers ? userAnswers[q.id] : undefined;

                          return (
                            <div
                              key={q.id}
                              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 min-h-[38px]"
                            >
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap text-xs">
                                  {String(subIndex).padStart(2, '0')}번
                                </span>
                              </div>

                              {/* 4지선다 OMR 마킹 시각화 */}
                              <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4].map((num) => {
                                  const isSelected = currentAnswer === num;
                                  return (
                                    <span
                                      key={num}
                                      className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border transition-colors ${
                                        isSelected
                                          ? 'border-2 border-blue-600 bg-blue-600 text-white shadow-xs'
                                          : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800'
                                      }`}
                                    >
                                      {num}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                // 단일 과목 시험일 때
                <div className="space-y-1">
                  {questions
                    .map((q, qIdx) => ({ q, qIdx }))
                    .filter(({ q }) => {
                      if (omrFilter === 'unanswered') return !isQuestionAnswered(q);
                      return true;
                    })
                    .map(({ q, qIdx }) => {
                      const currentAnswer = userAnswers ? userAnswers[q.id] : undefined;

                      return (
                        <div
                          key={q.id}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 min-h-[38px]"
                        >
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap text-xs">
                              {String(qIdx + 1).padStart(2, '0')}번
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4].map((num) => {
                              const isSelected = currentAnswer === num;
                              return (
                                <span
                                  key={num}
                                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border transition-colors ${
                                    isSelected
                                      ? 'border-2 border-blue-600 bg-blue-600 text-white shadow-xs'
                                      : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800'
                                  }`}
                                >
                                  {num}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* OMR 하단 푸터 (시험 제출 버튼) */}
            <div className="p-3.5 bg-slate-50/80 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 space-y-2">
              {mode === 'exam' && onSubmitExam ? (
                <>
                  {unansweredCount > 0 && (
                    <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 text-center">
                      미표기 문항이 {unansweredCount}개 남아있습니다.
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOmrOpen(false);
                      onSubmitExam();
                    }}
                    className="w-full py-3 px-4 border-2 border-blue-600 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>최종 답안 제출하기</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsOmrOpen(false)}
                  className="w-full py-2.5 px-4 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  닫기
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
