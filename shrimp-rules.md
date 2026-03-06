# Development Guidelines

## 프로젝트 개요

- **목적**: 모임 이벤트 관리 웹 MVP (그룹 생성, RSVP, 정산)
- **스택**: Next.js 15 App Router + Supabase (PostgreSQL, Auth, RLS) + Tailwind CSS v3 + shadcn/ui (new-york)
- **현재 상태**: 인증 기능 구현 완료, 튜토리얼 코드 잔존, MVP 기능 미구현
- **참조 문서**: `docs/prds/PRD.md` (기능 명세), `docs/roadmaps/ROADMAP_V1.md` (구현 계획)

---

## 디렉토리 구조 및 파일 배치

### 라우트 페이지

| 경로 패턴        | 배치 위치                                                 |
| ---------------- | --------------------------------------------------------- |
| 공개 페이지      | `app/page.tsx`, `app/auth/*/page.tsx`                     |
| 인증 필수 페이지 | `app/protected/**/page.tsx`                               |
| Route Handler    | `app/auth/callback/route.ts`, `app/auth/confirm/route.ts` |

- 새로운 인증 필수 페이지는 **반드시** `app/protected/` 하위에 생성
- 공개 접근 가능한 페이지를 `app/protected/` 안에 두지 말 것

### 컴포넌트 배치

| 분류           | 위치                 | 예시                                    |
| -------------- | -------------------- | --------------------------------------- |
| shadcn/ui 기본 | `components/ui/`     | button.tsx, card.tsx                    |
| 그룹 도메인    | `components/groups/` | group-card.tsx, member-list.tsx         |
| 이벤트 도메인  | `components/events/` | event-form.tsx, rsvp-toggle.tsx         |
| 정산 도메인    | `components/settle/` | expense-form.tsx, settlement-result.tsx |
| 레이아웃       | `components/layout/` | app-header.tsx, bottom-nav.tsx          |
| 인증 관련      | `components/` (루트) | login-form.tsx, auth-button.tsx         |

- 도메인 컴포넌트 디렉토리가 없으면 **먼저 생성** 후 파일 추가
- `components/ui/`는 shadcn/ui 전용, 수동 편집 금지

### 비즈니스 로직

| 분류                | 위치                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| Server Actions      | `lib/actions/group-actions.ts`, `lib/actions/event-actions.ts`, `lib/actions/settle-actions.ts` |
| 유틸리티            | `lib/utils.ts` (cn, hasEnvVars), `lib/settlement-calculator.ts`                                 |
| Supabase 클라이언트 | `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/proxy.ts`                     |

### 타입 정의

| 파일                | 용도                       | 수정 방법                                                |
| ------------------- | -------------------------- | -------------------------------------------------------- |
| `types/supabase.ts` | DB 스키마 타입 (자동 생성) | `mcp__supabase__generate_typescript_types` 도구로 재생성 |
| `types/index.ts`    | 앱 도메인 타입 (수동 작성) | 직접 편집                                                |

- `types/supabase.ts`를 **절대 수동 편집하지 말 것** — DB 스키마 변경 후 도구로 재생성
- 도메인 타입은 `types/index.ts`에 정의하고 Supabase Row 타입과 분리

---

## Supabase 클라이언트 사용 규칙

### 컨텍스트별 올바른 클라이언트 선택

| 사용 위치           | import 경로             | 호출 방식                                |
| ------------------- | ----------------------- | ---------------------------------------- |
| 서버 컴포넌트 (RSC) | `@/lib/supabase/server` | `const supabase = await createClient()`  |
| Server Action       | `@/lib/supabase/server` | `const supabase = await createClient()`  |
| Route Handler       | `@/lib/supabase/server` | `const supabase = await createClient()`  |
| 클라이언트 컴포넌트 | `@/lib/supabase/client` | `const supabase = createClient()` (동기) |
| 세션 갱신 (proxy)   | `@/lib/supabase/proxy`  | proxy.ts 내부에서만 사용                 |

### 필수 규칙

- Supabase 클라이언트를 **전역 변수, 모듈 스코프 변수에 저장 금지** — 매 함수 호출마다 새로 생성
- 서버 측 `createClient()`는 `async` 함수 (cookies() 호출), 클라이언트 측은 동기 함수
- `lib/supabase/proxy.ts`는 proxy.ts 전용, 다른 곳에서 import 금지

```typescript
// ✅ 올바른 사용
async function getGroups() {
    const supabase = await createClient();
    return supabase.from("groups").select("*");
}

// ❌ 금지: 모듈 스코프에 저장
const supabase = await createClient(); // 절대 금지
```

---

## 세션/인증 관련 규칙

### proxy.ts 수정 시 주의사항

- `proxy.ts` (루트)는 `lib/supabase/proxy.ts`의 `updateSession`을 호출하는 단순 래퍼
- `lib/supabase/proxy.ts`에서 `createServerClient()` 생성과 `supabase.auth.getClaims()` 사이에 **어떤 코드도 추가하지 말 것**
- 이 규칙 위반 시 사용자가 랜덤하게 로그아웃되는 디버깅 난이도 극고의 버그 발생

### 인증 콜백 흐름

```
Google OAuth → /auth/callback (route.ts) → exchangeCodeForSession → /protected
이메일 OTP  → /auth/confirm (route.ts)  → verifyOtp → /
```

- OAuth 리다이렉트 URL은 `window.location.origin + "/auth/callback"` 사용
- `next` 쿼리 파라미터로 인증 후 복귀 경로 제어 가능

### 인증 흐름 변경 시 동시 수정 파일

| 변경 내용                    | 수정 필요 파일                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| 인증 후 리다이렉트 경로 변경 | `lib/supabase/proxy.ts`, `app/auth/callback/route.ts`, `app/auth/confirm/route.ts` |
| 로그인 폼 UI 변경            | `components/login-form.tsx`                                                        |
| OAuth 프로바이더 추가        | `components/login-form.tsx`, `app/auth/callback/route.ts`                          |
| 보호 라우트 패턴 변경        | `lib/supabase/proxy.ts` (pathname 조건문)                                          |

---

## Server Actions 구현 패턴

### 파일 구조

```typescript
// lib/actions/group-actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createGroup(formData: FormData) {
    const supabase = await createClient();

    // 1. 인증 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    // 2. 입력 검증
    const name = formData.get("name") as string;
    if (!name?.trim()) return { error: "그룹명을 입력해주세요." };

    // 3. DB 작업
    const { data, error } = await supabase.from("groups").insert({ ... }).select().single();
    if (error) return { error: error.message };

    // 4. 캐시 무효화 + 리다이렉트
    revalidatePath("/protected");
    redirect(`/protected/groups/${data.id}`);
}
```

### 필수 패턴

- 파일 최상단에 `"use server"` 선언
- **모든 Server Action에서 인증 확인** (`supabase.auth.getUser()`)
- 에러 시 `{ error: string }` 객체 반환, 성공 시 `redirect()` 또는 `{ data }` 반환
- DB 변경 후 관련 경로에 `revalidatePath()` 호출
- `formData.get()` 반환값은 반드시 타입 검증

---

## DB 스키마 변경 규칙

### 마이그레이션 절차

1. `mcp__supabase__apply_migration` 도구로 DDL 실행 (테이블 생성, 컬럼 추가 등)
2. 마이그레이션 이름은 snake_case: `create_groups_table`, `add_invite_code_to_groups`
3. 마이그레이션 완료 후 `mcp__supabase__generate_typescript_types`로 `types/supabase.ts` 재생성
4. 도메인 타입이 필요하면 `types/index.ts`에 추가

### RLS 정책 필수

- **모든 새 테이블에 RLS 활성화** (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- RLS 정책 없이 테이블 생성 금지
- `is_group_member()` 헬퍼 함수 활용 (PRD 섹션 6 참조)
- 마이그레이션 후 `mcp__supabase__get_advisors` (security) 실행하여 누락된 RLS 확인

### 데이터 조회 (읽기 전용)

- `mcp__supabase__execute_sql`은 SELECT 등 읽기 작업에만 사용
- DDL 작업은 반드시 `apply_migration`으로 실행

---

## UI 컴포넌트 규칙

### shadcn/ui 컴포넌트 추가

- `npx shadcn@latest add <component-name>` 명령으로 추가
- 또는 `mcp__shadcn__get_add_command_for_items` 도구로 정확한 명령 확인
- 추가된 파일은 `components/ui/`에 자동 배치
- `components.json` 설정: style=new-york, rsc=true, tailwind cssVariables=true

### 스타일링

- 클래스 병합: `cn()` 함수 사용 (`import { cn } from "@/lib/utils"`)
- 조건부 클래스: `cn("base-class", condition && "conditional-class")`
- 다크 모드: `next-themes` ThemeProvider 사용, `dark:` prefix로 스타일 분기
- 반응형: 모바일 퍼스트 (`sm:`, `md:`, `lg:` 순서)

### 아이콘

- `lucide-react` 패키지 사용
- 커스텀 아이콘은 `components/icons/` 디렉토리에 배치 (예: `google.tsx`)

---

## 파일 동시 수정 규칙

### DB 스키마 변경 시

| 작업           | 동시 수정                                                                      |
| -------------- | ------------------------------------------------------------------------------ |
| 새 테이블 생성 | migration SQL → `types/supabase.ts` 재생성 → `types/index.ts` 도메인 타입 추가 |
| 컬럼 추가/변경 | migration SQL → `types/supabase.ts` 재생성 → 관련 Server Action 수정           |

### 새 페이지 추가 시

| 작업                  | 동시 수정                                                         |
| --------------------- | ----------------------------------------------------------------- |
| protected 하위 페이지 | `app/protected/**/page.tsx` 생성 → 네비게이션 링크 추가 (해당 시) |
| 그룹 상세 하위 페이지 | `app/protected/groups/[groupId]/**/page.tsx` → `layout.tsx` 확인  |

### 레이아웃 변경 시

| 작업           | 동시 수정                                                                   |
| -------------- | --------------------------------------------------------------------------- |
| 헤더 변경      | `app/protected/layout.tsx` 또는 `components/layout/app-header.tsx`          |
| 하단 네비 추가 | `components/layout/bottom-nav.tsx` 생성 → `app/protected/layout.tsx`에 포함 |

---

## 금지 사항

### 절대 금지

- `types/supabase.ts` 수동 편집
- Supabase 클라이언트를 모듈 스코프/전역 변수에 저장
- `lib/supabase/proxy.ts`의 `createServerClient()`와 `getClaims()` 사이에 코드 삽입
- RLS 없이 테이블 생성
- `components/ui/` 내 shadcn 컴포넌트 수동 수정 (커스텀 필요 시 래퍼 컴포넌트 생성)
- `any` 타입 사용 (`unknown` 사용 후 타입 좁히기)
- Server Action에서 인증 확인 누락

### 피해야 할 패턴

- 클라이언트 컴포넌트에서 직접 DB 쿼리 (Server Action 또는 RSC를 통해 접근)
- `middleware.ts` 사용 (이 프로젝트는 `proxy.ts` 사용)
- Server Action 내에서 `try-catch` 없이 DB 작업
- `revalidatePath` 호출 없이 DB 변경 후 리다이렉트

---

## PRD/로드맵 참조 규칙

- 기능 구현 전 `docs/prds/PRD.md`의 해당 기능 ID (F001~F012) 명세 확인
- 구현 순서는 `docs/roadmaps/ROADMAP_V1.md`의 Phase/Task 순서 준수
- 페이지 구현 시 PRD의 페이지별 상세 기능 (P01~P10) 참조
- DB 테이블 구조는 PRD 섹션 6 데이터 모델 참조
- 정산 알고리즘은 PRD 섹션 6 하단의 알고리즘 명세 준수
