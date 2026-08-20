# 블로그 AI 원고 작성기 — 초기 세팅

Next.js + Supabase + Claude API 기반 MVP 뼈대입니다.

## 포함된 기능
- 랜딩 페이지 (`/`)
- Supabase 이메일 매직링크 로그인 (`/login`)
- 원고 생성 대시보드 (`/dashboard`) — 주제 + 내 기존 글(문체 샘플)을 넣으면 Claude API로 글 생성
- `/api/generate` — Claude API 호출 라우트 (few-shot 방식으로 문체 학습)

## 실행 방법

1. 의존성 설치
   ```bash
   npm install
   ```

2. 환경 변수 설정
   ```bash
   cp .env.local.example .env.local
   ```
   `.env.local`을 열어 아래 값을 채워주세요:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
     → [supabase.com](https://supabase.com)에서 새 프로젝트 생성 후 Settings > API에서 확인
   - `ANTHROPIC_API_KEY`
     → [console.anthropic.com](https://console.anthropic.com)에서 발급

3. 개발 서버 실행
   ```bash
   npm run dev
   ```
   `http://localhost:3000` 접속

## 다음 단계 (아직 미구현)
- [ ] Supabase에 `profiles`, `posts` 테이블 만들고 생성한 글 저장하기
- [ ] Stripe 구독 결제 연동 (무료 3편 제한 → 프리미엄 무제한)
- [ ] 대시보드 라우트에 로그인 여부 확인(미들웨어) 추가
- [ ] 플랫폼별(네이버/티스토리/브런치) 톤 변환 기능
- [ ] 배포: Vercel에 연결 후 환경 변수 동일하게 설정
