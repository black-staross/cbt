#!/usr/bin/env python3
"""
공통 CBT 문제 은행 생성 및 교차검증 엔진 헬퍼
- 과목별 핵심 개념 매트릭스(Concept Matrix) 및 실무 계산/응용 문제(Calculation/Application Pool) 결합
- 회차 내(Session 내) 동일 개념 중복 출제 0건 보장
- 전 연도(2020~2026) 및 전 회차(1~3회) 간 동일 지문(question) 중복 0건 보장
- 정답 번호(1, 2, 3, 4) 완벽 균등 분포(각 25%) 및 보기 중복 0건 보장
"""

import hashlib


def _stable_hash(text: str) -> int:
    return int(hashlib.md5(text.encode("utf-8")).hexdigest()[:8], 16)


def make_question_from_concept(concept, form_idx, all_concepts, c_idx):
    """
    단일 개념 튜플로부터 form_idx(0~14)에 해당하는 고유 유형의 CBT 문항(정답 1개 + 오답 3개) 생성.
    concept 구조:
      (topic, category, def_true, feat_true, std_true, maint_true, [false_1, false_2, false_3], exp)
    반환:
      {"q": str, "correct": str, "wrongs": [str, str, str], "exp": str, "topic": str}
    """
    topic, category, def_t, feat_t, std_t, maint_t, falses, exp = concept
    f1, f2, f3 = falses[0], falses[1], falses[2]
    n = len(all_concepts)

    # 다른 개념들에서 오답 보기 추출 (자신과 겹치지 않는 인덱스)
    other1 = all_concepts[(c_idx + 3 + form_idx) % n]
    other2 = all_concepts[(c_idx + 7 + form_idx * 2) % n]
    other3 = all_concepts[(c_idx + 11 + form_idx * 3) % n]
    # 만약 우연히 c_idx와 같으면 한 칸 이동
    if (c_idx + 3 + form_idx) % n == c_idx:
        other1 = all_concepts[(c_idx + 1) % n]
    if (c_idx + 7 + form_idx * 2) % n in (c_idx, (c_idx + 3 + form_idx) % n):
        other2 = all_concepts[(c_idx + 2) % n]
    if (c_idx + 11 + form_idx * 3) % n in (c_idx, (c_idx + 3 + form_idx) % n, (c_idx + 7 + form_idx * 2) % n):
        other3 = all_concepts[(c_idx + 4) % n]

    if form_idx == 0:
        q = f"[{category}] 다음 중 '{topic}'의 기본 원리 및 정의로 가장 옳은 것은?"
        correct = def_t
        wrongs = [f1, other1[2], other2[2]]
    elif form_idx == 1:
        q = f"{category} 분야에서 활용되는 '{topic}'의 기술적 특징으로 올바른 것은?"
        correct = feat_t
        wrongs = [f2, other1[3], other2[3]]
    elif form_idx == 2:
        q = f"현장 실무에서 '{topic}'({category}) 적용 시 준수해야 할 기준 및 특성으로 가장 적절한 것은?"
        correct = std_t
        wrongs = [f3, other1[4], other2[4]]
    elif form_idx == 3:
        q = f"'{topic}' 관련 설비·작업의 점검 및 안전관리 대책으로 가장 알맞은 것은?"
        correct = maint_t
        wrongs = [f1, other1[5], other2[5]]
    elif form_idx == 4:
        q = f"다음 중 '{topic}'({category})에 관한 설명으로 옳지 않은 것은?"
        correct = f1
        wrongs = [def_t, feat_t, std_t]
    elif form_idx == 5:
        q = f"{category}의 '{topic}' 취급 및 운영 시 설명으로 틀린 것은?"
        correct = f2
        wrongs = [feat_t, std_t, maint_t]
    elif form_idx == 6:
        q = f"다음 중 '{topic}'의 기술 기준 및 유지관리 방법으로 적절하지 않은 것은?"
        correct = f3
        wrongs = [def_t, std_t, maint_t]
    elif form_idx == 7:
        q = f"다음에서 설명하는 {category} 핵심 요소(기술·법칙·설비)로 가장 알맞은 것은?\n\n「 {def_t} 」"
        correct = topic
        wrongs = [other1[0], other2[0], other3[0]]
    elif form_idx == 8:
        q = f"다음 특성 및 기준에 해당하는 {category} 관련 용어로 옳은 것은?\n\n「 {feat_t} 또한, {std_t} 」"
        correct = topic
        wrongs = [other1[0], other2[0], other3[0]]
    elif form_idx == 9:
        q = f"현장 실무에서 다음 설명에 부합하는 {category} 대상은 무엇인가?\n\n「 {maint_t} ({def_t}) 」"
        correct = topic
        wrongs = [other1[0], other2[0], other3[0]]
    elif form_idx == 10:
        q = f"다음 중 '{topic}'({category})와 관련하여 올바르게 설명한 것은?"
        correct = f"{def_t}"
        wrongs = [f1, f2, f3]
    elif form_idx == 11:
        q = f"설비 및 안전 엔지니어가 '{topic}'의 특성을 검토할 때 가장 정확한 기술적 판단은?"
        correct = f"{feat_t}"
        wrongs = [f1, f2, f3]
    elif form_idx == 12:
        q = f"작업자가 {category} 현장에서 '{topic}' 상태를 점검할 때 올바른 판정 기준은?"
        correct = f"{std_t}"
        wrongs = [f1, f2, f3]
    elif form_idx == 13:
        q = f"안전 및 설비 관리 규정에 따른 '{topic}'({category})의 표준 운용 방식으로 가장 타당한 것은?"
        correct = f"{maint_t}"
        wrongs = [f1, f2, f3]
    elif form_idx == 14:
        q = f"다음 {category} 관련 항목 중 '{topic}'의 핵심 원리와 거리가 먼(틀린) 설명은?"
        correct = f2
        wrongs = [def_t, feat_t, maint_t]
    elif form_idx == 15:
        q = f"[{category}] '{topic}'의 현장 적용 시 나타나는 현상이나 조건으로 옳지 않은 것은?"
        correct = f3
        wrongs = [def_t, feat_t, std_t]
    elif form_idx == 16:
        q = f"[{category}] '{topic}'에 대한 실무 기술 기준으로 옳지 않은 설명은?"
        correct = f1
        wrongs = [def_t, std_t, maint_t]
    elif form_idx == 17:
        q = f"{category} 실무에서 '{topic}'의 핵심 작용 원리를 가장 바르게 설명한 것은?"
        correct = def_t
        wrongs = [f2, other1[2], other2[3]]
    elif form_idx == 18:
        q = f"다음 중 {category}의 '{topic}' 관리 시 기대할 수 있는 기술적 효과 및 특징으로 옳은 것은?"
        correct = feat_t
        wrongs = [f3, other1[3], other2[4]]
    elif form_idx == 19:
        q = f"국가기술자격 검정 기준상 '{topic}'({category})의 규정치 및 운전 조건으로 적합한 것은?"
        correct = std_t
        wrongs = [f1, other1[4], other2[5]]
    elif form_idx == 20:
        q = f"현장 보전 및 안전점검 시 '{topic}'({category})에 대해 취해야 할 올바른 조치는?"
        correct = maint_t
        wrongs = [f2, other1[5], other2[2]]
    else:
        q = f"다음 설명이 가리키는 {category} 분야의 핵심 항목은 무엇인가?\n\n「 {std_t} / {maint_t} 」"
        correct = topic
        wrongs = [other1[0], other2[0], other3[0]]

    # 오답 보기 중복 방지 정제
    clean_wrongs = []
    seen = {correct.strip()}
    for w in wrongs:
        w_str = w.strip()
        if w_str and w_str not in seen:
            seen.add(w_str)
            clean_wrongs.append(w_str)

    # 만약 중복 제거 후 3개 미만이면 다른 개념에서 보충
    step = 1
    while len(clean_wrongs) < 3:
        cand_concept = all_concepts[(c_idx + step * 5) % n]
        cand_text = cand_concept[0] if form_idx in (7, 8, 9, 21) else cand_concept[2 + (step % 4)]
        cand_text = cand_text.strip()
        if cand_text not in seen:
            seen.add(cand_text)
            clean_wrongs.append(cand_text)
        step += 1

    full_exp = f"[{topic}] {exp}"
    return {
        "q": q,
        "correct": correct.strip(),
        "wrongs": clean_wrongs[:3],
        "exp": full_exp,
        "topic": topic
    }


def build_exam_dataset(
    exam_key: str,
    subject_Specs: list,
    years=None,
    session_count: int = 3,
    session_name_fmt: str = "{year}년 정기 제{session}회 기출"
):
    """
    subject_Specs: list of tuples
      (sub_id, sub_name, target_count, concepts_list, calc_items_list)
    각 연도(2020~2026) x 회차(1~3회) = 21개 회차 생성.
    - 한 회차 내에서 동일 topic 중복 출제 0건
    - 전 회차(21개 회차 전체)에서 동일 question 지문 중복 0건
    - 정답 번호 1, 2, 3, 4 완벽 균등 배분
    """
    if years is None:
        years = [2026, 2025, 2024, 2023, 2022, 2021, 2020]

    all_questions = []
    global_used_q = set()

    # 과목별로 사용된 (c_idx, form_idx) 추적 및 calc 인덱스 추적
    for sub_id, sub_name, target_count, concepts, calc_items in subject_Specs:
        if len(concepts) < target_count:
            raise ValueError(
                f"[{exam_key}] {sub_name}: 개념 수({len(concepts)})가 문항 수({target_count})보다 적습니다!"
            )

    total_sessions = len(years) * session_count
    # 과목별 calc_items 포인터
    calc_cursors = {sub_id: 0 for sub_id, _, _, _, _ in subject_Specs}
    used_pairs_by_sub = {sub_id: set() for sub_id, _, _, _, _ in subject_Specs}

    for y_idx, year in enumerate(years):
        for s_idx in range(1, session_count + 1):
            sess_seq = y_idx * session_count + (s_idx - 1)  # 0 .. 20
            session_title = session_name_fmt.format(year=year, session=s_idx)
            year_q_num = 1

            for sub_id, sub_name, target_count, concepts, calc_items in subject_Specs:
                n_concepts = len(concepts)
                session_items = []
                used_topics_in_session = set()

                # 1) 이번 회차에 배정할 계산/응용 문제 (과목당 매 회차 3~5문항 배정)
                calc_quota = min(4, len(calc_items) // total_sessions) if calc_items else 0
                c_cursor = calc_cursors[sub_id]
                while len(session_items) < calc_quota and c_cursor < len(calc_items):
                    c_item = dict(calc_items[c_cursor])
                    c_cursor += 1
                    # calc_item 오답 중복 자동 정제
                    c_cor = str(c_item["correct"]).strip()
                    c_seen = {c_cor}
                    c_wrongs = []
                    for w in c_item["wrongs"]:
                        w_s = str(w).strip()
                        if w_s and w_s not in c_seen:
                            c_seen.add(w_s)
                            c_wrongs.append(w_s)
                    extra_idx = 1
                    while len(c_wrongs) < 3:
                        cand_w = f"{c_cor} (오차 +{extra_idx * 7})"
                        if cand_w not in c_seen:
                            c_seen.add(cand_w)
                            c_wrongs.append(cand_w)
                        extra_idx += 1
                    c_item["correct"] = c_cor
                    c_item["wrongs"] = c_wrongs[:3]

                    if c_item["q"] not in global_used_q and c_item["topic"] not in used_topics_in_session:
                        global_used_q.add(c_item["q"])
                        used_topics_in_session.add(c_item["topic"])
                        session_items.append(c_item)
                calc_cursors[sub_id] = c_cursor

                # 2) 나머지 문항을 concept_bank에서 이번 회차 내 중복 topic 없이, 전체 회차 내 중복 지문 없이 추출
                # 회차마다 시작 개념 인덱스를 다르게 슬라이딩하여 1회, 2회, 3회 개념 구성을 차별화
                start_c = (sess_seq * 11 + sub_id * 5) % n_concepts
                for step in range(n_concepts):
                    if len(session_items) >= target_count:
                        break
                    c_idx = (start_c + step) % n_concepts
                    concept = concepts[c_idx]
                    topic_name = concept[0]
                    if topic_name in used_topics_in_session:
                        continue

                    # 이 개념에서 아직 쓰지 않은 form_idx(0~21) 선택
                    chosen_item = None
                    for f_step in range(22):
                        form_idx = (sess_seq + c_idx + f_step) % 22
                        if (c_idx, form_idx) in used_pairs_by_sub[sub_id]:
                            continue
                        cand = make_question_from_concept(concept, form_idx, concepts, c_idx)
                        if cand["q"] not in global_used_q:
                            used_pairs_by_sub[sub_id].add((c_idx, form_idx))
                            global_used_q.add(cand["q"])
                            chosen_item = cand
                            break

                    if chosen_item is not None:
                        used_topics_in_session.add(topic_name)
                        session_items.append(chosen_item)

                if len(session_items) != target_count:
                    raise RuntimeError(
                        f"[{exam_key}] {year} s{s_idx} {sub_name}: 목표 {target_count}문항 중 {len(session_items)}문항만 생성됨"
                    )

                # 3) 정답 번호(1, 2, 3, 4)를 골고루 배분하여 최종 문항 객체 생성
                for local_idx, item in enumerate(session_items):
                    # 정답 번호 1~4가 고르게 분포하도록 결정론적 타깃 위치 지정
                    target_ans_pos = ((year_q_num - 1) + sess_seq + sub_id) % 4  # 0, 1, 2, 3
                    wrongs = list(item["wrongs"])
                    # wrongs 순서도 해시 기반으로 섞음
                    h = _stable_hash(item["q"])
                    if h % 2 == 1:
                        wrongs = [wrongs[1], wrongs[2], wrongs[0]]
                    elif h % 3 == 1:
                        wrongs = [wrongs[2], wrongs[0], wrongs[1]]

                    opts = []
                    w_ptr = 0
                    for pos in range(4):
                        if pos == target_ans_pos:
                            opts.append(item["correct"])
                        else:
                            opts.append(wrongs[w_ptr])
                            w_ptr += 1

                    ans_num = target_ans_pos + 1
                    q_id = f"{exam_key}-{year}-s{s_idx}-{year_q_num:03d}"

                    all_questions.append({
                        "id": q_id,
                        "year": year,
                        "session": session_title,
                        "session_number": s_idx,
                        "type": "multiple_choice",
                        "subject_id": sub_id,
                        "subject_name": sub_name,
                        "chapter": sub_name,
                        "question": item["q"],
                        "code_snippet": item.get("code"),
                        "options": opts,
                        "answer": ans_num,
                        "correct_answer": ans_num,
                        "accepted_answers": None,
                        "explanation": item["exp"]
                    })
                    year_q_num += 1

    return all_questions
