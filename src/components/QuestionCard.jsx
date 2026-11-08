import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Bookmark, 
  Check, 
  X, 
  HelpCircle, 
  Lightbulb, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  Code2,
  Table as TableIcon,
  CheckCircle2,
  RotateCcw,
  Volume2,
  VolumeX,
  Headphones,
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
  onToggleSelfGraded
}) {
  const [showExplanation, setShowExplanation] = useState(mode === 'practice' || mode === 'review');
  const [showAnswerNumberOnly, setShowAnswerNumberOnly] = useState(false);
  const [subjectiveInput, setSubjectiveInput] = useState(userAnswer || '');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isContinuousPlay, setIsContinuousPlay] = useState(false);
  const inputRef = useRef(null);
  const autoNextTimeoutRef = useRef(null);

  // TTS 음성 읽기
  const stopSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
  }, []);

  const speakText = useCallback((text, onEnd) => {
    if (!('speechSynthesis' in window)) {
      alert('현재 브라우저가 음성 합성(TTS)을 지원하지 않습니다.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleSpeakCurrent = useCallback((includeAnswer = false) => {
    if (!question) return;
    if (isSpeaking) {
      stopSpeech();
      setIsContinuousPlay(false);
      return;
    }

    let speech = `문제 ${index + 1}번. ${question.question}. `;
    if (question.type !== 'subjective' && question.options) {
      speech += '보기입니다. ';
      question.options.forEach((opt, idx) => {
        speech += `${idx + 1}번, ${opt}. `;
      });
    }

    if (includeAnswer || showExplanation) {
      speech += `정답은 ${question.correct_answer || question.answer}번 입니다. `;
      if (question.explanation) {
        speech += `해설: ${question.explanation}`;
      }
    }

    speakText(speech, () => {
      if (isContinuousPlay && hasNext) {
        autoNextTimeoutRef.current = setTimeout(() => {
          onNext();
        }, 3000);
      } else if (isContinuousPlay && !hasNext) {
        setIsContinuousPlay(false);
      }
    });
  }, [question, index, isSpeaking, showExplanation, speakText, stopSpeech, isContinuousPlay, hasNext, onNext]);

  // 문제 변경 시 음성 정지 및 자동 연속 재생 처리
  useEffect(() => {
    if (isContinuousPlay) {
      handleSpeakCurrent(true);
    } else {
      stopSpeech();
    }
  }, [question?.id]);

  useEffect(() => {
    return () => stopSpeech();
  }, [stopSpeech]);

  // 문제 변경 시 상태 동기화
  useEffect(() => {
    setSubjectiveInput(userAnswer || '');
    if (mode === 'practice' || mode === 'review') {
      setShowExplanation(Boolean(userAnswer !== undefined && userAnswer !== null && userAnswer !== ''));
    } else {
      setShowExplanation(false);
    }
  }, [question.id, userAnswer, mode]);

  // 객관식 1, 2, 3, 4 키보드 단축키 지원
  useEffect(() => {
    if (question.type === 'subjective') return;

    const handleKeyDown = (e) => {
      // 포커스가 input 또는 textarea에 있으면 단축키 무시
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const selected = parseInt(e.key, 10);
        onAnswer(question.id, selected);
        if (mode === 'practice' || mode === 'review') {
          setShowExplanation(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question.id, question.type, onAnswer, mode]);

  if (!question) return null;

  const isSubjective = question.type === 'subjective';

  // 주관식 자동 채점 검사 (대소문자 무시, 공백 트림)
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

  // 최종 정답 인정 여부 (사용자 자가 채점 토글 우선 적용)
  const isFinalCorrect = selfGraded !== undefined ? selfGraded : isAutoCorrect;
  const isAnswered = userAnswer !== undefined && userAnswer !== null && userAnswer !== '';

  const handleSubjectiveSubmit = (e) => {
    e?.preventDefault();
    if (!subjectiveInput.trim()) return;
    onAnswer(question.id, subjectiveInput.trim());
    setShowExplanation(true);
  };

  return (
    <div className="flex flex-col h-full glass-card rounded-3xl shadow-xl overflow-hidden transition-colors">
      {/* 상단 문항 정보 바 (모바일 반응형 컴팩트 레이아웃) */}
      <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3.5 bg-slate-50/80 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-wrap">
          <span className="font-mono text-sm sm:text-lg font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border border-blue-200 dark:border-blue-800 shadow-xs shrink-0">
            Q. {String(index + 1).padStart(2, '0')}
          </span>
          {question.session && (
            <span className="text-[11px] sm:text-sm font-extrabold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
              {question.session}
            </span>
          )}
          <span className="text-[11px] sm:text-sm font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-300/60 dark:border-slate-700 truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">
            {question.chapter || question.subject_name || '기본 과목'}
          </span>
          <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold hidden xl:inline">
            전체 {totalCount}문항 중 {index + 1}번째
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* 연습하기 모드 전용: 정답 번호만 확인하는 정답보기 버튼 */}
          {mode === 'practice' && (
            <button
              type="button"
              onClick={() => setShowAnswerNumberOnly(prev => !prev)}
              title={showAnswerNumberOnly ? "정답 표시 끄기" : "정답 번호만 칠하기"}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[34px] sm:min-h-[38px] cursor-pointer ${
                showAnswerNumberOnly
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 border border-blue-500/40 hover:bg-blue-50 dark:hover:bg-blue-950/40'
              }`}
            >
              {showAnswerNumberOnly ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />}
              <span>{showAnswerNumberOnly ? '정답숨김' : '정답보기'}</span>
            </button>
          )}

          {/* TTS 음성 듣기 버튼 */}
          <button
            type="button"
            onClick={() => handleSpeakCurrent(false)}
            title="현재 문제 음성으로 듣기"
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[34px] sm:min-h-[38px] cursor-pointer ${
              isSpeaking
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />}
            <span className="hidden sm:inline">{isSpeaking ? '중지' : '듣기'}</span>
          </button>

          {/* 연속 오디오 학습 모드 (핸즈프리) */}
          <button
            type="button"
            onClick={() => {
              if (isContinuousPlay) {
                setIsContinuousPlay(false);
                stopSpeech();
              } else {
                setIsContinuousPlay(true);
                handleSpeakCurrent(true);
              }
            }}
            title="연속 듣기 (해설 후 다음 문제 자동 이동)"
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[34px] sm:min-h-[38px] cursor-pointer ${
              isContinuousPlay
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Headphones className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isContinuousPlay ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
            <span className="hidden sm:inline">{isContinuousPlay ? '재생 중' : '연속듣기'}</span>
          </button>

          {/* 북마크 버튼 */}
          <button
            type="button"
            onClick={() => onToggleBookmark(question.id)}
            title="문항 북마크"
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[34px] sm:min-h-[38px] cursor-pointer ${
              isBookmarked
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : 'text-slate-500 dark:text-slate-400'}`} />
            <span className="hidden sm:inline">{isBookmarked ? '북마크됨' : '북마크'}</span>
          </button>
        </div>
      </div>

      {/* 문항 본문 (스크롤 영역) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
        {/* 지문 텍스트 (어절 단위 break-keep으로 모바일에서 자연스러운 줄바꿈 보장) */}
        <div className="text-base sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50 leading-relaxed tracking-tight break-keep">
          {question.question}
        </div>

        {/* 데이터 테이블 (존재할 경우) */}
        {question.table_data && (
          <div className="overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 shadow-md backdrop-blur-md">
            {question.table_data.title && (
              <div className="px-4 py-2.5 bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <TableIcon className="w-4 h-4 text-blue-500" />
                <span>[{question.table_data.title}]</span>
              </div>
            )}
            <table className="w-full text-left text-sm sm:text-base border-collapse">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 font-mono">
                  {question.table_data.headers.map((h, i) => (
                    <th key={i} className="px-4 py-2.5 font-bold border-r last:border-r-0 border-slate-300 dark:border-slate-700">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                {question.table_data.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2.5 border-r last:border-r-0 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 코드 스니펫 터미널 (SQL, Java, C, Python 등 정상 출력 완벽 보장) */}
        {(question.code_snippet || question.code) && (() => {
          const rawCode = typeof question.code_snippet === 'object' && question.code_snippet !== null
            ? (question.code_snippet.code || '')
            : (question.code_snippet || question.code || '');
          
          const codeLang = (typeof question.code_snippet === 'object' && question.code_snippet?.language)
            || question.code_lang
            || (rawCode.includes('SELECT') || rawCode.includes('FROM') ? 'SQL' :
                rawCode.includes('#include') ? 'C' :
                rawCode.includes('class') || rawCode.includes('System.out') ? 'JAVA' :
                rawCode.includes('def ') || rawCode.includes('import ') ? 'PYTHON' : 'TERMINAL');

          return (
            <div className="glass-terminal rounded-2xl overflow-hidden border border-slate-700 shadow-xl my-4">
              {/* 터미널 상단 맥OS 창 제어 바 */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/95 border-b border-slate-700 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-xs"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-xs"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-xs"></span>
                  </div>
                  <span className="ml-2 text-xs font-mono font-bold text-slate-200 tracking-wider">
                    bash - {codeLang}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold">
                    {codeLang}
                  </span>
                </div>
              </div>

              {/* 터미널 코드 출력 영역 (선명한 고대비 Monospace 글꼴) */}
              <pre className="p-4 sm:p-5 bg-black/95 text-emerald-400 font-mono text-xs sm:text-sm md:text-base leading-relaxed overflow-x-auto whitespace-pre selection:bg-emerald-500 selection:text-black">
                <code className="text-emerald-400 font-semibold">{rawCode}</code>
              </pre>
            </div>
          );
        })()}

        {/* 렌더러 분기: 객관식 vs 주관식 */}
        {!isSubjective ? (
          // ================= [객관식 4지선다] =================
          <div className="space-y-3.5 pt-2">
            <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1.5">
              <span>보기를 선택하세요 (키보드 1~4번 입력 지원)</span>
              {mode === 'exam' && <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-extrabold">CBT 실전 모드</span>}
            </div>

            {question.options?.map((optionText, optIdx) => {
              const optionNumber = optIdx + 1;
              const isSelected = userAnswer === optionNumber;
              const isCorrectOpt = optionNumber === question.correct_answer;
              const isAnswerPeeking = mode === 'practice' && showAnswerNumberOnly && isCorrectOpt;

              // 학습 모드 또는 채점 완료 후 정오답 시각화 (리퀴드 글래스 및 고대비 다크모드)
              let stateStyle = 'border-slate-300/90 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 backdrop-blur-md shadow-xs';

              if (mode === 'exam') {
                if (isSelected) {
                  stateStyle = 'border-blue-600 dark:border-blue-400 bg-blue-50/95 dark:bg-blue-950/90 text-blue-950 dark:text-blue-50 ring-2 ring-blue-500/40 font-bold shadow-md';
                }
              } else if (showExplanation) {
                if (isCorrectOpt) {
                  stateStyle = 'border-emerald-500 dark:border-emerald-400 bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/40 font-bold shadow-md';
                } else if (isSelected && !isCorrectOpt) {
                  stateStyle = 'border-rose-500 dark:border-rose-400 bg-rose-50/95 dark:bg-rose-950/90 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/30 font-medium';
                } else {
                  stateStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500';
                }
              } else if (isSelected) {
                stateStyle = 'border-blue-600 dark:border-blue-400 bg-blue-50/95 dark:bg-blue-950/90 text-blue-950 dark:text-blue-50 ring-2 ring-blue-500/40 font-bold shadow-md';
              }

              return (
                <button
                  key={optionNumber}
                  type="button"
                  onClick={() => {
                    onAnswer(question.id, optionNumber);
                    if (mode === 'practice' || mode === 'review') {
                      setShowExplanation(true);
                    }
                  }}
                  className={`w-full flex items-start gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-2xl border text-left text-sm sm:text-lg transition-all cursor-pointer min-h-[50px] sm:min-h-[56px] ${stateStyle}`}
                >
                  <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono text-xs sm:text-sm font-black shrink-0 transition-all mt-0.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isAnswerPeeking
                        ? 'bg-blue-600 text-white border-2 border-blue-600 ring-4 ring-blue-500/25 shadow-md font-black'
                        : 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/80'
                  }`}>
                    {optionNumber}
                  </span>
                  <span className="flex-1 leading-relaxed pt-0.5 break-keep">{optionText}</span>
                  {showExplanation && mode !== 'exam' && (
                    <span className="shrink-0 pt-1">
                      {isCorrectOpt && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 stroke-[3]" />}
                      {isSelected && !isCorrectOpt && <X className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 stroke-[3]" />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          // ================= [주관식 단답형/코드추적] =================
          <div className="space-y-4 pt-2">
            <form onSubmit={handleSubjectiveSubmit} className="space-y-3">
              <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                정답 입력 (단답형 / 코드 실행 결과)
              </label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={subjectiveInput}
                  onChange={(e) => setSubjectiveInput(e.target.value)}
                  placeholder="답안을 입력하세요 (예: 90, ADD 등)"
                  className="flex-1 px-4 py-3.5 sm:py-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-hidden font-mono text-base sm:text-lg font-bold shadow-xs backdrop-blur-md"
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-sm sm:text-base rounded-2xl transition-all shrink-0 shadow-md shadow-blue-500/25 cursor-pointer"
                >
                  입력 완료
                </button>
              </div>
            </form>

            {/* 연습하기 모드 정답보기 활성화 시 주관식 표준 정답 번호/텍스트 표시 */}
            {mode === 'practice' && showAnswerNumberOnly && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 rounded-xl text-xs sm:text-sm text-blue-900 dark:text-blue-200 font-mono font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>정답: {question.correct_answer || question.answer}</span>
              </div>
            )}

            {/* 정답 확인 및 사용자 '자가 채점(맞음/틀림)' 토글 (학습/검토 모드) */}
            {(showExplanation || mode !== 'exam') && isAnswered && (
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/80 backdrop-blur-md space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                    자동 채점 판정: {' '}
                    <span className={`inline-flex items-center gap-1 font-black ${
                      isAutoCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {isAutoCorrect ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4 stroke-[3]" />}
                      {isAutoCorrect ? '정답 일치' : '오답 (또는 서술형 차이)'}
                    </span>
                  </div>

                  {/* 사용자 자가 채점 토글 버튼 */}
                  <div className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 px-1">자가 채점:</span>
                    <button
                      type="button"
                      onClick={() => onToggleSelfGraded(question.id, true)}
                      className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-black transition-all cursor-pointer min-h-[32px] sm:min-h-[36px] ${
                        isFinalCorrect 
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      맞음
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleSelfGraded(question.id, false)}
                      className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-black transition-all cursor-pointer min-h-[32px] sm:min-h-[36px] ${
                        !isFinalCorrect 
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      틀림
                    </button>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-1.5 bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 font-mono">
                  <div>• 입력한 답안: <strong className="text-slate-900 dark:text-white font-bold">{userAnswer}</strong></div>
                  <div>• 표준 모범 답안: <strong className="text-blue-600 dark:text-blue-400 font-bold">{question.correct_answer}</strong></div>
                  {question.accepted_answers && question.accepted_answers.length > 1 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                      (인정 답안: {question.accepted_answers.join(', ')})
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 상세 해설 및 오답 피하기 콜아웃 (학습 모드 / 검토 모드) */}
        {showExplanation && (
          <div className="pt-5 space-y-4 border-t border-slate-300/80 dark:border-slate-700">
            {/* 해설 헤더 */}
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm sm:text-base">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              <span>상세 정답 및 해설</span>
            </div>

            {/* 정답 안내 */}
            <div className="p-4 sm:p-5 bg-blue-50/90 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-800 rounded-2xl text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-relaxed backdrop-blur-md break-keep">
              <span className="font-black text-blue-700 dark:text-blue-300 block mb-1.5 text-base sm:text-lg">
                정답: {question.correct_answer || question.answer} {!isSubjective && question.options?.[(question.correct_answer || question.answer) - 1] ? `(${question.options[(question.correct_answer || question.answer) - 1]})` : ''}
              </span>
              <p className="whitespace-pre-line text-slate-800 dark:text-slate-200">{question.explanation}</p>
            </div>

            {/* 오답 피하기 포인트 (trap_avoidance) */}
            {question.trap_avoidance && (
              <div className="p-4 sm:p-5 bg-amber-50/90 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 rounded-2xl text-sm sm:text-base text-amber-950 dark:text-amber-100 leading-relaxed backdrop-blur-md break-keep">
                <div className="flex items-center gap-2 font-black text-amber-900 dark:text-amber-300 mb-1.5">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span>실전 함정 & 오답 피하기 팁</span>
                </div>
                <p className="text-amber-900 dark:text-amber-200">{question.trap_avoidance}</p>
              </div>
            )}

            {/* 수험 꿀팁 (tip) */}
            {question.tip && (
              <div className="p-4 sm:p-5 bg-indigo-50/90 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-800 rounded-2xl text-sm sm:text-base text-indigo-950 dark:text-indigo-100 leading-relaxed backdrop-blur-md break-keep">
                <div className="flex items-center gap-2 font-black text-indigo-900 dark:text-indigo-300 mb-1.5">
                  <Lightbulb className="w-5 h-5 text-indigo-500" />
                  <span>수험 공략 포인트</span>
                </div>
                <p className="text-indigo-900 dark:text-indigo-200">{question.tip}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 하단 문제 이동 컨트롤 바 (넉넉한 모바일 터치 영역) */}
      <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-4 bg-slate-50/80 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800 backdrop-blur-md gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex items-center gap-1 sm:gap-1.5 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer backdrop-blur-md shadow-xs min-h-[44px] sm:min-h-[46px]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>이전 문제</span>
        </button>

        {mode === 'practice' && !showExplanation && (
          <button
            type="button"
            onClick={() => setShowExplanation(true)}
            className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 py-2 px-1 cursor-pointer truncate max-w-[120px] xs:max-w-none"
          >
            해설 보기
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-1 sm:gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/25 cursor-pointer min-h-[44px] sm:min-h-[46px]"
        >
          <span>다음 문제</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}