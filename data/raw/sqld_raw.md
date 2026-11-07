# SQLD (SQL 개발자) 공개 기출 복원 및 핵심 문제 은행 (20문항 완비)

[Q-01]
과목: 1과목 데이터 모델링의 이해
유형: multiple_choice
질문: 다음 중 엔터티(Entity)의 일반적인 특징으로 가장 부적절한 것은?
보기1: 반드시 해당 업무에서 필요하고 관리하고자 하는 정보여야 한다.
보기2: 유일한 식별자(Unique Identifier)에 의해 식별이 가능해야 한다.
보기3: 영속적으로 존재하는 인스턴스의 수가 한 개여야 한다.
보기4: 엔터티는 반드시 2개 이상의 속성(Attribute)을 가져야 한다.
정답: 3
해설: 엔터티는 영속적으로 존재하는 두 개 이상의 인스턴스(Instance)의 집합이어야 합니다. 인스턴스가 1개뿐인 것은 엔터티의 성립 요건에 어긋납니다.

[Q-02]
과목: 1과목 데이터 모델링의 이해
유형: multiple_choice
질문: 다음 중 데이터베이스 정규화 과정에서 제2정규형(2NF)의 충족 조건으로 가장 올바른 것은?
보기1: 모든 도메인이 원자값(Atomic Value)으로만 구성된다.
보기2: 제1정규형을 만족하고, 기본키의 진부분집합이 일반 속성을 결정하지 않는 완전 함수 종속을 이룬다.
보기3: 제2정규형을 만족하고, 기본키가 아닌 일반 속성 간의 이행적 함수 종속성이 제거된다.
보기4: 결정자가 모두 후보키인 상태를 만족한다.
정답: 2
해설: 1NF는 원자성 확보, 2NF는 부분 함수 종속성 제거(완전 함수 종속), 3NF는 이행 함수 종속성 제거, BCNF는 결정자 후보키화입니다.

[Q-03]
과목: 1과목 데이터 모델링의 이해
유형: multiple_choice
질문: 엔터티의 특징 중 발생시점에 따라 분류할 때, 업무가 진행됨에 따라 지속적으로 발생하는 대량의 엔터티로 가장 적절한 것은?
보기1: 기본 엔터티 (Fundamental Entity)
보기2: 중심 엔터티 (Main Entity)
보기3: 행위 엔터티 (Action Entity)
보기4: 개념 엔터티 (Conceptual Entity)
정답: 3
해설: 발생시점에 따른 분류: 1. 기본 엔터티(사원, 부서, 고객 등 원래 존재), 2. 중심 엔터티(주문, 매출, 접수 등 업무의 중심), 3. 행위 엔터티(주문목록, 배송이력 등 2개 이상의 부모 엔터티로부터 빈번히 발생)

[Q-04]
과목: 1과목 데이터 모델링의 이해
유형: multiple_choice
질문: 식별자(Identifier)의 분류 중, 엔터티 내에서 대표성을 가지며 다른 엔터티와 참조 관계를 형성할 수 있는 식별자는?
보기1: 주식별자 (Primary Identifier)
보기2: 보조식별자 (Alternate Identifier)
보기3: 내부식별자 (Internal Identifier)
보기4: 대리식별자 (Surrogate Identifier)
정답: 1
해설: 주식별자는 엔터티를 대표하는 유일한 식별자로, 참조 무결성을 위해 외래키로 참조될 수 있습니다.

[Q-05]
과목: 1과목 데이터 모델링의 이해
유형: multiple_choice
질문: 성능 향상을 위한 반정규화(De-normalization) 기법 중, 빈번하게 발생하는 조인(Join) 연산의 부하를 줄이기 위해 사용하는 방법이 아닌 것은?
보기1: 중복 컬럼 추가 (추가적인 조인 경로 단축)
보기2: 파생 컬럼 추가 (총합, 평균 등 미리 계산된 칼럼 유지)
보기3: 테이블의 수평 분할 (Partitioning)
보기4: 제3정규형을 적용하여 이행적 함수 종속성 제거
정답: 4
해설: 제3정규형 적용은 정규화(Normalization) 과정이며, 반정규화는 성능을 위해 정규화된 모델을 의도적으로 중복·통합·분할하는 작업입니다.

[Q-06]
과목: 2과목 SQL 기본 및 활용
유형: multiple_choice
질문: 다음 EMP 테이블에서 수행된 SQL의 실행 결과 출력되는 행(Row)의 개수로 올바른 것은?
코드:
```sql
SELECT DEPTNO, AVG(SAL) AS AVG_SAL
FROM EMP
GROUP BY DEPTNO
HAVING AVG(SAL) >= 3000
ORDER BY AVG_SAL DESC;
```
보기1: 1개 행
보기2: 2개 행
보기3: 3개 행
보기4: 5개 행
정답: 2
해설: 부서별 평균 급여 계산 시 DEPTNO 10은 3500, DEPTNO 20은 2500, DEPTNO 30은 5000입니다. HAVING 조건 AVG(SAL) >= 3000에 의해 30번과 10번 부서 2개 행만 반환됩니다.

[Q-07]
과목: 2과목 SQL 기본 및 활용
유형: multiple_choice
질문: 다음 중 SQL에서 NULL 값에 대한 설명으로 가장 옳지 않은 것은?
코드:
```sql
SELECT COL1 + 10, COUNT(*), COUNT(COL1) FROM TBL;
```
보기1: NULL과의 산술 연산 결과는 항상 NULL이다.
보기2: 집계 함수(SUM, AVG 등)는 NULL 값을 0으로 자동 변환한 후 연산한다.
보기3: COUNT(*) 함수는 NULL을 포함한 전체 행 수를 반환한다.
보기4: WHERE COL1 = NULL 연산은 참을 반환하지 않으며, IS NULL을 사용해야 한다.
정답: 2
해설: 집계 함수는 NULL을 0으로 치환하지 않고 연산 대상에서 '완전히 제외(무시)'하고 나머지 행들로만 계산합니다.

[Q-08]
과목: 2과목 SQL 기본 및 활용
유형: multiple_choice
질문: 다음 윈도우 함수 중 동일한 순위가 있을 경우 다음 순위를 건너뛰지 않고 연속된 순위를 부여하는 함수는?
코드:
```sql
SELECT ENAME, SAL,
       [ 함수 ] OVER (ORDER BY SAL DESC) AS RNK
FROM EMP;
```
보기1: RANK
보기2: DENSE_RANK
보기3: ROW_NUMBER
보기4: NTILE
정답: 2
해설: DENSE_RANK는 동순위가 발생해도 다음 순위를 건너뛰지 않고 1, 2, 2, 3 처럼 연속된 순위를 부여합니다. (RANK는 1, 2, 2, 4)

[Q-09]
과목: 2과목 SQL 기본 및 활용
유형: multiple_choice
질문: 다음 SQL 문장에서 사용된 집합 연산자 중 두 테이블의 결과 집합에서 공통으로 존재하는 교집합(Intersection)만을 반환하는 연산자는?
보기1: UNION
보기2: UNION ALL
보기3: INTERSECT
보기4: MINUS (또는 EXCEPT)
정답: 3
해설: INTERSECT는 두 쿼리의 공통된 결과(교집합)를 중복 제거 후 반환합니다. UNION은 합집합, MINUS는 차집합입니다.

[Q-10]
과목: 2과목 SQL 기본 및 활용
유형: multiple_choice
질문: 다음 중 다중 행 서브쿼리(Multi-Row Subquery) 연산자로 사용할 수 없는 것은?
보기1: IN
보기2: ANY (또는 SOME)
보기3: ALL
보기4: = (단일 등호)
정답: 4
해설: 단일 등호(=)는 서브쿼리의 반환 결과가 반드시 1행이어야 하는 단일 행 비교 연산자입니다. 반환 행이 2개 이상이면 에러가 발생합니다.

[Q-11]
과목: 2과목 SQL 기본 및 활용
유형: multiple_choice
질문: 다음 중 그룹 함수(Group Function) 중 소계와 총계를 계층적으로 생성해주는 함수는?
코드:
```sql
SELECT DEPTNO, JOB, SUM(SAL)
FROM EMP
GROUP BY ROLLUP(DEPTNO, JOB);
```
보기1: ROLLUP
보기2: CUBE
보기3: GROUPING SETS
보기4: PIVOT
정답: 1
해설: ROLLUP은 인수로 전달된 컬럼의 오른쪽에서 왼쪽 방향으로 계층적인 소계와 총계를 산출합니다. CUBE는 가능한 모든 조합의 다차원 집계를 산출합니다.

[Q-12]
과목: 2과목 SQL 기본 및 활용
유형: multiple_choice
질문: 다음 SQL 중 조인(Join) 수행 시 조인 조건을 만족하지 않는 왼쪽 테이블의 모든 행도 함께 결과에 포함하는 조인 구문은?
보기1: INNER JOIN
보기2: LEFT OUTER JOIN
보기3: RIGHT OUTER JOIN
보기4: CROSS JOIN
정답: 2
해설: LEFT OUTER JOIN(왼쪽 외부 조인)은 왼쪽 테이블의 모든 행을 출력하며, 오른쪽 테이블과 일치하는 행이 없으면 오른쪽 컬럼 값은 NULL로 채워집니다.

[Q-13]
과목: 2과목 SQL 기본 및 활용
유형: multiple_choice
질문: 다음 중 트랜잭션의 제어어(TCL)에 해당하지 않는 명령어는?
보기1: COMMIT
보기2: ROLLBACK
보기3: SAVEPOINT
보기4: GRANT
정답: 4
해설: GRANT와 REVOKE는 권한을 부여하고 회수하는 DCL(데이터 제어어)입니다. COMMIT, ROLLBACK, SAVEPOINT는 TCL입니다.

[Q-14]
과목: 2과목 SQL 기본 및 활용
유형: multiple_choice
질문: 다음 중 오라클(Oracle)에서 NULL 값을 다른 기본값으로 치환하기 위해 사용하는 내장 함수는?
보기1: NVL
보기2: ISNULL
보기3: IFNULL
보기4: NULLIF
정답: 1
해설: 오라클에서는 NVL(컬럼, 대체값) 또는 표준 COALESCE를 사용합니다. ISNULL은 SQL Server, IFNULL은 MySQL 함수입니다.

[Q-15]
과목: 2과목 SQL 기본 및 활용
유형: multiple_choice
질문: 다음 SQL 문장 실행 시 최종적으로 적용되는 정렬 순서로 올바른 것은?
코드:
```sql
SELECT ENAME, DEPTNO, SAL
FROM EMP
ORDER BY DEPTNO ASC, SAL DESC;
```
보기1: 부서번호 내림차순 정렬 후 급여 오름차순
보기2: 부서번호 오름차순 정렬 후 급여 내림차순
보기3: 급여 내림차순 정렬 후 부서번호 오름차순
보기4: 부서번호와 급여 모두 오름차순
정답: 2
해설: ORDER BY 절에 나열된 순서대로 정렬됩니다. 먼저 DEPTNO 기준 오름차순(ASC)으로 정렬되고, DEPTNO가 동일한 행들 내에서 SAL 기준 내림차순(DESC)으로 정렬됩니다.

[Q-16]
과목: 2과목 SQL 기본 및 활용
유형: multiple_choice
질문: 윈도우 함수 중 현재 행을 기준으로 이전 N번째 행의 값을 가져오는 함수는?
코드:
```sql
SELECT ENAME, SAL,
       LAG(SAL, 1) OVER (ORDER BY HIREDATE) AS PREV_SAL
FROM EMP;
```
보기1: LEAD
보기2: LAG
보기3: FIRST_VALUE
보기4: RATIO_TO_REPORT
정답: 2
해설: LAG는 이전 행의 값을 참조하며, LEAD는 이후(다음) 행의 값을 참조합니다.

[Q-17]
과목: 2과목 SQL 기본 및 활용
유형: multiple_choice
질문: 다음 중 DDL(데이터 정의어) 명령어 중 테이블의 모든 행을 즉시 삭제하고 용량을 초기화하며, ROLLBACK이 불가능한 명령어는?
보기1: DELETE
보기2: TRUNCATE
보기3: DROP
보기4: ALTER
정답: 2
해설: TRUNCATE TABLE은 테이블 구조는 남겨두고 데이터 전체를 빠르게 삭제하며 로그를 최소화하여 ROLLBACK이 불가합니다. DELETE는 DML로 롤백이 가능합니다.

[Q-18]
과목: 2과목 SQL 기본 및 활용
유형: multiple_choice
질문: 다음 계층형 질의(Hierarchical Query) 구문 중 루트 노드(최상위 계층)를 지정하기 위해 사용하는 키워드는?
코드:
```sql
SELECT LEVEL, ENAME, MGR
FROM EMP
START WITH MGR IS NULL
CONNECT BY PRIOR EMPNO = MGR;
```
보기1: START WITH
보기2: CONNECT BY
보기3: PRIOR
보기4: ORDER SIBLINGS BY
정답: 1
해설: 계층형 질의에서 전개의 시작점(루트 노드)을 지정하는 키워드는 START WITH 절입니다.

[Q-19]
과목: 2과목 SQL 기본 및 활용
유형: multiple_choice
질문: 서브쿼리가 반환하는 결과가 존재하는지 여부만을 확인하여 불필요한 전체 검색을 방지하는 연산자는?
보기1: IN
보기2: EXISTS
보기3: BETWEEN
보기4: LIKE
정답: 2
해설: EXISTS 연산자는 조건에 일치하는 행이 최소 1건이라도 발견되는 즉시 TRUE를 반환하고 검색을 중단하므로 대용량 데이터에서 성능이 매우 우수합니다.

[Q-20]
과목: 2과목 SQL 기본 및 활용
유형: multiple_choice
질문: 다음 중 문자열 함수 중 문자열의 길이를 바이트(Byte) 단위가 아닌 글자 수 단위로 반환하는 표준 함수는?
보기1: LENGTH
보기2: LENGTHB
보기3: SUBSTRB
보기4: INSTRB
정답: 1
해설: LENGTH는 문자열의 순수 글자 수를 반환하며, LENGTHB는 저장 공간의 바이트(Byte) 길이를 반환합니다.
