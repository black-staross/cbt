import React, { useState, useEffect, useCallback } from 'react';
import examsData from './data/exams.json';
import Header from './components/Header';
import ExamHome from './components/ExamHome';
import QuestionCard from './components/QuestionCard';
import OMRCard from './components/OMRCard';
import ResultModal from './components/ResultModal';
import { BookOpen, AlertCircle, ArrowLeft } from 'lucide-react';

// 6종 문제 데이터 정적 import (CORS 에러 및 오프라인/단일 HTML 파일 완벽 지원)
import sqldQuestions from './data/questions/sqld.json';
import adspQuestions from './data/questions/adsp.json';
import eipWrittenQuestions from './data/questions/eip_written.json';
import com1WrittenQuestions from './data/questions/com1_written.json';
import indSafetyQuestions from './data/questions/ind_safety_written.json';
import eipPracticalQuestions from './data/questions/eip_practical.json';

const QUESTIONS_MAP = {
  sqld: sqldQuestions,
  adsp: adspQuestions,
  eip_written: eipWrittenQuestions,
  com1_written: com1WrittenQuestions,
  ind_safety_written: indSafetyQuestions,
  safety: indSafetyQuestions,
  eip_practical: eipPracticalQuestions
};

export default function App() {
  // 다크모드 상태 관리 (localStorage 영구 동기화)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('cbt_theme');
    if (saved) return saved === 'dark';
    return true; // 기본 다크모드 선호
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cbt_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cbt_theme', 'light');
    }
  }, [isDarkMode]);

  // 현재 선택된 시험 및 모드 상태
  const [currentExamId, setCurrentExamId] = useState(null);
  const [currentMode, setCurrentMode] = useState('home'); // 'home' | 'exam' | 'practice' | 'review'
  const [selectedYear, setSelectedYear] = useState('all'); // 'all' | '2024' | '2023' | ...
  
  // 시험 문제 및 진행 상태
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [selfGraded, setSelfGraded] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [wrongNotes, setWrongNotes] = useState([]);

  // 시험 제어 상태
  const [isPaused, setIsPaused] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isMobileOmrOpen, setIsMobileOmrOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 로컬스토리지 통계 집계 상태 (홈 화면 배지 표시용)
  const [wrongNotesCountByExam, setWrongNotesCountByExam] = useState({});
  const [bookmarksCountByExam, setBookmarksCountByExam] = useState({});

  // 초기 홈 로드 시 각 시험별 오답 및 북마크 통계 로드
  const refreshStorageStats = useCallback(() => {
    const wrongMap = {};
    const bookmarkMap = {};
    examsData.forEach(exam => {
      try {
        const savedWrong = JSON.parse(localStorage.getItem(`${exam.id}_wrong`) || '[]');
        const savedBookmarks = JSON.parse(localStorage.getItem(`${exam.id}_bookmarks`) || '[]');
        wrongMap[exam.id] = savedWrong.length;
        bookmarkMap[exam.id] = savedBookmarks.length;
      } catch (e) {
        wrongMap[exam.id] = 0;
        bookmarkMap[exam.id] = 0;
      }
    });
    setWrongNotesCountByExam(wrongMap);
    setBookmarksCountByExam(bookmarkMap);
  }, []);

  useEffect(() => {
    refreshStorageStats();
  }, [refreshStorageStats]);

  // 현재 선택된 시험 메타데이터
  const currentExam = examsData.find(e => e.id === currentExamId) || null;

  // 시험 시작 핸들러 (연도별 필터링 연동)
  const handleStartExam = (examId, mode, year = selectedYear) => {
    setIsLoading(true);
    try {
      const allQuestions = QUESTIONS_MAP[examId] || [];

      // 로컬스토리지에서 오답 및 북마크 불러오기
      const savedWrong = JSON.parse(localStorage.getItem(`${examId}_wrong`) || '[]');
      const savedBookmarks = JSON.parse(localStorage.getItem(`${examId}_bookmarks`) || '[]');

      let targetQuestions = allQuestions;

      // 특정 연도 선택 시 필터링
      if (year && year !== 'all') {
        const filteredByYear = allQuestions.filter(q => String(q.year) === String(year));
        if (filteredByYear.length > 0) {
          targetQuestions = filteredByYear;
        }
      }

      // 오답노트 & 북마크 모드인 경우 필터링
      if (mode === 'review') {
        const targetIds = new Set([...savedWrong, ...savedBookmarks]);
        targetQuestions = allQuestions.filter(q => targetIds.has(q.id));
      }

      setCurrentExamId(examId);
      setCurrentMode(mode);
      setQuestions(targetQuestions);
      setCurrentIndex(0);
      setUserAnswers({});
      setSelfGraded({});
      setBookmarks(savedBookmarks);
      setWrongNotes(savedWrong);
      setShowResultModal(false);
      setIsPaused(false);
      setIsMobileOmrOpen(false);
    } catch (err) {
      console.error('문제 로딩 실패:', err);
      alert('문제 데이터를 로드하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 홈으로 이동 핸들러
  const handleGoHome = () => {
    if (currentMode === 'exam' && !showResultModal) {
      if (!window.confirm('현재 진행 중인 시험이 종료됩니다. 홈으로 이동하시겠습니까?')) {
        return;
      }
    }
    setCurrentExamId(null);
    setCurrentMode('home');
    setQuestions([]);
    setUserAnswers({});
    setShowResultModal(false);
    refreshStorageStats();
  };

  // 답안 입력 / 선택 핸들러
  const handleAnswer = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // 단원별 학습 모드인 경우, 실시간 오답노트 자동 등록 처리
    if (currentMode === 'practice' && currentExamId) {
      const q = questions.find(item => item.id === questionId);
      if (q) {
        let isCorrect = false;
        if (q.type === 'subjective') {
          if (q.accepted_answers) {
            const clean = String(answer).trim().toLowerCase().replace(/\s+/g, ' ');
            isCorrect = q.accepted_answers.some(ans => ans.trim().toLowerCase().replace(/\s+/g, ' ') === clean);
          }
        } else {
          isCorrect = answer === q.correct_answer;
        }

        // 오답이면 로컬스토리지에 추가, 정답이면 기존 오답에서 제거
        try {
          const key = `${currentExamId}_wrong`;
          let wrongList = JSON.parse(localStorage.getItem(key) || '[]');
          if (!isCorrect && !wrongList.includes(questionId)) {
            wrongList.push(questionId);
            localStorage.setItem(key, JSON.stringify(wrongList));
            setWrongNotes(wrongList);
          } else if (isCorrect && wrongList.includes(questionId)) {
            wrongList = wrongList.filter(id => id !== questionId);
            localStorage.setItem(key, JSON.stringify(wrongList));
            setWrongNotes(wrongList);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  // 주관식 사용자 '자가 채점' 토글 핸들러
  const handleToggleSelfGraded = (questionId, isCorrect) => {
    setSelfGraded(prev => ({
      ...prev,
      [questionId]: isCorrect
    }));

    // 오답노트 동기화
    if (currentExamId) {
      try {
        const key = `${currentExamId}_wrong`;
        let wrongList = JSON.parse(localStorage.getItem(key) || '[]');
        if (!isCorrect && !wrongList.includes(questionId)) {
          wrongList.push(questionId);
          localStorage.setItem(key, JSON.stringify(wrongList));
          setWrongNotes(wrongList);
        } else if (isCorrect && wrongList.includes(questionId)) {
          wrongList = wrongList.filter(id => id !== questionId);
          localStorage.setItem(key, JSON.stringify(wrongList));
          setWrongNotes(wrongList);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // 북마크 토글 핸들러 (localStorage 동기화)
  const handleToggleBookmark = (questionId) => {
    if (!currentExamId) return;
    const key = `${currentExamId}_bookmarks`;
    let updated;
    if (bookmarks.includes(questionId)) {
      updated = bookmarks.filter(id => id !== questionId);
    } else {
      updated = [...bookmarks, questionId];
    }
    setBookmarks(updated);
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // 시험 제출 핸들러 (모의고사 종료 및 채점)
  const handleSubmitExam = () => {
    // 미표기 문항 확인
    const unansweredCount = questions.filter(q => {
      const a = userAnswers[q.id];
      if (a === undefined || a === null) return true;
      if (typeof a === 'string') return a.trim().length === 0;
      return false;
    }).length;

    if (unansweredCount > 0) {
      if (!window.confirm(`미표기된 문항이 ${unansweredCount}개 있습니다. 그래도 제출하시겠습니까?`)) {
        return;
      }
    }

    // 오답들을 시험 오답노트 로컬스토리지에 저장
    if (currentExamId) {
      try {
        const key = `${currentExamId}_wrong`;
        let wrongList = JSON.parse(localStorage.getItem(key) || '[]');
        
        questions.forEach(q => {
          const userAns = userAnswers[q.id];
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

          if (!isCorrect && !wrongList.includes(q.id)) {
            wrongList.push(q.id);
          }
        });

        localStorage.setItem(key, JSON.stringify(wrongList));
        setWrongNotes(wrongList);
      } catch (e) {
        console.error(e);
      }
    }

    setShowResultModal(true);
    setIsMobileOmrOpen(false);
  };

  // 모의고사 제한시간 만료 시 자동 제출
  const handleTimeUp = () => {
    alert('시험 제한시간이 종료되어 답안이 자동으로 최종 제출됩니다.');
    handleSubmitExam();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 relative transition-colors duration-200">
      {/* 프리미엄 iOS 리퀴드 글래스 앰비언트 글로우 레이어 */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-blue-500/15 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-teal-500/10 dark:bg-teal-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* 글로벌 상단 헤더 (다크모드 스위치 연동) */}
      <Header
        currentExam={currentExam}
        currentMode={currentMode}
        onGoHome={handleGoHome}
        onTimeUp={handleTimeUp}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(prev => !prev)}
        onToggleMobileOmr={() => setIsMobileOmrOpen(prev => !prev)}
        unansweredCount={questions.filter(q => !userAnswers[q.id]).length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
      />

      {/* 메인 뷰 분기 */}
      <main className="flex-1 flex flex-col relative z-10">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-12 text-slate-500 dark:text-slate-400 font-semibold text-sm">
            CBT 시험 데이터를 준비 중입니다...
          </div>
        ) : currentMode === 'home' || !currentExam ? (
          // 1. 홈 화면 (자격증 및 2020~2024년 회차 즉시 선택)
          <ExamHome
            exams={examsData}
            onStartExam={handleStartExam}
            wrongNotesCountByExam={wrongNotesCountByExam}
            bookmarksCountByExam={bookmarksCountByExam}
            selectedYear={selectedYear}
            onSelectYear={(yr) => setSelectedYear(yr)}
          />
        ) : questions.length === 0 ? (
          // 오답노트/북마크 모드 등에서 문제가 없을 때의 Empty State
          <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl glass-pill flex items-center justify-center text-slate-400">
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">저장된 문제가 없습니다</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              현재 [{currentExam.name}]의 저장된 오답 또는 북마크가 비어 있습니다.<br />
              단원별 학습이나 실전 모의고사를 진행하여 오답과 북마크를 수집해 보세요.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleStartExam(currentExam.id, 'practice')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/25"
              >
                단원별 학습 시작
              </button>
              <button
                type="button"
                onClick={handleGoHome}
                className="px-4 py-2.5 glass-pill hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        ) : (
          // 2. CBT 시험장 화면: 좌측 65% 문제 카드 + 우측 35% OMR 카드 분할 레이아웃
          <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 min-h-[640px]">
              {/* 좌측 65% (8/12 컬럼): 문제 영역 */}
              <div className="md:col-span-8 flex flex-col h-full">
                <QuestionCard
                  question={questions[currentIndex]}
                  index={currentIndex}
                  totalCount={questions.length}
                  userAnswer={userAnswers[questions[currentIndex]?.id]}
                  onAnswer={handleAnswer}
                  mode={currentMode}
                  isBookmarked={bookmarks.includes(questions[currentIndex]?.id)}
                  onToggleBookmark={handleToggleBookmark}
                  onPrev={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  onNext={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  hasPrev={currentIndex > 0}
                  hasNext={currentIndex < questions.length - 1}
                  selfGraded={selfGraded[questions[currentIndex]?.id]}
                  onToggleSelfGraded={handleToggleSelfGraded}
                />
              </div>

              {/* 우측 35% (4/12 컬럼): OMR 답안지 영역 */}
              <div className="hidden md:flex md:col-span-4 flex-col h-full">
                <OMRCard
                  questions={questions}
                  currentIndex={currentIndex}
                  onSelectQuestion={(idx) => setCurrentIndex(idx)}
                  answers={userAnswers}
                  bookmarks={bookmarks}
                  onSubmitExam={handleSubmitExam}
                  isSubjective={currentExam.question_type === 'subjective'}
                  isMobileOpen={false}
                />
              </div>

              {/* 모바일 전용 OMR 바텀시트 / 모달 */}
              {isMobileOmrOpen && (
                <div className="md:hidden">
                  <OMRCard
                    questions={questions}
                    currentIndex={currentIndex}
                    onSelectQuestion={(idx) => {
                      setCurrentIndex(idx);
                      setIsMobileOmrOpen(false);
                    }}
                    answers={userAnswers}
                    bookmarks={bookmarks}
                    onSubmitExam={handleSubmitExam}
                    isSubjective={currentExam.question_type === 'subjective'}
                    isMobileOpen={true}
                    onCloseMobile={() => setIsMobileOmrOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 결과 분석 및 채점 모달 (모의고사 제출 시) */}
      {showResultModal && (
        <ResultModal
          examMeta={currentExam}
          questions={questions}
          answers={userAnswers}
          selfGraded={selfGraded}
          onReviewExam={() => {
            setShowResultModal(false);
            setCurrentMode('practice'); // 검토를 위해 학습/해설 모드로 전환
            setCurrentIndex(0);
          }}
          onGoToWrongNotes={() => {
            setShowResultModal(false);
            handleStartExam(currentExam.id, 'review');
          }}
          onGoHome={handleGoHome}
        />
      )}
    </div>
  );
}