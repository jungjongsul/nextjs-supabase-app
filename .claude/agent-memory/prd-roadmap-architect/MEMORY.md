# PRD Roadmap Architect - 프로젝트 메모리

## 프로젝트 기본 정보

- **프로젝트**: 모임 이벤트 관리 웹 MVP (nextjs-supabase-app)
- **스택**: Next.js 15 App Router + Supabase + Tailwind CSS v4 + shadcn/ui + TypeScript strict
- **패키지 매니저**: npm (bun 아님 주의)
- **인증**: Supabase Auth (이메일 + Google OAuth), 세션 관리는 `proxy.ts` (middleware.ts 미사용)

## 주요 파일 경로

- PRD: `docs/prds/PRD.md`
- 로드맵 V1: `docs/roadmaps/ROADMAP_V1.md`
- 프로젝트 지침: `CLAUDE.md`
- Supabase 클라이언트: `lib/supabase/server.ts`, `lib/supabase/client.ts`
- 세션 갱신: `proxy.ts` (루트 레벨)
- 타입 정의: `types/index.ts` (신규), `types/supabase.ts` (자동 생성)
- 공통 유틸: `lib/utils.ts` (`cn()` 헬퍼)

## 로드맵 패턴 (V1 기준)

- **Phase 0**: 기반 환경 구축 (기존 코드 정리, 타입 시스템, 레이아웃, proxy.ts 개선)
- **Phase 1**: 그룹 관리 (DB 마이그레이션 → Server Actions → 페이지)
- **Phase 2**: 이벤트 관리 (date-fns 추가, RSVP + 대기자 자동 승격)
- **Phase 3**: 정산 관리 (정산 알고리즘 순수 함수, 최소 거래 수 알고리즘)

## DB 구조

7개 테이블: `groups`, `group_members`, `events`, `event_participants`, `expenses`, `expense_participants`, `settlements`
RLS 헬퍼: `is_group_member(p_group_id UUID)` 함수

## 로드맵 작성 시 주의사항

1. 각 Phase에 DB 마이그레이션 → 서버 액션 → 페이지 순서로 태스크 배치
2. Supabase 타입 재생성(`types/supabase.ts`)은 각 Phase DB 마이그레이션 직후에 태스크로 포함
3. shadcn/ui 컴포넌트 설치는 PRD의 Phase별 목록대로 분리 설치
4. 기존 튜토리얼 UI 제거는 Phase 0에서 처리
5. proxy.ts 수정은 Phase 0에서 처리 (초대 링크 redirect 파라미터 보존)
