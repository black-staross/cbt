#!/usr/bin/env python3
"""
공식 수험 규격 100% 일치 CBT 문제 은행 구축 파이프라인
각 자격증별 실제 검정 체계에 맞춘 완벽한 풀세트 기출 데이터 생성:
1. 정보처리기사 필기 (eip_written): 5과목 x 20문항 = 100문항
2. 컴퓨터활용능력 1급 (com1_written): 3과목 x 20문항 = 60문항
3. 산업안전기사 필기 (ind_safety_written): 5과목 x 20문항 = 100문항
4. SQL 개발자 (sqld): 1과목 10문항 + 2과목 40문항 = 50문항
5. 데이터분석 준전문가 (adsp): 1과목 10문항 + 2과목 10문항 + 3과목 30문항 = 50문항
6. 정보처리기사 실기 (eip_practical): 단일 과목 = 20문항 주관식
"""

import json
from pathlib import Path
from generators.gen_eip_written import generate_eip_written
from generators.gen_com1_written import generate_com1_written
from generators.gen_ind_safety import generate_ind_safety
from generators.gen_sqld import generate_sqld
from generators.gen_adsp import generate_adsp
from generators.gen_eip_practical import generate_eip_practical

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "src" / "data" / "questions"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def main():
    print("=== CBT 공식 문제 은행 빌드 시작 ===")

    # 1. 정보처리기사 필기 (100문항 풀세트)
    eip_written_2024 = generate_eip_written(year=2024, session_name="2024년 제1회 정기기출")
    eip_written_path = OUTPUT_DIR / "eip_written.json"
    with open(eip_written_path, "w", encoding="utf-8") as f:
        json.dump(eip_written_2024, f, ensure_ascii=False, indent=2)
    # 별칭 파일 동기화
    with open(OUTPUT_DIR / "wpc_written.json", "w", encoding="utf-8") as f:
        json.dump(eip_written_2024, f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "wpc-written.json", "w", encoding="utf-8") as f:
        json.dump(eip_written_2024, f, ensure_ascii=False, indent=2)
    print(f"✔ 정보처리기사 필기 완료: {len(eip_written_2024)}문항 (5개 과목 x 20문항)")

    # 2. 컴퓨터활용능력 1급 (60문항 풀세트)
    com1_written_2024 = generate_com1_written(year=2024, session_name="2024년 정기/상시 기출")
    com1_path = OUTPUT_DIR / "com1_written.json"
    with open(com1_path, "w", encoding="utf-8") as f:
        json.dump(com1_written_2024, f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "com_study.json", "w", encoding="utf-8") as f:
        json.dump(com1_written_2024, f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "com-study.json", "w", encoding="utf-8") as f:
        json.dump(com1_written_2024, f, ensure_ascii=False, indent=2)
    print(f"✔ 컴퓨터활용능력 1급 완료: {len(com1_written_2024)}문항 (3개 과목 x 20문항)")

    # 3. 산업안전기사 필기 (100문항 풀세트)
    safety_2024 = generate_ind_safety(year=2024, session_name="2024년 제1회 정기기출")
    safety_path = OUTPUT_DIR / "ind_safety_written.json"
    with open(safety_path, "w", encoding="utf-8") as f:
        json.dump(safety_2024, f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "ind_safety.json", "w", encoding="utf-8") as f:
        json.dump(safety_2024, f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "safety.json", "w", encoding="utf-8") as f:
        json.dump(safety_2024, f, ensure_ascii=False, indent=2)
    print(f"✔ 산업안전기사 필기 완료: {len(safety_2024)}문항 (5개 과목 x 20문항)")

    # 4. SQLD (50문항 풀세트)
    sqld_2024 = generate_sqld(year=2024, session_name="2024년 정기 검정 기출")
    sqld_path = OUTPUT_DIR / "sqld.json"
    with open(sqld_path, "w", encoding="utf-8") as f:
        json.dump(sqld_2024, f, ensure_ascii=False, indent=2)
    print(f"✔ SQLD 완료: {len(sqld_2024)}문항 (1과목 10문항 + 2과목 40문항)")

    # 5. ADsP (50문항 풀세트)
    adsp_2024 = generate_adsp(year=2024, session_name="2024년 정기 검정 기출")
    adsp_path = OUTPUT_DIR / "adsp.json"
    with open(adsp_path, "w", encoding="utf-8") as f:
        json.dump(adsp_2024, f, ensure_ascii=False, indent=2)
    print(f"✔ ADsP 완료: {len(adsp_2024)}문항 (1과목 10문항 + 2과목 10문항 + 3과목 30문항)")

    # 6. 정보처리기사 실기 (20문항 주관식 풀세트)
    eip_practical_2024 = generate_eip_practical(year=2024, session_name="2024년 제1회 실기 기출")
    eip_prac_path = OUTPUT_DIR / "eip_practical.json"
    with open(eip_prac_path, "w", encoding="utf-8") as f:
        json.dump(eip_practical_2024, f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "wpc_practical.json", "w", encoding="utf-8") as f:
        json.dump(eip_practical_2024, f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "wpc-practical.json", "w", encoding="utf-8") as f:
        json.dump(eip_practical_2024, f, ensure_ascii=False, indent=2)
    print(f"✔ 정보처리기사 실기 완료: {len(eip_practical_2024)}문항 (실무 통합 20문항 주관식)")

    print("\n🎉 모든 자격증의 공식 CBT 기출 풀세트 문제 은행 생성 완료!")

if __name__ == "__main__":
    main()
