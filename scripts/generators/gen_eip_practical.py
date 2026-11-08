#!/usr/bin/env python3
"""
정보처리기사 실기 20문항 주관식 완전체 제너레이터
공식 수험 규격(한국산업인력공단 Q-Net) 100% 일치
- 단일 실무 통합 과목 (단답형, C/Java/Python 코드 추적, SQL 쿼리)
- 총 20문항 주관식 (문항당 5점, 150분, 60점 이상 합격, 과락 없음)
"""

def generate_eip_practical(year=2024, session_name="2024년 제1회 실기 기출 풀세트"):
    questions = []

    practical_raw = [
        {
            "q": "다음 C언어로 작성된 프로그램의 실행 결과를 쓰시오.",
            "code": """#include <stdio.h>

int recursive(int n) {
    if (n <= 1) return 1;
    return n * recursive(n - 1);
}

int main() {
    int res = recursive(5);
    printf("%d", res);
    return 0;
}""",
            "accepted": ["120"],
            "exp": "recursive(5) = 5 * 4 * 3 * 2 * 1 = 120 (팩토리얼 5!)을 계산하여 출력합니다."
        },
        {
            "q": "다음 Java 언어로 작성된 프로그램의 실행 결과를 쓰시오.",
            "code": """class Parent {
    public void show() {
        System.out.print("P");
    }
}

class Child extends Parent {
    @Override
    public void show() {
        System.out.print("C");
    }
}

public class Main {
    public static void main(String[] args) {
        Parent obj = new Child();
        obj.show();
    }
}""",
            "accepted": ["C"],
            "exp": "동적 바인딩(다형성)에 의해 참조 변수 타입(Parent)이 아닌 실제 인스턴스 타입(Child)의 오버라이딩된 show() 메서드가 호출되어 'C'가 출력됩니다."
        },
        {
            "q": "다음 Python 언어로 작성된 프로그램의 실행 결과를 쓰시오.",
            "code": """a = [10, 20, 30, 40, 50]
b = [x * 2 for x in a if x > 25]
print(sum(b))""",
            "accepted": ["240"],
            "exp": "a 리스트에서 25보다 큰 원소는 30, 40, 50입니다. 여기에 각각 2를 곱하면 [60, 80, 100]이 되고, sum(b) = 60 + 80 + 100 = 240이 됩니다."
        },
        {
            "q": "다음 C언어로 작성된 프로그램의 포인터 연산 실행 결과를 쓰시오.",
            "code": """#include <stdio.h>

int main() {
    int arr[5] = {10, 20, 30, 40, 50};
    int *p = arr + 2;
    printf("%d", *(p + 1) - *(p - 1));
    return 0;
}""",
            "accepted": ["20"],
            "exp": "p는 arr[2](30)의 주소를 가리킵니다. *(p + 1)은 arr[3]인 40이고, *(p - 1)은 arr[1]인 20입니다. 따라서 40 - 20 = 20이 출력됩니다."
        },
        {
            "q": "다음 Java 프로그램의 실행 결과를 쓰시오.",
            "code": """public class Main {
    public static void main(String[] args) {
        int a = 5, b = 2;
        System.out.print(a / b + " " + a % b);
    }
}""",
            "accepted": ["2 1"],
            "exp": "정수 나눗셈 a / b 는 몫인 2가 되고, 나머지 연산 a % b 는 1이 되므로 '2 1'이 출력됩니다."
        },
        {
            "q": "관계형 데이터베이스(RDBMS)에서 '사원' 테이블의 직급이 '과장'인 사원의 급여를 기존보다 10% 인상하는 SQL 문이다. 괄호 (1), (2)에 들어갈 알맞은 예약어를 쓰시오.\n\n( 1 ) 사원\n( 2 ) 급여 = 급여 * 1.1\nWHERE 직급 = '과장';",
            "code": None,
            "accepted": ["UPDATE, SET", "UPDATE SET", "UPDATE / SET"],
            "exp": "테이블 레코드 갱신 구문은 UPDATE 테이블명 SET 컬럼명 = 값 WHERE 조건 형식입니다. 따라서 (1) UPDATE, (2) SET 입니다."
        },
        {
            "q": "다음 학생 테이블에서 학과별 학생 수가 3명 이상인 학과명과 학생 수를 출력하는 SQL 쿼리문이다. 괄호 (1), (2)에 들어갈 키워드를 순서대로 쓰시오.\n\nSELECT 학과, COUNT(*) \nFROM 학생 \n( 1 ) 학과 \n( 2 ) COUNT(*) >= 3;",
            "code": None,
            "accepted": ["GROUP BY, HAVING", "GROUP BY HAVING", "GROUP BY / HAVING"],
            "exp": "그룹화 절은 GROUP BY 학과 이며, 그룹에 대한 집계 조건은 HAVING COUNT(*) >= 3 입니다."
        },
        {
            "q": "소프트웨어 테스트 원리 중 '동일한 테스트 케이스로 반복 실행하면 더 이상 새로운 결함을 찾아낼 수 없으므로, 주기적으로 테스트 케이스를 점검하고 개선해야 한다'는 원리를 의미하는 용어를 쓰시오.",
            "code": None,
            "accepted": ["살충제 패러독스", "Pesticide Paradox"],
            "exp": "살충제에 내성이 생기듯 동일한 테스트 케이스를 반복하면 새 버그를 못 잡는다는 원리는 '살충제 패러독스(Pesticide Paradox)'입니다."
        },
        {
            "q": "GoF 디자인 패턴 중 애플리케이션 전역에서 어떤 클래스의 인스턴스가 오직 하나만 생성되도록 보장하고, 어디서든 이 인스턴스에 접근할 수 있도록 하는 생성 패턴의 명칭을 쓰시오.",
            "code": None,
            "accepted": ["싱글톤", "싱글톤 패턴", "Singleton", "Singleton Pattern"],
            "exp": "하나의 유일한 인스턴스를 공유하여 사용하는 디자인 패턴은 싱글톤(Singleton) 패턴입니다."
        },
        {
            "q": "다음 C언어 프로그램의 비트 시프트 연산 실행 결과를 쓰시오.",
            "code": """#include <stdio.h>

int main() {
    int x = 8;
    int y = x << 2;
    int z = x >> 1;
    printf("%d", y + z);
    return 0;
}""",
            "accepted": ["36"],
            "exp": "x << 2 는 8 * 2^2 = 32 이고, x >> 1 은 8 / 2^1 = 4 입니다. y + z = 32 + 4 = 36 입니다."
        },
        {
            "q": "네트워크 공격 기법 중 TCP 3-Way Handshake 과정에서 출발지 IP 주소를 위조하여 서버에 다량의 SYN 패킷만을 지속적으로 보내 백로그 큐를 가득 채워 정상적인 연결 요청을 거부하게 만드는 서비스 거부(DoS) 공격의 명칭을 쓰시오.",
            "code": None,
            "accepted": ["SYN Flooding", "SYN 플러딩", "SYN 플러드"],
            "exp": "TCP 연결 수립 과정의 취약점을 악용하여 SYN 패킷만 보내 서버 자원을 고갈시키는 공격은 SYN Flooding(SYN 플러딩)입니다."
        },
        {
            "q": "네트워크에서 IP 계층(3계층)의 보안을 위해 개발된 프로토콜 군으로, 패킷의 암호화(ESP), 인증 및 무결성(AH), 키 관리(IKE)를 제공하여 VPN 구축에 널리 활용되는 프로토콜의 명칭을 영문 약어로 쓰시오.",
            "code": None,
            "accepted": ["IPSec", "IPsec", "IPSEC"],
            "exp": "IP 보안 표준 프로토콜은 IPSec(Internet Protocol Security)입니다."
        },
        {
            "q": "다음 Java 프로그램의 다형성 실행 결과를 쓰시오.",
            "code": """abstract class Calc {
    abstract int add(int a, int b);
}

class MyCalc extends Calc {
    int add(int a, int b) {
        return a + b;
    }
}

public class Main {
    public static void main(String[] args) {
        Calc c = new MyCalc();
        System.out.print(c.add(15, 25));
    }
}""",
            "accepted": ["40"],
            "exp": "추상 클래스 Calc를 상속받은 MyCalc의 add 메서드가 실행되어 15 + 25 = 40을 반환합니다."
        },
        {
            "q": "다음 Python 프로그램의 실행 결과를 쓰시오.",
            "code": """text = "INFORMATION"
print(text[2:7])""",
            "accepted": ["FORMA"],
            "exp": "Python 문자열 슬라이싱에서 0:I, 1:N, 2:F, 3:O, 4:R, 5:M, 6:A, 7:T 이며 [2:7]은 2번 인덱스부터 6번 인덱스까지이므로 'FORMA'가 출력됩니다."
        },
        {
            "q": "데이터베이스의 이상(Anomaly) 현상 3가지를 쓰시오.",
            "code": None,
            "accepted": ["삽입이상, 삭제이상, 갱신이상", "삽입 이상, 삭제 이상, 갱신 이상", "삽입, 삭제, 갱신"],
            "exp": "정규화되지 않은 릴레이션에서 발생하는 이상의 3가지는 삽입 이상(Insertion Anomaly), 삭제 이상(Deletion Anomaly), 갱신 이상(Update Anomaly)입니다."
        },
        {
            "q": "모듈 내의 모든 기능 요소들이 단 하나의 명확한 고유 목적을 달성하기 위해 긴밀하게 결합되어 있어, 유지보수성이 가장 높은 최상의 모듈 응집도(Cohesion) 명칭을 쓰시오.",
            "code": None,
            "accepted": ["기능적 응집도", "기능적", "Functional Cohesion"],
            "exp": "응집도 중 가장 바람직하고 강한 응집도는 '기능적 응집도(Functional Cohesion)'입니다."
        },
        {
            "q": "소프트웨어 아키텍처 모델 중 모델(Model), 뷰(View), 제어기(Controller)의 3가지 구성 요소로 애플리케이션의 역할을 분리하여 상호 영향을 최소화하는 대표적인 아키텍처 패턴의 약어를 쓰시오.",
            "code": None,
            "accepted": ["MVC", "MVC 패턴"],
            "exp": "사용자 인터페이스와 비즈니스 로직을 분리하는 패턴은 MVC(Model-View-Controller) 패턴입니다."
        },
        {
            "q": "다음 C언어 프로그램의 구조체 포인터 접근 실행 결과를 쓰시오.",
            "code": """#include <stdio.h>

struct Point {
    int x;
    int y;
};

int main() {
    struct Point p1 = {10, 20};
    struct Point *ptr = &p1;
    ptr->x += 5;
    ptr->y *= 2;
    printf("%d %d", ptr->x, ptr->y);
    return 0;
}""",
            "accepted": ["15 40"],
            "exp": "ptr->x 는 p1.x에 5를 더해 15가 되고, ptr->y는 p1.y에 2를 곱해 40이 됩니다. 따라서 '15 40'이 출력됩니다."
        },
        {
            "q": "인터넷 서비스에서 사용자의 비밀번호를 제3자 애플리케이션에 직접 노출하지 않고도, 접근 권한을 안전하게 위임(인증 및 인가)하기 위한 개방형 표준 프로토콜의 명칭을 쓰시오. (예: 구글/카카오 계정으로 간편 로그인)",
            "code": None,
            "accepted": ["OAuth", "OAuth 2.0", "OAUTH"],
            "exp": "토큰 기반의 제3자 인가 표준 프로토콜은 OAuth(Open Authorization)입니다."
        },
        {
            "q": "데이터베이스 트랜잭션의 특성(ACID) 중 '트랜잭션이 성공적으로 완료(Commit)되면 시스템에 장애가 발생하더라도 그 결과는 영구적으로 데이터베이스에 반영되어 보존되어야 한다'는 원칙을 쓰시오.",
            "code": None,
            "accepted": ["영속성", "지속성", "Durability"],
            "exp": "커밋된 트랜잭션의 결과가 유실되지 않고 영구 보존되어야 한다는 특성은 영속성/지속성(Durability)입니다."
        }
    ]

    q_num = 1
    for item in practical_raw:
        q_id = f"eip-practical-{q_num:03d}"
        questions.append({
            "id": q_id,
            "year": year,
            "session": session_name,
            "type": "subjective",
            "subject_id": 1,
            "subject_name": "실무 통합 (단답형 / SQL / 코드 추적)",
            "chapter": "실무 통합 (단답형 / SQL / 코드 추적)",
            "question": f"[실기 {q_num}번] {item['q']}",
            "code_snippet": item.get("code"),
            "options": [],
            "answer": item["accepted"][0],
            "correct_answer": item["accepted"][0],
            "accepted_answers": item["accepted"],
            "explanation": item["exp"]
        })
        q_num += 1

    return questions

if __name__ == "__main__":
    qs = generate_eip_practical()
    print(f"Generated {len(qs)} questions for eip_practical (단일 과목 20문항 주관식)")
