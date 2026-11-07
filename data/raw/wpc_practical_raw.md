# 정보처리기사 실기 공개 복원 및 코드 추적 문제 은행 (20문항 완비)

[Q-01]
과목: 프로그래밍 언어 활용 (C언어)
유형: subjective
질문: 다음 C언어 프로그램의 실행 결과를 쓰시오.
코드:
```c
#include <stdio.h>

int main() {
    int arr[5] = { 10, 20, 30, 40, 50 };
    int *p = arr;
    int sum = 0;
    
    for(int i = 0; i < 3; i++) {
        sum += *(p + i * 2);
    }
    
    printf("%d", sum);
    return 0;
}
```
정답: 90
허용정답: 90
해설: 포인터 p는 arr[0]의 주소입니다. i=0일 때 arr[0]=10, i=1일 때 arr[2]=30, i=2일 때 arr[4]=50이 누적되어 sum = 10 + 30 + 50 = 90이 됩니다.

[Q-02]
과목: 프로그래밍 언어 활용 (Java)
유형: subjective
질문: 다음 Java 프로그램의 실행 결과를 쓰시오.
코드:
```java
class SuperObject {
    public void paint() {
        draw();
    }
    public void draw() {
        System.out.print("Super ");
    }
}

class SubObject extends SuperObject {
    public void paint() {
        super.paint();
        draw();
    }
    public void draw() {
        System.out.print("Sub ");
    }
}

public class Test {
    public static void main(String[] args) {
        SuperObject obj = new SubObject();
        obj.paint();
    }
}
```
정답: Sub Sub
허용정답: Sub Sub, SubSub, Sub  Sub
해설: SubObject 인스턴스에서 paint() 실행 시 super.paint()를 통해 부모의 paint()로 가지만, 동적 바인딩에 의해 오버라이딩된 SubObject의 draw()가 실행됩니다. 따라서 "Sub "가 두 번 출력됩니다.

[Q-03]
과목: SQL 응용 (단답형)
유형: subjective
질문: 기존 STUDENT 테이블에 AGE 속성(INT 타입)을 추가하는 SQL DDL 명령문의 빈칸에 들어갈 키워드를 영문으로 작성하시오.

ALTER TABLE STUDENT [ ( 1 ) ] AGE INT;
정답: ADD
허용정답: ADD, add
해설: 테이블에 열을 추가할 때의 표준 SQL DDL 문법은 ALTER TABLE 테이블명 ADD 컬럼명 데이터타입; 입니다.

[Q-04]
과목: 소프트웨어 공학 (단답형)
유형: subjective
질문: 모듈 내부가 아닌 모듈과 모듈 사이의 상호 의존 정도를 나타내는 척도로, 결합도가 (높을수록 / 낮을수록) 소프트웨어의 품질과 재사용성이 우수하다고 평가된다. 빈칸에 알맞은 단어를 작성하시오.
정답: 낮을수록
허용정답: 낮을수록, 낮을 수록, 낮아야
해설: 소프트웨어 설계에서 모듈의 독립성을 높이려면 '응집도(Cohesion)는 높이고, 결합도(Coupling)는 낮추어야' 합니다.

[Q-05]
과목: 프로그래밍 언어 활용 (Python)
유형: subjective
질문: 다음 Python 프로그램의 실행 결과를 쓰시오.
코드:
```python
def solve(text):
    return text[::-1]

msg = "PASS2026"
print(solve(msg))
```
정답: 6202SSAP
허용정답: 6202SSAP
해설: 문자열 슬라이싱 `text[::-1]`은 문자열을 뒤에서부터 역순으로 뒤집어 반환합니다. "PASS2026"을 뒤집으면 "6202SSAP"가 됩니다.

[Q-06]
과목: 프로그래밍 언어 활용 (C언어)
유형: subjective
질문: 다음 C언어 재귀함수(Recursive Function)의 실행 결과를 쓰시오.
코드:
```c
#include <stdio.h>

int f(int n) {
    if (n <= 1) return 1;
    return n * f(n - 1);
}

int main() {
    printf("%d", f(4));
    return 0;
}
```
정답: 24
허용정답: 24
해설: f(4) = 4 * f(3) = 4 * 3 * f(2) = 4 * 3 * 2 * f(1) = 4 * 3 * 2 * 1 = 24 입니다. 팩토리얼(Factorial) 연산입니다.

[Q-07]
과목: 프로그래밍 언어 활용 (Java)
유형: subjective
질문: 다음 Java 프로그램의 실행 결과를 쓰시오.
코드:
```java
public class ArrayTest {
    public static void main(String[] args) {
        int[] arr = { 2, 4, 6, 8, 10 };
        int sum = 0;
        for (int x : arr) {
            if (x > 5) sum += x;
        }
        System.out.print(sum);
    }
}
```
정답: 24
허용정답: 24
해설: 5보다 큰 원소는 6, 8, 10입니다. 따라서 sum = 6 + 8 + 10 = 24가 출력됩니다.

[Q-08]
과목: 프로그래밍 언어 활용 (Python)
유형: subjective
질문: 다음 Python 딕셔너리 연산의 실행 결과를 쓰시오.
코드:
```python
scores = {"kor": 80, "eng": 90, "math": 70}
scores["math"] = 85
scores["sci"] = 95
print(len(scores), scores["math"])
```
정답: 4 85
허용정답: 4 85, 4, 85
해설: 초기 3개 키에서 "math"는 값이 85로 갱신되고, 새로운 키 "sci"가 추가되어 총 길이는 4가 됩니다. 출력은 "4 85"입니다.

[Q-09]
과목: 데이터베이스 (SQL)
유형: subjective
질문: 다음 SQL 질의의 실행 결과 출력되는 숫자를 쓰시오.
코드:
```sql
-- EMP 테이블에 총 5개의 행이 있고, 
-- 그 중 2개 행의 COMM 컬럼 값이 NULL일 때
SELECT COUNT(COMM) FROM EMP;
```
정답: 3
허용정답: 3
해설: `COUNT(*)`는 NULL을 포함한 전체 행 수(5)를 세지만, `COUNT(컬럼명)`은 컬럼 값이 NULL인 행을 제외하므로 5 - 2 = 3을 반환합니다.

[Q-10]
과목: 소프트웨어 공학 (디자인 패턴)
유형: subjective
질문: 객체의 생성과 관련된 디자인 패턴 중, 하나의 클래스에 대해 오직 단 하나의 인스턴스만 생성되도록 보장하고 이에 대한 전역적인 접근점을 제공하는 GoF 패턴의 명칭을 영문으로 쓰시오.
정답: Singleton
허용정답: Singleton, singleton, 싱글톤
해설: 전역에서 유일한 하나의 인스턴스만 보장하는 대표적인 생성 패턴은 싱글톤(Singleton) 패턴입니다.

[Q-11]
과목: 네트워크 (프로토콜)
유형: subjective
질문: IP 주소를 사용하여 목적지 호스트까지 패킷이 도달하는 최적의 경로를 설정해주는 3계층(네트워크 계층) 핵심 장비의 명칭을 쓰시오.
정답: 라우터
허용정답: 라우터, Router, router
해설: 서로 다른 네트워크 대역을 연결하고 패킷의 최적 경로(Routing)를 지정하는 네트워크 3계층 장비는 라우터(Router)입니다.

[Q-12]
과목: 정보보안 (암호학)
유형: subjective
질문: 임의의 길이의 데이터를 입력받아 항상 고정된 길이의 고유한 문자열(다이제스트)을 출력하며, 복호화가 불가능한 일방향 암호화 알고리즘 군(SHA-256, MD5 등)을 무엇이라고 하는가?
정답: 해시 함수
허용정답: 해시 함수, 해시함수, Hash, hash, 해시
해설: 역방향 계산(복호화)이 불가능하고 고정 길이 해시값을 생성하는 알고리즘은 해시 함수(Hash Function)입니다.

[Q-13]
과목: 프로그래밍 언어 활용 (C언어)
유형: subjective
질문: 다음 C언어 프로그램의 실행 결과를 쓰시오.
코드:
```c
#include <stdio.h>

int main() {
    char str[] = "HELLO";
    printf("%c%c", str[1], *(str + 4));
    return 0;
}
```
정답: EO
허용정답: EO, eo
해설: str[1]은 두 번째 문자인 'E'이며, *(str + 4)는 다섯 번째 문자인 'O'입니다. 따라서 연속으로 출력되어 "EO"가 됩니다.

[Q-14]
과목: 데이터베이스 (SQL)
유형: subjective
질문: 테이블의 특정 컬럼에 값이 중복 입력되는 것을 방지하면서, 필요시 NULL 값은 허용하는 관계형 데이터베이스 무결성 제약조건 키워드를 영문으로 쓰시오.
정답: UNIQUE
허용정답: UNIQUE, unique, 유니크
해설: PRIMARY KEY는 NOT NULL + UNIQUE이지만, 중복을 불허하면서 NULL을 허용하는 제약조건은 UNIQUE 제약조건입니다.

[Q-15]
과목: 프로그래밍 언어 활용 (Java)
유형: subjective
질문: 다음 Java 프로그램의 실행 결과를 쓰시오.
코드:
```java
public class StringTest {
    public static void main(String[] args) {
        String s1 = "PASS";
        String s2 = "PASS";
        String s3 = new String("PASS");
        System.out.print((s1 == s2) + " " + s1.equals(s3));
    }
}
```
정답: true true
허용정답: true true, truetrue
해설: 리터럴로 생성된 s1과 s2는 문자열 상수 풀에서 동일한 참조 주소를 공유하므로 `s1 == s2`는 true입니다. `s1.equals(s3)`는 문자열의 실제 내용 값을 비교하므로 true입니다.

[Q-16]
과목: 소프트웨어 공학 (응집도)
유형: subjective
질문: 모듈 내부의 모든 요소들이 하나의 단일 목적만을 위해 긴밀하게 협력하여 동작하는 상태로, 응집도의 7가지 단계 중 가장 높은(가장 이상적인) 응집도는?
정답: 기능적 응집도
허용정답: 기능적 응집도, 기능적응집도, Functional Cohesion, functional
해설: 응집도가 가장 높은 것은 기능적 응집도(Functional)이며, 가장 낮은 것은 우연적 응집도(Coincidental)입니다.

[Q-17]
과목: 데이터베이스 (정규화)
유형: subjective
질문: 릴레이션에서 X → Y 이고 Y → Z 일 때 X → Z 가 성립하는 종속 관계를 '이행적 함수 종속'이라고 한다. 이행적 함수 종속성을 제거하여 분해하는 정규화 단계는 제 몇 정규형인가? (숫자만 작성)
정답: 3
허용정답: 3, 제3정규형, 3NF
해설: 1NF(원자화) → 2NF(부분함수종속 제거) → 3NF(이행함수종속 제거) 입니다.

[Q-18]
과목: 프로그래밍 언어 활용 (Python)
유형: subjective
질문: 다음 Python 람다(lambda) 함수의 실행 결과를 쓰시오.
코드:
```python
func = lambda a, b: a * 2 + b
print(func(3, 4))
```
정답: 10
허용정답: 10
해설: a=3, b=4를 대입하면 3 * 2 + 4 = 6 + 4 = 10이 반환됩니다.

[Q-19]
과목: 소프트웨어 테스팅
유형: subjective
질문: 입력 도메인을 여러 개의 동등한 영역으로 나눈 후 각 영역에서 대푯값을 하나씩 선택하여 테스트 케이스를 설계하는 블랙박스 테스트 기법의 명칭을 쓰시오.
정답: 동등 분할
허용정답: 동등 분할, 동등분할, 동치분할, Equivalence Partitioning
해설: 유효값과 무효값 영역으로 분할하여 대푯값을 추출하는 기법은 동등 분할(동치 분할) 기법입니다.

[Q-20]
과목: 정보보안 (보안 공격)
유형: subjective
질문: 데이터베이스 웹 애플리케이션의 입력값 검증 취약점을 이용하여, 악의적인 SQL 구문을 삽입하고 비인가 데이터 열람이나 조작을 유발하는 대표적인 웹 취약점 공격의 명칭을 쓰시오.
정답: SQL 인젝션
허용정답: SQL 인젝션, SQL 삽입, SQL Injection, SQL injection
해설: 입력 폼이나 URL 쿼리스트링에 임의의 SQL 명령어를 주입하여 공격하는 기법은 SQL 인젝션(SQL Injection) 공격입니다.
