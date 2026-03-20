# CLItoris

**당신의 언어와 CLI, 두 가지로 말하는 소셜 네트워크.**

> 하고 싶은 말을 쓰세요. AI가 CLI 명령어로 변환합니다. 둘 다 나란히 게시됩니다.

[English](./README.md)

<!-- TODO: 스크린샷 추가 -->

---

## 작동 방식

1. **접속** — GitHub 계정으로 원클릭 OAuth 로그인
2. **작성** — 자연어로 아무거나 작성
3. **선택** — AI 모델 선택 (Claude, GPT-4o, Llama 3 등)
4. **전송** — Cmd+Enter
5. **변환** — AI가 텍스트를 구조화된 CLI 명령어로 변환
6. **게시** — 원문과 CLI 버전이 나란히 표시

모든 포스트는 두 세계에 동시에 존재합니다.

---

## 주요 기능

### GitHub 네이티브 로그인
GitHub OAuth로만 로그인합니다. 비밀번호도, 회원가입 폼도 없습니다 — `$ ssh terminal.social`로 접속하세요. 개발자 정체성이 곧 소셜 정체성입니다.

### 듀얼 포맷 포스트
모든 포스트는 원문과 CLI 표현을 동시에 보여줍니다. 코드를 위한 자막이라고 생각하세요.

```
┌─ 자연어 ───────────────────┐  ┌─ CLI — claude-sonnet ──────┐
│ 바이브 코딩하다가 우리가    │  │ post --user=jiyeon.kim \   │
│ AI에 적응하고 있는 건      │  │   --lang=ko \              │
│ 아닌지 생각이 들었다.      │  │   --message="AI 언어       │
│ #vibe-coding #thoughts     │  │   수렴 현상 관찰..." \     │
│                            │  │   --tags=vibe-coding       │
└────────────────────────────┘  └────────────────────────────┘
```

### 포크, 리포스트 말고
흥미로운 포스트를 발견했나요? 레포 포크하듯 **포크하세요**. 원본에 링크되고, 내 버전으로 리믹스할 수 있습니다.

### AI 모델 선택
어떤 AI가 포스트를 변환할지 선택하세요:
- **Claude** (Anthropic) — 기본값
- **GPT-4o** (OpenAI)
- **Gemini** (Google)
- **Llama 3** (Ollama로 로컬 실행 — API 키 불필요, 완전한 프라이버시)
- **커스텀** — 범용 API로 직접 모델 연결

### 레포 첨부
포스트에 GitHub 레포를 `--repo=owner/name`으로 태그하세요. 코드를 논의하고, 프로젝트를 공유하고, 피드를 통해 레포를 발견하세요.

### 레포 분석
AI로 GitHub 레포를 분석하세요. 아키텍처 리포트, 프레젠테이션 자동 생성, 영상 워크스루를 터미널에서 바로 만들 수 있습니다.

```bash
$ analyze --repo=vercel/next.js --output=report        # 아키텍처 분석
$ analyze --repo=owner/name --output=pptx --slides=10  # 슬라이드 덱
$ analyze --repo=owner/name --output=video --duration=60s  # 영상 워크스루
```

### 로컬 LLM
Ollama를 통해 모델을 로컬에서 실행하세요. API 키 없이, 클라우드 없이, 민감한 레포도 완전한 프라이버시로 분석할 수 있습니다. CLItoris가 하드웨어를 감지하고 최적의 모델을 추천합니다.

### AI별 브라우징
같은 아이디어를 다른 AI가 어떻게 해석하는지 궁금하신가요? 모델별로 피드를 필터링하고 비교하세요.

### 터미널 미학
어두운 배경. 모노스페이스 폰트. 검은색 위의 녹색 텍스트. 그라디언트 없음, 둥근 모서리 없음, 군더더기 없음. 콘텐츠만.

### 다국어 지원
어떤 언어로든 작성하세요. AI가 CLI 포맷으로 변환합니다. 모든 포스트에 언어 태그가 표시됩니다 (`--lang=ko`, `--lang=en`, `--lang=hi`).

### 키보드 우선
`j`/`k`로 탐색, `s`로 스타, `r`로 답글, `f`로 포크, `/`로 작성. 터미널 사용자가 편하게 느낄 수 있습니다.

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 19 + TypeScript + Vite + Tailwind CSS |
| 상태 관리 | Zustand |
| 백엔드 | Node.js + Express + tsx |
| 데이터베이스 | SQLite (better-sqlite3) |
| 인증 | GitHub OAuth 2.0 (PKCE) |
| LLM | Anthropic, OpenAI, Google Gemini, Ollama, CLI 어댑터, 범용 API |
| 테스트 | Vitest + Playwright |
| 패키지 매니저 | pnpm workspaces (모노레포) |

---

## 빠른 시작

```bash
git clone https://github.com/ccivlcid/CLItoris.git
cd CLItoris
cp .env.example .env            # GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, SESSION_SECRET 설정
pnpm install                    # 의존성 설치
pnpm dev                        # 개발 서버 시작
```

`http://localhost:5173`을 열고 GitHub으로 접속하세요.

---

## 프로젝트 구조

```
packages/
├── client/    # React 프론트엔드 (Vite + Tailwind)
├── server/    # Express API 서버 (tsx)
├── shared/    # 공유 타입, 상수
└── llm/       # LLM 프로바이더 통합
docs/          # 전체 문서 (가이드, 스펙, 화면, 아키텍처)
```

---

## 기여하기

이 프로젝트는 **바이브 코딩** — AI 주도 개발로 만들어집니다.

기여하기 전에 읽어주세요:
1. [CLAUDE.md](./CLAUDE.md) — AI 어시스턴트용 프로젝트 가이드
2. [Conventions](./docs/guides/CONVENTIONS.md) — 코딩 규칙
3. [Design Guide](./docs/design/DESIGN_GUIDE.md) — 비주얼 시스템

전체 문서는 [`docs/`](./docs/)에 카테고리별로 정리되어 있습니다:
- `docs/guides/` — 코딩 컨벤션, 디자인 시스템, 테스트, 프롬프트
- `docs/screens/` — 페이지별 UI 스펙 (8개 화면)
- `docs/specs/` — PRD, 데이터베이스 스키마, API 문서
- `docs/architecture/` — 시스템 다이어그램, Mermaid 플로우차트

---

## 로드맵

| 단계 | 초점 | 주요 기능 |
|------|------|----------|
| **Phase 1** | 핵심 | GitHub OAuth, 듀얼 포맷 포스트, LLM 변환, 글로벌 피드 |
| **Phase 2** | 소셜 | 팔로우/팔로잉, 로컬 피드, 포크, GitHub 정보 포함 프로필 |
| **Phase 3** | 확장 | 멀티 LLM, 로컬 LLM 설치, 번역, 탐색/트렌딩 |
| **Phase 4** | GitHub 심화 | 레포 첨부, 트렌딩 레포, 활동 임포트, 레포 분석 (리포트) |
| **Phase 5** | 분석 & 생성 | PPTX 생성, 영상 생성, `/analyze` 페이지, 분석 피드 |

전체 로드맵은 [PROGRESS.md](./docs/PROGRESS.md)를 참고하세요.

---

## 관련 문서

- [CLAUDE.md](./CLAUDE.md) — 기술 스택, 모노레포 구조, 문서 맵
- [docs/](./docs/) — 전체 문서 (가이드, 스펙, 아키텍처, 화면)

---

## 라이선스

TBD
