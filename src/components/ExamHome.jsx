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

  // 각 자격증별 선택된 연도 상태 (기본 2024년)
  const [selectedYears, setSelectedYears] = useState({});
  // 각 자격증별 선택된 회차 상태 (기본 1회)
  const [selectedSessions, setSelectedSessions] = useState({});

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

  // 각 시험별 연간 회차 목록 반환 (요구사항 3: 연도별 복수 시험 일정 반영)
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* 요구사항 1: 상단 유형별(카테고리) 필터 바 (모바일 가로 스크롤 및 잘림 방지 최적화) */}
      <div className="w-full overflow-x-auto no-scrollbar flex justify-start sm:justify-center py-1">
        <div className="inline-flex p-1.5 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-[0_4px_20px_0_rgba(0,0,0,0.04)] shrink-0">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer min-h-[36px] sm:min-h-[38px] break-keep ${
                  isActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm font-black scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400 dark:text-blue-600' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 요구사항 2: 감각적인 유러피안 미니멀 아코디언 리스트 (자격증 이름만 보이고 누르면 아래로 펼쳐짐) */}
      <div className="space-y-3.5">
        {filteredExams.map((exam, idx) => {
          const isExpanded = expandedExamId === exam.id;
          const wrongCount = wrongNotesCountByExam[exam.id] || 0;
          const bookmarkCount = bookmarksCountByExam[exam.id] || 0;
          const currentYear = selectedYears[exam.id] || '2024';
          const currentSession = selectedSessions[exam.id] || 1;
          const sessions = getExamSessions(exam.id);
          const isSubjective = exam.question_type === 'subjective';

          return (
            <div
              key={exam.id}
              className={`rounded-3xl transition-all duration-300 overflow-hidden border ${
                isExpanded
                  ? 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border-blue-500/50 dark:border-blue-400/50 shadow-[0_16px_40px_0_rgba(15,23,42,0.08)] dark:shadow-[0_16px_40px_0_rgba(0,0,0,0.4)] ring-1 ring-blue-500/20'
                  : 'bg-white/60 dark:bg-white/5 backdrop-blur-xl border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-sm hover:shadow-md'
              }`}
            >
              {/* 자격증 이름 헤더 (클릭 시 아코디언 토글) */}
              <button
                type="button"
                onClick={() => toggleExpand(exam.id)}
                className="w-full px-5 sm:px-7 py-4 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                  {/* 유러피안 넘버링 배지 */}
                  <span className={`w-8 h-8 rounded-2xl flex items-center justify-center font-mono text-xs font-black shrink-0 transition-colors ${
                    isExpanded 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' 
                      : 'bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 group-hover:bg-slate-300 dark:group-hover:bg-white/15'
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
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block truncate">
                        {exam.issuer} • {exam.question_count}문항 • {exam.time_limit}분
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight whitespace-nowrap ${
                        isSubjective
                          ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/10'
                      }`}>
                        {isSubjective ? '주관식·실기' : '4지선다'}
                      </span>
                      {wrongCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 whitespace-nowrap">
                          오답 {wrongCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 화살표 아이콘 */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                  isExpanded ? 'rotate-180 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                }`}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>

              {/* 누르면 아래로 펼쳐지는 상세 정보 영역 */}
              {isExpanded && (
                <div className="px-4 sm:px-7 pb-5 sm:pb-7 pt-2 border-t border-slate-100 dark:border-white/10 space-y-4 sm:space-y-5 animate-in fade-in duration-200">
                  {/* 시험 소개 */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal break-keep">
                    {exam.description}
                  </p>

                  {/* 1단계: 연도 선택 (2020~2026) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>기출 연도 선택:</span>
                      </span>
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                        {currentYear}년도
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {availableYears.map((yr) => {
                        const isSelected = currentYear === yr;
                        return (
                          <button
                            key={yr}
                            type="button"
                            onClick={() => handleYearChange(exam.id, yr)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer min-h-[34px] border shrink-0 ${
                              isSelected
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-md'
                                : 'bg-slate-100/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:border-slate-300'
                            }`}
                          >
                            {yr}년
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2단계: 시험 회차 일정 선택 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>정규 시험 회차 선택:</span>
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        제{currentSession}회차
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {sessions.map((sess) => {
                        const isSessSelected = currentSession === sess.num;
                        return (
                          <button
                            key={sess.num}
                            type="button"
                            onClick={() => handleSessionChange(exam.id, sess.num)}
                            className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer break-keep leading-snug min-h-[40px] flex items-center justify-center ${
                              isSessSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/25 font-black scale-[1.01]'
                                : 'bg-slate-100/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:border-emerald-500/50'
                            }`}
                          >
                            <span>{sess.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3단계: 응시 방식 선택 버튼들 */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      {/* 전체 실전 시험 응시 */}
                      <button
                        type="button"
                        onClick={() => onStartExam(exam.id, 'exam', currentYear, null, currentSession)}
                        className="py-3 sm:py-3.5 px-3.5 sm:px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white rounded-2xl text-xs sm:text-sm font-black transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer min-h-[48px] break-keep text-center leading-tight"
                      >
                        <Play className="w-4 h-4 fill-current shrink-0" />
                        <span>{currentYear}년 제{currentSession}회 전체 시험 ({exam.question_count}제)</span>
                      </button>

                      {/* 오답 & 북마크 복습 */}
                      <button
                        type="button"
                        onClick={() => onStartExam(exam.id, 'review')}
                        className="py-3 sm:py-3.5 px-3.5 sm:px-4 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 rounded-2xl text-xs sm:text-sm font-bold transition-all border border-slate-200 dark:border-white/10 flex items-center justify-between cursor-pointer min-h-[48px] break-keep"
                      >
                        <div className="flex items-center gap-2">
                          <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                          <span>오답 및 북마크 복습</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
                          {wrongCount + bookmarkCount}문항
                        </span>
                      </button>
                    </div>

                    {/* 과목별 나눠보기 섹션 */}
                    {exam.subjects && exam.subjects.length > 1 && (
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-black text-slate-700 dark:text-slate-200">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>과목별 집중 학습:</span>
                          </span>
                          <span className="text-[11px] font-normal text-slate-400">
                            원하는 과목만 즉시 풀이 및 정답 확인
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {exam.subjects.map((sub, sIdx) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => onStartExam(exam.id, 'practice', currentYear, sub.id, currentSession)}
                              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer group min-h-[40px]"
                            >
                              <span className="truncate pr-2 break-keep">
                                {sIdx + 1}. {sub.name.replace(/^[0-9제]+\s*과목\s*/, '')}
                              </span>
                              <span className="font-mono text-[11px] font-black text-blue-600 dark:text-blue-400 shrink-0">
                                {sub.question_count}제
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
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
