#!/usr/bin/env python3
"""
Lightweight CBT Question Parser & Pipeline Utility (ponytail & lean standard)
- No heavy frameworks (Scrapy/Selenium 배제)
- Python standard library + BeautifulSoup4 + regex(re) 기반
- data/raw/{exam_id}.txt 또는 .html 원본 보존 -> src/data/questions/{exam_id}.json 정제 저장
"""

import os
import re
import json
from pathlib import Path
from bs4 import BeautifulSoup

RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "src" / "data" / "questions"

def clean_text(text: str) -> str:
    """공백 및 줄바꿈 정리"""
    if not text:
        return ""
    text = re.sub(r'[\r\t]+', ' ', text)
    text = re.sub(r' +', ' ', text)
    return text.strip()

def parse_raw_text(content: str, exam_id: str, subject_id: int = 1, subject_name: str = "") -> list:
    """
    일반 텍스트 형식의 기출문제를 파싱하는 경량 정규식 엔진
    지원 패턴 예시:
    1. 다음 중 ...
    ① 보기 1  ② 보기 2  ③ 보기 3  ④ 보기 4
    [정답] 1
    [해설] ...
    """
    questions = []
    
    # 문제 단위 분할 (숫자. 으로 시작하는 패턴)
    q_blocks = re.split(r'\n(?=\d+[\.\s])', content.strip())
    
    for block in q_blocks:
        block = block.strip()
        if not block:
            continue
            
        m = re.match(r'^(\d+)[\.\s]+(.*?)(?=(?:①|1\)|\[정답\]|\n\s*1\.)|$)', block, re.DOTALL)
        if not m:
            continue
            
        q_num = int(m.group(1))
        q_text = clean_text(m.group(2))
        
        # 보기 추출 (①, ②, ③, ④ 또는 1), 2), 3), 4))
        options = []
        opt_matches = re.findall(r'(?:[①②③④]|\d\))\s*([^①②③④\n\d\)]+)', block)
        if opt_matches and len(opt_matches) >= 4:
            options = [clean_text(opt) for opt in opt_matches[:4]]
            
        # 정답 추출
        ans_m = re.search(r'\[정답\]\s*([1-4①-④])', block)
        correct_ans = 1
        if ans_m:
            raw_ans = ans_m.group(1)
            char_map = {'①': 1, '②': 2, '③': 3, '④': 4}
            correct_ans = char_map.get(raw_ans, int(raw_ans) if raw_ans.isdigit() else 1)
            
        # 해설 추출
        exp_m = re.search(r'\[해설\]\s*(.*?)(?=\n\d+[\.\s]|$)', block, re.DOTALL)
        explanation = clean_text(exp_m.group(1)) if exp_m else ""
        
        # 정형 데이터 생성
        item = {
            "id": q_num,
            "exam_id": exam_id,
            "subject_id": subject_id,
            "subject_name": subject_name or f"제{subject_id}과목",
            "type": "multiple_choice" if options else "subjective",
            "question": q_text,
            "options": options if options else None,
            "correct_answer": correct_ans if options else str(correct_ans),
            "explanation": explanation
        }
        
        if not item["options"]:
            del item["options"]
            
        questions.append(item)
        
    return questions

def parse_html_archive(html_content: str, exam_id: str) -> list:
    """HTML 기반 CBT 공개 아카이브 파싱 (BeautifulSoup)"""
    soup = BeautifulSoup(html_content, 'html.parser')
    questions = []
    
    # 일반적인 CBT 웹 아카이브의 문제 태그 탐색
    q_containers = soup.select('.question_box, .exam_question, .cbt_item, div[class*="question"]')
    
    for idx, container in enumerate(q_containers, start=1):
        q_text_el = container.select_one('.question_text, .q_title, h4, p')
        q_text = clean_text(q_text_el.get_text()) if q_text_el else ""
        
        opt_els = container.select('.option_item, .answers li, label')
        options = [clean_text(opt.get_text()) for opt in opt_els][:4]
        
        questions.append({
            "id": idx,
            "exam_id": exam_id,
            "subject_id": 1,
            "subject_name": "기본 과목",
            "type": "multiple_choice" if len(options) == 4 else "subjective",
            "question": q_text,
            "options": options if len(options) == 4 else None,
            "correct_answer": 1,
            "explanation": ""
        })
        
    return questions

def save_structured_questions(exam_id: str, data: list):
    """정형 JSON 파일로 저장"""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_file = OUTPUT_DIR / f"{exam_id}.json"
    
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✓ 성공: {len(data)}문항 정제 완료 -> {out_file}")

if __name__ == "__main__":
    print(f"CBT 파이프라인 준비 완료.")
    print(f"- 원본 디렉터리: {RAW_DIR}")
    print(f"- 추출 대상 디렉터리: {OUTPUT_DIR}")
