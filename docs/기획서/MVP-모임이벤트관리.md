# 모임 이벤트 관리 웹 MVP 구현 계획

## Context

수영, 헬스, 친구 모임 주최자가 공지/참여자 관리/정산 등을 효율적으로 처리할 수 있는 모바일 반응형 웹 MVP.
현재 Next.js App Router + Supabase Auth(이메일/Google OAuth) 기반 스타터킷 위에 구축.

- **타겟**: 소규모 친구 모임 5-15명, 비정기 모임 중심
- **목적**: 프로토타입 검증
- **MVP 핵심**: 이벤트 생성/공지 + 참여자 관리 + 정산 관리
- **후순위 (v1.1)**: 카풀 매칭

---

## 1. 핵심 설계 결정

### 그룹(모임) 개념 도입

- 이벤트는 반드시 그룹에 속함 (반복 멤버 관리 편의)
- 그룹 생성 최소화: 이름 + 설명만으로 즉시 생성
- 멤버 초대: 초대 링크 공유 방식

---

## 2. URL 구조

```
/protected                                    # 대시보드 (내 그룹 목록)
/protected/groups/new                         # 그룹 생성
/protected/groups/join/[inviteCode]           # 초대 링크 참가
/protected/groups/[groupId]                   # 그룹 상세 (이벤트 목록)
/protected/groups/[groupId]/settings          # 그룹 설정/멤버 관리
/protected/groups/[groupId]/events/new        # 이벤트 생성
/protected/groups/[groupId]/events/[eventId]  # 이벤트 상세 (RSVP)
.../events/[eventId]/settle                   # 정산 관리
.../events/[eventId]/settle/new               # 지출 등록
```

---

## 3. DB 스키마

### 신규 테이블 (6개)

**groups** - 모임 그룹
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| name | TEXT NOT NULL | 그룹명 |
| description | TEXT | 설명 |
| invite_code | TEXT UNIQUE | 12자리 초대 코드 (자동 생성) |
| created_by | UUID FK(profiles) | 생성자 |
| created_at/updated_at | TIMESTAMPTZ | |

**group_members** - 그룹 멤버
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| group_id | UUID FK(groups) | |
| user_id | UUID FK(profiles) | |
| role | ENUM('owner','admin','member') | 기본값 member |
| joined_at | TIMESTAMPTZ | |
| UNIQUE(group_id, user_id) | | |

**events** - 이벤트
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| group_id | UUID FK(groups) | |
| title | TEXT NOT NULL | |
| description | TEXT | 공지사항 |
| location | TEXT | 장소 |
| event_date | TIMESTAMPTZ | 일시 |
| max_participants | INT | NULL이면 무제한 |
| status | ENUM('draft','open','closed','cancelled') | |
| created_by | UUID FK(profiles) | |

**event_participants** - RSVP
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| event_id | UUID FK(events) | |
| user_id | UUID FK(profiles) | |
| status | ENUM('attending','declined','maybe','waitlisted') | |
| waitlist_position | INT | 대기 순서 |
| UNIQUE(event_id, user_id) | | |

**expenses** - 지출 항목
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| event_id | UUID FK(events) | |
| paid_by | UUID FK(profiles) | 실제 지불자 |
| title | TEXT NOT NULL | "식사비", "입장료" |
| amount | INT NOT NULL | 원 단위 정수 (소수점 오차 방지) |
| created_by | UUID FK(profiles) | |

**expense_participants** - 항목별 참여자 (정산 핵심)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| expense_id | UUID FK(expenses) | |
| user_id | UUID FK(profiles) | |
| UNIQUE(expense_id, user_id) | | |

**settlements** - 송금 기록
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| event_id | UUID FK(events) | |
| from_user_id | UUID FK(profiles) | 보내는 사람 |
| to_user_id | UUID FK(profiles) | 받는 사람 |
| amount | INT NOT NULL | |
| status | ENUM('pending','confirmed') | |
| confirmed_at | TIMESTAMPTZ | |

### RLS 공통 헬퍼

```sql
CREATE FUNCTION is_group_member(p_group_id UUID) RETURNS BOOLEAN
-- auth.uid()가 해당 그룹의 멤버인지 확인
```

### 정산 알고리즘 (클라이언트 사이드)

1. 각 expense의 amount를 expense_participants 수로 나눠 개인 부담금 계산
2. 각 사용자의 순잔액 = 총 지불액 - 총 부담액
3. 양수(받을 사람)/음수(보낼 사람) 분리 후 탐욕 매칭 → 최소 거래 수 달성
4. 1원 오차는 지불자에게 귀속 (floor 사용)

---

## 4. 파일 구조 (신규)

```
app/protected/
  page.tsx                           # 대시보드 개편
  groups/
    new/page.tsx                     # 그룹 생성
    join/[inviteCode]/page.tsx       # 초대 참가
    [groupId]/
      page.tsx                       # 그룹 상세
      layout.tsx                     # 그룹 레이아웃
      settings/page.tsx              # 그룹 설정
      events/
        new/page.tsx                 # 이벤트 생성
        [eventId]/
          page.tsx                   # 이벤트 상세
          settle/
            page.tsx                 # 정산 관리
            new/page.tsx             # 지출 등록

components/
  groups/                            # 그룹 관련 컴포넌트
  events/                            # 이벤트/RSVP 컴포넌트
  settle/                            # 정산 컴포넌트
  layout/                            # 앱 헤더, 하단 네비게이션 등

lib/
  actions/
    group-actions.ts                 # Server Actions: 그룹 CRUD
    event-actions.ts                 # Server Actions: 이벤트 + RSVP
    settle-actions.ts                # Server Actions: 지출/정산
  settlement-calculator.ts           # 순수 함수: 정산 알고리즘

types/index.ts                       # 앱 도메인 타입 정의
```

---

## 5. 구현 단계

### Phase 1: 그룹 관리 + 레이아웃 개편

- DB: `groups`, `group_members` 테이블 + RLS
- UI: 대시보드 개편, 그룹 생성/상세/설정, 초대 링크, 모바일 하단 네비
- 기존 튜토리얼 UI 제거
- `proxy.ts`에 redirect 쿼리 파라미터 보존 추가 (초대 링크 지원)
- **추가 shadcn 컴포넌트**: dialog, avatar, textarea, toast(sonner), separator, skeleton

### Phase 2: 이벤트 관리

- DB: `events`, `event_participants` 테이블 + RLS
- UI: 이벤트 생성 폼 (날짜 선택), 이벤트 상세, RSVP 토글, 참여자 목록, 대기자 관리
- 대기자 자동 승격 로직 (Server Action)
- **추가 의존성**: `date-fns` (날짜 포맷)
- **추가 shadcn 컴포넌트**: calendar, popover, tabs, toggle-group, select

### Phase 3: 정산 관리

- DB: `expenses`, `expense_participants`, `settlements` 테이블 + RLS
- UI: 지출 등록 (참여자 체크박스 선택), 정산 결과 자동 계산, 송금 완료 표시
- `settlement-calculator.ts` 구현 (최적 송금 경로)
- **추가 shadcn 컴포넌트**: sheet, scroll-area

---

## 6. 수정 필요한 기존 파일

| 파일                       | 수정 내용                            |
| -------------------------- | ------------------------------------ |
| `app/protected/layout.tsx` | 모바일 퍼스트 레이아웃으로 전면 개편 |
| `app/protected/page.tsx`   | 그룹 목록 대시보드로 변경            |
| `lib/supabase/proxy.ts`    | redirect 쿼리 파라미터 보존 추가     |
| `types/supabase.ts`        | DB 스키마 변경 후 재생성             |
| `app/page.tsx`             | 랜딩 페이지 MVP 소개로 개편 (선택)   |

---

## 7. 검증 방법

### Phase별 검증

1. **Phase 1**: 그룹 생성 → 초대 링크로 다른 계정 참가 → 그룹 목록에 표시되는지 확인
2. **Phase 2**: 이벤트 생성 → RSVP 변경 → 인원 초과 시 대기자 전환 → 불참 시 자동 승격
3. **Phase 3**: 다중 지출 등록 (A: 식사비 10만/5명, B: 입장료 5만/3명) → 정산 결과 정확성 → 송금 완료 표시

### E2E 시나리오

1. 사용자 A가 "수영 모임" 그룹 생성
2. 초대 링크로 B, C, D, E 참가
3. A가 "3월 수영" 이벤트 생성 (인원 제한 4명)
4. A, B, C, D 참석, E는 대기자
5. D가 불참 → E 자동 승격
6. A가 식사비 10만원 (A,B,C,E), B가 입장료 5만원 (A,B,C) 등록
7. 정산 결과 확인 및 송금 완료 표시
