# CLAUDE.md

This file provides guidance to AI assistants working with the CLItoris repository.

## Project Overview

**CLItoris**는 터미널/CLI 인터페이스를 컨셉으로 한 소셜 네트워크 서비스(SNS)다.
사용자가 자연어로 글을 쓰면, LLM이 CLI 명령어 형태로 변환하여 듀얼 포맷(자연어 + CLI)으로 표시한다.
포스트, 팔로우, 포크, 스타 등 모든 소셜 인터랙션이 CLI 명령어로 표현된다.

**도메인**: `terminal.social`

## Tech Stack

| Area | Technology |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS |
| State management | Zustand |
| Flow diagrams | `@xyflow/react` v12 |
| Backend | Node.js + Express + tsx (TypeScript direct execution) |
| DB | SQLite (`better-sqlite3`) + versioned migrations |
| Logging | pino |
| Testing | Vitest (frontend + server), Playwright (E2E) |
| Package manager | pnpm |
| LLM Integration | Anthropic SDK, OpenAI SDK, Ollama |

## Monorepo Structure

pnpm workspaces 기반 모노레포 구조.

```
packages/
├── client/    # @clitoris/client — React 프론트엔드 (Vite + Tailwind)
├── server/    # @clitoris/server — Express API 서버 (tsx)
├── shared/    # @clitoris/shared — 공유 타입, 상수
└── llm/       # @clitoris/llm — LLM 프로바이더 통합 (Anthropic, OpenAI, Ollama)
docs/          # 프로젝트 문서 (PRD 등)
tests/         # unit (Vitest), e2e (Playwright)
scripts/       # 빌드/배포 스크립트
```

### 주요 명령어

```bash
pnpm dev              # 전체 개발 서버 실행
pnpm dev:client       # 프론트엔드만
pnpm dev:server       # 백엔드만
pnpm build            # 전체 빌드
pnpm test             # Vitest 단위 테스트
pnpm test:e2e         # Playwright E2E
pnpm lint             # ESLint
pnpm format           # Prettier
```

### 패키지 의존 관계

```
client ──→ shared, llm(타입)
server ──→ shared, llm
llm    ──→ shared
```

## Design Conventions

- **UI**: 다크 배경(`#1a1a2e`), 모노스페이스 폰트, 터미널 미학
- **Colors**: 그린(`#4ade80`) CLI 키워드, 앰버(`#fbbf24`) 사용자명, 시안(`#22d3ee`) 해시태그
- **Layout**: 좌측 사이드바 네비게이션 + 듀얼 패널 포스트 (자연어 | CLI)

## Development Workflow

### Branch Conventions

- Feature branches should follow the pattern: `claude/<description>-<id>`
- All development happens on feature branches; avoid pushing directly to `main`

### Commit Guidelines

- Write clear, descriptive commit messages
- Use conventional commit style when applicable (e.g., `feat:`, `fix:`, `docs:`, `chore:`)

### Key Documents

- `docs/PRD.md` — 전체 제품 요구사항 문서
