# Google OAuth 로그인 기능 추가 계획

## Context

현재 프로젝트는 이메일/비밀번호 기반 인증만 지원합니다. 사용자 편의성을 위해 Google OAuth 소셜 로그인을 추가합니다. Supabase의 `signInWithOAuth` + PKCE flow를 사용하며, 기존 세션 관리(`proxy.ts`)와 UI 패턴(Card 기반 폼)을 그대로 활용합니다.

---

## Step 1: Supabase Google OAuth Provider 설정 (수동)

### 1-1. Google Cloud Console

1. https://console.cloud.google.com → "API 및 서비스" → "사용자 인증 정보"
2. "사용자 인증 정보 만들기" → "OAuth 클라이언트 ID" (웹 애플리케이션)
3. **승인된 JavaScript 원본**: `http://localhost:3000`
4. **승인된 리디렉션 URI**: `https://ttczocqejtjsgnwytdvq.supabase.co/auth/v1/callback`
5. Client ID / Client Secret 복사

### 1-2. Supabase 대시보드

1. Authentication → Providers → Google 활성화
2. Client ID, Client Secret 입력
3. Authentication → URL Configuration → Redirect URLs에 추가:
    - `http://localhost:3000/auth/callback`

---

## Step 2: Google 아이콘 컴포넌트 생성

**새 파일**: `components/icons/google.tsx`

- Google 공식 컬러 SVG 아이콘 컴포넌트
- `React.SVGProps<SVGSVGElement>` 타입으로 `className` 등 전달 가능

---

## Step 3: OAuth 콜백 Route Handler 생성

**새 파일**: `app/auth/callback/route.ts`

- GET 핸들러: `code` 파라미터를 받아 `exchangeCodeForSession` 호출
- 성공 시 `/protected`로 리다이렉트
- 실패 시 `/auth/error`로 리다이렉트
- 기존 `auth/confirm/route.ts` 패턴 참고 (서버 클라이언트 + redirect)

**proxy.ts 영향 없음**: 52행에서 `/auth` 경로는 이미 보호 대상 제외

---

## Step 4: LoginForm 수정

**수정 파일**: `components/login-form.tsx`

변경 내용:

1. `GoogleIcon` import 추가
2. `handleGoogleLogin` 핸들러 추가 (`signInWithOAuth({ provider: "google" })`)
3. 기존 Login 버튼 아래에 구분선("또는") + Google 로그인 버튼 추가

UI 구조:

```
CardContent
├── form
│   ├── Email 입력
│   ├── Password 입력
│   ├── 에러 메시지
│   ├── Login 버튼
│   ├── ── 또는 ──  (구분선)
│   ├── Google로 로그인 버튼  (type="button")
│   └── "Don't have an account? Sign up"
```

---

## Step 5: SignUpForm 수정

**수정 파일**: `components/sign-up-form.tsx`

LoginForm과 동일 패턴:

1. `GoogleIcon` import
2. `handleGoogleSignUp` 핸들러 (내부적으로 `signInWithOAuth` — 로그인과 동일)
3. Sign up 버튼 아래에 구분선 + "Google로 회원가입" 버튼

---

## 파일 변경 요약

| 파일                          | 작업    | 설명                          |
| ----------------------------- | ------- | ----------------------------- |
| `components/icons/google.tsx` | 새 파일 | Google SVG 아이콘 컴포넌트    |
| `app/auth/callback/route.ts`  | 새 파일 | OAuth PKCE code exchange      |
| `components/login-form.tsx`   | 수정    | Google 로그인 버튼 + 구분선   |
| `components/sign-up-form.tsx` | 수정    | Google 회원가입 버튼 + 구분선 |

**수정 불필요**: `proxy.ts`, `lib/supabase/server.ts`, `lib/supabase/client.ts`, `auth/error/page.tsx`

---

## 검증 방법

1. `npm run build` — 빌드 에러 없는지 확인
2. `npm run lint` — 린트 통과
3. 브라우저 테스트:
    - `/auth/login` 접속 → Google 로그인 버튼 표시 확인
    - Google 버튼 클릭 → Google 인증 화면 이동 확인
    - 인증 완료 → `/protected` 리다이렉트 확인
    - `/auth/sign-up` 에서도 동일하게 동작 확인
