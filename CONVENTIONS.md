# CONVENTIONS.md — AI 바이브코딩 규칙

이 문서는 AI가 코드를 생성할 때 반드시 따라야 하는 규칙이다.

## 언어 & 런타임

- **TypeScript strict mode** 전용 — JavaScript 금지
- **tsx**로 서버 직접 실행 (빌드 스텝 최소화)
- Node.js 20+ (ES2022 타겟)

## 네이밍 규칙

```
파일명        → kebab-case       (post-card.tsx, create-post.ts)
컴포넌트      → PascalCase       (PostCard, FeedList)
함수/변수     → camelCase        (createPost, postId)
타입/인터페이스 → PascalCase       (Post, CreatePostRequest)
상수          → UPPER_SNAKE_CASE (MAX_POST_LENGTH, DEFAULT_LANG)
DB 테이블     → snake_case       (user_posts, post_tags)
DB 컬럼       → snake_case       (created_at, user_id)
API 경로      → kebab-case       (/api/by-llm, /api/feed/global)
CSS 클래스    → Tailwind 유틸리티 (직접 CSS 작성 금지)
```

## React 컴포넌트 규칙

```typescript
// 항상 named export (default export 금지)
export function PostCard({ post }: PostCardProps) { ... }

// Props 타입은 컴포넌트 바로 위에 정의
interface PostCardProps {
  post: Post;
  onStar?: (id: string) => void;
}

// 상태 관리는 Zustand 스토어 사용
// useState는 UI-only 로컬 상태에만 사용
// useEffect 최소화 — 데이터 페칭은 TanStack Query 권장
```

## 서버 규칙

```typescript
// 라우트 핸들러는 단순하게
router.get('/posts/feed/global', async (req, res) => {
  const posts = await db.getAllPosts();
  res.json({ data: posts });
});

// 비즈니스 로직은 라우트에서 분리하지 않음 (오버엔지니어링 금지)
// 단, 재사용되는 로직만 utils로 추출

// 에러는 Express 에러 미들웨어에 위임
// try-catch 남발 금지
```

## 타입 규칙

```typescript
// shared 패키지에 모든 공유 타입 정의
// interface 우선 (type은 유니온/인터섹션에만)

interface Post {
  id: string;
  userId: string;
  messageRaw: string;    // 자연어 원문
  messageCli: string;    // CLI 변환 결과
  lang: string;
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted';
  llmModel: LlmModel;
  createdAt: string;
}

type LlmModel = 'claude-sonnet' | 'gpt-4o' | 'llama-3' | 'custom';

// API 요청/응답 타입도 shared에 정의
interface ApiResponse<T> {
  data: T;
  error?: string;
}
```

## DB 규칙

```typescript
// better-sqlite3 동기 API 사용 (async 불필요)
// 마이그레이션은 버전 번호로 관리: 001_create_users.sql, 002_create_posts.sql
// SQL은 prepared statement만 사용 (SQL injection 방지)
```

## 파일 구조 규칙

- 한 파일에 한 컴포넌트/모듈
- 파일이 200줄 넘으면 분리 고려
- index.ts는 re-export 용도로만 사용
- 테스트 파일: `*.test.ts` (같은 디렉토리 또는 tests/)

## 스타일 규칙

- Tailwind CSS 유틸리티 클래스만 사용
- 커스텀 CSS 파일 작성 금지 (globals.css 테마 변수 제외)
- 다크 테마가 기본값 (라이트 테마 불필요)
- 터미널 미학: `font-mono`, 그린/앰버/시안 강조색

## 금지 사항

- `any` 타입 사용 금지
- `console.log` 금지 → pino 로거 사용
- 클래스 기반 컴포넌트 금지
- CSS-in-JS 금지 (styled-components, emotion 등)
- ORM 금지 (Prisma, TypeORM 등) → 직접 SQL
- `.env` 파일 커밋 금지
- default export 금지 (라우트 페이지 제외)

## 커밋 메시지

```
feat: 새 기능
fix: 버그 수정
docs: 문서
style: 코드 포맷 (기능 변경 없음)
refactor: 리팩토링
test: 테스트
chore: 빌드/설정
```
