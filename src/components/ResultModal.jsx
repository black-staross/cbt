import React from 'react';
import { Trophy, AlertOctagon, CheckCircle2, XCircle, ArrowRight, RotateCcw, Home, BookOpen } from 'lucide-react';

export default function ResultModal({
  examMeta,
  questions = [],
  answers = {},
  selfGraded = {},
  onReviewExam,
  onGoToWrongNotes,
  onGoHome
}) {
  if (!examMeta) return null;

  const isSubjective = examMeta.question_type === 'subjective';

  // 채점 로직
  // 1. 개별 문제 정답 판정
  const questionResults = questions.map((q) => {
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

    return {
      id: q.id,
      subject_id: q.subject_id,
      subject_name: q.subject_name,
      userAns,
      isCorrect,
      isAnswered: userAns !== undefined && userAns !== null && userAns !== ''
    };
  });

  const totalQuestions = questions.length;
  const correctCount = questionResults.filter(r => r.isCorrect).length;
  const answeredCount = questionResults.filter(r => r.isAnswered).length;

  // 점수 계산
  // 실제 시험 만점(100점) 기준으로 환산
  const totalScore = Math.round((correctCount / (totalQuestions || 1)) * 100);

  // 과목별 점수 및 과락 여부 계산
  let hasSubjectFail = false;
  const subjectStats = (examMeta.subjects || []).map((sub) => {
    const subQuestions = questionResults.filter(r => r.subject_id === sub.id);
    const subTotal = subQuestions.length;
    const subCorrect = subQuestions.filter(r => r.isCorrect).length;
    const subScore = subTotal > 0 ? Math.round((subCorrect / subTotal) * 100) : 0;

    // 과목 과락 기준: 40점 미만 (40% 미만)
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
  // 1. 총점 60점 이상
  // 2. 과목 과락 없을 것
  const isPassScore = totalScore >= examMeta.pass_score;
  const isFinalPassed = isPassScore && !hasSubjectFail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xl overflow-y-auto">
      <div className="w-full max-w-2xl glass-card rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* 상단 결과 배너 */}
        <div className={`p-8 text-center text-white relative ${
          isFinalPassed 
            ? 'bg-gradient-to-br from-emerald-600/90 to-teal-700/90' 
            : 'bg-gradient-to-br from-slate-800/90 to-rose-900/90'
        }`}>
          <div className="inline-flex p-3 rounded-2xl bg-white/15 backdrop-blur-md mb-3 border border-white/20 shadow-md">
            {isFinalPassed ? (
              <Trophy className="w-10 h-10 text-amber-300" />
            ) : (
              <AlertOctagon className="w-10 h-10 text-rose-300" />
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            {isFinalPassed ? '축하합니다! 시험에 합격하셨습니다' : '아쉽지만 불합격하셨습니다'}
          </h2>

          <p className="text-white/80 text-xs md:text-sm mt-1.5 font-medium">
            {examMeta.name} • 기준: {examMeta.fail_criteria_description}
          </p>

          {/* 총점 뱃지 */}
          <div className="mt-5 inline-flex items-baseline gap-1 px-6 py-2 rounded-2xl bg-black/30 backdrop-blur-md border border-white/15 font-mono shadow-inner">
            <span className="text-4xl md:text-5xl font-black">{totalScore}</span>
            <span className="text-xl text-white/70 font-semibold">/ 100점</span>
          </div>

          {/* 과락 안내 문구 */}
          {!isFinalPassed && hasSubjectFail && (
            <div className="mt-3 inline-block px-3 py-1 rounded-full bg-rose-500/40 border border-rose-300/40 text-xs font-bold text-rose-100">
              ⚠️ 과목 과락 발생 (40점 미만 과목 존재)
            </div>
          )}
        </div>

        {/* 세부 점수 통계 본문 */}
        <div className="p-5 sm:p-7 md:p-8 space-y-6">
          {/* 전체 요약 그리드 */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 backdrop-blur-md">
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-bold block">총 응시 문항</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">{totalQuestions}문항</span>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-md">
              <span className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 font-bold block">정답 문항</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">{correctCount}문항</span>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 backdrop-blur-md">
              <span className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 font-bold block">오답 / 미표기</span>
              <span className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-300 font-mono">{totalQuestions - correctCount}문항</span>
            </div>
          </div>

          {/* 과목별 성적 및 과락 현황 테이블 */}
          <div className="space-y-2.5">
            <h4 className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              과목별 성적 및 과락 여부
            </h4>

            <div className="border border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 bg-white/90 dark:bg-slate-800/60 backdrop-blur-md">
              {subjectStats.map((sub) => (
                <div key={sub.id} className="p-4 flex items-center justify-between text-sm sm:text-base">
                  <div className="space-y-1">
                    <span className="font-black text-slate-900 dark:text-slate-100">{sub.name}</span>
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                      맞힌 문항: <strong className="text-slate-800 dark:text-slate-200">{sub.correctCount}</strong> / {sub.actualCount}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-lg sm:text-xl text-slate-900 dark:text-slate-100">
                      {sub.score}점
                    </span>
                    {examMeta.has_fail_criteria && (
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                        sub.isFailed 
                          ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40' 
                          : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {sub.isFailed ? '과락 (불합격)' : '통과'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 하단 액션 버튼 (손가락으로 탭하기 쉬운 넉넉한 터치 타겟) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={onReviewExam}
              className="py-3.5 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[50px]"
            >
              <RotateCcw className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <span>문제/해설 검토</span>
            </button>

            <button
              type="button"
              onClick={onGoToWrongNotes}
              className="py-3.5 px-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[50px]"
            >
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>오답노트 복습</span>
            </button>

            <button
              type="button"
              onClick={onGoHome}
              className="py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer min-h-[50px]"
            >
              <Home className="w-5 h-5" />
              <span>홈으로 이동</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}