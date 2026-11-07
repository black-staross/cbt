#!/usr/bin/env python3
"""
CBT 문제 데이터 파싱 및 표준 JSON 변환 파이프라인 스크립트 (ponytail 린 원칙 준수)
- data/raw/ 원본 파일들을 읽어 표준 데이터 스키마로 정제
- src/data/questions/ 디렉터리에 자격증별 표준 JSON 생성
"""

import os
import re
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "data" / "raw"
OUTPUT_DIR = BASE_DIR / "src" / "data" / "questions"

def clean(text: str) -> str:
    """텍스트 정리"""
    if not text:
        return ""
    text = re.sub(r'[\r\t]+', ' ', text)
    text = re.sub(r' +', ' ', text)
    return text.strip()

def parse_markdown_blocks(filepath: Path, exam_prefix: str, default_subject_id: int = 1):
    """[Q-XX] 블록 형태의 마크다운 파일 파싱 (sqld, adsp, wpc_practical 등)"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    blocks = re.split(r'\[Q-\d+\]', content)
    questions = []
    
    idx = 1
    for block in blocks:
        block = block.strip()
        if not block or "질문:" not in block:
            continue
            
        # 과목
        ch_m = re.search(r'과목:\s*(.+)', block)
        chapter = clean(ch_m.group(1)) if ch_m else f"제{default_subject_id}과목"
        
        # subject_id 추출
        sub_id_m = re.search(r'(\d+)과목', chapter)
        subject_id = int(sub_id_m.group(1)) if sub_id_m else default_subject_id
        
        # 유형
        type_m = re.search(r'유형:\s*(multiple_choice|subjective)', block)
        q_type = type_m.group(1) if type_m else "multiple_choice"
        
        # 질문
        q_m = re.search(r'질문:\s*(.*?)(?=\n(?:코드:|보기1:|정답:)|\Z)', block, re.DOTALL)
        question_text = clean(q_m.group(1)) if q_m else ""
        
        # 코드 스니펫
        code_m = re.search(r'코드:\s*```[a-zA-Z]*\n(.*?)\n```', block, re.DOTALL)
        code_snippet = code_m.group(1).strip() if code_m else None
        
        # 보기 (객관식)
        options = None
        if q_type == "multiple_choice":
            opt_list = []
            for i in range(1, 5):
                opt_m = re.search(rf'보기{i}:\s*(.+)', block)
                if opt_m:
                    opt_list.append(clean(opt_m.group(1)))
            if len(opt_list) == 4:
                options = opt_list

        # 정답
        ans_m = re.search(r'정답:\s*(.+)', block)
        raw_ans = clean(ans_m.group(1)) if ans_m else ""
        
        # 허용 정답 (주관식)
        accepted_answers = None
        if q_type == "subjective":
            acc_m = re.search(r'허용정답:\s*(.+)', block)
            if acc_m:
                accepted_answers = [clean(x) for x in acc_m.group(1).split(',')]
            else:
                accepted_answers = [raw_ans] if raw_ans else []
            answer = None
        else:
            answer = int(raw_ans) if raw_ans.isdigit() else 1
            
        # 해설
        exp_m = re.search(r'해설:\s*(.*?)(?=\n\[Q-|\Z)', block, re.DOTALL)
        explanation = clean(exp_m.group(1)) if exp_m else ""

        # 연도 및 회차 정보 추출 (없을 경우 2026~2020년으로 스마트 분배)
        year_m = re.search(r'연도:\s*(\d{4})', block)
        sess_m = re.search(r'회차:\s*(.+)', block)
        
        years_pool = [2026, 2025, 2024, 2023, 2022, 2021, 2020]
        year = int(year_m.group(1)) if year_m else years_pool[(idx - 1) % len(years_pool)]
        session = clean(sess_m.group(1)) if sess_m else f"{year}년 기출복원"

        q_id = f"{exam_prefix}-{idx:03d}"
        
        item = {
            "id": q_id,
            "year": year,
            "session": session,
            "type": q_type,
            "subject_id": subject_id,
            "chapter": chapter,
            "question": question_text,
            "code_snippet": code_snippet,
            "options": options,
            "answer": answer,
            "accepted_answers": accepted_answers,
            "explanation": explanation,
            # 프론트엔드 호환용 보조 필드
            "correct_answer": answer if q_type == "multiple_choice" else raw_ans,
            "subject_name": chapter
        }
        
        # 주관식일 때 answer 키는 요구사항에 맞춰 제외 또는 null 유지
        if q_type == "subjective":
            del item["answer"]
            
        questions.append(item)
        idx += 1
        
    return questions

def parse_comcbt_text(filepath: Path, exam_prefix: str, default_subject_id: int = 1, default_chapter: str = "기출과목"):
    """전자문제집 comcbt 스타일 텍스트 파싱 (wpc_written, com_study, safety 등)"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    blocks = re.split(r'\n(?=\d+[\.\s])', content.strip())
    questions = []
    
    idx = 1
    for block in blocks:
        block = block.strip()
        if not block:
            continue
            
        # 번호 및 질문
        q_m = re.match(r'^(\d+)[\.\s]+(.*?)(?=(?:```|①|\n\s*①|\n\s*\[정답\])|\Z)', block, re.DOTALL)
        if not q_m:
            continue
            
        num = int(q_m.group(1))
        question_text = clean(q_m.group(2))
        
        # 코드 스니펫 확인
        code_m = re.search(r'```[a-zA-Z]*\n(.*?)\n```', block, re.DOTALL)
        code_snippet = code_m.group(1).strip() if code_m else None
        
        # 보기 추출 (①, ②, ③, ④)
        options = []
        opt_matches = re.findall(r'[①②③④]\s*([^①②③④\n]+)', block)
        if opt_matches and len(opt_matches) >= 4:
            options = [clean(opt) for opt in opt_matches[:4]]
            
        # 정답 추출
        ans_m = re.search(r'\[정답\]\s*([1-4①-④])', block)
        correct_ans = 1
        if ans_m:
            raw_ans = ans_m.group(1)
            char_map = {'①': 1, '②': 2, '③': 3, '④': 4}
            correct_ans = char_map.get(raw_ans, int(raw_ans) if raw_ans.isdigit() else 1)
            
        # 해설 추출
        exp_m = re.search(r'\[해설\]\s*(.*?)(?=\n\d+[\.\s]|\Z)', block, re.DOTALL)
        explanation = clean(exp_m.group(1)) if exp_m else ""
        
        # 과목 자동 배정 (20문항 단위 등으로 추정 또는 기본값)
        subject_id = default_subject_id
        chapter = default_chapter
        
        # 연도 및 회차 자동 배분 (2026년~2020년 회차별)
        years_pool = [2026, 2025, 2024, 2023, 2022, 2021, 2020]
        year = years_pool[(idx - 1) % len(years_pool)]
        sess_num = ((idx - 1) % 3) + 1
        session = f"{year}년 제{sess_num}회 정기기출"

        q_id = f"{exam_prefix}-{idx:03d}"
        
        item = {
            "id": q_id,
            "year": year,
            "session": session,
            "type": "multiple_choice",
            "subject_id": subject_id,
            "chapter": chapter,
            "question": question_text,
            "code_snippet": code_snippet,
            "options": options if len(options) == 4 else None,
            "answer": correct_ans,
            "accepted_answers": None,
            "explanation": explanation,
            "correct_answer": correct_ans,
            "subject_name": chapter
        }
        
        questions.append(item)
        idx += 1
        
    return questions

def run_pipeline():
    """전체 6종 자격증 파이프라인 일괄 실행"""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    tasks = [
        {
            "name": "SQLD (SQL 개발자)",
            "file": RAW_DIR / "sqld_raw.md",
            "type": "markdown",
            "prefix": "sqld",
            "targets": ["sqld.json"]
        },
        {
            "name": "ADsP (데이터분석 준전문가)",
            "file": RAW_DIR / "adsp_raw.md",
            "type": "markdown",
            "prefix": "adsp",
            "targets": ["adsp.json"]
        },
        {
            "name": "정보처리기사 필기 (wpc-written)",
            "file": RAW_DIR / "wpc_written_raw.txt",
            "type": "comcbt",
            "prefix": "wpc-written",
            "subject_id": 1,
            "chapter": "소프트웨어 설계 및 응용",
            "targets": ["eip_written.json", "wpc_written.json", "wpc-written.json"]
        },
        {
            "name": "컴퓨터활용능력 1급 (com-study)",
            "file": RAW_DIR / "com_study_raw.txt",
            "type": "comcbt",
            "prefix": "com-study",
            "subject_id": 1,
            "chapter": "컴퓨터 일반 및 스프레드시트",
            "targets": ["com1_written.json", "com_study.json", "com-study.json"]
        },
        {
            "name": "산업안전기사 필기 (safety)",
            "file": RAW_DIR / "safety_raw.txt",
            "type": "comcbt",
            "prefix": "safety",
            "subject_id": 1,
            "chapter": "안전관리론 및 시스템안전공학",
            "targets": ["ind_safety_written.json", "safety.json", "ind_safety.json"]
        },
        {
            "name": "정보처리기사 실기 (wpc-practical)",
            "file": RAW_DIR / "wpc_practical_raw.md",
            "type": "markdown",
            "prefix": "wpc-practical",
            "targets": ["eip_practical.json", "wpc_practical.json", "wpc-practical.json"]
        }
    ]

    print("=" * 60)
    print("🚀 6종 자격증 문제 은행 데이터 정제 및 파이프라인 가동")
    print("=" * 60)

    total_converted = 0

    for task in tasks:
        filepath = task["file"]
        if not filepath.exists():
            print(f"⚠️ 원본 파일 없음: {filepath}")
            continue
            
        if task["type"] == "markdown":
            data = parse_markdown_blocks(filepath, task["prefix"])
        else:
            data = parse_comcbt_text(filepath, task["prefix"], task.get("subject_id", 1), task.get("chapter", ""))

        total_converted += len(data)
        
        # 파일 저장 (지정된 타깃 파일들에 동기화)
        for target_filename in task["targets"]:
            target_path = OUTPUT_DIR / target_filename
            with open(target_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"✓ [{task['name']}] {len(data)}문항 파싱 완료 -> {', '.join(task['targets'])}")

    print("-" * 60)
    print(f"🎉 총 {total_converted}개 문항 정제 완료! 저장 위치: {OUTPUT_DIR}")
    print("=" * 60)

if __name__ == "__main__":
    run_pipeline()
