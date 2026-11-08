import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Database, 
  ShieldCheck, 
  ChevronDown, 
  Play, 
  BookOpen, 
  Bookmark, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function ExamHome({
  exams = [],
  onStartExam,
  wrongNotesCountByExam = {},
  bookmarksCountByExam = {}
}) {
  // 상단 유형별 필터 (요구사항 1: 유형별로 나눈 것만 슬릭하게 남김)
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 현재 열려있는(펼쳐진) 자격증 ID (요구사항 2: 이름만 보이고 누르면 아래로 펼쳐짐)
  const [expandedExamId, setExpandedExamId] = useState(null);

  // 각 자격증별 선택된 연도 상태 (기본 2026년)
  const [selectedYears, setSelectedYears] = useState({});
  // 각 자격증별 선택된 회차 상태 (기본 1회)
  const [selectedSessions, setSelectedSessions] = useState({});
  // 각 자격증별 선택된 과목 상태 (기본 'all' 전체)
  const [selectedSubjects, setSelectedSubjects] = useState({});

  const categories = [
    { id: 'all', label: '전체 자격증 (6)', icon: Sparkles },
    { id: 'it', label: 'IT / 개발 (3)', icon: Cpu },
    { id: 'data', label: '데이터 (2)', icon: Database },
    { id: 'engineer', label: '기사 / 산업기사 (1)', icon: ShieldCheck }
  ];

  const availableYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];

  const filteredExams = exams.filter(e => {
    if (selectedCategory === 'all') return true;
    return e.category === selectedCategory;
  });

  const toggleExpand = (examId) => {
    setExpandedExamId(prev => (prev === examId ? null : examId));
  };

  const handleYearChange = (examId, yr) => {
    setSelectedYears(prev => ({ ...prev, [examId]: yr }));
  };

  const handleSessionChange = (examId, sessNum) => {
    setSelectedSessions(prev => ({ ...prev, [examId]: sessNum }));
  };

  const handleSubjectChange = (examId, subId) => {
    setSelectedSubjects(prev => ({ ...prev, [examId]: subId }));
  };

  // 각 시험별 연간 회차 목록 반환 (연도별 복수 시험 일정)
  const getExamSessions = (examId) => {
    if (examId === 'sqld' || examId === 'adsp') {
      return [
        { num: 1, label: '제1회 (봄 검정)' },
        { num: 2, label: '제2회 (여름 검정)' },
        { num: 3, label: '제3회 (가을 검정)' },
        { num: 4, label: '제4회 (겨울 검정)' }
      ];
    }
    return [
      { num: 1, label: '제1회 정기검정' },
      { num: 2, label: '제2회 정기검정' },
      { num: 3, label: '제3회 정기검정' }
    ];
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 overflow-x-hidden box-border">
      {/* 상단 유형별 필터 바 (간결하고 심플한 플랫 탭) */}
      <div className="w-full overflow-x-auto no-scrollbar flex justify-start sm:justify-center py-1">
        <div className="inline-flex p-1 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-xs shrink-0">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer min-h-[36px] sm:min-h-[38px] break-keep ${
                  isActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400 dark:text-blue-600' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 자격증 리스트 (선택 시에도 외곽 크기 동일 유지) */}
      <div className="space-y-3">
        {filteredExams.map((exam, idx) => {
          const isExpanded = expandedExamId === exam.id;
          const wrongCount = wrongNotesCountByExam[exam.id] || 0;
          const bookmarkCount = bookmarksCountByExam[exam.id] || 0;
          const currentYear = selectedYears[exam.id] || '2026';
          const currentSession = selectedSessions[exam.id] || 1;
          const currentSubject = selectedSubjects[exam.id] || 'all';
          const sessions = getExamSessions(exam.id);
          const isSubjective = exam.question_type === 'subjective';

          return (
            <div
              key={exam.id}
              className={`rounded-2xl sm:rounded-3xl transition-colors duration-200 overflow-hidden border ${
                isExpanded
                  ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-xs'
                  : 'bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              {/* 자격증 이름 헤더 (클릭 시 아코디언 토글, 외곽 크기 변동 없음) */}
              <button
                type="button"
                onClick={() => toggleExpand(exam.id)}
                className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3 sm:gap-4 text-left cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-3.5 flex-1 min-w-0">
                  {/* 넘버링 배지 (크기 완전 고정) */}
                  <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl sm:rounded-2xl flex items-center justify-center font-mono text-xs font-black shrink-0 transition-colors ${
                    isExpanded 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-white/15'
                  }`}>
                    0{idx + 1}
                  </span>

                  {/* 자격증 이름 및 메타 태그 */}
                  <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                    <div className="min-w-0">
                      <h3 className={`text-base sm:text-lg font-black tracking-tight truncate break-keep transition-colors ${
                        isExpanded 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`}>
                        {exam.name}
                      </h3>
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block truncate">
                        {exam.issuer} • {exam.question_count}문항 • {exam.time_limit}분
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <span className={`px-2 sm:px-2.5 py-0.5 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap ${
                        isSubjective
                          ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                      }`}>
                        {isSubjective ? '주관식·실기' : '4지선다'}
                      </span>
                      {wrongCount > 0 && (
                        <span className="text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-md sm:rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 whitespace-nowrap">
                          오답 {wrongCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 화살표 아이콘 */}
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                }`}>
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </button>

              {/* 누르면 아래로 펼쳐지는 상세 정보 영역 (화면 폭 100% 고정, 흔들림 방지) */}
              {isExpanded && (
                <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-1 border-t border-slate-100 dark:border-white/10 space-y-4 w-full max-w-full box-border">
                  {/* 시험 소개 */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal break-keep">
                    {exam.description}
                  </p>

                  {/* 1단계: 기출연도 */}
                  <div className="space-y-1.5 w-full">
                    <div className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>기출연도</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 w-full">
                      {availableYears.map((yr) => {
                        const isSelected = currentYear === yr;
                        return (
                          <button
                            key={yr}
                            type="button"
                            onClick={() => handleYearChange(exam.id, yr)}
                            className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer min-h-[34px] w-full flex items-center justify-center border ${
                              isSelected
                                ? 'bg-transparent border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-black'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                            }`}
                          >
                            <span>{yr}년</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2단계: 시험회차 (시계 아이콘 파란색 통일) */}
                  <div className="space-y-1.5 w-full">
                    <div className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>시험회차</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                      {sessions.map((sess) => {
                        const isSessSelected = currentSession === sess.num;
                        return (
                          <button
                            key={sess.num}
                            type="button"
                            onClick={() => handleSessionChange(exam.id, sess.num)}
                            className={`p-2.5 rounded-xl text-xs font-bold transition-colors text-center cursor-pointer break-keep leading-snug min-h-[38px] w-full flex items-center justify-center border ${
                              isSessSelected
                                ? 'bg-transparent border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-black'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                            }`}
                          >
                            <span>{sess.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3단계: 시험 과목 (과목 옆에 '전체' 버튼 배치 & 그리드 반응형 고정) */}
                  <div className="space-y-1.5 w-full">
                    <div className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>시험 과목</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
                      {/* '전체' 버튼 */}
                      <button
                        type="button"
                        onClick={() => handleSubjectChange(exam.id, 'all')}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[38px] w-full flex items-center justify-between border ${
                          currentSubject === 'all'
                            ? 'bg-transparent border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-black'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-bold">전체 과목</span>
                        <span className="font-mono text-[11px] opacity-75">{exam.question_count}제</span>
                      </button>

                      {/* 개별 과목 버튼들 */}
                      {exam.subjects && exam.subjects.map((sub, sIdx) => {
                        const isSubSelected = currentSubject === sub.id;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => handleSubjectChange(exam.id, sub.id)}
                            className={`p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[38px] w-full flex items-center justify-between border ${
                              isSubSelected
                                ? 'bg-transparent border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-black'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                            }`}
                          >
                            <span className="truncate pr-1 break-keep text-left">{sIdx + 1}. {sub.name.replace(/^[0-9제]+\s*과목\s*/, '')}</span>
                            <span className="font-mono text-[11px] opacity-75 shrink-0">{sub.question_count}제</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4단계: 과목 아래로 시험보기 / 연습하기 액션 버튼 */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-white/10">
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      {/* 시험보기 버튼 (타이머 자동 시작) */}
                      <button
                        type="button"
                        onClick={() => onStartExam(
                          exam.id, 
                          'exam', 
                          currentYear, 
                          currentSubject === 'all' ? null : currentSubject, 
                          currentSession
                        )}
                        className="py-3 sm:py-3.5 px-3.5 sm:px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[46px] break-keep text-center"
                      >
                        <Play className="w-4 h-4 fill-current shrink-0" />
                        <span>시험보기</span>
                      </button>

                      {/* 연습하기 버튼 (타이머 없는 버전) */}
                      <button
                        type="button"
                        onClick={() => onStartExam(
                          exam.id, 
                          'practice', 
                          currentYear, 
                          currentSubject === 'all' ? null : currentSubject, 
                          currentSession
                        )}
                        className="py-3 sm:py-3.5 px-3.5 sm:px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-[0.99] rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[46px] break-keep text-center"
                      >
                        <BookOpen className="w-4 h-4 shrink-0" />
                        <span>연습하기</span>
                      </button>
                    </div>

                    {/* 오답 및 북마크 복습 */}
                    {(wrongCount > 0 || bookmarkCount > 0) && (
                      <button
                        type="button"
                        onClick={() => onStartExam(exam.id, 'review')}
                        className="w-full py-2.5 px-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer min-h-[38px]"
                      >
                        <div className="flex items-center gap-2">
                          <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                          <span>오답 및 북마크 복습</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                          {wrongCount + bookmarkCount}문항
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
