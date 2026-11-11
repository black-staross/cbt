import React, { useState, useEffect, useCallback } from 'react';
import examsData from './data/exams.json';
import Header from './components/Header';
import ExamHome from './components/ExamHome';
import QuestionCard from './components/QuestionCard';
import OMRCard from './components/OMRCard';
import ResultModal from './components/ResultModal';
import SubjectTabBar from './components/SubjectTabBar';
import { BookOpen } from 'lucide-react';

// 6종 문제 데이터 정적 import (2020~2026년 다중 회차 대규모 문제 은행)
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
    return true; // 기본 다크모드
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
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedSessionNumber, setSelectedSessionNumber] = useState(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [homeResetKey, setHomeResetKey] = useState(0); // 홈 복귀 시 첫 화면(전체 자격증) 리셋 키
  
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

  // 초기 홈 로드 시 각 시험별 오답 및 북마크 통계 로드 (요구사항 1: 실제 존재하는 유효 문제만 카운트 및 정리)
  const refreshStorageStats = useCallback(() => {
    const wrongMap = {};
    const bookmarkMap = {};
    examsData.forEach(exam => {
      try {
        const allQ = QUESTIONS_MAP[exam.id] || [];
        const validQIds = new Set(allQ.map(q => q.id));

        const savedWrong = JSON.parse(localStorage.getItem(`${exam.id}_wrong`) || '[]');
        const actualWrong = Array.isArray(savedWrong) ? savedWrong.filter(id => validQIds.has(id)) : [];
        if (Array.isArray(savedWrong) && actualWrong.length !== savedWrong.length) {
          localStorage.setItem(`${exam.id}_wrong`, JSON.stringify(actualWrong));
        }

        const savedBookmarks = JSON.parse(localStorage.getItem(`${exam.id}_bookmarks`) || '[]');
        const actualBookmarks = Array.isArray(savedBookmarks) ? savedBookmarks.filter(id => validQIds.has(id)) : [];
        if (Array.isArray(savedBookmarks) && actualBookmarks.length !== savedBookmarks.length) {
          localStorage.setItem(`${exam.id}_bookmarks`, JSON.stringify(actualBookmarks));
        }

        wrongMap[exam.id] = actualWrong.length;
        bookmarkMap[exam.id] = actualBookmarks.length;
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

  // 시험 시작 핸들러 (연도, 회차, 과목별 필터링 완벽 지원)
  const handleStartExam = (
    examId, 
    mode = 'exam', 
    year = '2026', 
    subjectId = null, 
    sessionNumber = 1
  ) => {
    setIsLoading(true);
    try {
      const allQuestions = QUESTIONS_MAP[examId] || [];

      // 로컬스토리지에서 오답 및 북마크 불러오기
      const savedWrong = JSON.parse(localStorage.getItem(`${examId}_wrong`) || '[]');
      const savedBookmarks = JSON.parse(localStorage.getItem(`${examId}_bookmarks`) || '[]');

      let targetQuestions = allQuestions;

      // 1. 연도 및 회차 필터링
      if (year && year !== 'all') {
        const filteredByYearSess = allQuestions.filter(q => 
          String(q.year) === String(year) && 
          Number(q.session_number || 1) === Number(sessionNumber || 1)
        );
        if (filteredByYearSess.length > 0) {
          targetQuestions = filteredByYearSess;
        } else {
          // 연도만 일치하는 경우 fallback
          const filteredByYear = allQuestions.filter(q => String(q.year) === String(year));
          if (filteredByYear.length > 0) {
            targetQuestions = filteredByYear;
          }
        }
      }

      // 2. 과목별 필터링 (특정 과목만 골라서 학습 시)
      if (subjectId !== null && subjectId !== undefined && subjectId !== 'all') {
        const filteredBySubject = targetQuestions.filter(q => 
          Number(q.subject_id) === Number(subjectId) || String(q.subject_id) === String(subjectId)
        );
        if (filteredBySubject.length > 0) {
          targetQuestions = filteredBySubject;
        }
      }

      // 안전 fallback: 만약 필터 결과가 비어있다면 전체 문제로 fallback
      if (targetQuestions.length === 0 && allQuestions.length > 0) {
        targetQuestions = allQuestions;
      }

      // 3. 오답노트 & 북마크 모드인 경우 필터링 (요구사항 1: 유효한 문제만 엄격하게 매칭)
      if (mode === 'wrong') {
        const validWrong = Array.isArray(savedWrong) ? savedWrong.filter(id => allQuestions.some(q => q.id === id)) : [];
        if (validWrong.length === 0) {
          alert('저장된 오답 문제가 없습니다.');
          setIsLoading(false);
          refreshStorageStats();
          return;
        }
        targetQuestions = allQuestions.filter(q => validWrong.includes(q.id));
      } else if (mode === 'bookmark') {
        const validBookmarks = Array.isArray(savedBookmarks) ? savedBookmarks.filter(id => allQuestions.some(q => q.id === id)) : [];
        if (validBookmarks.length === 0) {
          alert('북마크된 문제가 없습니다.');
          setIsLoading(false);
          refreshStorageStats();
          return;
        }
        targetQuestions = allQuestions.filter(q => validBookmarks.includes(q.id));
      } else if (mode === 'review') {
        const targetIds = new Set([...savedWrong, ...savedBookmarks]);
        targetQuestions = allQuestions.filter(q => targetIds.has(q.id));
      }

      setCurrentExamId(examId);
      setCurrentMode(mode);
      setSelectedYear(year || '2026');
      setSelectedSessionNumber(sessionNumber || 1);
      setSelectedSubjectId(subjectId);
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

  // 홈으로 이동 핸들러 (첫 화면 전체 자격증 상태로 초기화)
  const handleGoHome = () => {
    if (currentMode === 'exam' && !showResultModal) {
      if (!window.confirm('현재 진행 중인 실전 시험이 종료됩니다. 홈으로 이동하시겠습니까?')) {
        return;
      }
    }
    setCurrentExamId(null);
    setCurrentMode('home');
    setSelectedSubjectId(null);
    setQuestions([]);
    setUserAnswers({});
    setShowResultModal(false);
    setHomeResetKey(prev => prev + 1); // 첫 화면(전체 자격증 리스트)으로 초기화
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

  // 북마크 토글 핸들러
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

  // 시험 제출 핸들러
  const handleSubmitExam = () => {
    const unansweredCount = questions.filter(q => {
      const a = userAnswers[q.id];
      if (a === undefined || a === null) return true;
      if (typeof a === 'string') return a.trim().length === 0;
      return false;
    }).length;

    if (unansweredCount > 0) {
      if (!window.confirm(`미표기된 문항이 ${unansweredCount}개 남아있습니다. 그래도 최종 제출하시겠습니까?`)) {
        return;
      }
    }

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

  // 제한시간 만료 시 자동 제출
  const handleTimeUp = () => {
    alert('시험 제한시간이 종료되어 답안이 자동으로 최종 제출됩니다.');
    handleSubmitExam();
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[#F8F9FA] dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 relative transition-colors duration-300 font-sans antialiased selection:bg-blue-500 selection:text-white box-border">
      {/* 유러피안 리퀴드 글래스 앰비언트 글로우 오브젝트 */}
      <div className="fixed -top-48 -left-48 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/12 to-blue-500/10 dark:from-indigo-600/10 dark:to-blue-600/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed top-1/4 -right-48 w-[550px] h-[550px] bg-gradient-to-bl from-teal-500/10 to-emerald-500/8 dark:from-teal-600/8 dark:to-emerald-600/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-48 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/8 to-rose-500/6 dark:from-amber-600/5 dark:to-rose-600/5 rounded-full blur-[130px] pointer-events-none" />

      {/* 헤더 */}
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

      {/* 요구사항 3: 시험볼 때 문제 위에 전체 풀세트, 1과목 등의 버튼(SubjectTabBar) 완전 삭제 */}

      {/* 메인 뷰 (가로 넘침 방지 고정) */}
      <main className="flex-1 flex flex-col relative z-10 w-full max-w-full overflow-x-hidden">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-12 text-slate-400 font-medium text-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
              <span>CBT 시험 데이터를 준비하고 있습니다...</span>
            </div>
          </div>
        ) : currentMode === 'home' || !currentExam ? (
          // 홈 화면 (자격증 이름 목록 아코디언)
          <ExamHome
            key={homeResetKey}
            exams={examsData}
            onStartExam={handleStartExam}
            wrongNotesCountByExam={wrongNotesCountByExam}
            bookmarksCountByExam={bookmarksCountByExam}
          />
        ) : questions.length === 0 ? (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 backdrop-blur-xl">
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">저장된 문제가 없습니다</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              현재 [{currentExam.name}]의 저장된 오답 또는 북마크가 비어 있습니다.<br />
              실전 모의고사나 과목별 학습을 진행하여 문제를 수집해 보세요.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleStartExam(currentExam.id, 'practice', selectedYear, null, selectedSessionNumber)}
                className="px-4 py-2.5 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs bg-blue-50/50 dark:bg-blue-950/40"
              >
                전체 문제 학습
              </button>
              <button
                type="button"
                onClick={handleGoHome}
                className="px-4 py-2.5 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-white/10"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        ) : (
          // CBT 시험장 화면 (요구사항 2: OMR을 하단바 메뉴 안에 넣고 왼쪽에서 열리게 함)
          <div className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col min-h-[640px]">
            <QuestionCard
              question={questions[currentIndex]}
              index={currentIndex}
              totalCount={questions.length}
              userAnswer={userAnswers[questions[currentIndex]?.id]}
              userAnswers={userAnswers}
              onAnswer={handleAnswer}
              mode={currentMode}
              isBookmarked={bookmarks.includes(questions[currentIndex]?.id)}
              bookmarks={bookmarks}
              onToggleBookmark={handleToggleBookmark}
              onPrev={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              onNext={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              hasPrev={currentIndex > 0}
              hasNext={currentIndex < questions.length - 1}
              onSelectIndex={(idx) => setCurrentIndex(idx)}
              selfGraded={selfGraded[questions[currentIndex]?.id]}
              onToggleSelfGraded={handleToggleSelfGraded}
              subjects={currentExam?.subjects || []}
              questions={questions}
              onSubmitExam={handleSubmitExam}
            />
          </div>
        )}
      </main>

      {/* 채점 결과 모달 */}
      {showResultModal && (
        <ResultModal
          examMeta={currentExam}
          questions={questions}
          answers={userAnswers}
          selfGraded={selfGraded}
          onReviewExam={() => {
            setShowResultModal(false);
            setCurrentMode('practice');
            setCurrentIndex(0);
          }}
          onGoToWrongNotes={() => {
            setShowResultModal(false);
            handleStartExam(currentExam.id, 'wrong');
          }}
          onGoHome={handleGoHome}
        />
      )}
    </div>
  );
}
