# PRD: 모임 이벤트 관리 웹 MVP

**작성일**: 2026-03-02
**대상**: 솔로 개발자
**버전**: 1.0 (MVP)

---

## 1. 핵심 정보

### 목적

수영, 헬스, 친구 모임 주최자가 공지·참여자 관리·정산을 하나의 웹에서 처리할 수 있도록 한다.
카카오톡 채팅방으로 흩어진 공지/RSVP/정산 과정을 단일 웹 앱으로 통합하여 주최자 부담을 줄이는 것이 핵심 가치다.

### 타겟 사용자

- **주최자**: 소규모 정기/비정기 모임(5~15명)을 운영하는 사람
- **참여자**: 초대 링크를 통해 합류하는 모임 멤버

### MVP 범위

- 그룹(모임) 생성 및 멤버 초대
- 이벤트 생성 및 RSVP(참석/불참/미결정/대기) 관리
- 지출 등록 및 자동 정산 계산
- 이메일/Google OAuth 인증

### MVP 제외 항목 (v1.1 이후)

- 카풀 매칭
- 푸시 알림
- 모임 채팅
- 결제 연동 (토스페이 등)

---

## 2. 사용자 여정

```
[랜딩 페이지 /]
    ↓ (로그인 또는 회원가입 선택)
[로그인/회원가입 /auth/login, /auth/sign-up]
    ↓ (인증 성공)
[대시보드 /protected]
    ├── 그룹 생성 → [그룹 생성 /protected/groups/new]
    │       ↓ (생성 완료)
    │   [그룹 상세 /protected/groups/[groupId]]
    │       ├── 초대 링크 공유 → [초대 참가 /protected/groups/join/[inviteCode]]
    │       ├── 그룹 설정 → [그룹 설정 /protected/groups/[groupId]/settings]
    │       └── 이벤트 생성 → [이벤트 생성 /protected/groups/[groupId]/events/new]
    │               ↓ (생성 완료)
    │           [이벤트 상세 .../events/[eventId]]
    │               ├── RSVP 응답 (참석/불참/미결정)
    │               └── 정산 관리 → [정산 관리 .../settle]
    │                       └── 지출 등록 → [지출 등록 .../settle/new]
    └── 기존 그룹 클릭 → [그룹 상세]
```

---

## 3. 기능 명세

### MVP 핵심 기능

| ID   | 기능명           | 설명                                                                                     |
| ---- | ---------------- | ---------------------------------------------------------------------------------------- |
| F001 | 그룹 생성        | 이름+설명 입력만으로 즉시 그룹 생성. 자동으로 12자리 invite_code 발급                    |
| F002 | 그룹 목록 조회   | 내가 속한 그룹 목록을 대시보드에 표시 (최신 이벤트 요약 포함)                            |
| F003 | 초대 링크 참가   | invite_code가 포함된 URL로 접근 시 자동으로 그룹 멤버로 등록                             |
| F004 | 멤버 관리        | 그룹 설정 페이지에서 멤버 목록 확인, owner/admin은 멤버 추방 가능                        |
| F005 | 이벤트 생성      | 제목, 공지사항, 장소, 일시, 인원제한 설정. status 기본값 'open'                          |
| F006 | 이벤트 목록 조회 | 그룹 상세 페이지에서 이벤트 목록 표시 (예정/지난 탭 구분)                                |
| F007 | RSVP 응답        | 이벤트 상세에서 참석/불참/미결정 선택. 인원 초과 시 자동으로 대기자 등록                 |
| F008 | 대기자 자동 승격 | 참석자가 불참으로 변경 시, 대기자 1순위를 자동으로 'attending'으로 승격 (Server Action)  |
| F009 | 지출 등록        | 지출 항목명, 금액, 실제 지불자, 참여자(체크박스) 등록. 금액은 원 단위 정수               |
| F010 | 정산 결과 계산   | 각 지출 항목의 개인 부담금 계산 후 최소 거래 수 알고리즘으로 송금 경로 도출 (클라이언트) |
| F011 | 송금 완료 표시   | 수취인이 "받았어요" 확인 시 settlement.status를 'confirmed'로 변경                       |

### MVP 지원 기능

| ID   | 기능명 | 설명                                                                                    |
| ---- | ------ | --------------------------------------------------------------------------------------- |
| F012 | 인증   | 이메일+비밀번호 회원가입/로그인, Google OAuth, 이메일 인증, 비밀번호 재설정 (기존 구현) |

### 어드민 기능 (Phase Admin)

| ID   | 기능명           | 설명                                                                           |
| ---- | ---------------- | ------------------------------------------------------------------------------ |
| F013 | 어드민 인증      | `profiles.is_admin = true`인 사용자만 `/admin` 접근 허용. 미인증 시 리다이렉트 |
| F014 | 전체 데이터 조회 | 전체 사용자·그룹·이벤트 목록 조회 (RLS 우회, service_role 키 사용)             |
| F015 | 어드민 대시보드  | 전체 사용자 수·그룹 수·이벤트 수 통계 카드 표시                                |

---

## 4. 메뉴 구조

```
앱 전체 내비게이션
├── 헤더 (공통)
│   ├── 앱 로고/홈 링크
│   └── 사용자 메뉴 (프로필, 로그아웃)
│
├── 공개 영역
│   ├── / — 랜딩 페이지
│   ├── /auth/login — 로그인
│   ├── /auth/sign-up — 회원가입
│   ├── /auth/forgot-password — 비밀번호 찾기
│   ├── /auth/update-password — 비밀번호 변경
│   └── /auth/confirm — 이메일 OTP 확인 (Route Handler)
│
├── 인증 필요 영역 (/protected)
│   ├── / — 대시보드 (내 그룹 목록)
│   ├── /groups/new — 그룹 생성
│   ├── /groups/join/[inviteCode] — 초대 링크 참가
│   └── /groups/[groupId]
│       ├── (index) — 그룹 상세 (이벤트 목록)
│       ├── /settings — 그룹 설정/멤버 관리
│       └── /events
│           ├── /new — 이벤트 생성
│           └── /[eventId]
│               ├── (index) — 이벤트 상세/RSVP
│               └── /settle
│                   ├── (index) — 정산 관리
│                   └── /new — 지출 등록
│
└── 어드민 영역 (/admin, is_admin=true 전용)
    ├── / — 어드민 대시보드 (통계)
    ├── /users — 전체 사용자 관리
    ├── /groups — 전체 그룹 관리
    └── /events — 전체 이벤트 관리
```

---

## 5. 페이지별 상세 기능

### P01. 로그인 / 회원가입

| 항목     | 내용                                                          |
| -------- | ------------------------------------------------------------- |
| 경로     | `/auth/login`, `/auth/sign-up`                                |
| 구현기능 | F012                                                          |
| 진입경로 | 랜딩 페이지 CTA, 미인증 상태로 보호 라우트 접근 시 리다이렉트 |
| 기능     | 이메일/비밀번호 로그인, Google OAuth 로그인, 회원가입 폼      |
| 이동경로 | 성공 → `/protected` (대시보드), 실패 → 에러 메시지 표시       |

### P02. 대시보드

| 항목     | 내용                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| 경로     | `/protected`                                                                 |
| 구현기능 | F001, F002                                                                   |
| 진입경로 | 로그인 성공 후 리다이렉트, 헤더 로고 클릭                                    |
| 기능     | 내가 속한 그룹 카드 목록 (그룹명, 멤버 수, 최신 이벤트 요약), 그룹 생성 버튼 |
| 이동경로 | 그룹 카드 클릭 → P04 그룹 상세, 그룹 생성 버튼 → P03 그룹 생성               |

### P03. 그룹 생성

| 항목     | 내용                                                 |
| -------- | ---------------------------------------------------- |
| 경로     | `/protected/groups/new`                              |
| 구현기능 | F001                                                 |
| 진입경로 | 대시보드 "그룹 만들기" 버튼                          |
| 기능     | 그룹명(필수), 설명(선택) 입력 폼, Server Action 제출 |
| 이동경로 | 생성 성공 → P04 그룹 상세, 취소 → 대시보드           |

### P04. 초대 참가

| 항목     | 내용                                                              |
| -------- | ----------------------------------------------------------------- |
| 경로     | `/protected/groups/join/[inviteCode]`                             |
| 구현기능 | F003                                                              |
| 진입경로 | 초대 링크 직접 접근 (미인증 시 로그인 후 동일 URL로 복귀)         |
| 기능     | 초대 코드 검증, 그룹 정보 미리보기, 참가 확인 버튼                |
| 이동경로 | 참가 성공 → P05 그룹 상세, 이미 멤버 → P05 바로 이동, 실패 → 에러 |

### P05. 그룹 상세

| 항목     | 내용                                                                              |
| -------- | --------------------------------------------------------------------------------- |
| 경로     | `/protected/groups/[groupId]`                                                     |
| 구현기능 | F003, F006                                                                        |
| 진입경로 | 대시보드 그룹 카드 클릭, 초대 참가 성공 후                                        |
| 기능     | 그룹 정보 헤더, 초대 링크 복사 버튼, 이벤트 목록 (예정/지난 탭), 이벤트 생성 버튼 |
| 이동경로 | 이벤트 카드 → P08 이벤트 상세, 그룹 설정 아이콘 → P06, 이벤트 추가 → P07          |

### P06. 그룹 설정

| 항목     | 내용                                                                |
| -------- | ------------------------------------------------------------------- |
| 경로     | `/protected/groups/[groupId]/settings`                              |
| 구현기능 | F004                                                                |
| 진입경로 | 그룹 상세 설정 아이콘 (owner/admin만 접근 가능)                     |
| 기능     | 그룹명/설명 수정, 멤버 목록(역할 표시), 멤버 추방, 초대 코드 재생성 |
| 이동경로 | 저장 → P05 그룹 상세, 그룹 삭제 후 → 대시보드                       |

### P07. 이벤트 생성

| 항목     | 내용                                                                |
| -------- | ------------------------------------------------------------------- |
| 경로     | `/protected/groups/[groupId]/events/new`                            |
| 구현기능 | F005                                                                |
| 진입경로 | 그룹 상세 "이벤트 추가" 버튼 (owner/admin만)                        |
| 기능     | 제목(필수), 공지사항, 장소, 일시(날짜 피커), 인원제한(선택) 입력 폼 |
| 이동경로 | 생성 성공 → P08 이벤트 상세, 취소 → P05 그룹 상세                   |

### P08. 이벤트 상세

| 항목     | 내용                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| 경로     | `/protected/groups/[groupId]/events/[eventId]`                                 |
| 구현기능 | F006, F007, F008                                                               |
| 진입경로 | 그룹 상세 이벤트 카드 클릭                                                     |
| 기능     | 이벤트 정보(제목, 장소, 일시, 공지), RSVP 토글 버튼, 참석자/대기자/불참자 목록 |
| 이동경로 | 정산하기 버튼 → P09 정산 관리, 뒤로 → P05 그룹 상세                            |

### P09. 정산 관리

| 항목     | 내용                                                         |
| -------- | ------------------------------------------------------------ |
| 경로     | `/protected/groups/[groupId]/events/[eventId]/settle`        |
| 구현기능 | F010, F011                                                   |
| 진입경로 | 이벤트 상세 "정산하기" 버튼                                  |
| 기능     | 등록된 지출 목록, 자동 계산된 송금 결과, 송금 완료 확인 버튼 |
| 이동경로 | 지출 추가 버튼 → P10 지출 등록, 뒤로 → P08 이벤트 상세       |

### P10. 지출 등록

| 항목     | 내용                                                                  |
| -------- | --------------------------------------------------------------------- |
| 경로     | `/protected/groups/[groupId]/events/[eventId]/settle/new`             |
| 구현기능 | F009                                                                  |
| 진입경로 | 정산 관리 "지출 추가" 버튼                                            |
| 기능     | 항목명(필수), 금액(필수), 실제 지불자 선택, 참여자 체크박스 다중 선택 |
| 이동경로 | 등록 성공 → P09 정산 관리, 취소 → P09 정산 관리                       |

### P11. 어드민 대시보드

| 항목     | 내용                                                       |
| -------- | ---------------------------------------------------------- |
| 경로     | `/admin`                                                   |
| 구현기능 | F013, F015                                                 |
| 진입경로 | 어드민 계정으로 로그인 후 직접 접근                        |
| 기능     | 전체 사용자 수·그룹 수·이벤트 수 통계 카드, 사이드바 네비  |
| 이동경로 | 사이드바 → P12 사용자 관리, P13 그룹 관리, P14 이벤트 관리 |

### P12. 사용자 관리

| 항목     | 내용                                                      |
| -------- | --------------------------------------------------------- |
| 경로     | `/admin/users`                                            |
| 구현기능 | F013, F014                                                |
| 기능     | 전체 사용자 목록 (이메일, 가입일, 그룹 수, is_admin 여부) |
| 이동경로 | 사이드바 네비게이션                                       |

### P13. 그룹 관리

| 항목     | 내용                                                |
| -------- | --------------------------------------------------- |
| 경로     | `/admin/groups`                                     |
| 구현기능 | F013, F014                                          |
| 기능     | 전체 그룹 목록 (그룹명, 멤버 수, 이벤트 수, 생성일) |
| 이동경로 | 사이드바 네비게이션                                 |

### P14. 이벤트 관리

| 항목     | 내용                                             |
| -------- | ------------------------------------------------ |
| 경로     | `/admin/events`                                  |
| 구현기능 | F013, F014                                       |
| 기능     | 전체 이벤트 목록 (제목, 그룹명, 날짜, RSVP 현황) |
| 이동경로 | 사이드바 네비게이션                              |

---

## 6. 데이터 모델

### 테이블 목록

| 테이블               | 설명                          |
| -------------------- | ----------------------------- |
| profiles             | 사용자 프로필 (is_admin 포함) |
| groups               | 모임 그룹                     |
| group_members        | 그룹 멤버 및 역할             |
| events               | 그룹 내 이벤트                |
| event_participants   | 이벤트 RSVP                   |
| expenses             | 지출 항목                     |
| expense_participants | 지출 항목별 참여자            |
| settlements          | 송금 기록                     |

### profiles

| 컬럼       | 타입        | 제약                | 설명                        |
| ---------- | ----------- | ------------------- | --------------------------- |
| id         | UUID        | PK, FK → auth.users |                             |
| email      | TEXT        | NOT NULL            |                             |
| username   | TEXT        |                     | 표시 이름                   |
| avatar_url | TEXT        |                     |                             |
| is_admin   | BOOLEAN     | DEFAULT false       | true이면 `/admin` 접근 가능 |
| created_at | TIMESTAMPTZ | DEFAULT now()       |                             |
| updated_at | TIMESTAMPTZ | DEFAULT now()       |                             |

### groups

| 컬럼        | 타입        | 제약                 | 설명                         |
| ----------- | ----------- | -------------------- | ---------------------------- |
| id          | UUID        | PK, DEFAULT gen_uuid |                              |
| name        | TEXT        | NOT NULL             | 그룹명                       |
| description | TEXT        |                      | 그룹 설명                    |
| invite_code | TEXT        | UNIQUE               | 12자리 초대 코드 (자동 생성) |
| created_by  | UUID        | FK → profiles(id)    | 그룹 생성자                  |
| created_at  | TIMESTAMPTZ | DEFAULT now()        |                              |
| updated_at  | TIMESTAMPTZ | DEFAULT now()        |                              |

### group_members

| 컬럼      | 타입                           | 제약                      | 설명                         |
| --------- | ------------------------------ | ------------------------- | ---------------------------- |
| id        | UUID                           | PK                        |                              |
| group_id  | UUID                           | FK → groups(id)           |                              |
| user_id   | UUID                           | FK → profiles(id)         |                              |
| role      | ENUM('owner','admin','member') | DEFAULT 'member'          | owner: 생성자, admin: 관리자 |
| joined_at | TIMESTAMPTZ                    | DEFAULT now()             |                              |
|           |                                | UNIQUE(group_id, user_id) |                              |

### events

| 컬럼             | 타입                                      | 제약              | 설명            |
| ---------------- | ----------------------------------------- | ----------------- | --------------- |
| id               | UUID                                      | PK                |                 |
| group_id         | UUID                                      | FK → groups(id)   |                 |
| title            | TEXT                                      | NOT NULL          |                 |
| description      | TEXT                                      |                   | 공지사항        |
| location         | TEXT                                      |                   | 장소            |
| event_date       | TIMESTAMPTZ                               |                   | 이벤트 일시     |
| max_participants | INT                                       |                   | NULL이면 무제한 |
| status           | ENUM('draft','open','closed','cancelled') | DEFAULT 'open'    |                 |
| created_by       | UUID                                      | FK → profiles(id) |                 |
| created_at       | TIMESTAMPTZ                               | DEFAULT now()     |                 |

### event_participants

| 컬럼              | 타입                                              | 제약                      | 설명      |
| ----------------- | ------------------------------------------------- | ------------------------- | --------- |
| id                | UUID                                              | PK                        |           |
| event_id          | UUID                                              | FK → events(id)           |           |
| user_id           | UUID                                              | FK → profiles(id)         |           |
| status            | ENUM('attending','declined','maybe','waitlisted') | NOT NULL                  | RSVP 상태 |
| waitlist_position | INT                                               |                           | 대기 순서 |
|                   |                                                   | UNIQUE(event_id, user_id) |           |

### expenses

| 컬럼       | 타입        | 제약              | 설명                            |
| ---------- | ----------- | ----------------- | ------------------------------- |
| id         | UUID        | PK                |                                 |
| event_id   | UUID        | FK → events(id)   |                                 |
| paid_by    | UUID        | FK → profiles(id) | 실제 지불자                     |
| title      | TEXT        | NOT NULL          | 항목명 (예: "식사비", "입장료") |
| amount     | INT         | NOT NULL          | 원 단위 정수 (소수점 오차 방지) |
| created_by | UUID        | FK → profiles(id) |                                 |
| created_at | TIMESTAMPTZ | DEFAULT now()     |                                 |

### expense_participants

| 컬럼       | 타입 | 제약                        | 설명 |
| ---------- | ---- | --------------------------- | ---- |
| id         | UUID | PK                          |      |
| expense_id | UUID | FK → expenses(id)           |      |
| user_id    | UUID | FK → profiles(id)           |      |
|            |      | UNIQUE(expense_id, user_id) |      |

### settlements

| 컬럼         | 타입                        | 제약              | 설명        |
| ------------ | --------------------------- | ----------------- | ----------- |
| id           | UUID                        | PK                |             |
| event_id     | UUID                        | FK → events(id)   |             |
| from_user_id | UUID                        | FK → profiles(id) | 보내는 사람 |
| to_user_id   | UUID                        | FK → profiles(id) | 받는 사람   |
| amount       | INT                         | NOT NULL          |             |
| status       | ENUM('pending','confirmed') | DEFAULT 'pending' |             |
| confirmed_at | TIMESTAMPTZ                 |                   |             |

### RLS 공통 헬퍼

```sql
-- auth.uid()가 해당 그룹의 멤버인지 확인
CREATE FUNCTION is_group_member(p_group_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

### 정산 알고리즘 (클라이언트 사이드)

1. 각 expense의 amount를 expense_participants 수로 나눠 개인 부담금 계산 (floor, 나머지는 paid_by에 귀속)
2. 각 사용자의 순잔액 = 총 지불액 - 총 부담액
3. 양수(받을 사람) / 음수(보낼 사람) 분리 후 탐욕 매칭 → 최소 거래 수 달성

---

## 7. 기술 스택

| 분류        | 기술                                  | 비고                         |
| ----------- | ------------------------------------- | ---------------------------- |
| 프레임워크  | Next.js 15 (App Router)               | RSC 기반, TypeScript strict  |
| 스타일링    | Tailwind CSS v4 + shadcn/ui           | `cn()` 헬퍼, next-themes     |
| 백엔드      | Supabase (PostgreSQL + Auth + RLS)    | 서버 클라이언트 / 클라이언트 |
| 인증        | Supabase Auth (이메일 + Google OAuth) | proxy.ts 세션 갱신           |
| 배포        | Vercel                                |                              |
| 날짜 처리   | date-fns                              | 날짜 포맷 및 계산            |
| 패키지 관리 | npm                                   |                              |

### 추가 shadcn/ui 컴포넌트 (구현 단계별)

**Phase 1 (그룹 관리)**

- dialog, avatar, textarea, sonner (toast), separator, skeleton

**Phase 2 (이벤트 관리)**

- calendar, popover, tabs, toggle-group, select

**Phase 3 (정산 관리)**

- sheet, scroll-area

---

## 8. 구현 단계

### Phase 1: 그룹 관리 + 레이아웃 개편

- DB: `groups`, `group_members` 테이블 + RLS 정책
- UI: 대시보드 개편, 그룹 생성/상세/설정/초대, 모바일 하단 네비
- 기존 튜토리얼 UI 제거
- `proxy.ts`에 redirect 쿼리 파라미터 보존 추가 (초대 링크 로그인 후 복귀 지원)

**완료 기준**: 그룹 생성 → 초대 링크로 다른 계정 참가 → 그룹 목록에 표시 확인

### Phase 2: 이벤트 관리

- DB: `events`, `event_participants` 테이블 + RLS 정책
- UI: 이벤트 생성 폼, 이벤트 상세, RSVP 토글, 참여자/대기자 목록
- 대기자 자동 승격 로직 (Server Action)
- 의존성 추가: `date-fns`

**완료 기준**: 이벤트 생성 → RSVP 변경 → 인원 초과 시 대기자 전환 → 불참 시 자동 승격 확인

### Phase 3: 정산 관리

- DB: `expenses`, `expense_participants`, `settlements` 테이블 + RLS 정책
- UI: 지출 등록 폼 (참여자 체크박스), 정산 결과 자동 계산, 송금 완료 표시
- `lib/settlement-calculator.ts` 구현 (최적 송금 경로)

**완료 기준**: 다중 지출 등록 후 정산 결과 정확성 확인 (A: 식사비 10만/5명, B: 입장료 5만/3명)

### Phase Admin: 어드민 패널

- DB: `profiles` 테이블에 `is_admin` 컬럼 추가
- 인증: `proxy.ts`에서 `/admin` 경로 접근 시 `is_admin` 검증
- UI: 어드민 대시보드(통계), 사용자/그룹/이벤트 전체 목록 조회
- RLS 우회: `service_role` 키 사용하는 서버 전용 클라이언트 구성

**완료 기준**: `is_admin=true` 계정만 `/admin` 접근, 전체 데이터 테이블 조회 정상 동작

---

## 9. 파일 구조 (신규)

```
app/protected/
  page.tsx                           # 대시보드 (P02)
  groups/
    new/page.tsx                     # 그룹 생성 (P03)
    join/[inviteCode]/page.tsx       # 초대 참가 (P04)
    [groupId]/
      page.tsx                       # 그룹 상세 (P05)
      layout.tsx                     # 그룹 레이아웃
      settings/page.tsx              # 그룹 설정 (P06)
      events/
        new/page.tsx                 # 이벤트 생성 (P07)
        [eventId]/
          page.tsx                   # 이벤트 상세 (P08)
          settle/
            page.tsx                 # 정산 관리 (P09)
            new/page.tsx             # 지출 등록 (P10)

components/
  groups/                            # 그룹 관련 컴포넌트
  events/                            # 이벤트/RSVP 컴포넌트
  settle/                            # 정산 컴포넌트
  layout/                            # 앱 헤더, 하단 네비게이션

lib/
  actions/
    group-actions.ts                 # Server Actions: 그룹 CRUD
    event-actions.ts                 # Server Actions: 이벤트 + RSVP
    settle-actions.ts                # Server Actions: 지출/정산
  settlement-calculator.ts           # 순수 함수: 정산 알고리즘

types/index.ts                       # 앱 도메인 타입 정의

app/admin/
  layout.tsx                         # 어드민 레이아웃 (사이드바 + ADMIN 배지)
  page.tsx                           # 어드민 대시보드 (P11)
  users/page.tsx                     # 사용자 관리 (P12)
  groups/page.tsx                    # 그룹 관리 (P13)
  events/page.tsx                    # 이벤트 관리 (P14)

lib/
  supabase/
    admin.ts                         # service_role 키 사용 어드민 전용 클라이언트
  actions/
    admin-actions.ts                 # Server Actions: 어드민 데이터 조회
```

### 수정 필요한 기존 파일

| 파일                       | 수정 내용                            |
| -------------------------- | ------------------------------------ |
| `app/protected/layout.tsx` | 모바일 퍼스트 레이아웃으로 전면 개편 |
| `app/protected/page.tsx`   | 그룹 목록 대시보드로 변경            |
| `lib/supabase/proxy.ts`    | redirect 쿼리 파라미터 보존 추가     |
| `types/supabase.ts`        | DB 스키마 변경 후 재생성             |
| `app/page.tsx`             | 랜딩 페이지 MVP 소개로 개편 (선택)   |
