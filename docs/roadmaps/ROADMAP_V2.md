# 로드맵 V2: 모임 앱 개선 (보안 강화 + 운영 기능 + UX 개선)

**작성일**: 2026-03-07
**기준 PRD**: `docs/prds/PRD_V2.md`
**버전**: V2
**선행 조건**: V1 (Phase 0 ~ Phase Admin) 전체 완료

---

## 프로젝트 개요

| 항목          | 내용                                                               |
| ------------- | ------------------------------------------------------------------ |
| **목표**      | 보안 강화, 어드민 운영 기능 확대, 사용자 경험 개선                 |
| **예상 기간** | Phase 4 ~ Phase 6 순차 진행 (약 3~4주)                             |
| **타겟**      | 기존 MVP 사용자 + 운영 관리자                                      |
| **핵심 가치** | 취약점 해소, 어드민 사용자 관리 고도화, 프로필/그룹 이미지 UX 향상 |

### 핵심 기술 스택 (V1 동일)

| 분류        | 기술                               |
| ----------- | ---------------------------------- |
| 프레임워크  | Next.js 15 (App Router, RSC 우선)  |
| 스타일링    | Tailwind CSS v4 + shadcn/ui        |
| 백엔드/인증 | Supabase (PostgreSQL + Auth + RLS) |
| 언어        | TypeScript 5 (strict mode)         |
| 배포        | Vercel                             |

---

## 전체 진행 현황

| Phase   | 이름                           | 상태    | 진행률 | 완료일     |
| ------- | ------------------------------ | ------- | ------ | ---------- |
| Phase 4 | 어드민 보안 강화 및 역할 표시  | ✅ 완료 | 4/4    | 2026-03-07 |
| Phase 5 | 사용자 경험 개선 (멤버/프로필) | ✅ 완료 | 8/8    | 2026-03-07 |
| Phase 6 | 어드민 고도화 및 그룹 이미지   | ✅ 완료 | 9/9    | 2026-03-07 |

### 체크리스트 요약

#### Phase 4 -- 어드민 보안 강화 및 역할 표시

- [x] A-1: proxy.ts 어드민 접근 보안 강화 (try/catch)
- [x] A-2: 어드민 사용자 목록에 역할(is_admin) 컬럼 추가
- [x] A-1 검증: 비어드민 계정으로 /admin 접근 차단 확인
- [x] A-2 검증: 역할 뱃지 정상 표시 확인

#### Phase 5 -- 사용자 경험 개선

- [x] W-1: 그룹 상세 페이지에 멤버 목록 섹션 추가
- [x] W-3-1: 회원가입 폼에 닉네임 필드 추가
- [x] W-3-2: 프로필 수정 페이지 및 Server Action 구현
- [x] W-3-3: 앱 헤더에 프로필 페이지 링크 연동
- [x] W-1 검증: 일반 멤버 계정으로 멤버 목록 확인
- [x] W-3 검증: 닉네임 변경 및 비밀번호 변경 확인

#### Phase 6 -- 어드민 고도화 및 그룹 이미지

- [x] A-3-1: 어드민 사용자 상세 페이지 (조회)
- [x] A-3-2: 어드민 사용자 닉네임 수정 기능
- [x] A-3-3: 어드민 비밀번호 재설정 기능
- [x] A-3-4: 어드민 계정 삭제 기능
- [x] W-2-1: DB 컬럼 추가 + 타입 수정 (groups.image_url)
- [x] W-2-2: Supabase Storage 버킷 설정 + 이미지 업로드 구현
- [x] W-2-3: 그룹 생성/수정 폼에 이미지 업로드 UI 추가
- [x] W-2-4: GroupCard, GroupHeader에 이미지 표시
- [x] Phase 6 통합 검증: 빌드 에러 없음 확인

---

## 마일스톤 타임라인

```
Phase 4  [보안 + 역할]         ████████████████████████  완료 (2026-03-07)
Phase 5  [멤버/프로필]         ████████████████████████  완료 (2026-03-07)
Phase 6  [어드민 고도화/이미지] ████████████████████████  완료 (2026-03-07)
```

---

## Phase 4: 어드민 보안 강화 및 역할 표시

**기간**: 1~2일 | **우선순위**: Critical (보안 이슈)
**마일스톤**: 비어드민 계정의 /admin 직접 접근 완전 차단 + 사용자 목록 역할 뱃지 표시

### 주요 목표

- proxy.ts의 어드민 접근 제어 로직 보안 강화
- 어드민 사용자 목록에 역할(is_admin) 정보 노출

### Task 001: 어드민 접근 보안 강화 (A-1) - 우선순위

- proxy.ts의 `/admin` 경로 접근 제어 로직에 try/catch 추가
- `createAdminClient()` 실패 시 안전하게 `/admin/login`으로 리다이렉트
- 예외 발생 시 접근 차단 보장 (fail-closed 원칙)

**관련 파일**:
| 파일 | 변경 유형 |
|------|-----------|
| `lib/supabase/proxy.ts` | 수정 |

**구현 사항**:

- [x]`createAdminClient()` 호출부를 try/catch로 감싸기
- [x]catch 블록에서 `/admin/login`으로 리다이렉트 처리
- [x]is_admin 체크 실패 시에도 안전하게 리다이렉트

**검증 방법**:

- `is_admin=false` 계정으로 로그인 후 `/admin` 직접 URL 접근 시 `/admin/login`으로 리다이렉트 확인
- Supabase Admin Client 오류 시에도 접근 차단 확인

**테스트 체크리스트 (Playwright MCP)**:

- [x]일반 사용자 로그인 상태에서 `/admin` 접근 -> `/admin/login` 리다이렉트 확인
- [x]미인증 상태에서 `/admin` 접근 -> 리다이렉트 확인

---

### Task 002: 사용자 목록에 역할 컬럼 추가 (A-2)

- 어드민 사용자 목록 테이블에 역할(is_admin) 컬럼 추가
- `is_admin = true` -> "어드민" 뱃지, `is_admin = false` -> "일반" 뱃지

**관련 파일**:
| 파일 | 변경 유형 |
|------|-----------|
| `lib/actions/admin-actions.ts` | 수정 |
| `app/admin/(main)/users/page.tsx` | 수정 |

**구현 사항**:

- [x]`getAllUsers()` 함수 반환값에 `is_admin` 필드 포함
- [x]사용자 목록 테이블에 "역할" 컬럼 헤더 추가
- [x]역할 셀에 조건부 뱃지 렌더링 (어드민: 파란색, 일반: 회색)

**검증 방법**:

- 어드민 사용자 목록 페이지에서 "어드민"/"일반" 뱃지 표시 확인
- is_admin=true인 사용자에게 "어드민" 뱃지가 정상적으로 표시되는지 확인

---

## Phase 5: 사용자 경험 개선 (멤버 목록 공개 + 프로필)

**기간**: 3~5일 | **우선순위**: High (UX 핵심 기능)
**마일스톤**: 그룹 멤버 목록 공개 확인 + 프로필 수정 후 닉네임 반영 확인

### 주요 목표

- 그룹 상세 페이지에서 모든 멤버가 멤버 목록 열람 가능
- 회원가입 시 닉네임 입력 지원 및 프로필 수정 페이지 구현

### Task 003: 그룹 멤버 목록 공개 (W-1)

- 그룹 상세 페이지에 멤버 목록 섹션 추가 (모든 멤버 접근 가능)
- 기존 `MemberList`, `MemberItem` 컴포넌트 재사용
- 추방 버튼은 owner/admin에게만 표시

**관련 파일**:
| 파일 | 변경 유형 |
|------|-----------|
| `app/protected/groups/[groupId]/page.tsx` | 수정 |

**구현 사항**:

- [x]그룹 상세 페이지에 멤버 목록 섹션 추가
- [x]`getMembersByGroupId()` 호출하여 멤버 데이터 조회 (이미 구현됨)
- [x]`MemberList` / `MemberItem` 컴포넌트 재사용 (추방 버튼은 권한 체크)
- [x]멤버 목록 UI: 아바타, 닉네임, 역할 뱃지 표시

**검증 방법**:

- 일반 멤버 계정으로 그룹 상세 페이지 접근 시 멤버 목록 표시 확인
- owner/admin에게만 추방 버튼 표시 확인
- 비멤버는 기존 레이아웃 수준에서 접근 차단 유지

**테스트 체크리스트 (Playwright MCP)**:

- [x]일반 멤버로 그룹 상세 페이지 접근 -> 멤버 목록 섹션 존재 확인
- [x]owner/admin 계정 -> 추방 버튼 표시 확인
- [x]일반 멤버 계정 -> 추방 버튼 미표시 확인

---

### Task 004: 회원가입 닉네임 필드 추가 (W-3 - 1단계)

- 회원가입 폼에 닉네임(username) 필드 추가 (선택 입력)
- 가입 후 `profiles.username` 업데이트

**관련 파일**:
| 파일 | 변경 유형 |
|------|-----------|
| `components/sign-up-form.tsx` | 수정 |

**구현 사항**:

- [x]회원가입 폼에 닉네임 input 필드 추가 (선택, placeholder: "닉네임 (선택)")
- [x]가입 완료 후 `profiles.username` 업데이트 로직 추가
- [x]닉네임 유효성 검증 (최소 2자, 최대 20자, 선택 입력)

**검증 방법**:

- 닉네임 입력 후 가입 시 profiles 테이블에 username 저장 확인
- 닉네임 미입력 시에도 정상 가입 확인

---

### Task 005: 프로필 수정 페이지 구현 (W-3 - 2단계)

- `/protected/profile` 페이지 신규 생성
- 닉네임(username) 변경 + 비밀번호 변경 기능

**관련 파일**:
| 파일 | 변경 유형 |
|------|-----------|
| `app/protected/profile/page.tsx` | 신규 |
| `components/profile/profile-form.tsx` | 신규 |
| `lib/actions/profile-actions.ts` | 신규 |

**구현 사항**:

- [x]`lib/actions/profile-actions.ts` 생성: `updateProfile(username)` Server Action
- [x]`components/profile/profile-form.tsx` 생성: 닉네임 수정 폼 + 비밀번호 변경 폼
- [x]`app/protected/profile/page.tsx` 생성: 현재 프로필 정보 표시 + 수정 폼
- [x]닉네임 변경: `profiles` 테이블 UPDATE (Server Action)
- [x]비밀번호 변경: 클라이언트 Supabase `supabase.auth.updateUser({ password })` 사용
- [x]현재 닉네임/이메일 프리필 표시

**검증 방법**:

- 프로필 페이지에서 닉네임 변경 후 반영 확인
- 비밀번호 변경 후 재로그인 확인
- 유효하지 않은 비밀번호 입력 시 에러 메시지 표시

**테스트 체크리스트 (Playwright MCP)**:

- [x]`/protected/profile` 페이지 접근 -> 현재 닉네임/이메일 표시 확인
- [x]닉네임 변경 -> 성공 toast 메시지 확인
- [x]비밀번호 변경 (신규 비밀번호 불일치) -> 에러 메시지 확인

---

### Task 006: 앱 헤더 프로필 링크 연동 (W-3 - 3단계)

- 앱 헤더의 사용자 이름 클릭 시 `/protected/profile`로 이동

**관련 파일**:
| 파일 | 변경 유형 |
|------|-----------|
| `components/layout/app-header.tsx` | 수정 |

**구현 사항**:

- [x]앱 헤더의 사용자 이름/아이콘에 `/protected/profile` 링크 추가
- [x]프로필 페이지 링크가 모바일/데스크탑 양쪽에서 접근 가능하도록 구현

**검증 방법**:

- 헤더에서 사용자 이름 클릭 시 프로필 페이지 이동 확인

---

## Phase 6: 어드민 고도화 및 그룹 이미지

**기간**: 5~7일 | **우선순위**: Medium
**마일스톤**: 어드민 사용자 상세 관리 가능 + 그룹 이미지 업로드/표시 확인

### 주요 목표

- 어드민 사용자 상세 페이지 (조회/수정/삭제) 구현
- 그룹 이미지 업로드 및 표시 기능 구현

### Task 007: 어드민 사용자 상세 페이지 (A-3)

- `/admin/users/[userId]` 상세 페이지 신규 생성
- 사용자 정보 조회, 닉네임 수정, 비밀번호 재설정, 계정 삭제 기능

**관련 파일**:
| 파일 | 변경 유형 |
|------|-----------|
| `app/admin/(main)/users/[userId]/page.tsx` | 신규 |
| `lib/actions/admin-actions.ts` | 수정 |

**구현 사항**:

- [x]`getUserDetail(userId)` 함수 추가: 이메일, 닉네임, 가입일, 그룹 목록, 역할 반환
- [x]`updateUserByAdmin(userId, data)` 함수 추가: 닉네임(profiles.username) 수정
- [x]`resetPasswordByAdmin(userId, newPassword)` 함수 추가: `auth.admin.updateUserById()` 사용
- [x]`deleteUserByAdmin(userId)` 함수 추가: `auth.admin.deleteUser()` 사용
- [x]상세 페이지 UI: 사용자 정보 카드 + 수정 폼 + 위험 영역(삭제)
- [x]사용자 목록에서 행 클릭 시 상세 페이지로 이동하는 링크 추가
- [x]삭제 전 확인 다이얼로그 표시

**검증 방법**:

- 사용자 상세에서 닉네임 수정 -> 목록 반영 확인
- 비밀번호 재설정 -> 해당 사용자 새 비밀번호로 로그인 확인
- 계정 삭제 -> 목록에서 사라짐 확인 (cascade 삭제)

**테스트 체크리스트 (Playwright MCP)**:

- [x]`/admin/users/[userId]` 접근 -> 사용자 정보 표시 확인
- [x]닉네임 수정 -> 성공 후 목록 페이지에서 반영 확인
- [x]삭제 버튼 -> 확인 다이얼로그 표시 확인
- [x]삭제 확인 -> 목록 페이지로 리다이렉트 + 해당 사용자 제거 확인

---

### Task 008: 그룹 이미지 DB 및 타입 준비 (W-2 - 1단계)

- `groups` 테이블에 `image_url TEXT` 컬럼 추가 (사용자가 SQL Editor에서 실행)
- TypeScript 타입 업데이트

**관련 파일**:
| 파일 | 변경 유형 |
|------|-----------|
| `types/index.ts` | 수정 |
| `types/supabase.ts` | 재생성 |

**구현 사항**:

- [x]SQL 마이그레이션 문서화: `ALTER TABLE groups ADD COLUMN IF NOT EXISTS image_url TEXT;`
- [x]`types/index.ts`의 `Group` 인터페이스에 `image_url?: string` 필드 추가
- [x]Supabase 타입 재생성 (`supabase gen types typescript`)

**검증 방법**:

- `tsc --noEmit` 에러 없음
- Supabase 대시보드에서 groups 테이블에 image_url 컬럼 확인

---

### Task 009: 그룹 이미지 업로드 기능 (W-2 - 2단계)

- Supabase Storage `group-images` 버킷 설정
- 이미지 업로드 유틸리티 구현

**관련 파일**:
| 파일 | 변경 유형 |
|------|-----------|
| `lib/actions/group-actions.ts` | 수정 |

**사전 조건** (사용자가 Supabase 대시보드에서 수행):

- `group-images` 버킷 생성 (Public 접근)
- RLS: 인증된 사용자만 업로드, 누구나 읽기

**구현 사항**:

- [x]클라이언트에서 `supabase.storage.from("group-images").upload()` 호출 유틸리티 작성
- [x]`createGroup`, `updateGroup` Server Action에 `image_url` 처리 추가
- [x]이미지 파일 크기 제한 (최대 2MB) 및 형식 검증 (JPEG, PNG, WebP)

**검증 방법**:

- 이미지 업로드 후 Storage에 파일 저장 확인
- 반환된 public URL로 이미지 접근 가능 확인

---

### Task 010: 그룹 이미지 UI 구현 (W-2 - 3단계)

- 그룹 생성/수정 폼에 이미지 업로드 input 추가
- GroupCard, GroupHeader에 이미지 표시

**관련 파일**:
| 파일 | 변경 유형 |
|------|-----------|
| `components/groups/group-create-form.tsx` | 수정 |
| `components/groups/group-card.tsx` | 수정 |
| `components/groups/group-header.tsx` | 수정 |

**구현 사항**:

- [x]그룹 생성/수정 폼에 이미지 파일 선택 input 추가
- [x]이미지 미리보기 기능 구현
- [x]`GroupCard` (목록): 이미지 있으면 썸네일 표시, 없으면 기본 색상 플레이스홀더
- [x]`GroupHeader` (상세): 상단 배너 또는 아이콘으로 이미지 표시
- [x]Next.js `Image` 컴포넌트 사용 (width/height 지정)

**검증 방법**:

- 그룹 생성 시 이미지 업로드 -> 목록/상세에서 이미지 표시 확인
- 이미지 없는 그룹은 플레이스홀더 정상 표시 확인
- 이미지 교체 후 반영 확인

**테스트 체크리스트 (Playwright MCP)**:

- [x]그룹 생성 폼에서 이미지 업로드 -> 미리보기 표시 확인
- [x]생성 완료 후 GroupCard에 썸네일 표시 확인
- [x]그룹 상세 페이지에서 GroupHeader에 이미지 표시 확인
- [x]이미지 없는 그룹 -> 플레이스홀더 정상 표시 확인

---

### Phase 6 통합 검증

**테스트 체크리스트 (Playwright MCP)**:

- [x]어드민 사용자 관리 전체 플로우: 목록 -> 상세 -> 수정 -> 목록 반영
- [x]그룹 이미지 전체 플로우: 생성(이미지 포함) -> 목록 표시 -> 상세 표시
- [x]프로필 수정 -> 그룹 멤버 목록에서 닉네임 반영 확인
- [x]에러 핸들링: 잘못된 이미지 형식 업로드 시 에러 메시지 확인

---

## 기능 ID - 파일 매핑 요약

| 기능 ID | 기능명                | 관련 파일                                                    | 구현 Phase |
| ------- | --------------------- | ------------------------------------------------------------ | ---------- |
| A-1     | 어드민 접근 보안 강화 | `lib/supabase/proxy.ts`                                      | Phase 4    |
| A-2     | 사용자 역할 표시      | `admin-actions.ts`, `users/page.tsx`                         | Phase 4    |
| A-3     | 사용자 상세 페이지    | `users/[userId]/page.tsx`, `admin-actions.ts`                | Phase 6    |
| W-1     | 그룹 멤버 목록 공개   | `groups/[groupId]/page.tsx`                                  | Phase 5    |
| W-2     | 그룹 이미지 업로드    | `group-actions.ts`, `group-card.tsx`, `types/index.ts`       | Phase 6    |
| W-3     | 닉네임/프로필 수정    | `sign-up-form.tsx`, `profile/page.tsx`, `profile-actions.ts` | Phase 5    |

---

## DB 변경 사항

### Phase 6 사전 작업 (사용자가 Supabase SQL Editor에서 실행)

```sql
-- W-2: 그룹 이미지 컬럼 추가
ALTER TABLE groups ADD COLUMN IF NOT EXISTS image_url TEXT;
```

### Supabase Storage 설정 (사용자가 Supabase 대시보드에서 실행)

- `group-images` 버킷 생성 (Public 접근)
- RLS: 인증된 사용자만 업로드 (`INSERT`), 누구나 읽기 (`SELECT`)

---

## 위험 요소 및 대응

| 위험                                   | 영향도 | 대응                                                          |
| -------------------------------------- | ------ | ------------------------------------------------------------- |
| proxy.ts 수정 시 기존 인증 플로우 영향 | 높음   | A-1 수정 후 일반 사용자/어드민 양쪽 인증 플로우 회귀 테스트   |
| `auth.admin.deleteUser()` cascade 삭제 | 높음   | 삭제 전 확인 다이얼로그 필수, profiles cascade 동작 검증      |
| Supabase Storage 버킷 권한 설정 오류   | 중간   | Public 버킷 + RLS 조합 테스트, 미인증 업로드 차단 확인        |
| 이미지 파일 크기로 인한 성능 저하      | 중간   | 클라이언트 측 파일 크기 제한 (2MB), Next.js Image 최적화 활용 |
| 비밀번호 변경 시 세션 무효화           | 낮음   | 변경 후 재로그인 안내 메시지 표시                             |

---

## 참고 자료

- PRD V2: `docs/prds/PRD_V2.md`
- 로드맵 V1: `docs/roadmaps/ROADMAP_V1.md`
- 프로젝트 가이드: `CLAUDE.md`
- Supabase Admin Client: `lib/supabase/admin.ts`
- 어드민 인증: `lib/actions/admin-auth.ts`
- 세션 관리: `lib/supabase/proxy.ts`
