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
  Layers,
  Award,
  Filter,
  Check
} from 'lucide-react';

export default function ExamHome({
  exams = [],
  onStartExam,
  onStartSubjectExam, // 특정 과목만 골라서 학습
  wrongNotesCountByExam = {},
  bookmarksCountByExam = {},
  selectedYear = 'all',
  onSelectYear
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeSubjectModalExam, setActiveSubjectModalExam] = useState(null); // 과목 선택 모달 열린 시험

  const categories = [
    { id: 'all', label: '전체 자격증 (6)', icon: Sparkles },
    { id: 'it', label: 'IT / 개발 (3)', icon: Cpu },
    { id: 'data', label: '데이터 (2)', icon: Database },
    { id: 'engineer', label: '기사 / 산업기사 (1)', icon: ShieldCheck }
  ];

  const filteredExams = exams.filter(e => {
    if (selectedCategory === 'all') return true;
    return e.category === selectedCategory;
  });

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
                국가기술 및 공인 자격증 CBT 시험장
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                실제 출제 기준과 동일한 <strong>정규 회차 풀세트(100제/60제/50제/20제)</strong> 및 <strong>과목별 집중 학습</strong>을 지원합니다.
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
                    {isSubjective ? '주관식·실기' : '4지선다 객관식'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {exam.description}
                </p>

                {/* 공식 검정 규격 스펙 그리드 (실제 문항 수 정확히 표기) */}
                <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold border border-slate-200/80 dark:border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>시간: <strong className="text-slate-900 dark:text-white">{exam.time_limit}분</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-500" />
                    <span>문항: <strong className="text-slate-900 dark:text-white">{exam.question_count}문항</strong> ({subjectCount}개 과목)</span>
                  </div>
                  <div className="col-span-2 text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs truncate">
                    기준: <strong className="text-slate-900 dark:text-white">{exam.fail_criteria_description}</strong>
                  </div>
                </div>

                {/* 과목 구성 뱃지 리스트 */}
                {exam.subjects && exam.subjects.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      시험 과목 ({exam.subjects.length}과목 구성):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {exam.subjects.map((sub, sIdx) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            if (onStartSubjectExam) {
                              onStartSubjectExam(exam.id, sub.id);
                            } else {
                              onStartExam(exam.id, 'practice');
                            }
                          }}
                          title={`${sub.name} 집중 학습`}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                        >
                          {sIdx + 1}. {sub.name.replace(/^[0-9제]+\s*과목\s*/, '')} <span className="font-mono text-blue-600 dark:text-blue-400 font-extrabold">({sub.question_count}제)</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 카드 하단 실행 버튼 */}
              <div className="pt-4 mt-5 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  {/* 실전 풀세트 모의고사 */}
                  <button
                    type="button"
                    onClick={() => onStartExam(exam.id, 'exam')}
                    className="py-3 px-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl text-xs sm:text-sm font-black transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px]"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>실전 풀세트 ({exam.question_count}제)</span>
                  </button>

                  {/* 과목별 / 단원별 학습 모달 트리거 */}
                  <button
                    type="button"
                    onClick={() => {
                      if (exam.subjects && exam.subjects.length > 1) {
                        setActiveSubjectModalExam(exam);
                      } else {
                        onStartExam(exam.id, 'practice');
                      }
                    }}
                    className="py-3 px-3.5 glass-pill hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[48px]"
                  >
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span>과목별 학습</span>
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

      {/* 과목 선택 모달 */}
      {activeSubjectModalExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xl animate-in fade-in duration-150">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {activeSubjectModalExam.name} - 과목 선택
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  집중적으로 학습할 과목을 선택하세요. 즉시 정답과 해설이 제공됩니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubjectModalExam(null)}
                className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer font-black text-sm"
              >
                닫기
              </button>
            </div>

            <div className="space-y-2 pt-2 max-h-[60vh] overflow-y-auto">
              {/* 전과목 풀세트 연습 옵션 */}
              <button
                type="button"
                onClick={() => {
                  onStartExam(activeSubjectModalExam.id, 'practice');
                  setActiveSubjectModalExam(null);
                }}
                className="w-full p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-left hover:border-blue-500 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="font-black text-sm sm:text-base text-blue-950 dark:text-blue-100">
                    전체 과목 순차 학습 ({activeSubjectModalExam.question_count}문항)
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    1과목부터 마지막 과목까지 순서대로 모두 학습
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* 개별 과목 선택 버튼들 */}
              {(activeSubjectModalExam.subjects || []).map((sub, sIdx) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    if (onStartSubjectExam) {
                      onStartSubjectExam(activeSubjectModalExam.id, sub.id);
                    } else {
                      onStartExam(activeSubjectModalExam.id, 'practice');
                    }
                    setActiveSubjectModalExam(null);
                  }}
                  className="w-full p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-700/60 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-mono font-black text-xs text-slate-800 dark:text-slate-200">
                      0{sIdx + 1}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {sub.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {sub.question_count}문항 • 배점 {sub.max_score}점 • 과락 {sub.fail_score}점 미만
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
