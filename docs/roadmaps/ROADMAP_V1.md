# 로드맵 V1: 모임 이벤트 관리 웹 MVP

**작성일**: 2026-03-02
**기준 PRD**: `docs/prds/PRD.md` (v1.0)
**버전**: V1

---

## 프로젝트 개요

| 항목          | 내용                                                                 |
| ------------- | -------------------------------------------------------------------- |
| **목표**      | 수영·헬스·친구 모임 주최자가 공지·RSVP·정산을 하나의 웹에서 처리     |
| **예상 기간** | Phase 0 ~ Phase 3 순차 진행 (약 8~10주)                              |
| **타겟**      | 소규모 정기/비정기 모임 주최자 (5~15명 규모)                         |
| **핵심 가치** | 카카오톡 채팅방으로 흩어진 공지/RSVP/정산 과정을 단일 웹 앱으로 통합 |

### 핵심 기술 스택

| 분류        | 기술                               |
| ----------- | ---------------------------------- |
| 프레임워크  | Next.js 15 (App Router, RSC 우선)  |
| 스타일링    | Tailwind CSS v4 + shadcn/ui        |
| 백엔드/인증 | Supabase (PostgreSQL + Auth + RLS) |
| 언어        | TypeScript 5 (strict mode)         |
| 날짜 처리   | date-fns                           |
| 배포        | Vercel                             |

---

## 전체 진행 현황

| Phase       | 이름                             | 상태       | 진행률                                |
| ----------- | -------------------------------- | ---------- | ------------------------------------- |
| Phase 0     | 기반 환경 구축 및 기존 코드 정리 | ✅ 완료    | 7/8 (Supabase 타입은 Phase 1 후 진행) |
| Phase 1     | 그룹 관리                        | ✅ 완료    | 14/14                                 |
| Phase 2     | 이벤트 관리                      | ✅ 완료    | 7/7                                   |
| Phase 3     | 정산 관리                        | ⏳ 대기    | 0/11                                  |
| Phase Admin | 어드민 패널                      | 🔨 진행 중 | 1/6 (플레이스홀더 완료)               |

### 체크리스트 요약

#### ✅ Phase 0 — 완료

- [x] 기존 튜토리얼 UI 제거
- [x] 랜딩 페이지 MVP 소개로 개편
- [x] 도메인 타입 정의 파일 생성 (`types/index.ts`)
- [x] Protected 레이아웃 모바일 퍼스트로 개편
- [x] 공통 레이아웃 컴포넌트 생성 (`AppHeader`, `BottomNav`)
- [x] 초대 링크 로그인 후 복귀 지원 (`proxy.ts`)
- [x] shadcn/ui 추가 컴포넌트 설치 (dialog, avatar, textarea, sonner, separator, skeleton)
- [x] Supabase 타입 재생성 준비 → Phase 1 DB 마이그레이션 후 진행

#### ✅ Phase 1 — 그룹 관리 (완료)

- [x] groups / group_members 테이블 생성 + RLS
- [x] 그룹 CRUD Server Actions (createGroup, getMyGroups, joinGroup, removeMember 등)
- [x] 대시보드, 그룹 생성, 그룹 상세, 그룹 설정, 초대 참가 페이지

#### ✅ Phase 2 — 이벤트 관리 (완료)

- [x] **[T1]** 사전 작업: date-fns 설치 + shadcn/ui 컴포넌트 설치 (calendar, popover, tabs, toggle-group, select)
- [x] **[T2]** DB 마이그레이션: events/event_participants 테이블 + RLS 정책 + 타입 재생성
- [x] **[T3]** Server Actions 구현: `event-actions.ts` (createEvent, getGroupEvents, updateRsvp, promoteWaitlisted)
- [x] **[T4]** 이벤트 카드/목록 컴포넌트 구현: `EventCard`, `EventList`
- [x] **[T5]** 그룹 상세 페이지 이벤트 목록 연동 (Tabs — 예정/지난, 이벤트 생성 버튼)
- [x] **[T6]** 이벤트 생성 페이지 구현: `EventCreateForm` (Calendar+Popover 날짜 피커)
- [x] **[T7]** 이벤트 상세/RSVP 페이지 구현: `EventHeader`, `RsvpToggle`, `ParticipantList`

#### ⏳ Phase 3 — 정산 관리 (대기)

- [ ] expenses / expense_participants / settlements 테이블 생성 + RLS
- [ ] 정산 알고리즘 (`lib/settlement-calculator.ts`)
- [ ] 지출 등록, 정산 관리 페이지

#### 🔨 Phase Admin — 어드민 패널 (진행 중)

- [x] 어드민 레이아웃 및 플레이스홀더 페이지 생성 (`/admin`, `/admin/users`, `/admin/groups`, `/admin/events`)
- [ ] `profiles.is_admin` 컬럼 추가 + RLS
- [ ] 어드민 인증 미들웨어 (`proxy.ts` 수정)
- [ ] 사용자 / 그룹 / 이벤트 전체 조회 페이지 구현

---

## 마일스톤 타임라인

```
Phase 0  [기반 작업]         ██████████████████████  ✅ 완료
Phase 1  [그룹 관리]         ██████████████████████  ✅ 완료
Phase 2  [이벤트 관리]       ░░░░░░░░░░░░░░░░░░░░░░  4~7주
Phase 3  [정산 관리]         ░░░░░░░░░░░░░░░░░░░░░░  7~10주
Phase A  [어드민]            ██░░░░░░░░░░░░░░░░░░░░  Phase 3 이후
```

---

## Phase 0: 기반 환경 구축 및 기존 코드 정리

**기간**: 1~2주 | **우선순위**: High (선행 필수)

### 주요 목표

- 기존 튜토리얼 UI 및 불필요한 컴포넌트 제거
- 도메인 타입 시스템 및 공통 컴포넌트 기반 수립
- proxy.ts 개선으로 초대 링크 인증 플로우 사전 준비

### 태스크 체크리스트

#### 코드 정리

- [x] **기존 튜토리얼 UI 제거**
    - 파일: `components/tutorial/`, `components/hero.tsx`, `components/deploy-button.tsx`
    - 작업: 튜토리얼 관련 컴포넌트 삭제 및 import 참조 제거
    - 완료 기준: `npm run build` 오류 없이 빌드 성공

- [x] **랜딩 페이지 MVP 소개로 개편**
    - 파일: `app/page.tsx`
    - 작업: 앱 소개, 주요 기능, CTA(로그인/회원가입) 버튼 배치
    - 완료 기준: 미인증 사용자가 랜딩 페이지에서 로그인 페이지로 이동 가능

#### 타입 시스템 구축

- [x] **도메인 타입 정의 파일 생성**
    - 파일: `types/index.ts` (신규 생성)
    - 작업: 7개 테이블 기반 TypeScript 인터페이스 정의

    ```typescript
    // 정의할 타입 목록
    interface Group {
        id;
        name;
        description;
        invite_code;
        created_by;
        created_at;
        updated_at;
    }
    interface GroupMember {
        id;
        group_id;
        user_id;
        role: "owner" | "admin" | "member";
        joined_at;
    }
    interface Event {
        id;
        group_id;
        title;
        description;
        location;
        event_date;
        max_participants;
        status;
        created_by;
        created_at;
    }
    interface EventParticipant {
        id;
        event_id;
        user_id;
        status: "attending" | "declined" | "maybe" | "waitlisted";
        waitlist_position;
    }
    interface Expense {
        id;
        event_id;
        paid_by;
        title;
        amount;
        created_by;
        created_at;
    }
    interface ExpenseParticipant {
        id;
        expense_id;
        user_id;
    }
    interface Settlement {
        id;
        event_id;
        from_user_id;
        to_user_id;
        amount;
        status: "pending" | "confirmed";
        confirmed_at;
    }
    ```

    - 완료 기준: `tsc --noEmit` 에러 없음

- [ ] **Supabase 타입 재생성 준비**
    - 파일: `types/supabase.ts`
    - 작업: Phase 1 DB 마이그레이션 후 `supabase gen types typescript` 로 재생성 예정으로 표시

#### 레이아웃 기반 작업

- [x] **Protected 레이아웃 모바일 퍼스트로 개편**
    - 파일: `app/protected/layout.tsx` (수정)
    - 작업: 모바일 하단 네비게이션 공간 확보, 헤더 간소화
    - 관련 컴포넌트: `components/layout/AppHeader.tsx`, `components/layout/BottomNav.tsx` (신규)
    - 완료 기준: 모바일(375px)과 데스크탑(1280px) 레이아웃 정상 동작

- [x] **공통 레이아웃 컴포넌트 생성**
    - 파일: `components/layout/AppHeader.tsx` (신규)
    - 파일: `components/layout/BottomNav.tsx` (신규)
    - 작업: 앱 로고/홈 링크, 사용자 메뉴(프로필, 로그아웃), 모바일 하단 탭 네비게이션
    - 완료 기준: 모든 protected 페이지에서 일관된 헤더/네비 표시

#### proxy.ts 개선

- [x] **초대 링크 로그인 후 복귀 지원**
    - 파일: `lib/supabase/proxy.ts` (수정)
    - 작업: 미인증 요청의 `redirect` 쿼리 파라미터를 로그인 URL에 보존, 로그인 성공 후 원래 URL로 복귀
    - 완료 기준: 미인증 상태에서 초대 링크 접근 → 로그인 → 초대 참가 페이지 자동 복귀

#### shadcn/ui 컴포넌트 설치

- [x] **Phase 0~1 필요 컴포넌트 설치**
    - 설치 목록: `dialog`, `avatar`, `textarea`, `sonner`, `separator`, `skeleton`
    - 완료 기준: `components/ui/` 하위에 해당 컴포넌트 파일 존재

---

## Phase 1: 그룹 관리

**기간**: 2~4주 | **우선순위**: High
**마일스톤**: 그룹 생성 → 초대 링크로 다른 계정 참가 → 그룹 목록 표시 확인

### 주요 목표

- 그룹 및 멤버 DB 테이블 생성 + RLS 정책 적용
- 대시보드, 그룹 생성, 그룹 상세, 그룹 설정, 초대 참가 페이지 구현
- 서버 액션 기반 그룹 CRUD 완성

### DB 마이그레이션

- [x] **groups 테이블 생성**
    - 마이그레이션: `groups` 테이블 (id, name, description, invite_code UNIQUE, created_by, created_at, updated_at)
    - 완료 기준: Supabase 대시보드에서 테이블 확인

- [x] **group_members 테이블 생성**
    - 마이그레이션: `group_members` 테이블 (id, group_id FK, user_id FK, role ENUM, joined_at)
    - UNIQUE 제약: `(group_id, user_id)`
    - 완료 기준: Supabase 대시보드에서 테이블 확인

- [x] **RLS 헬퍼 함수 및 정책 생성**
    - 마이그레이션:
        - `is_group_member(p_group_id UUID)` 함수 생성
        - `groups` RLS: 멤버만 조회, 인증 사용자 생성, owner/admin만 수정/삭제
        - `group_members` RLS: 그룹 멤버 조회, 인증 사용자 참가(INSERT), owner/admin만 삭제
    - 완료 기준: RLS 활성화 상태에서 멤버/비멤버 접근 제어 정상 동작

- [x] **Supabase 타입 재생성**
    - 파일: `types/supabase.ts`
    - 작업: `supabase gen types typescript --local > types/supabase.ts` 실행
    - 완료 기준: `types/supabase.ts`에 groups, group_members 타입 포함

### 서버 액션 구현

- [x] **그룹 생성 Server Action** (F001)
    - 파일: `lib/actions/group-actions.ts` (신규)
    - 함수: `createGroup(formData: FormData)`
    - 작업: 그룹명 필수 검증, `crypto.randomUUID()` 기반 12자리 invite_code 생성, groups INSERT, group_members에 owner로 INSERT, 생성된 groupId로 리다이렉트
    - 완료 기준: 그룹 생성 후 `/protected/groups/[groupId]`로 이동

- [x] **그룹 목록 조회 함수** (F002)
    - 파일: `lib/actions/group-actions.ts`
    - 함수: `getMyGroups(userId: string)`
    - 작업: group_members JOIN groups 쿼리, 최신 이벤트 요약 포함 (Phase 2 이후 연동)
    - 완료 기준: 현재 사용자가 속한 그룹 목록 반환

- [x] **초대 코드로 그룹 참가 Server Action** (F003)
    - 파일: `lib/actions/group-actions.ts`
    - 함수: `joinGroup(inviteCode: string)`
    - 작업: invite_code로 그룹 조회, 이미 멤버면 그룹 상세로 리다이렉트, 신규면 group_members에 member로 INSERT
    - 완료 기준: 초대 코드 검증 및 멤버 등록 정상 동작

- [x] **멤버 관리 Server Actions** (F004)
    - 파일: `lib/actions/group-actions.ts`
    - 함수:
        - `removeMember(groupId: string, userId: string)` — owner/admin만 실행 가능
        - `regenerateInviteCode(groupId: string)` — 새 invite_code 생성
        - `updateGroup(groupId: string, data: { name: string; description?: string })` — 그룹명/설명 수정
        - `deleteGroup(groupId: string)` — owner만 실행 가능
    - 완료 기준: 권한 없는 사용자 접근 시 에러 반환

### 페이지 구현

- [x] **대시보드 페이지 개편** (F001, F002 / P02)
    - 파일: `app/protected/page.tsx` (수정)
    - 컴포넌트: `components/groups/GroupCard.tsx` (신규)
    - 작업: 서버 컴포넌트로 그룹 목록 조회, 그룹 카드 목록 렌더링, "그룹 만들기" 버튼
    - UI 요소: 그룹 카드 (그룹명, 멤버 수, 최신 이벤트 요약), 빈 상태(empty state) 처리
    - 완료 기준: 로그인 후 그룹 목록 표시, 그룹 없을 때 생성 유도 메시지 표시

- [x] **그룹 생성 페이지** (F001 / P03)
    - 파일: `app/protected/groups/new/page.tsx` (신규)
    - 컴포넌트: `components/groups/GroupCreateForm.tsx` (신규)
    - 작업: 그룹명(필수), 설명(선택) 입력 폼, Server Action 연동, 취소 버튼
    - 완료 기준: 폼 제출 후 생성된 그룹 상세 페이지로 이동

- [x] **그룹 레이아웃 생성**
    - 파일: `app/protected/groups/[groupId]/layout.tsx` (신규)
    - 작업: 그룹 ID 기반 그룹 정보 로드, 멤버십 검증 (비멤버 접근 차단)
    - 완료 기준: 비멤버가 그룹 URL 직접 접근 시 대시보드로 리다이렉트

- [x] **초대 참가 페이지** (F003 / P04)
    - 파일: `app/protected/groups/join/[inviteCode]/page.tsx` (신규)
    - 컴포넌트: `components/groups/JoinGroupCard.tsx` (신규)
    - 작업: 초대 코드로 그룹 정보 조회 및 미리보기, "참가하기" 버튼 (Server Action 호출), 이미 멤버면 그룹 상세로 자동 리다이렉트
    - 완료 기준: 유효한 초대 코드 → 그룹 정보 표시 → 참가 확인, 유효하지 않은 코드 → 에러 메시지

- [x] **그룹 상세 페이지** (F003, F006 / P05)
    - 파일: `app/protected/groups/[groupId]/page.tsx` (신규)
    - 컴포넌트: `components/groups/GroupHeader.tsx`, `components/groups/InviteLinkButton.tsx` (신규)
    - 작업: 그룹 정보 헤더, 초대 링크 복사 버튼 (클립보드 API), 이벤트 목록 영역 (Phase 2에서 채움), 이벤트 생성 버튼 (owner/admin만 표시)
    - 완료 기준: 그룹 정보 및 초대 링크 복사 기능 정상 동작

- [x] **그룹 설정 페이지** (F004 / P06)
    - 파일: `app/protected/groups/[groupId]/settings/page.tsx` (신규)
    - 컴포넌트: `components/groups/MemberList.tsx`, `components/groups/MemberItem.tsx` (신규)
    - 작업: 그룹명/설명 수정 폼, 멤버 목록 (역할 배지 표시), 멤버 추방 버튼 (owner/admin만), 초대 코드 재생성, 그룹 삭제 버튼 (owner만, 확인 다이얼로그)
    - 완료 기준: 멤버 추방 후 목록에서 제거, 그룹 삭제 후 대시보드로 이동

### 테스트 전략

- [ ] `createGroup` Server Action 유효성 검증 테스트 (빈 그룹명 거부)
- [ ] `joinGroup` 중복 참가 처리 테스트 (이미 멤버인 경우)
- [ ] RLS 정책 검증: 비멤버 그룹 데이터 접근 차단 확인

### 위험 요소 및 대응

| 위험                          | 대응                                                     |
| ----------------------------- | -------------------------------------------------------- |
| 초대 코드 중복 발생 가능성    | INSERT 전 UNIQUE 제약 에러 처리, 재시도 로직 추가        |
| 그룹 삭제 시 연관 데이터 정리 | CASCADE DELETE 설정 또는 soft delete 방식 채택 결정 필요 |
| 비멤버의 그룹 URL 직접 접근   | 레이아웃 수준에서 멤버십 검증 후 리다이렉트              |

---

## Phase 2: 이벤트 관리

**기간**: 4~7주 | **우선순위**: High
**마일스톤**: 이벤트 생성 → RSVP 변경 → 인원 초과 시 대기자 전환 → 불참 시 자동 승격 확인

### 주요 목표

- 이벤트 및 RSVP DB 테이블 생성 + RLS 정책 적용
- 이벤트 생성, 이벤트 상세/RSVP, 대기자 자동 승격 구현
- date-fns 라이브러리 도입

### 사전 작업 — `T1`

- [x] **date-fns 설치**
    - 명령: `npm install date-fns`
    - 완료 기준: `package.json`에 date-fns 추가

- [x] **shadcn/ui Phase 2 컴포넌트 설치**
    - 설치 목록: `calendar`, `popover`, `tabs`, `toggle-group`, `select`
    - 완료 기준: `components/ui/` 하위에 해당 컴포넌트 파일 존재

> ✅ T1 완료 시: 요약 체크리스트의 **[T1]** 항목을 `[x]`로 변경

### DB 마이그레이션 — `T2`

- [x] **events 테이블 생성**
    - 마이그레이션: `events` 테이블 (id, group_id FK, title NOT NULL, description, location, event_date TIMESTAMPTZ, max_participants INT, status ENUM('draft','open','closed','cancelled') DEFAULT 'open', created_by FK, created_at)
    - 완료 기준: Supabase 대시보드에서 테이블 확인

- [x] **event_participants 테이블 생성**
    - 마이그레이션: `event_participants` 테이블 (id, event_id FK, user_id FK, status ENUM('attending','declined','maybe','waitlisted') NOT NULL, waitlist_position INT)
    - UNIQUE 제약: `(event_id, user_id)`
    - 완료 기준: Supabase 대시보드에서 테이블 확인

- [x] **이벤트/참가자 RLS 정책 생성**
    - 마이그레이션:
        - `events` RLS: 그룹 멤버만 조회, owner/admin만 생성·수정·삭제
        - `event_participants` RLS: 그룹 멤버 조회, 본인 RSVP 데이터 수정
    - 완료 기준: 비멤버 접근 차단, 멤버 RSVP 변경 정상 동작

- [x] **Supabase 타입 재생성**
    - 파일: `types/supabase.ts`
    - 작업: events, event_participants 테이블 추가 후 타입 재생성
    - 완료 기준: `types/supabase.ts`에 신규 테이블 타입 포함

> ✅ T2 완료 시: 요약 체크리스트의 **[T2]** 항목을 `[x]`로 변경

### 서버 액션 구현 — `T3`

- [x] **이벤트 생성 Server Action** (F005)
    - 파일: `lib/actions/event-actions.ts` (신규)
    - 함수: `createEvent(groupId: string, formData: FormData)`
    - 작업: 제목 필수 검증, status 기본값 'open', events INSERT, 생성된 eventId로 리다이렉트
    - 완료 기준: 이벤트 생성 후 이벤트 상세 페이지로 이동

- [x] **이벤트 목록 조회 함수** (F006)
    - 파일: `lib/actions/event-actions.ts`
    - 함수: `getGroupEvents(groupId: string)`
    - 작업: 예정 이벤트 (event_date >= 현재) / 지난 이벤트 구분 반환
    - 완료 기준: 그룹 상세 페이지의 예정/지난 탭에 이벤트 목록 정상 표시

- [x] **RSVP 변경 Server Action** (F007, F008)
    - 파일: `lib/actions/event-actions.ts`
    - 함수: `updateRsvp(eventId: string, status: 'attending' | 'declined' | 'maybe')`
    - 작업:
        1. max_participants 확인 — 인원 초과 시 status를 'waitlisted'로 저장, waitlist_position 부여
        2. UPSERT event_participants (기존 레코드 있으면 UPDATE, 없으면 INSERT)
        3. 'attending' → 'declined' 변경 시 대기자 자동 승격 트리거 (F008)
    - 완료 기준: RSVP 변경 즉시 반영, 인원 초과 시 대기자 처리

- [x] **대기자 자동 승격 로직** (F008)
    - 파일: `lib/actions/event-actions.ts`
    - 함수: `promoteWaitlisted(eventId: string)` (내부 헬퍼)
    - 작업: waitlist_position 1순위 대기자 조회 → status를 'attending'으로 UPDATE → waitlist_position 재정렬
    - 완료 기준: 참석자 → 불참 변경 시 1순위 대기자가 자동으로 참석자로 전환

> ✅ T3 완료 시: 요약 체크리스트의 **[T3]** 항목을 `[x]`로 변경

### 컴포넌트 구현 — `T4`

- [x] **이벤트 카드 컴포넌트**
    - 파일: `components/events/event-card.tsx` (신규)
    - 표시 정보: 이벤트 제목, 날짜/시간(date-fns format), 장소, 참석자 수, 내 RSVP 상태 배지
    - 완료 기준: 날짜 포맷 정상, 상태 배지 정상 표시

- [x] **이벤트 목록 컴포넌트**
    - 파일: `components/events/event-list.tsx` (신규)
    - 빈 상태(empty state) 메시지 처리 포함
    - 완료 기준: 이벤트 있을 때/없을 때 모두 정상 렌더링

> ✅ T4 완료 시: 요약 체크리스트의 **[T4]** 항목을 `[x]`로 변경

### 페이지 구현

- [x] **그룹 상세 페이지 이벤트 목록 연동** (F006 / P05) — `T5`
    - 파일: `app/protected/groups/[groupId]/page.tsx` (수정)
    - 컴포넌트: `components/events/event-tabs.tsx` (클라이언트, Tabs 래퍼)
    - 작업: shadcn/ui Tabs로 예정/지난 탭 구현, owner/admin 전용 이벤트 생성 버튼 추가
    - 완료 기준: 탭 전환 시 해당 이벤트 목록 표시, 권한별 버튼 노출 제어
        > ✅ T5 완료 시: 요약 체크리스트의 **[T5]** 항목을 `[x]`로 변경

- [x] **이벤트 생성 페이지** (F005 / P07) — `T6`
    - 파일: `app/protected/groups/[groupId]/events/new/page.tsx` (신규)
    - 컴포넌트: `components/events/event-create-form.tsx` (신규, 클라이언트)
    - 작업: 제목(필수), 공지사항(Textarea), 장소, 일시(shadcn/ui Calendar + Popover + time input), 인원제한(숫자 input) 폼, Server Action 연동
    - 완료 기준: 날짜 피커 정상 동작, 폼 제출 후 이벤트 상세로 이동, owner/admin 외 접근 차단
        > ✅ T6 완료 시: 요약 체크리스트의 **[T6]** 항목을 `[x]`로 변경

- [x] **이벤트 상세 페이지** (F006, F007, F008 / P08) — `T7`
    - 파일: `app/protected/groups/[groupId]/events/[eventId]/page.tsx` (신규)
    - 컴포넌트:
        - `components/events/event-header.tsx` — 이벤트 정보 (제목, 장소, 일시, 공지)
        - `components/events/rsvp-toggle.tsx` — RSVP 토글 버튼 (참석/불참/미결정, 클라이언트)
        - `components/events/participant-list.tsx` — 참석자/대기자/불참자 목록
    - 작업: 이벤트 정보 표시, RSVP 토글, 참여자 그룹별 목록, "정산하기" 버튼 플레이스홀더 (Phase 3)
    - 완료 기준: RSVP 변경 후 참여자 목록 반영, 인원 초과 시 대기 toast 알림
        > ✅ T7 완료 시: 요약 체크리스트의 **[T7]** 항목을 `[x]`로 변경

### 테스트 전략

- [ ] `updateRsvp` 인원 초과 시 waitlisted 처리 테스트
- [ ] `promoteWaitlisted` 대기자 순서 정렬 정확성 테스트
- [ ] 이벤트 생성 날짜 유효성 검증 (과거 날짜 거부 여부) 테스트

### 위험 요소 및 대응

| 위험                              | 대응                                                          |
| --------------------------------- | ------------------------------------------------------------- |
| RSVP 동시 변경으로 인한 인원 초과 | Supabase 트랜잭션(RPC) 또는 Database Function으로 원자적 처리 |
| 대기자 자동 승격 알림 부재        | MVP에서는 페이지 새로고침으로 확인, v1.1에서 푸시 알림 도입   |
| 날짜 피커 모바일 UX 저하          | 네이티브 date input 폴백 옵션 준비                            |

---

## Phase 3: 정산 관리

**기간**: 7~10주 | **우선순위**: Medium
**마일스톤**: 다중 지출 등록 후 정산 결과 정확성 확인 (A: 식사비 10만/5명, B: 입장료 5만/3명)

### 주요 목표

- 지출 및 정산 DB 테이블 생성 + RLS 정책 적용
- 지출 등록 폼, 정산 결과 자동 계산, 송금 완료 확인 구현
- 최소 거래 수 정산 알고리즘 구현

### 사전 작업

- [ ] **shadcn/ui Phase 3 컴포넌트 설치**
    - 설치 목록: `sheet`, `scroll-area`
    - 완료 기준: `components/ui/` 하위에 해당 컴포넌트 파일 존재

### DB 마이그레이션

- [ ] **expenses 테이블 생성**
    - 마이그레이션: `expenses` 테이블 (id, event_id FK, paid_by FK, title NOT NULL, amount INT NOT NULL, created_by FK, created_at)
    - 완료 기준: Supabase 대시보드에서 테이블 확인

- [ ] **expense_participants 테이블 생성**
    - 마이그레이션: `expense_participants` 테이블 (id, expense_id FK, user_id FK)
    - UNIQUE 제약: `(expense_id, user_id)`
    - 완료 기준: Supabase 대시보드에서 테이블 확인

- [ ] **settlements 테이블 생성**
    - 마이그레이션: `settlements` 테이블 (id, event_id FK, from_user_id FK, to_user_id FK, amount INT NOT NULL, status ENUM('pending','confirmed') DEFAULT 'pending', confirmed_at TIMESTAMPTZ)
    - 완료 기준: Supabase 대시보드에서 테이블 확인

- [ ] **정산 관련 RLS 정책 생성**
    - 마이그레이션:
        - `expenses` RLS: 그룹 멤버만 조회, 이벤트 참석자만 생성, 생성자/owner/admin 삭제
        - `expense_participants` RLS: 그룹 멤버만 조회
        - `settlements` RLS: 관련 사용자(from/to)만 조회, 수취인(to_user_id)만 confirmed 상태 변경
    - 완료 기준: 권한 없는 사용자 송금 확인 불가 확인

- [ ] **Supabase 타입 재생성**
    - 파일: `types/supabase.ts`
    - 작업: 3개 신규 테이블 추가 후 타입 재생성
    - 완료 기준: `types/supabase.ts`에 신규 테이블 타입 포함

### 정산 알고리즘 구현

- [ ] **정산 계산기 순수 함수 구현** (F010)
    - 파일: `lib/settlement-calculator.ts` (신규)
    - 함수:
        - `calculateIndividualShares(expenses, participants)` — 각 지출의 개인 부담금 계산 (floor, 나머지는 paid_by 귀속)
        - `calculateNetBalances(shares)` — 각 사용자의 순잔액 (총 지불액 - 총 부담액)
        - `minimizeTransactions(balances)` — 탐욕 매칭으로 최소 거래 수 송금 경로 도출
    - 완료 기준: 단위 테스트 통과 (A: 10만/5명, B: 5만/3명 시나리오)

### 서버 액션 구현

- [ ] **지출 등록 Server Action** (F009)
    - 파일: `lib/actions/settle-actions.ts` (신규)
    - 함수: `createExpense(eventId: string, formData: FormData)`
    - 작업: 항목명·금액 필수 검증, expenses INSERT, expense_participants 다중 INSERT (선택된 참여자)
    - 완료 기준: 지출 등록 후 정산 관리 페이지로 이동, 참여자 데이터 정확히 저장

- [ ] **송금 완료 확인 Server Action** (F011)
    - 파일: `lib/actions/settle-actions.ts`
    - 함수: `confirmSettlement(settlementId: string)`
    - 작업: 현재 사용자가 to_user_id인지 검증, status를 'confirmed'로 UPDATE, confirmed_at 기록
    - 완료 기준: 수취인만 확인 가능, 확인 후 상태 변경 즉시 반영

### 페이지 구현

- [ ] **정산 관리 페이지** (F010, F011 / P09)
    - 파일: `app/protected/groups/[groupId]/events/[eventId]/settle/page.tsx` (신규)
    - 컴포넌트:
        - `components/settle/ExpenseList.tsx` — 등록된 지출 목록
        - `components/settle/SettlementResult.tsx` — 자동 계산된 송금 결과 (클라이언트 컴포넌트)
        - `components/settle/SettlementItem.tsx` — 개별 송금 항목 (확인 버튼 포함)
    - 작업: 서버 컴포넌트로 지출 데이터 조회, 클라이언트 컴포넌트에서 정산 알고리즘 실행, "받았어요" 버튼으로 Server Action 호출
    - 완료 기준: 지출 목록 표시, 송금 결과 계산 정확성 확인, "받았어요" 후 상태 변경

- [ ] **지출 등록 페이지** (F009 / P10)
    - 파일: `app/protected/groups/[groupId]/events/[eventId]/settle/new/page.tsx` (신규)
    - 컴포넌트: `components/settle/ExpenseCreateForm.tsx` (신규)
    - 작업: 항목명(필수), 금액(필수, 원 단위 정수), 실제 지불자 선택(Select), 참여자 체크박스 다중 선택, Server Action 연동
    - 완료 기준: 전체 이벤트 참석자 목록 체크박스로 표시, 폼 제출 후 정산 관리 페이지로 이동

### 테스트 전략

- [ ] `calculateIndividualShares` 나머지 처리 정확성 테스트 (10만/3명 = 33333, 33333, 33334)
- [ ] `minimizeTransactions` 최소 거래 수 알고리즘 검증 (다양한 시나리오)
- [ ] `confirmSettlement` 비수취인 접근 시 에러 반환 테스트

### 위험 요소 및 대응

| 위험                                         | 대응                                                                       |
| -------------------------------------------- | -------------------------------------------------------------------------- |
| 정산 계산 중 소수점 오차                     | amount를 원 단위 정수(INT)로 강제, floor() 사용 후 나머지 paid_by 귀속     |
| 지출 수정/삭제 후 정산 결과 불일치           | MVP에서는 지출 등록만 지원 (수정/삭제는 v1.1)                              |
| settlements 테이블와 실시간 계산 결과 불일치 | MVP에서는 매번 클라이언트에서 재계산, settlements는 확인 기록용으로만 활용 |

---

## Phase Admin: 어드민 패널

**기간**: Phase 3 완료 후 | **우선순위**: Low
**마일스톤**: 슈퍼유저 계정으로 전체 데이터 조회 가능

### 주요 목표

- 슈퍼유저 전용 인증 미들웨어 구축
- 전체 사용자·그룹·이벤트 데이터 조회 페이지 구현

### 태스크 체크리스트

#### 페이지 구조 (플레이스홀더)

- [x] **어드민 레이아웃 및 플레이스홀더 페이지 생성**
    - 파일: `app/admin/layout.tsx`, `app/admin/page.tsx` (신규)
    - 파일: `app/admin/users/page.tsx`, `app/admin/groups/page.tsx`, `app/admin/events/page.tsx` (신규)
    - 작업: ADMIN 배지 헤더, 사이드바 네비게이션, 대시보드 통계 카드 플레이스홀더
    - 완료 기준: `/admin` 경로 접근 및 빌드 성공

#### 인증 및 권한 (미구현)

- [ ] **슈퍼유저 role 컬럼 추가**
    - 파일: `types/supabase.ts` (재생성)
    - 작업: `profiles` 테이블에 `is_admin` boolean 컬럼 추가, RLS 정책 설정
    - 완료 기준: 어드민 계정으로만 `/admin` 접근 가능

- [ ] **어드민 인증 미들웨어 적용**
    - 파일: `lib/supabase/proxy.ts` (수정)
    - 작업: `/admin` 경로는 `is_admin = true`인 사용자만 접근, 미인증 시 `/auth/login`으로 리다이렉트
    - 완료 기준: 일반 사용자 `/admin` 접근 차단

#### 데이터 조회 페이지 (미구현)

- [ ] **사용자 관리 페이지**
    - 파일: `app/admin/users/page.tsx` (수정)
    - 작업: 전체 사용자 목록, 이메일·가입일·그룹 수 표시
    - 완료 기준: 전체 사용자 데이터 테이블 렌더링

- [ ] **그룹 관리 페이지**
    - 파일: `app/admin/groups/page.tsx` (수정)
    - 작업: 전체 그룹 목록, 그룹명·멤버 수·이벤트 수 표시
    - 완료 기준: 전체 그룹 데이터 테이블 렌더링

- [ ] **이벤트 관리 페이지**
    - 파일: `app/admin/events/page.tsx` (수정)
    - 작업: 전체 이벤트 목록, 제목·날짜·RSVP 현황 표시
    - 완료 기준: 전체 이벤트 데이터 테이블 렌더링

---

## 기술 아키텍처 결정사항 (ADR)

### ADR-001: 서버 컴포넌트 우선 원칙

- **결정**: 모든 페이지는 기본적으로 서버 컴포넌트, `"use client"`는 RSVP 토글, 정산 결과 계산 등 브라우저 상태가 필요한 경우에만 적용
- **이유**: 초기 로딩 성능 향상, Supabase 서버 클라이언트로 RLS 완전 활용

### ADR-002: Server Actions 기반 데이터 변경

- **결정**: 모든 데이터 변경(생성/수정/삭제)은 Server Actions 사용, API Route 최소화
- **이유**: 타입 안전성 보장, Next.js 15의 프로그레시브 인핸스먼트 활용, 클라이언트 번들 크기 최소화

### ADR-003: 정산 알고리즘 클라이언트 사이드 실행

- **결정**: `lib/settlement-calculator.ts`는 순수 함수로 구현, 클라이언트에서 실행
- **이유**: DB에 중간 계산 결과를 저장하지 않아 지출 추가 시 항상 최신 계산 보장

### ADR-004: 대기자 자동 승격 Server Action 처리

- **결정**: RSVP 변경 시 Server Action 내에서 동기적으로 대기자 승격 처리
- **이유**: 별도 트리거/함수보다 디버깅 용이, Next.js revalidatePath로 즉시 UI 갱신

### ADR-005: Supabase RLS 기반 접근 제어

- **결정**: 모든 보안 로직은 RLS 정책에서 처리, 애플리케이션 레이어는 보조적 검증만
- **이유**: 직접 DB 접근이나 API 우회 시에도 데이터 보안 보장

---

## 성과 지표 (KPIs)

| 지표                   | 목표값     | 측정 방법                      |
| ---------------------- | ---------- | ------------------------------ |
| 그룹 생성 완료율       | 90% 이상   | 생성 시작 → 완료 전환율        |
| 초대 링크 참가 성공률  | 95% 이상   | 링크 접근 → 멤버 등록 전환율   |
| RSVP 응답 완료율       | 80% 이상   | 이벤트 조회 → RSVP 선택 전환율 |
| 정산 계산 정확도       | 100%       | 테스트 시나리오 기반 검증      |
| 초기 페이지 로딩 (LCP) | 2.5초 이하 | Vercel Analytics               |
| 모바일 CLS             | 0.1 이하   | Core Web Vitals                |

---

## 리스크 관리

### 높음

| 리스크                          | 영향도 | 발생 가능성 | 대응 전략                                                     |
| ------------------------------- | ------ | ----------- | ------------------------------------------------------------- |
| RLS 정책 오설정으로 데이터 노출 | 높음   | 중간        | Phase별 RLS 테스트 필수화, Supabase 보안 어드바이저 정기 확인 |
| RSVP 동시성 충돌                | 중간   | 낮음        | Supabase RPC(트랜잭션)로 원자적 처리                          |

### 중간

| 리스크                    | 영향도 | 발생 가능성 | 대응 전략                                   |
| ------------------------- | ------ | ----------- | ------------------------------------------- |
| 초대 코드 충돌            | 낮음   | 낮음        | UNIQUE 제약 에러 캐치 후 재생성 재시도      |
| date-fns 타임존 처리 오류 | 중간   | 중간        | TIMESTAMPTZ 사용, 표시는 `date-fns-tz` 고려 |
| 모바일 날짜 피커 UX 불량  | 낮음   | 중간        | 네이티브 date input 폴백 제공               |

---

## 파일 구조 참조

```
app/protected/
  page.tsx                                          # P02: 대시보드
  groups/
    new/page.tsx                                    # P03: 그룹 생성
    join/[inviteCode]/page.tsx                      # P04: 초대 참가
    [groupId]/
      page.tsx                                      # P05: 그룹 상세
      layout.tsx                                    # 그룹 레이아웃 (멤버십 검증)
      settings/page.tsx                             # P06: 그룹 설정
      events/
        new/page.tsx                                # P07: 이벤트 생성
        [eventId]/
          page.tsx                                  # P08: 이벤트 상세/RSVP
          settle/
            page.tsx                                # P09: 정산 관리
            new/page.tsx                            # P10: 지출 등록

components/
  layout/
    AppHeader.tsx                                   # 앱 공통 헤더
    BottomNav.tsx                                   # 모바일 하단 네비게이션
  groups/
    GroupCard.tsx                                   # 대시보드 그룹 카드
    GroupCreateForm.tsx                             # 그룹 생성 폼
    GroupHeader.tsx                                 # 그룹 상세 헤더
    InviteLinkButton.tsx                            # 초대 링크 복사 버튼
    JoinGroupCard.tsx                               # 초대 참가 그룹 정보 카드
    MemberList.tsx                                  # 멤버 목록
    MemberItem.tsx                                  # 개별 멤버 아이템
  events/
    EventList.tsx                                   # 이벤트 목록
    EventCard.tsx                                   # 이벤트 카드
    EventCreateForm.tsx                             # 이벤트 생성 폼
    EventHeader.tsx                                 # 이벤트 상세 헤더
    RsvpToggle.tsx                                  # RSVP 토글 버튼
    ParticipantList.tsx                             # 참가자 목록
  settle/
    ExpenseList.tsx                                 # 지출 목록
    ExpenseCreateForm.tsx                           # 지출 등록 폼
    SettlementResult.tsx                            # 정산 결과 표시
    SettlementItem.tsx                              # 개별 송금 항목

lib/
  actions/
    group-actions.ts                                # Server Actions: 그룹 CRUD
    event-actions.ts                                # Server Actions: 이벤트 + RSVP
    settle-actions.ts                               # Server Actions: 지출/정산
  settlement-calculator.ts                          # 순수 함수: 정산 알고리즘

types/
  index.ts                                          # 앱 도메인 타입 정의
  supabase.ts                                       # Supabase 자동 생성 타입
```

---

## 기능 ID - 페이지 매핑 요약

| 기능 ID | 기능명           | 관련 페이지                     | 구현 Phase |
| ------- | ---------------- | ------------------------------- | ---------- |
| F001    | 그룹 생성        | P02 대시보드, P03 그룹 생성     | Phase 1    |
| F002    | 그룹 목록 조회   | P02 대시보드                    | Phase 1    |
| F003    | 초대 링크 참가   | P04 초대 참가, P05 그룹 상세    | Phase 1    |
| F004    | 멤버 관리        | P06 그룹 설정                   | Phase 1    |
| F005    | 이벤트 생성      | P07 이벤트 생성                 | Phase 2    |
| F006    | 이벤트 목록 조회 | P05 그룹 상세, P08 이벤트 상세  | Phase 2    |
| F007    | RSVP 응답        | P08 이벤트 상세                 | Phase 2    |
| F008    | 대기자 자동 승격 | P08 이벤트 상세 (Server Action) | Phase 2    |
| F009    | 지출 등록        | P10 지출 등록                   | Phase 3    |
| F010    | 정산 결과 계산   | P09 정산 관리                   | Phase 3    |
| F011    | 송금 완료 표시   | P09 정산 관리                   | Phase 3    |
| F012    | 인증             | P01 로그인/회원가입             | 기 구현    |

---

## 참고 자료

- PRD: `docs/prds/PRD.md`
- 프로젝트 가이드: `CLAUDE.md`
- Supabase 클라이언트: `lib/supabase/server.ts`, `lib/supabase/client.ts`
- 세션 관리: `lib/supabase/proxy.ts` (또는 `proxy.ts`)
- 공통 유틸리티: `lib/utils.ts` (`cn()` 헬퍼)
- shadcn/ui 컴포넌트: `components/ui/`
