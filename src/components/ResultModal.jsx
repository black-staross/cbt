import React, { useState } from 'react';
import { 
  Trophy, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Home, 
  BookOpen, 
  Check, 
  X, 
  HelpCircle, 
  AlertTriangle, 
  Table as TableIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ResultModal({
  examMeta,
  questions = [],
  answers = {},
  selfGraded = {},
  onReviewExam,
  onGoToWrongNotes,
  onGoHome
}) {
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all' | 'wrong' | 'correct'
  const [expandedQuestions, setExpandedQuestions] = useState({}); // 개별 해설 아코디언 토글

  if (!examMeta) return null;

  const isSubjective = examMeta.question_type === 'subjective';

  // 개별 문제 정답 판정
  const questionResults = questions.map((q, idx) => {
    const userAns = answers[q.id];
    let isCorrect = false;

    if (q.type === 'subjective') {
      if (selfGraded[q.id] !== undefined) {
        isCorrect = selfGraded[q.id];
      } else if (userAns && q.accepted_answers) {
        const clean = userAns.trim().toLowerCase().replace(/\s+/g, ' ');
        isCorrect = q.accepted_answers.some(ans => ans.trim().toLowerCase().replace(/\s+/g, ' ') === clean);
      }
    } else {
      isCorrect = userAns === q.correct_answer;
    }

    const isAnswered = userAns !== undefined && userAns !== null && userAns !== '';

    return {
      q,
      originalIndex: idx,
      userAns,
      isCorrect,
      isAnswered
    };
  });

  const totalQuestions = questions.length;
  const correctCount = questionResults.filter(r => r.isCorrect).length;
  const wrongCount = totalQuestions - correctCount;

  // 점수 계산 (100점 만점 환산)
  const totalScore = Math.round((correctCount / (totalQuestions || 1)) * 100);

  // 과목별 점수 및 과락 여부 계산
  let hasSubjectFail = false;
  const subjectStats = (examMeta.subjects || []).map((sub) => {
    const subQuestions = questionResults.filter(r => r.q.subject_id === sub.id);
    const subTotal = subQuestions.length;
    const subCorrect = subQuestions.filter(r => r.isCorrect).length;
    const subScore = subTotal > 0 ? Math.round((subCorrect / subTotal) * 100) : 0;

    // 과목 과락 기준: 40점 미만
    const isFailed = examMeta.has_fail_criteria && subScore < 40;
    if (isFailed) {
      hasSubjectFail = true;
    }

    return {
      ...sub,
      actualCount: subTotal,
      correctCount: subCorrect,
      score: subScore,
      isFailed
    };
  });

  // 최종 합격 판정
  const isPassScore = totalScore >= examMeta.pass_score;
  const isFinalPassed = isPassScore && !hasSubjectFail;

  // 필터링된 문항 목록
  const filteredResults = questionResults.filter(({ isCorrect, isAnswered }) => {
    if (reviewFilter === 'wrong') return !isCorrect;
    if (reviewFilter === 'correct') return isCorrect;
    return true;
  });

  // 과목별 문항 인덱스 계산 헬퍼
  const getSubjectInfo = (question, originalIdx) => {
    const subId = question.subject_id;
    if (!subId) return { label: `${originalIdx + 1}번`, subIdx: originalIdx + 1 };
    
    const sameSub = questions.filter(item => item.subject_id === subId);
    const subIdx = sameSub.findIndex(item => item.id === question.id) + 1;
    const subObj = examMeta.subjects?.find(s => s.id === subId);
    const subName = subObj ? subObj.name.replace(/^[0-9제]+\s*과목\s*/, '') : `${subId}과목`;
    
    return {
      label: `${subId}과목 ${subName}`,
      subIdx,
      totalSub: sameSub.length
    };
  };

  const toggleExpand = (qId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-xl overflow-hidden select-none">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* =========================================================================
            상단 결과 배너 (합격/불합격 및 총점)
           ========================================================================= */}
        <div className={`p-5 sm:p-7 text-center text-white relative shrink-0 ${
          isFinalPassed 
            ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700' 
            : 'bg-gradient-to-br from-slate-800 via-slate-900 to-rose-950'
        }`}>
          <div className="inline-flex p-2.5 sm:p-3 rounded-2xl bg-white/15 backdrop-blur-md mb-2 sm:mb-2.5 border border-white/20 shadow-md">
            {isFinalPassed ? (
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300" />
            ) : (
              <AlertOctagon className="w-8 h-8 sm:w-10 sm:h-10 text-rose-300" />
            )}
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight break-keep">
            {isFinalPassed ? '축하합니다! 시험에 합격하셨습니다' : '아쉽지만 불합격하셨습니다'}
          </h2>

          <p className="text-white/80 text-xs sm:text-sm mt-1 font-medium break-keep">
            {examMeta.name} • 합격 기준: {examMeta.fail_criteria_description}
          </p>

          {/* 총점 뱃지 */}
          <div className="mt-3.5 sm:mt-4 inline-flex items-baseline gap-1.5 px-6 py-1.5 sm:py-2 rounded-2xl bg-black/35 backdrop-blur-md border border-white/20 font-mono shadow-inner">
            <span className="text-3xl sm:text-4xl md:text-5xl font-black">{totalScore}</span>
            <span className="text-base sm:text-xl text-white/70 font-bold">/ 100점</span>
          </div>

          {/* 과락 안내 문구 */}
          {!isFinalPassed && hasSubjectFail && (
            <div className="mt-2.5 inline-block px-3 py-1 rounded-full bg-rose-500/40 border border-rose-300/40 text-[11px] sm:text-xs font-bold text-rose-100 break-keep">
              ⚠️ 과목 과락 발생 (40점 미만 과목 존재)
            </div>
          )}
        </div>

        {/* =========================================================================
            스크롤 본문: 1. 요약 통계 -> 2. 과목별 성적 -> 3. 문항별 상세 정답 및 해설
           ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          
          {/* 1. 요약 통계 3카드 */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="p-3 sm:p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold block break-keep">총 응시 문항</span>
              <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">{totalQuestions}문항</span>
            </div>
            <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-bold block break-keep">정답 문항</span>
              <span className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">{correctCount}문항</span>
            </div>
            <div className="p-3 sm:p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
              <span className="text-[11px] sm:text-xs text-rose-600 dark:text-rose-400 font-bold block break-keep">오답 / 미표기</span>
              <span className="text-lg sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">{wrongCount}문항</span>
            </div>
          </div>

          {/* 2. 과목별 성적 및 과락 현황 */}
          {subjectStats.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300">
                과목별 성적 및 과락 현황
              </h4>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-800/50">
                {subjectStats.map((sub) => (
                  <div key={sub.id} className="p-3 sm:p-3.5 flex items-center justify-between text-xs sm:text-sm gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <span className="font-bold text-slate-900 dark:text-slate-100 truncate block">{sub.name}</span>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        맞힌 문항: <strong className="text-slate-700 dark:text-slate-300 font-mono">{sub.correctCount}</strong> / {sub.actualCount}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className="font-mono font-black text-sm sm:text-base text-slate-900 dark:text-slate-100">
                        {sub.score}점
                      </span>
                      {examMeta.has_fail_criteria && (
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold shrink-0 border ${
                          sub.isFailed 
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 border-rose-200 dark:border-rose-800' 
                            : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-200 dark:border-emerald-800'
                        }`}>
                          {sub.isFailed ? '과락' : '통과'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              3. 요구사항 2: 시험결과에서 각 문항별 정답과 해설 직접 확인
             ========================================================================= */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>문항별 정답 및 상세 해설</span>
                  <span className="text-xs font-normal text-slate-500 font-mono">({filteredResults.length}문항)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  각 문항의 정답과 상세 해설을 바로 검토할 수 있습니다.
                </p>
              </div>

              {/* 필터 탭: 전체 / 오답만 / 정답만 */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold shrink-0">
                {[
                  { id: 'all', label: `전체 (${totalQuestions})` },
                  { id: 'wrong', label: `오답 (${wrongCount})` },
                  { id: 'correct', label: `정답 (${correctCount})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setReviewFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer border ${
                      reviewFilter === tab.id
                        ? 'border-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-700 font-black shadow-xs'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 문항별 상세 카드 리스트 */}
            <div className="space-y-4">
              {filteredResults.map(({ q, originalIndex, userAns, isCorrect, isAnswered }) => {
                const subInfo = getSubjectInfo(q, originalIndex);
                const isExpanded = expandedQuestions[q.id] !== false; // 기본 열림 상태

                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isCorrect 
                        ? 'border-emerald-200 dark:border-emerald-950 bg-white dark:bg-slate-900' 
                        : isAnswered
                          ? 'border-rose-200 dark:border-rose-950 bg-white dark:bg-slate-900'
                          : 'border-amber-200 dark:border-amber-950 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {/* 카드 헤더 (문항 번호, 과목명, 채점 결과 뱃지) */}
                    <div className="p-3.5 sm:p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-black text-sm sm:text-base text-blue-600 dark:text-blue-400">
                          Q{subInfo.subIdx}.
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                          {subInfo.label}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                          (전체 {originalIndex + 1}번)
                        </span>
                      </div>

                      {/* 채점 뱃지 */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                            <Check className="w-3.5 h-3.5" />
                            <span>정답</span>
                          </span>
                        ) : isAnswered ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                            <X className="w-3.5 h-3.5" />
                            <span>오답 (선택: {userAns}번 / 정답: {q.correct_answer}번)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>미표기 (정답: {q.correct_answer}번)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 카드 본문: 문제 지문 + 보기 + 해설 */}
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* 문제 지문 */}
                      <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed break-keep">
                        {q.question}
                      </p>

                      {/* 데이터 테이블 (존재할 경우) */}
                      {q.table_data && (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                          {q.table_data.title && (
                            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <TableIcon className="w-3.5 h-3.5 text-blue-500" />
                              <span>[{q.table_data.title}]</span>
                            </div>
                          )}
                          <table className="w-full text-left text-xs border-collapse font-mono">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 font-bold">
                                {q.table_data.headers?.map((h, i) => (
                                  <th key={i} className="px-2.5 py-1.5 border-r last:border-r-0 border-slate-200 dark:border-slate-700">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {q.table_data.rows?.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="px-2.5 py-1.5 border-r last:border-r-0 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* 코드 스니펫 (존재할 경우) */}
                      {(q.code_snippet || q.code) && (
                        <div className="rounded-xl overflow-hidden border border-slate-700 bg-black text-slate-200 font-mono text-xs p-3">
                          <pre className="whitespace-pre overflow-x-auto">
                            <code>
                              {typeof q.code_snippet === 'object' && q.code_snippet !== null
                                ? (q.code_snippet.code || '')
                                : (q.code_snippet || q.code || '')}
                            </code>
                          </pre>
                        </div>
                      )}

                      {/* 4지선다 보기 리스트 (객관식) */}
                      {q.options && q.options.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const optionNum = optIdx + 1;
                            const isCorrectOpt = optionNum === q.correct_answer;
                            const isUserSelected = userAns === optionNum;

                            let optStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300';
                            if (isCorrectOpt) {
                              optStyle = 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-bold';
                            } else if (isUserSelected && !isCorrectOpt) {
                              optStyle = 'border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100';
                            }

                            return (
                              <div
                                key={optIdx}
                                className={`p-2.5 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 transition-colors ${optStyle}`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 ${
                                  isCorrectOpt
                                    ? 'bg-emerald-600 text-white'
                                    : isUserSelected
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}>
                                  {optionNum}
                                </span>
                                <span className="flex-1 leading-relaxed break-keep">
                                  {opt}
                                </span>
                                {isCorrectOpt && (
                                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-1">
                                    [정답]
                                  </span>
                                )}
                                {isUserSelected && !isCorrectOpt && (
                                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 shrink-0 ml-1">
                                    [내가 고른 답]
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 주관식 답안 정보 */}
                      {isSubjective && (
                        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs space-y-1">
                          <div>
                            <span className="text-slate-500">내가 작성한 답안: </span>
                            <strong className={isCorrect ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                              {userAns || '(미입력)'}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-500">인정 정답: </span>
                            <strong className="text-blue-600 dark:text-blue-400">
                              {q.accepted_answers ? q.accepted_answers.join(' / ') : q.correct_answer}
                            </strong>
                          </div>
                        </div>
                      )}

                      {/* =========================================================================
                          정답 및 상세 해설 박스 (요구사항 2 핵심)
                         ========================================================================= */}
                      <div className="pt-2">
                        <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-2">
                          <div className="flex items-center gap-1.5 font-black text-blue-700 dark:text-blue-300">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>
                              정답: {q.correct_answer}번 {q.options && q.options[q.correct_answer - 1] ? `(${q.options[q.correct_answer - 1]})` : ''}
                            </span>
                          </div>

                          <div className="leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300 break-keep">
                            {q.explanation}
                          </div>

                          {/* 함정 피하기 팁 */}
                          {q.trap_avoidance && (
                            <div className="pt-2 mt-2 border-t border-blue-200 dark:border-blue-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <div className="leading-relaxed">
                                <strong className="font-bold text-amber-800 dark:text-amber-300">오답 함정 피하기: </strong>
                                <span>{q.trap_avoidance}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            하단 액션 버튼 바 (고정)
           ========================================================================= */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            시험 결과 검토가 완료되면 복습 또는 홈으로 이동하세요.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* 오답노트 복습 버튼 */}
            {wrongCount > 0 && (
              <button
                type="button"
                onClick={onGoToWrongNotes}
                className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>오답노트 복습 ({wrongCount})</span>
              </button>
            )}

            {/* 홈으로 이동 버튼 */}
            <button
              type="button"
              onClick={onGoHome}
              className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl border-2 border-blue-600 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Home className="w-4 h-4" />
              <span>홈으로 이동</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
