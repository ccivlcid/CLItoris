# CONVENTIONS.md — AI 바이브코딩 규칙

> **이 문서의 모든 규칙은 강제(MUST)다. 위반 시 코드 리뷰에서 즉시 반려된다.**
> AI는 코드를 생성하기 전에 이 문서를 반드시 참조해야 한다.

---

## 1. 언어 & 런타임 (절대 규칙)

- **TypeScript strict mode 전용** — `.js` 파일 생성 절대 금지
- `tsconfig.json`에서 `"strict": true` 필수, 개별 strict 옵션 끄기 금지
- **tsx**로 서버 직접 실행 (빌드 스텝 최소화)
- Node.js 20+ / ES2022 타겟
- CommonJS(`require`) 금지 → ESM(`import/export`) 전용

---

## 2. 네이밍 규칙 (예외 없음)

| 대상 | 규칙 | 올바른 예 | 잘못된 예 |
|------|------|----------|----------|
| 파일명 | `kebab-case` | `post-card.tsx` | `PostCard.tsx`, `postCard.tsx` |
| React 컴포넌트 | `PascalCase` | `PostCard` | `postCard`, `post_card` |
| 함수 / 변수 | `camelCase` | `createPost` | `create_post`, `CreatePost` |
| 타입 / 인터페이스 | `PascalCase` | `CreatePostRequest` | `createPostRequest` |
| 상수 | `UPPER_SNAKE_CASE` | `MAX_POST_LENGTH` | `maxPostLength` |
| 환경 변수 | `UPPER_SNAKE_CASE` | `DATABASE_URL` | `databaseUrl` |
| DB 테이블 | `snake_case` 복수형 | `user_posts` | `UserPosts`, `userPost` |
| DB 컬럼 | `snake_case` | `created_at` | `createdAt` |
| API 경로 | `kebab-case` | `/api/by-llm` | `/api/byLlm` |
| CSS 클래스 | Tailwind 유틸리티만 | `className="flex gap-2"` | `className="my-card"` |
| 이벤트 핸들러 | `handle` + 동사 | `handleClick` | `onClick` (props는 `on` 접두사) |
| boolean 변수 | `is/has/can/should` | `isLoading` | `loading` |
| 배열 변수 | 복수형 | `posts` | `postList`, `postArray` |

---

## 3. TypeScript 타입 규칙 (엄격)

### 절대 금지

```typescript
// ❌ 절대 금지 — 하나라도 있으면 반려
let x: any;                          // any 금지
let y: object;                       // object 금지
let z: Function;                     // Function 금지
// @ts-ignore                        // ts-ignore 금지
// @ts-nocheck                       // ts-nocheck 금지
// eslint-disable                    // eslint-disable 금지
x!.property;                         // non-null assertion 금지
(x as SomeType);                     // type assertion 최소화 (as const 제외)
```

### 필수 규칙

```typescript
// ✅ interface 우선 (type은 유니온/인터섹션/맵드 타입에만)
interface Post {
  id: string;
  userId: string;
  messageRaw: string;
  messageCli: string;
  lang: string;
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted';
  llmModel: LlmModel;
  createdAt: string;
}

// ✅ type은 이런 경우에만 사용
type LlmModel = 'claude-sonnet' | 'gpt-4o' | 'llama-3' | 'custom';
type PostWithUser = Post & { user: User };

// ✅ API 요청/응답 타입은 반드시 shared 패키지에 정의
interface ApiResponse<T> {
  data: T;
  error?: string;
}

// ✅ 함수 반환 타입 명시 필수 (추론에 의존하지 않음)
function createPost(input: CreatePostInput): Post { ... }
async function fetchFeed(cursor?: string): Promise<ApiResponse<Post[]>> { ... }

// ✅ enum 금지 → const 객체 + as const 사용
const VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  UNLISTED: 'unlisted',
} as const;
type Visibility = typeof VISIBILITY[keyof typeof VISIBILITY];
```

---

## 4. React 컴포넌트 규칙 (엄격)

### 컴포넌트 구조 (반드시 이 순서)

```typescript
// 1. import (외부 → 내부 → 타입 순서)
import { useState } from 'react';
import { usePostStore } from '../stores/post-store';
import type { Post } from '@clitoris/shared';

// 2. Props 인터페이스 (컴포넌트 바로 위에)
interface PostCardProps {
  post: Post;
  onStar?: (id: string) => void;
}

// 3. 컴포넌트 (named export만, default export 절대 금지)
export function PostCard({ post, onStar }: PostCardProps): JSX.Element {
  // 4. hooks (최상단, 조건문 안에서 절대 호출 금지)
  const [isExpanded, setIsExpanded] = useState(false);

  // 5. 이벤트 핸들러
  function handleStarClick(): void {
    onStar?.(post.id);
  }

  // 6. 조기 반환 (로딩, 에러, 빈 상태)
  if (!post) return null;

  // 7. JSX 반환
  return (
    <article className="border border-gray-700 rounded p-4 bg-[#1a1a2e]">
      {/* ... */}
    </article>
  );
}
```

### 절대 금지

```typescript
// ❌ default export 금지
export default function PostCard() { ... }

// ❌ React.FC 금지
const PostCard: React.FC<Props> = () => { ... }

// ❌ 클래스 컴포넌트 금지
class PostCard extends React.Component { ... }

// ❌ 인라인 스타일 금지
<div style={{ color: 'green' }}>

// ❌ index.tsx에 컴포넌트 구현 금지 (re-export만)

// ❌ useEffect에서 데이터 페칭 금지 → 전용 훅 또는 TanStack Query
useEffect(() => { fetch('/api/posts')... }, []);

// ❌ prop drilling 3단계 이상 금지 → Zustand 스토어 사용
```

### 필수 규칙

```typescript
// ✅ useState는 UI-only 로컬 상태에만 (토글, 입력값, 모달 열림)
const [isOpen, setIsOpen] = useState(false);

// ✅ 서버 상태는 Zustand 스토어
const posts = usePostStore((s) => s.posts);

// ✅ 이벤트 핸들러는 handle 접두사
function handleSubmit(e: React.FormEvent): void { ... }

// ✅ 조건부 렌더링은 삼항 또는 && (중첩 금지)
{isLoading ? <Spinner /> : <PostList posts={posts} />}

// ✅ key는 고유 ID (index 금지)
{posts.map((post) => <PostCard key={post.id} post={post} />)}

// ✅ 컴포넌트 파일은 한 파일에 하나만
```

---

## 5. 서버 규칙 (엄격)

### 라우트 구조

```typescript
// ✅ 라우트 파일은 router 하나만 export
import { Router } from 'express';
import type { ApiResponse, Post } from '@clitoris/shared';

export const postsRouter = Router();

// ✅ 핸들러는 단순하게 — 비즈니스 로직 분리 금지 (오버엔지니어링)
postsRouter.get('/feed/global', async (req, res, next) => {
  try {
    const cursor = req.query.cursor as string | undefined;
    const posts = db.prepare('SELECT * FROM posts WHERE ...').all(cursor);
    const response: ApiResponse<Post[]> = { data: posts };
    res.json(response);
  } catch (err) {
    next(err);  // ✅ 에러 미들웨어에 위임
  }
});
```

### 절대 금지

```typescript
// ❌ console.log 금지 → pino 로거 사용
console.log('request received');    // 절대 금지
logger.info('request received');    // ✅ 올바름

// ❌ 서비스 레이어/리포지토리 패턴 금지 (오버엔지니어링)
class PostService { ... }          // 금지
class PostRepository { ... }       // 금지

// ❌ 데코레이터 금지
@Controller('/posts')              // 금지

// ❌ 클래스 기반 컨트롤러 금지
class PostController { ... }       // 금지

// ❌ 중첩 try-catch 금지
try { try { ... } catch {} } catch {} // 금지
```

### 입력 검증

```typescript
// ✅ zod로 API 경계에서 1회만 검증
import { z } from 'zod';

const createPostSchema = z.object({
  message: z.string().min(1).max(2000),
  lang: z.string().length(2),
  tags: z.array(z.string()).max(10),
  visibility: z.enum(['public', 'private', 'unlisted']),
  llmModel: z.enum(['claude-sonnet', 'gpt-4o', 'llama-3', 'custom']),
});

// ✅ 미들웨어로 검증
function validate(schema: z.ZodSchema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    req.body = result.data;
    next();
  };
}
```

---

## 6. DB 규칙 (엄격)

```typescript
// ✅ better-sqlite3 동기 API만 사용 (async 래핑 금지)
const db = new Database('clitoris.db');

// ✅ prepared statement만 사용 (SQL injection 방지)
const stmt = db.prepare('SELECT * FROM posts WHERE id = ?');
const post = stmt.get(postId);

// ❌ 문자열 보간 절대 금지
db.exec(`SELECT * FROM posts WHERE id = '${postId}'`);  // 절대 금지

// ✅ 마이그레이션은 순번 관리
// 001_create_users.sql
// 002_create_posts.sql
// 003_create_social.sql
// 번호 건너뛰기 금지, 수정 금지 (새 파일만 추가)

// ✅ 트랜잭션은 반드시 transaction() 사용
const insertMany = db.transaction((posts) => {
  for (const post of posts) {
    insertStmt.run(post);
  }
});

// ❌ ORM 사용 절대 금지
// Prisma, TypeORM, Drizzle, Knex 등 전부 금지 → 직접 SQL
```

---

## 7. import 규칙 (엄격)

```typescript
// 반드시 이 순서 (그룹 사이에 빈 줄)

// 1. Node.js 내장 모듈
import path from 'node:path';
import { readFileSync } from 'node:fs';

// 2. 외부 라이브러리
import { Router } from 'express';
import { z } from 'zod';

// 3. 모노레포 내부 패키지
import type { Post, User } from '@clitoris/shared';
import { transformToCli } from '@clitoris/llm';

// 4. 프로젝트 내부 모듈 (상대 경로)
import { usePostStore } from '../stores/post-store';
import { PostCard } from '../components/post/post-card';

// ✅ type-only import 필수 (타입만 가져올 때)
import type { Post } from '@clitoris/shared';       // ✅
import { Post } from '@clitoris/shared';             // ❌ (타입만 사용하는 경우)

// ❌ 와일드카드 import 금지
import * as utils from '../utils';                   // 금지

// ❌ 상대 경로 2단계 초과 금지
import { something } from '../../../utils/helper';   // 금지 → 패키지 alias 사용
```

---

## 8. 스타일 규칙 (엄격)

### Tailwind CSS 전용

```typescript
// ✅ Tailwind 유틸리티 클래스만
<div className="flex items-center gap-2 p-4 bg-[#1a1a2e] text-gray-200 font-mono">

// ❌ 커스텀 CSS 파일 작성 금지 (globals.css 테마 변수 제외)
// ❌ CSS Modules 금지 (.module.css)
// ❌ CSS-in-JS 금지 (styled-components, emotion, vanilla-extract)
// ❌ Sass/Less 금지
// ❌ 인라인 스타일 금지 (style={{ }})
```

### 디자인 토큰 (터미널 테마)

```
배경 (primary)   : bg-[#1a1a2e]
배경 (secondary) : bg-[#16213e]
배경 (surface)   : bg-[#0f3460]
텍스트 (primary) : text-gray-200
텍스트 (muted)   : text-gray-500
CLI 키워드       : text-green-400      (#4ade80)
사용자명         : text-amber-400      (#fbbf24)
해시태그         : text-cyan-400       (#22d3ee)
멘션             : text-blue-400       (#60a5fa)
언어 태그        : text-purple-400     (#a78bfa)
명령어 프롬프트   : text-orange-400     (#fb923c)
에러             : text-red-400        (#f87171)
성공             : text-emerald-400    (#34d399)
보더             : border-gray-700
보더 (hover)     : border-gray-500
```

### 폰트

```
코드/CLI    : font-mono (JetBrains Mono → Fira Code → monospace)
자연어 본문  : font-sans (시스템 sans-serif)
```

---

## 9. 에러 처리 규칙

```typescript
// ✅ 서버: 에러 미들웨어 1곳에서 통합 처리
app.use((err: Error, req, res, next) => {
  logger.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ✅ 클라이언트: 에러 바운더리 사용
// 컴포넌트마다 try-catch 넣지 않음

// ❌ 빈 catch 블록 절대 금지
try { ... } catch (e) {}           // 금지
try { ... } catch (e) { /* */ }    // 금지

// ❌ 에러 삼키기 금지
catch (e) { return null; }         // 금지 (에러를 숨기지 마라)

// ✅ catch에서 반드시 로깅 또는 re-throw
catch (err) {
  logger.error({ err }, 'Failed to create post');
  throw err;
}
```

---

## 10. 파일 구조 규칙

```
✅ 한 파일에 한 컴포넌트/모듈 (예외 없음)
✅ 파일이 150줄 넘으면 반드시 분리
✅ index.ts는 re-export 전용 (로직 구현 금지)
✅ 테스트 파일: {파일명}.test.ts (같은 디렉토리)
✅ 타입 파일: {도메인}.ts (shared/types/ 아래)

❌ utils.ts 같은 범용 파일 금지 → 구체적 이름 사용
   utils.ts        → date-formatter.ts, id-generator.ts
❌ helpers.ts 금지
❌ misc.ts 금지
❌ common.ts 금지 (constants는 허용)
```

---

## 11. 절대 금지 목록 (체크리스트)

> **아래 항목 중 하나라도 위반하면 코드 전체가 반려된다.**

| # | 금지 항목 | 대안 |
|---|----------|------|
| 1 | `any` 타입 | `unknown` + 타입 가드 |
| 2 | `console.log/warn/error` | pino 로거 |
| 3 | `default export` | named export |
| 4 | `class` 컴포넌트 | 함수 컴포넌트 |
| 5 | `enum` | `as const` 객체 |
| 6 | `React.FC` / `React.FunctionComponent` | 일반 함수 + Props 타입 |
| 7 | CSS-in-JS | Tailwind CSS |
| 8 | 인라인 스타일 (`style={}`) | Tailwind CSS |
| 9 | ORM (Prisma, TypeORM 등) | 직접 SQL (better-sqlite3) |
| 10 | `require()` | `import` |
| 11 | `.js` 파일 | `.ts` / `.tsx` |
| 12 | `@ts-ignore` / `@ts-nocheck` | 타입 수정 |
| 13 | `eslint-disable` | 규칙 준수 |
| 14 | `!` (non-null assertion) | 옵셔널 체이닝 `?.` + 타입 가드 |
| 15 | 문자열 SQL 보간 | prepared statement |
| 16 | `.env` 커밋 | `.env.example` 만 커밋 |
| 17 | `index.ts`에 로직 구현 | 별도 파일에 구현 후 re-export |
| 18 | `useEffect`로 데이터 페칭 | 전용 훅 / TanStack Query |
| 19 | `* as` 와일드카드 import | 개별 import |
| 20 | 빈 `catch` 블록 | 로깅 또는 re-throw |
| 21 | 서비스/리포지토리 패턴 | 라우트 핸들러에 직접 작성 |
| 22 | 3단계 이상 상대경로 import | 패키지 alias |
| 23 | `var` 선언 | `const` (변경 필요시 `let`) |
| 24 | 매직 넘버 / 매직 스트링 | 상수로 추출 |
| 25 | 주석으로 코드 비활성화 | 삭제 (git이 기억한다) |

---

## 12. 커밋 메시지 (필수 형식)

```
<type>: <설명 (한글 또는 영문, 50자 이내)>

type 목록:
  feat:     새 기능
  fix:      버그 수정
  docs:     문서
  style:    코드 포맷 (기능 변경 없음)
  refactor: 리팩토링
  test:     테스트
  chore:    빌드/설정

❌ 금지:
  - type 없는 커밋 메시지
  - 50자 초과 제목
  - "fix bugs", "update code" 같은 모호한 메시지
  - WIP 커밋 (작업 완료 후 커밋)
```

---

## 13. 코드 리뷰 자동 반려 기준

AI가 생성한 코드가 아래 중 하나라도 해당되면 **즉시 반려**:

1. TypeScript strict mode 에러 존재
2. `any` 타입 1개 이상 사용
3. `console.log` 1개 이상 사용
4. `default export` 사용
5. 커스텀 CSS 파일 생성
6. ORM 코드 존재
7. 150줄 초과 파일
8. 함수 반환 타입 미명시
9. `.js` 파일 생성
10. 테스트 없는 유틸리티 함수
