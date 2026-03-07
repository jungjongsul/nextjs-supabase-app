# Phase 2 PRD: 모임 앱 개선

## Context

Phase 1에서 기본 MVP(그룹/이벤트/정산/어드민)를 완성했습니다.
Phase 2는 **보안 강화**, **어드민 운영 기능 확대**, **사용자 경험 개선**을 목표로 합니다.

---

## 현재 상태 (As-Is)

| 기능               | 현황                                                 |
| ------------------ | ---------------------------------------------------- |
| 어드민 접근 제어   | proxy.ts에서 is_admin 체크하나, 취약 가능성 있음     |
| 어드민 사용자 목록 | 이메일, 사용자명, 가입일, 그룹 수만 표시 (역할 없음) |
| 어드민 사용자 관리 | 목록 조회만 가능, 상세/수정/삭제 없음                |
| 그룹 멤버 목록     | settings 페이지에서만 보임 (owner/admin 전용)        |
| 그룹 이미지        | 없음 (DB 컬럼, UI 모두 미구현)                       |
| 회원가입           | 이메일+비밀번호만 수집, 닉네임 없음                  |
| 프로필 수정        | 없음                                                 |

---

## 목표 (To-Be)

### 어드민 (Admin)

#### A-1. 어드민 접근 보안 강화

- **문제**: 일반 계정으로 로그인 후 `/admin` 직접 URL 접근 가능 여부 불확실
- **해결**: proxy.ts의 is_admin 체크 로직을 명확히 하고 에러 핸들링 보강
    - `createAdminClient()` 실패 시 안전하게 `/admin/login`으로 리다이렉트
    - `try/catch`로 예외 발생 시 접근 차단 보장
- **파일**: `lib/supabase/proxy.ts`

#### A-2. 사용자 목록에 역할(is_admin) 컬럼 추가

- 어드민 사용자 목록 테이블에 **역할** 컬럼 추가
    - `is_admin = true` → "어드민" 뱃지
    - `is_admin = false` → "일반" 뱃지
- **파일**: `app/admin/(main)/users/page.tsx`, `lib/actions/admin-actions.ts`
    - `getAllUsers()` 함수에 `is_admin` 필드 포함

#### A-3. 어드민 사용자 상세 페이지

- **새 페이지**: `/admin/users/[userId]`
- **표시 정보**: 이메일, 닉네임, 가입일, 그룹 목록, 역할
- **기능**:
    1. **닉네임 수정**: `profiles.username` 업데이트
    2. **비밀번호 재설정**: Supabase Admin API `auth.admin.updateUserById()` 사용
    3. **계정 탈퇴(삭제)**: `auth.admin.deleteUser()` 사용 (profiles는 cascade 삭제)
- **파일**:
    - `app/admin/(main)/users/[userId]/page.tsx` (신규)
    - `lib/actions/admin-actions.ts` (함수 추가: `getUserDetail`, `updateUserByAdmin`, `deleteUserByAdmin`)

---

### 웹 (Web)

#### W-1. 그룹 멤버 목록 공개

- **현재**: 멤버 목록이 settings 페이지에만 존재 (owner/admin만 접근 가능)
- **개선**: 그룹 상세 페이지(`/protected/groups/[groupId]`)에 멤버 목록 섹션 추가
    - 모든 멤버가 볼 수 있음
    - 추방 버튼은 owner/admin에게만 표시 (기존 `MemberList`, `MemberItem` 컴포넌트 재사용)
- **파일**: `app/protected/groups/[groupId]/page.tsx`
    - `GroupInfo` 컴포넌트에 멤버 목록 추가 (getMembersByGroupId는 이미 구현됨)

#### W-2. 그룹 이미지 업로드

- **DB**: `groups` 테이블에 `image_url TEXT` 컬럼 추가
- **Storage**: Supabase Storage `group-images` 버킷 생성 (Public)
- **업로드 흐름**:
    1. 그룹 생성/수정 폼에 이미지 업로드 input 추가
    2. 클라이언트에서 `supabase.storage.from("group-images").upload()` 호출
    3. 반환된 public URL을 `image_url`로 저장
- **표시**:
    - `GroupCard` (목록): 이미지 있으면 썸네일 표시, 없으면 기본 색상 플레이스홀더
    - `GroupHeader` (상세): 상단 배너 또는 아이콘으로 표시
- **파일**:
    - `components/groups/group-create-form.tsx` (이미지 업로드 추가)
    - `components/groups/group-card.tsx` (이미지 표시)
    - `components/groups/group-header.tsx` (이미지 표시)
    - `lib/actions/group-actions.ts` (`createGroup`, `updateGroup`에 image_url 처리)
    - `types/index.ts` (`Group` 인터페이스에 `image_url` 추가)

#### W-3. 닉네임 + 프로필 수정

- **회원가입 시 닉네임 입력**:
    - `sign-up-form.tsx`에 닉네임 필드 추가 (선택 입력)
    - 가입 후 `profiles.username` 업데이트 (Supabase Auth `user_metadata` 또는 별도 update)
- **프로필 수정 페이지**: `/protected/profile`
    - 닉네임(username) 변경
    - 비밀번호 변경 (`supabase.auth.updateUser({ password })`)
- **Server Actions**:
    - `updateProfile(username)` → `profiles` 테이블 업데이트
    - 비밀번호 변경은 클라이언트 Supabase로 처리 (`updateUser`)
- **헤더 연동**: 앱 헤더의 사용자 이름 클릭 시 `/protected/profile`로 이동
- **파일**:
    - `components/sign-up-form.tsx`
    - `app/protected/profile/page.tsx` (신규)
    - `components/profile/profile-form.tsx` (신규)
    - `lib/actions/profile-actions.ts` (신규: `updateProfile`)

---

## DB 변경 사항 (사용자가 Supabase SQL Editor에서 실행)

```sql
-- W-2: 그룹 이미지 컬럼 추가
ALTER TABLE groups ADD COLUMN IF NOT EXISTS image_url TEXT;
```

Supabase Storage:

- `group-images` 버킷 생성 (Public 접근)
- RLS: 인증된 사용자만 업로드, 누구나 읽기

---

## 핵심 파일 목록

| 파일                                       | 변경 유형 | 관련 기능                |
| ------------------------------------------ | --------- | ------------------------ |
| `lib/supabase/proxy.ts`                    | 수정      | A-1 보안 강화            |
| `lib/actions/admin-actions.ts`             | 수정      | A-2, A-3                 |
| `app/admin/(main)/users/page.tsx`          | 수정      | A-2 역할 컬럼            |
| `app/admin/(main)/users/[userId]/page.tsx` | 신규      | A-3 상세 페이지          |
| `app/protected/groups/[groupId]/page.tsx`  | 수정      | W-1 멤버 목록            |
| `components/groups/group-create-form.tsx`  | 수정      | W-2 이미지 업로드        |
| `components/groups/group-card.tsx`         | 수정      | W-2 이미지 표시          |
| `components/groups/group-header.tsx`       | 수정      | W-2 이미지 표시          |
| `lib/actions/group-actions.ts`             | 수정      | W-2 image_url 처리       |
| `types/index.ts`                           | 수정      | W-2 Group 타입           |
| `components/sign-up-form.tsx`              | 수정      | W-3 닉네임 입력          |
| `app/protected/profile/page.tsx`           | 신규      | W-3 프로필 수정          |
| `components/profile/profile-form.tsx`      | 신규      | W-3 프로필 폼            |
| `lib/actions/profile-actions.ts`           | 신규      | W-3 프로필 Server Action |

---

## 구현 우선순위

| 순서 | 기능                   | 이유                            |
| ---- | ---------------------- | ------------------------------- |
| 1    | A-1 어드민 보안 강화   | 보안 이슈, 즉시 수정 필요       |
| 2    | A-2 사용자 역할 표시   | 작은 변경, 빠른 완료            |
| 3    | W-1 멤버 목록 공개     | 기존 컴포넌트 재사용, 작은 변경 |
| 4    | W-3 닉네임/프로필 수정 | UX 핵심 기능                    |
| 5    | A-3 사용자 상세 페이지 | A-2 완료 후 진행                |
| 6    | W-2 그룹 이미지        | DB 변경 + Storage 설정 필요     |

---

## 검증 방법

1. **A-1**: `is_admin=false` 계정으로 로그인 후 `/admin` 직접 접근 → `/admin/login` 리다이렉트 확인
2. **A-2**: 어드민 사용자 목록에서 "어드민"/"일반" 뱃지 표시 확인
3. **A-3**: 사용자 상세에서 닉네임 수정 → 목록 반영 확인 / 삭제 후 사용자 사라짐 확인
4. **W-1**: 일반 멤버 계정으로 그룹 상세 페이지 접근 → 멤버 목록 표시 확인
5. **W-2**: 그룹 생성 시 이미지 업로드 → 목록/상세에서 이미지 표시 확인
6. **W-3**: 회원가입 시 닉네임 입력 → 그룹 멤버 목록에 닉네임 표시 확인 / 프로필 페이지에서 닉네임·비밀번호 변경 확인
