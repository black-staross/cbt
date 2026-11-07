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
  Zap,
  Calendar,
  Layers
} from 'lucide-react';

export default function ExamHome({
  exams = [],
  onStartExam,
  wrongNotesCountByExam = {},
  bookmarksCountByExam = {},
  selectedYear = 'all',
  onSelectYear
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: '전체 자격증 (6)', icon: Sparkles },
    { id: 'it', label: 'IT / 개발 (3)', icon: Cpu },
    { id: 'data', label: '데이터 (2)', icon: Database },
    { id: 'engineer', label: '기사 / 산업기사 (1)', icon: ShieldCheck }
  ];

  const years = [
    { id: 'all', label: '전체 연도' },
    { id: '2026', label: '2026년 최신' },
    { id: '2025', label: '2025년 기출복원' },
    { id: '2024', label: '2024년' },
    { id: '2023', label: '2023년' },
    { id: '2022', label: '2022년' },
    { id: '2021', label: '2021년' },
    { id: '2020', label: '2020년' }
  ];

  const filteredExams = exams.filter(e => {
    if (selectedCategory === 'all') return true;
    return e.category === selectedCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 컴팩트 리퀴드 글래스 필터 바 (사진의 쓸데없는 거대 배너 완전 제거!) */}
      <div className="glass-card rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 backdrop-blur-xl">
        {/* 상단 타이틀 & 카테고리 탭 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25 shrink-0">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                기출문제 자격증 & 연도 선택
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                원하는 자격증과 연도를 선택하면 즉시 실전 CBT 및 단원별 학습을 시작합니다.
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

        {/* 연도별 필터 칩 바 (2020~2026년 원클릭 선택) */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-200/80 dark:border-slate-800 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0 mr-1">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>기출 연도:</span>
          </div>
          {years.map((y) => {
            const isSelected = selectedYear === y.id;
            return (
              <button
                key={y.id}
                type="button"
                onClick={() => onSelectYear(y.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer min-h-[36px] ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                    : 'glass-pill text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                {y.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 자격증 카드 그리드 (iOS 리퀴드 글래스 전면 적용) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredExams.map((exam) => {
          const wrongCount = wrongNotesCountByExam[exam.id] || 0;
          const bookmarkCount = bookmarksCountByExam[exam.id] || 0;
          const isSubjective = exam.question_type === 'subjective';

          return (
            <div
              key={exam.id}
              className="glass-card rounded-3xl p-5 sm:p-6 hover:border-blue-400 dark:hover:border-blue-500/60 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-2xl"
            >
              {/* 카드 상단 정보 */}
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
                    {isSubjective ? '주관식·실기' : '4지선다'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {exam.description}
                </p>

                {/* 규격 스펙 태그 그리드 */}
                <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold border border-slate-200/80 dark:border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>시간: <strong className="text-slate-900 dark:text-white">{exam.time_limit}분</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-500" />
                    <span>문항: <strong className="text-slate-900 dark:text-white">20문항/회</strong></span>
                  </div>
                  <div className="col-span-2 text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs truncate">
                    기준: <strong className="text-slate-900 dark:text-white">{exam.fail_criteria_description}</strong>
                  </div>
                </div>

                {/* 연도별 빠른 시작 태그 칩 */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    회차별 즉시 선택:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['2026', '2025', '2024', '2023', '2022', '2021', '2020'].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => onStartExam(exam.id, 'exam', yr)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-black bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all cursor-pointer min-h-[32px] border border-slate-300/60 dark:border-slate-700"
                      >
                        {yr}년
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 카드 하단 원클릭 모드 선택 버튼 3가지 */}
              <div className="pt-4 mt-5 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  {/* 실전 모의고사 */}
                  <button
                    type="button"
                    onClick={() => onStartExam(exam.id, 'exam', selectedYear)}
                    className="py-3 px-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl text-xs sm:text-sm font-black transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px]"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>실전 모의고사</span>
                  </button>

                  {/* 단원별 즉시 학습 */}
                  <button
                    type="button"
                    onClick={() => onStartExam(exam.id, 'practice', selectedYear)}
                    className="py-3 px-3.5 glass-pill hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px]"
                  >
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span>단원별 학습</span>
                  </button>
                </div>

                {/* 오답노트 & 북마크 모드 */}
                <button
                  type="button"
                  onClick={() => onStartExam(exam.id, 'review')}
                  className="w-full py-2.5 px-3.5 glass-pill hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer min-h-[44px]"
                >
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>오답 & 북마크 복습</span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
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