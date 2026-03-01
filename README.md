# Next.js + Supabase 인증 앱

Next.js App Router와 Supabase를 사용한 풀스택 인증 앱입니다.
이메일/비밀번호 로그인과 Google OAuth 소셜 로그인을 지원합니다.

## 기술 스택

- **Next.js** (App Router, Turbopack)
- **Supabase** — 인증 및 데이터베이스
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **next-themes** — 다크/라이트 테마
- **ESLint** + **Prettier** + **Husky** (lint-staged)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일을 생성하고 아래 값을 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=<Supabase 프로젝트 URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable 또는 anon 키>
```

Supabase 대시보드 → Project Settings → API에서 확인할 수 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

`http://localhost:3000`에서 확인합니다.

## Google OAuth 설정

Google 소셜 로그인을 사용하려면 아래 설정이 필요합니다.

### Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com) → API 및 서비스 → 사용자 인증 정보
2. 사용자 인증 정보 만들기 → **OAuth 클라이언트 ID** (웹 애플리케이션)
3. 승인된 JavaScript 원본: `http://localhost:3000`
4. 승인된 리디렉션 URI: `https://<your-project>.supabase.co/auth/v1/callback`
5. Client ID / Client Secret 복사

### Supabase 대시보드

1. Authentication → Providers → **Google** 활성화
2. Client ID, Client Secret 입력 후 저장
3. Authentication → URL Configuration → Redirect URLs에 추가:
    - `http://localhost:3000/auth/callback`

## 라우팅 구조

```
/                          # 랜딩 페이지
/auth/login                # 로그인
/auth/sign-up              # 회원가입
/auth/sign-up-success      # 회원가입 이메일 전송 완료
/auth/forgot-password      # 비밀번호 찾기
/auth/update-password      # 비밀번호 변경
/auth/error                # 인증 에러
/auth/confirm              # 이메일 OTP 확인 (Route Handler)
/auth/callback             # OAuth PKCE 콜백 (Route Handler)
/protected                 # 인증 필수 페이지
```

## 주요 파일

```
app/
  auth/
    callback/route.ts      # Google OAuth PKCE code exchange
    confirm/route.ts       # 이메일 OTP 확인
lib/
  supabase/
    server.ts              # 서버 컴포넌트용 Supabase 클라이언트
    client.ts              # 클라이언트 컴포넌트용 Supabase 클라이언트
    proxy.ts               # 세션 갱신 (middleware 역할)
components/
  icons/
    google.tsx             # Google SVG 아이콘
  login-form.tsx           # 로그인 폼
  sign-up-form.tsx         # 회원가입 폼
```

## 세션 관리

`middleware.ts` 대신 `lib/supabase/proxy.ts`의 `updateSession`을 사용합니다.
모든 요청에서 세션 쿠키를 갱신하며, 미인증 요청은 `/auth/login`으로 리다이렉트됩니다.
(`/`와 `/auth/**` 경로는 보호 대상 제외)

## 개발 명령어

```bash
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버
npm run lint         # ESLint 실행
npm run lint:fix     # ESLint 자동 수정
npm run format       # Prettier 포맷
npm run type-check   # TypeScript 타입 검사
```
