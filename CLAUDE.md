# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

```bash
npm run dev      # 개발 서버 시작 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 시작
npm run lint     # ESLint 실행
```

## 환경변수 설정

`.env.local` 파일에 아래 두 변수를 설정해야 합니다.

```
NEXT_PUBLIC_SUPABASE_URL=<Supabase 프로젝트 URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable 또는 anon 키>
```

## 아키텍처 개요

**Next.js App Router + Supabase 인증** 기반 풀스택 앱입니다.

### 라우팅 구조

- `/` — 공개 랜딩 페이지
- `/auth/{login,sign-up,sign-up-success,forgot-password,update-password,error}` — 인증 페이지
- `/auth/confirm` — 이메일 OTP 확인 Route Handler
- `/protected` — 인증 필수 페이지 (미인증 시 `/auth/login`으로 리다이렉트)

### Supabase 클라이언트 팩토리

클라이언트를 전역 변수에 저장하지 말고 함수 호출마다 새로 생성해야 합니다 (Fluid compute 호환성).

| 파일                     | 용도                                                      |
| ------------------------ | --------------------------------------------------------- |
| `lib/supabase/server.ts` | 서버 컴포넌트, Route Handler, Server Action용 (쿠키 기반) |
| `lib/supabase/client.ts` | 클라이언트 컴포넌트용 (브라우저)                          |
| `lib/supabase/proxy.ts`  | `proxy.ts`에서 호출하는 세션 갱신 로직                    |

### 세션 관리 (proxy.ts)

Next.js `middleware.ts` 대신 **`proxy.ts`** 를 사용합니다. `lib/supabase/proxy.ts`의 `updateSession`이 모든 요청에서 세션 쿠키를 갱신합니다.

- `supabase.auth.getClaims()` 호출 후 사용자 확인
- 미인증 요청(루트 `/` 및 `/auth/**` 제외)은 `/auth/login`으로 리다이렉트

> **주의**: `createServerClient()` 생성 직후 `getClaims()` 사이에 코드를 추가하면 세션 관련 디버깅이 매우 어려워집니다.

### 경로 별칭

`@/*` → 프로젝트 루트 (`tsconfig.json`의 `paths` 설정)

### UI 스택

- **shadcn/ui** 컴포넌트는 `components/ui/`에 위치
- **Tailwind CSS** + `tailwind-merge` + `clsx` 조합 사용 (`lib/utils.ts`의 `cn()` 헬퍼)
- **next-themes**로 다크/라이트 테마 지원 (루트 레이아웃의 `ThemeProvider`)
- **Geist Sans** 폰트 (Google Fonts)

### 유틸리티

- `lib/utils.ts` — `cn()` (클래스 병합), `hasEnvVars` (환경변수 존재 여부 확인)
