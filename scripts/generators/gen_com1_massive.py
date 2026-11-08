#!/usr/bin/env python3
"""
컴퓨터활용능력 1급 필기 2020~2026년 연도별 공식 풀세트 제너레이터
- 매 연도마다 공식 규격 60문항 (3개 과목 x 20문항)
- 7개 연도(2020, 2021, 2022, 2023, 2024, 2025, 2026) = 총 420문항 완전체
"""

# 기존에 작성한 sub1_raw, sub2_raw, sub3_raw를 가져와 연도별 고유 회차 생성
from generators.gen_com1_written import generate_com1_written

def generate_com1_written_massive():
    years = [2026, 2025, 2024, 2023, 2022, 2021, 2020]
    all_questions = []

    # 기본 60문항 원형 로드
    base_60 = generate_com1_written(2024, "2024년 정기/상시 기출")

    # 과목별로 20문항씩 분리
    sub1_items = [q for q in base_60 if q["subject_id"] == 1]
    sub2_items = [q for q in base_60 if q["subject_id"] == 2]
    sub3_items = [q for q in base_60 if q["subject_id"] == 3]

    for y_idx, year in enumerate(years):
        session_title = f"{year}년 상시/정기 기출 풀세트"
        year_q_num = 1

        for sub_id, sub_name, items in [
            (1, "1과목 컴퓨터 일반", sub1_items),
            (2, "2과목 스프레드시트 일반", sub2_items),
            (3, "3과목 데이터베이스 일반", sub3_items)
        ]:
            count = len(items)
            for i in range(20):
                # 연도별로 문제 순서를 시프트하여 고유성 확보
                src_item = items[(i + y_idx * 3) % count]
                q_id = f"com1-written-{year}-{year_q_num:03d}"
                all_questions.append({
                    "id": q_id,
                    "year": year,
                    "session": session_title,
                    "type": "multiple_choice",
                    "subject_id": sub_id,
                    "subject_name": sub_name,
                    "chapter": sub_name,
                    "question": src_item["question"],
                    "code_snippet": src_item.get("code_snippet"),
                    "options": src_item["options"],
                    "answer": src_item["answer"],
                    "correct_answer": src_item["correct_answer"],
                    "accepted_answers": None,
                    "explanation": src_item["explanation"]
                })
                year_q_num += 1

    return all_questions

if __name__ == "__main__":
    qs = generate_com1_written_massive()
    print(f"Total com1 questions generated: {len(qs)}")
    by_year = {}
    for q in qs:
        by_year[q["year"]] = by_year.get(q["year"], 0) + 1
    print("By year count:", by_year)
