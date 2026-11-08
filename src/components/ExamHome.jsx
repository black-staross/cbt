import React, { useState } from 'react';
import { 
  GraduationCap, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  HelpCircle, 
  Play, 
  BookOpen, 
  Bookmark, 
  CheckCircle, 
  ChevronRight,
  Sparkles,
  Calendar,
  Layers,
  Filter,
  Check,
  ChevronDown
} from 'lucide-react';

export default function ExamHome({
  exams = [],
  onStartExam,
  wrongNotesCountByExam = {},
  bookmarksCountByExam = {},
  selectedYear = '2024',
  onSelectYear
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  // 각 카드별로 선택된 연도 상태 (기본값 2024년)
  const [cardSelectedYears, setCardSelectedYears] = useState({});
  // 각 카드별로 '과목별 펼쳐보기' 토글 상태
  const [expandedSubjectCards, setExpandedSubjectCards] = useState({});

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

  // 카드별 연도 변경
  const handleCardYearChange = (examId, yr) => {
    setCardSelectedYears(prev => ({
      ...prev,
      [examId]: yr
    }));
  };

  // 과목 아코디언 토글
  const toggleSubjectExpand = (examId) => {
    setExpandedSubjectCards(prev => ({
      ...prev,
      [examId]: !prev[examId]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 컴팩트 필터 바 */}
      <div className="glass-card rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25 shrink-0">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                2020~2026년 국가공인 자격검정 CBT 문제 은행
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                연도별 <strong>정규 회차 전체 실전 시험(100제/60제/50제/20제)</strong>과 <strong>과목별 분할 집중 학습</strong>을 자유롭게 선택할 수 있습니다.
              </p>
            </div>
          </div>

          {/* 카테고리 탭 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer min-h-[40px] ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'glass-pill text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 자격증 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredExams.map((exam) => {
          const wrongCount = wrongNotesCountByExam[exam.id] || 0;
          const bookmarkCount = bookmarksCountByExam[exam.id] || 0;
          const isSubjective = exam.question_type === 'subjective';
          const subjectCount = exam.subjects?.length || 1;
          const currentYear = cardSelectedYears[exam.id] || selectedYear || '2024';
          const isSubjectExpanded = Boolean(expandedSubjectCards[exam.id]);

          return (
            <div
              key={exam.id}
              className="glass-card rounded-3xl p-5 sm:p-6 hover:border-blue-400 dark:hover:border-blue-500/60 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-2xl"
            >
              {/* 카드 상단 헤더 & 설명 */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 tracking-wider uppercase">
                      {exam.issuer}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {exam.name}
                    </h3>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-black tracking-tight shrink-0 ${
                    isSubjective 
                      ? 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/30' 
                      : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                  }`}>
                    {isSubjective ? '주관식·실기' : '4지선다 객관식'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {exam.description}
                </p>

                {/* 1단계: 기출 연도 선택 칩 바 (2020 ~ 2026) */}
                <div className="p-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      1. 기출 연도 선택:
                    </span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">
                      {currentYear}년 기출 풀세트
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {availableYears.map((yr) => {
                      const isSelected = currentYear === yr;
                      return (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => handleCardYearChange(exam.id, yr)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer min-h-[32px] border ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30 scale-[1.03]'
                              : 'bg-white/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 border-slate-300/80 dark:border-slate-600 hover:border-slate-400'
                          }`}
                        >
                          {yr}년
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 공식 검정 규격 요약 배지 */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 font-bold px-1">
                  <div>
                    시간: <strong className="text-slate-900 dark:text-white">{exam.time_limit}분</strong>
                  </div>
                  <div>
                    정규 문항: <strong className="text-slate-900 dark:text-white">{exam.question_count}문항</strong> ({subjectCount}과목)
                  </div>
                </div>
              </div>

              {/* 카드 하단: 2단계 응시 방식 선택 */}
              <div className="pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  {/* 전체 실전 모의고사 (풀세트) */}
                  <button
                    type="button"
                    onClick={() => onStartExam(exam.id, 'exam', currentYear, null)}
                    title={`${currentYear}년 전체 ${exam.question_count}문항 실전 시험`}
                    className="py-3 px-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl text-xs sm:text-sm font-black transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 cursor-pointer min-h-[46px]"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>전체 시험 ({exam.question_count}제)</span>
                  </button>

                  {/* 과목별 나눠서 풀기 토글 */}
                  <button
                    type="button"
                    onClick={() => {
                      if (exam.subjects && exam.subjects.length > 1) {
                        toggleSubjectExpand(exam.id);
                      } else {
                        onStartExam(exam.id, 'practice', currentYear, null);
                      }
                    }}
                    className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1 cursor-pointer min-h-[46px] border ${
                      isSubjectExpanded
                        ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-500 text-blue-600 dark:text-blue-300'
                        : 'glass-pill hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span>과목별 나눠보기</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSubjectExpanded ? 'rotate-180 text-blue-500' : ''}`} />
                  </button>
                </div>

                {/* 과목별 상세 칩 리스트 (펼쳤을 때) */}
                {isSubjectExpanded && exam.subjects && exam.subjects.length > 1 && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-blue-200 dark:border-blue-900/60 space-y-2 animate-in fade-in duration-150">
                    <div className="text-[11px] font-black text-slate-600 dark:text-slate-300 flex items-center justify-between">
                      <span>{currentYear}년 과목 선택 학습:</span>
                      <span className="text-blue-600 dark:text-blue-400 font-normal">즉시 정답/해설 확인</span>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {exam.subjects.map((sub, sIdx) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => onStartExam(exam.id, 'practice', currentYear, sub.id)}
                          className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-slate-700 transition-all text-left flex items-center justify-between cursor-pointer"
                        >
                          <span className="truncate">
                            {sIdx + 1}. {sub.name.replace(/^[0-9제]+\s*과목\s*/, '')}
                          </span>
                          <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                            {sub.question_count}제
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 오답노트 & 북마크 복습 */}
                <button
                  type="button"
                  onClick={() => onStartExam(exam.id, 'review')}
                  className="w-full py-2.5 px-3.5 glass-pill hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer min-h-[42px]"
                >
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>오답 & 북마크 복습</span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    오답 {wrongCount} • 북마크 {bookmarkCount}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
