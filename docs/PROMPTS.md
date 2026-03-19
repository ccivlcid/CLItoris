# PROMPTS.md — 바이브코딩 프롬프트 가이드

이 문서는 AI에게 작업을 지시할 때 사용할 수 있는 프롬프트 템플릿 모음이다.

## 사용법

각 프롬프트를 복사하여 AI에게 전달한다. `{변수}`는 상황에 맞게 수정한다.
모든 프롬프트는 CONVENTIONS.md와 ARCHITECTURE.md를 컨텍스트로 참조한다.

---

## 1. 컴포넌트 생성

```
packages/client/src/components/{폴더}/ 아래에 {컴포넌트명} 컴포넌트를 만들어줘.

요구사항:
- {기능 설명}
- Props: {필요한 props 나열}
- Tailwind CSS로 스타일링 (다크 테마, 터미널 미학)
- CONVENTIONS.md 규칙 준수
```

### 예시
```
packages/client/src/components/post/ 아래에 DualPanel 컴포넌트를 만들어줘.

요구사항:
- 좌측에 자연어 원문, 우측에 CLI 변환 결과를 나란히 표시
- Props: messageRaw, messageCli, lang
- 모바일에서는 세로 스택
- CLI 패널은 녹색 텍스트, 모노스페이스 폰트
```

---

## 2. API 라우트 추가

```
packages/server/src/routes/{파일명}.ts 에 {HTTP메서드} {경로} 라우트를 추가해줘.

요구사항:
- {기능 설명}
- 입력: {요청 바디/파라미터}
- 출력: ApiResponse<{타입}>
- DB 쿼리: {필요한 쿼리 설명}
```

---

## 3. DB 마이그레이션

```
packages/server/src/db/migrations/ 에 새 마이그레이션 파일을 만들어줘.

파일명: {번호}_{설명}.sql
내용: {테이블/컬럼 변경 설명}
```

---

## 4. Zustand 스토어

```
packages/client/src/stores/{스토어명}.ts 에 Zustand 스토어를 만들어줘.

상태:
- {상태 필드 나열}

액션:
- {액션 메서드 나열}
```

---

## 5. LLM 프로바이더

```
packages/llm/src/providers/{프로바이더}.ts 에 새 LLM 프로바이더를 추가해줘.

- LlmProvider 인터페이스 구현
- {SDK/API} 사용
- transform 메서드: 자연어 → CLI 변환
```

---

## 6. 페이지 추가

```
packages/client/src/pages/{페이지명}.tsx 에 새 페이지를 만들어줘.

라우트: {경로}
기능: {페이지 설명}
사용 컴포넌트: {필요한 컴포넌트 나열}
데이터: {필요한 스토어/API 호출}
```

---

## 7. 기능 구현 (풀스택)

```
{기능명} 기능을 풀스택으로 구현해줘.

사용자 스토리: {사용자가 ~하면 ~한다}

구현 범위:
1. shared: 타입 정의
2. server: API 라우트 + DB 쿼리
3. client: UI 컴포넌트 + 스토어 + 페이지 연결

CONVENTIONS.md와 ARCHITECTURE.md 규칙을 따라줘.
```

### 예시
```
포스트 포크 기능을 풀스택으로 구현해줘.

사용자 스토리: 사용자가 다른 사람의 포스트에서 "fork" 버튼을 누르면,
해당 포스트가 복제되어 자신의 타임라인에 올라간다.
원본 포스트 링크가 유지된다.

구현 범위:
1. shared: Fork 타입, ForkPostRequest/Response
2. server: POST /api/posts/:id/fork + DB insert
3. client: ForkButton 컴포넌트 + postStore.forkPost() + 피드 업데이트
```

---

## 8. 버그 수정

```
{증상 설명}

재현 방법: {스텝}
예상 동작: {올바른 동작}
실제 동작: {현재 버그 동작}

원인을 파악하고 수정해줘.
```

---

## 9. 테스트 작성

```
{대상} 에 대한 테스트를 작성해줘.

테스트 도구: Vitest (단위) / Playwright (E2E)
커버할 케이스:
- {케이스 1}
- {케이스 2}
- {엣지 케이스}
```

---

## 팁: 바이브코딩을 잘 하려면

1. **구체적으로 지시하라** — "좋은 UI 만들어줘" ❌ → "PostCard에 star 버튼 추가해줘, 클릭하면 노란색으로 토글" ✅
2. **파일 경로를 명시하라** — AI가 어디에 코드를 놓을지 고민하지 않게
3. **기존 패턴을 참조시켜라** — "PostCard처럼 만들어줘" 같은 힌트
4. **한 번에 하나씩** — 여러 기능을 한 프롬프트에 넣지 말 것
5. **결과를 확인하고 피드백하라** — "동작하는데 CLI 패널 폰트가 너무 작아" 같은 구체적 피드백
