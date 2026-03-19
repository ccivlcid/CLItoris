# ARCHITECTURE.md — 시스템 아키텍처

## 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│                      사용자 브라우저                       │
│                  React 19 + Vite (SPA)                   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   Express API 서버                       │
│              (tsx — TypeScript 직접 실행)                 │
│                                                         │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐              │
│  │ Routes  │  │Middleware │  │  LLM 모듈  │              │
│  │ /posts  │  │  auth     │  │ Anthropic  │              │
│  │ /users  │  │  logger   │  │ OpenAI     │              │
│  │ /llm    │  │  errors   │  │ Ollama     │              │
│  └────┬────┘  └──────────┘  └─────┬─────┘              │
│       │                           │                     │
│       ▼                           ▼                     │
│  ┌─────────┐              ┌─────────────┐              │
│  │ SQLite  │              │ LLM APIs    │              │
│  │ (local) │              │ (external)  │              │
│  └─────────┘              └─────────────┘              │
└─────────────────────────────────────────────────────────┘
```

## 데이터 흐름

### 포스트 작성 플로우

```
1. 사용자가 자연어 입력 + LLM 모델 선택
2. [Cmd+Enter] 클릭
3. Client → POST /api/llm/transform { message, model, lang }
4. Server → LLM API 호출 (자연어 → CLI 변환)
5. LLM 응답 수신 → CLI 포맷 생성
6. Client에 CLI 프리뷰 표시
7. 사용자 확인 → POST /api/posts { messageRaw, messageCli, ... }
8. DB 저장 → 피드에 듀얼 포맷으로 표시
```

### 피드 로딩 플로우

```
1. Client → GET /api/posts/feed/global?cursor=X&limit=20
2. Server → SQLite 쿼리 (커서 기반 페이지네이션)
3. JSON 응답 → Zustand 스토어 업데이트
4. React 렌더링 (듀얼 패널 카드)
```

## DB 스키마

```sql
-- 001_create_users.sql
CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  username    TEXT UNIQUE NOT NULL,
  domain      TEXT,
  display_name TEXT,
  bio         TEXT,
  avatar_url  TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- 002_create_posts.sql
CREATE TABLE posts (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  message_raw   TEXT NOT NULL,
  message_cli   TEXT NOT NULL,
  lang          TEXT DEFAULT 'en',
  tags          TEXT DEFAULT '[]',    -- JSON array
  mentions      TEXT DEFAULT '[]',    -- JSON array
  visibility    TEXT DEFAULT 'public',
  llm_model     TEXT NOT NULL,
  parent_id     TEXT REFERENCES posts(id),    -- reply
  forked_from_id TEXT REFERENCES posts(id),   -- fork
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_llm_model ON posts(llm_model);

-- 003_create_social.sql
CREATE TABLE follows (
  follower_id  TEXT NOT NULL REFERENCES users(id),
  following_id TEXT NOT NULL REFERENCES users(id),
  created_at   TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE stars (
  user_id    TEXT NOT NULL REFERENCES users(id),
  post_id    TEXT NOT NULL REFERENCES posts(id),
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, post_id)
);
```

## 프론트엔드 상태 관리

```typescript
// Zustand 스토어 구조

feedStore: {
  posts: Post[]
  cursor: string | null
  loading: boolean
  fetchGlobalFeed()
  fetchLocalFeed()
  fetchByLlm(model)
}

authStore: {
  user: User | null
  login(credentials)
  logout()
}

postStore: {
  draft: string
  cliPreview: string | null
  selectedModel: LlmModel
  transformToClip()
  submitPost()
}
```

## LLM 통합 아키텍처

```typescript
// @clitoris/llm 패키지 — 프로바이더 패턴

interface LlmProvider {
  transform(input: TransformRequest): Promise<TransformResponse>;
}

// 각 프로바이더가 동일 인터페이스 구현
// anthropic.ts → Anthropic SDK
// openai.ts    → OpenAI SDK
// ollama.ts    → Ollama REST API

// transformer.ts — 프롬프트 구성
// "다음 자연어 메시지를 terminal.social CLI 명령어로 변환하세요"
// 시스템 프롬프트 + 예시 포함 (few-shot)
```

## 보안 고려사항

- **인증**: 세션 기반 (express-session + SQLite 저장)
- **입력 검증**: zod 스키마 (API 경계에서 1회)
- **SQL**: prepared statements only (better-sqlite3 기본 지원)
- **XSS**: React 자동 이스케이프 + DOMPurify (CLI 렌더링 시)
- **Rate Limiting**: express-rate-limit (LLM 변환 엔드포인트)
