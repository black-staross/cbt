# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React (Vite 기반 초경량 SPA) + 순수 React 상태(State/Reducer) + localStorage (외부 DB 및 Redux 배제)

## Users

한국산업인력공단(정보처리기사 등) 및 K-DATA(SQLD, ADsP 등) 자격검정 CBT 시험을 대비하는 수험생 및 개인 학습자.

## Product Purpose

실제 시험장 환경과 유사한 고대비 가독성 환경에서 기출문제 풀이, 실전 모의고사 응시, OMR 마킹, 오답 노트, SQL 및 프로그래밍 코드 해석을 즉각적이고 가볍게 훈련할 수 있는 개인 학습용 멀티 자격증 CBT 웹 애플리케이션.

## Positioning

무거운 외부 라이브러리나 백엔드 의존성 없이, 브라우저 단독(로컬 스토리지)으로 즉시 구동되는 초경량 린(Lean) 수험 플랫폼.

## Operating Context

- 데스크톱 및 태블릿 웹 브라우저 환경에서의 CBT 시험 시뮬레이션
- 시험 시간 카운트다운 타이머, 문항 이동(OMR 답안지 그리드 네비게이션), 답안 제출 및 자동 채점
- SQL, C, Java, Python 등 프로그래밍/데이터베이스 코드 해석 및 결과 테이블 분석

## Capabilities and Constraints

- Capabilities:
  - 멀티 자격증(정보처리기사, SQLD 등) 종목 및 회차별 모의고사 응시 모드 / 연습 모드
  - OMR 카드 기반 문항 탐색, 안 푼 문제 필터링, 정답 마킹 실시간 동기화
  - 네이티브 구현 경량 SQL/코드 하이라이터 및 정갈한 데이터 그리드 렌더링
  - 시험 종료 후 점수 리포트, 오답 분석 및 localStorage 기반 오답 노트 영구 보관
- Constraints:
  - `ponytail` (YAGNI & Lean): 무거운 상태 관리 라이브러리(Redux, Zustand 등) 및 외부 DB 배제. 순수 React 상태 관리와 `localStorage`만 활용.
  - 모달, 탭 전환, 코드 하이라이팅을 외부 대형 패키지 없이 경량 네이티브 코드로 구현.
  - `impeccable` (CBT 수험 최적화 UI): 한국산업인력공단/K-DATA 검정 화면 스타일의 고대비 모노톤 + 직관적 강조색 + iOS 리퀴드 글래스 레이아웃 버튼.
  - 코드 블록(Monospace 폰트) 및 정갈한 테두리 그리드 테이블 적용으로 수험 가독성 극대화.

## Product Principles

1. **극도의 단순성과 린 아키텍처 (Zero Over-engineering)**: 외부 종속성을 최소화하여 브라우저 어디서나 지연 없이 즉각 로딩되고 동작한다.
2. **실전 시험 중심의 시각적 안정성 (Exam-First Readability)**: 장시간 응시에도 눈의 피로를 최소화하는 차분한 고대비 모노톤과 실전 OMR 레이아웃을 제공한다.
3. **직관적인 네이티브 인터랙션 (Native Smooth UX)**: 가벼운 네이티브 코드로 부드러운 탭 전환, 모달, 즉각적인 답안 마킹 피드백을 구현한다.
