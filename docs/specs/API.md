# API.md — REST API Specification

> **Source of truth** for all 29 REST API endpoints across 6 groups, request/response formats, and error handling.
> Base URL: `/api`
> Content-Type: `application/json`
> Authentication: Session-based (express-session) via GitHub OAuth

---

## 1. Response Format

All endpoints return a consistent envelope:

```typescript
// Success
{
  "data": T,
  "meta"?: { cursor?: string, hasMore?: boolean }
}

// Error
{
  "error": {
    "code": string,      // machine-readable (e.g. "VALIDATION_ERROR")
    "message": string    // human-readable description
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST (resource created) |
| `400` | Bad Request | Validation error (zod) |
| `401` | Unauthorized | Not logged in |
| `403` | Forbidden | Not allowed to perform action |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate (e.g. already starred, already following) |
| `429` | Too Many Requests | Rate limit exceeded (LLM endpoints) |
| `500` | Internal Server Error | Unexpected server error |

---

## 2. Authentication

### GET `/api/auth/github`

Redirects to GitHub OAuth consent screen.

**Query Parameters:** none

**Response:** `302 Redirect` to `https://github.com/login/oauth/authorize` with client_id, redirect_uri, scope, state parameters.

---

### GET `/api/auth/github/callback`

Handles GitHub OAuth callback. Exchanges code for access token, creates/finds user, sets session.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| code | string | Authorization code from GitHub |
| state | string | CSRF state parameter |

**Success (existing user):** `302 Redirect` to `/`
**Success (new user):** `302 Redirect` to `/setup`
**Error (denied):** `302 Redirect` to `/login?error=denied`
**Error (state mismatch):** `302 Redirect` to `/login?error=state_mismatch`

---

### POST `/api/auth/setup`

Complete profile setup for new GitHub users.

**Auth:** Required (partial session from OAuth)

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | Yes | CLItoris username (3+ chars, [a-z0-9_]) |
| displayName | string | No | Display name (max 50 chars) |
| bio | string | No | Bio text (max 300 chars) |

**Success Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "username": "jiyeon_dev",
    "displayName": "Jiyeon Kim",
    "bio": "full-stack dev",
    "avatarUrl": "https://github.com/...",
    "githubUsername": "jiyeon-kim"
  }
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| 400 | Username too short or invalid characters |
| 409 | Username already taken |

---

### POST `/auth/logout`

Destroy the current session.

**Response:** `200 OK`
```json
{
  "data": { "message": "Logged out" }
}
```

---

### GET `/auth/me`

Get the currently authenticated user.

**Response:** `200 OK`
```json
{
  "data": {
    "id": "01912345-6789-7abc-def0-123456789abc",
    "username": "jiyeon_dev",
    "displayName": "Jiyeon",
    "domain": "jiyeon.kim",
    "bio": "Building terminal.social",
    "avatarUrl": null,
    "createdAt": "2026-03-19T12:00:00Z"
  }
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| `401` | Not logged in |

---

### PUT `/auth/me`

Update the current user's profile. Requires authentication.

**Request:**
```json
{
  "displayName": "New Display Name",
  "domain": "newdomain.dev",
  "bio": "Updated bio text",
  "avatarUrl": "https://example.com/avatar.png"
}
```

**Validation (zod):**
```
displayName:  string, min 1, max 50 (optional)
domain:       string, valid domain format or null (optional)
bio:          string, max 300 (optional)
avatarUrl:    string, valid URL or null (optional)
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "01912345-6789-7abc-def0-123456789abc",
    "username": "jiyeon_dev",
    "displayName": "New Display Name",
    "domain": "newdomain.dev",
    "bio": "Updated bio text",
    "avatarUrl": "https://example.com/avatar.png",
    "createdAt": "2026-03-19T12:00:00Z"
  }
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| `400` | Validation error (invalid domain format, bio too long) |
| `401` | Not authenticated |

---

### DELETE `/auth/me`

Delete the current user's account permanently. Requires authentication. This action is irreversible — all posts, stars, and follows are deleted.

**Request:** No body required. Server validates session.

**Response:** `200 OK`
```json
{
  "data": { "message": "Account deleted" }
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| `401` | Not authenticated |
| `500` | Deletion failed (server error) |

---

## 3. Posts

### POST `/posts`

Create a new post. Requires authentication.

**Request:**
```json
{
  "messageRaw": "CLI is the new lingua franca. Think in any language, post in any language.",
  "messageCli": "post --user=0xmitsuki.sh --lang=en --message=\"CLI flags as universal language layer\" --tags=cli-first --visibility=public",
  "lang": "en",
  "tags": ["cli-first"],
  "mentions": [],
  "visibility": "public",
  "llmModel": "claude-sonnet"
}
```

**Validation (zod):**
```
messageRaw:  string, min 1, max 2000
messageCli:  string, min 1, max 4000
lang:        string, length 2 (ISO 639-1)
tags:        string[], max 10 items, each max 50 chars
mentions:    string[], max 20 items
visibility:  enum ["public", "private", "unlisted"]
llmModel:    enum ["claude-sonnet", "gpt-4o", "gemini-2.5-pro", "llama-3", "cursor", "cli", "api", "custom"]
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "01912345-aaaa-7bbb-cccc-dddddddddddd",
    "userId": "01912345-6789-7abc-def0-123456789abc",
    "messageRaw": "CLI is the new lingua franca...",
    "messageCli": "post --user=0xmitsuki.sh ...",
    "lang": "en",
    "tags": ["cli-first"],
    "mentions": [],
    "visibility": "public",
    "llmModel": "claude-sonnet",
    "parentId": null,
    "forkedFromId": null,
    "createdAt": "2026-03-19T12:30:00Z",
    "user": {
      "username": "0xmitsuki",
      "domain": "mitsuki.sh",
      "displayName": "Mitsuki",
      "avatarUrl": null
    },
    "starCount": 0,
    "replyCount": 0,
    "forkCount": 0,
    "isStarred": false
  }
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| `400` | Validation error |
| `401` | Not authenticated |

---

### GET `/posts/feed/global`

Get the global public feed. No authentication required.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `cursor` | string | — | ISO timestamp for pagination (created_at of last item) |
| `limit` | number | `20` | Items per page (max 50) |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "01912345-aaaa-7bbb-cccc-dddddddddddd",
      "userId": "01912345-6789-7abc-def0-123456789abc",
      "messageRaw": "CLI is the new lingua franca...",
      "messageCli": "post --user=0xmitsuki.sh ...",
      "lang": "en",
      "tags": ["cli-first"],
      "mentions": [],
      "visibility": "public",
      "llmModel": "claude-sonnet",
      "parentId": null,
      "forkedFromId": null,
      "createdAt": "2026-03-19T12:30:00Z",
      "user": {
        "username": "0xmitsuki",
        "domain": "mitsuki.sh",
        "displayName": "Mitsuki",
        "avatarUrl": null
      },
      "starCount": 31,
      "replyCount": 9,
      "forkCount": 3,
      "isStarred": false
    }
  ],
  "meta": {
    "cursor": "2026-03-19T12:29:00Z",
    "hasMore": true
  }
}
```

---

### GET `/posts/feed/local`

Get feed from followed users. Requires authentication.

**Query Parameters:** Same as global feed.

**Response:** Same shape as global feed.

**Errors:**
| Code | Condition |
|------|-----------|
| `401` | Not authenticated |

---

### GET `/posts/:id`

Get a single post by ID.

**Response:** `200 OK`
```json
{
  "data": {
    "id": "01912345-aaaa-7bbb-cccc-dddddddddddd",
    "userId": "...",
    "messageRaw": "...",
    "messageCli": "...",
    "lang": "en",
    "tags": ["cli-first"],
    "mentions": [],
    "visibility": "public",
    "llmModel": "claude-sonnet",
    "parentId": null,
    "forkedFromId": null,
    "createdAt": "2026-03-19T12:30:00Z",
    "user": { "username": "...", "domain": "...", "displayName": "...", "avatarUrl": "..." },
    "starCount": 31,
    "replyCount": 9,
    "forkCount": 3,
    "isStarred": true,
    "forkedFrom": null,
    "replies": [
      {
        "id": "...",
        "messageRaw": "...",
        "messageCli": "...",
        "user": { "username": "...", "displayName": "..." },
        "createdAt": "...",
        "starCount": 2,
        "replyCount": 0,
        "forkCount": 0
      }
    ]
  }
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| `404` | Post not found |

---

### POST `/posts/:id/reply`

Reply to a post. Requires authentication.

**Request:**
```json
{
  "messageRaw": "Totally agree!",
  "messageCli": "reply --to=01912345-aaaa --message=\"Totally agree!\" --lang=en",
  "lang": "en",
  "tags": [],
  "mentions": [],
  "visibility": "public",
  "llmModel": "claude-sonnet"
}
```

**Response:** `201 Created` — Same shape as POST `/posts` response, with `parentId` set.

**Errors:**
| Code | Condition |
|------|-----------|
| `400` | Validation error |
| `401` | Not authenticated |
| `404` | Parent post not found |

---

### POST `/posts/:id/fork`

Fork a post to your timeline. Requires authentication.

**Request:** No body required. The original post is cloned.

**Response:** `201 Created`
```json
{
  "data": {
    "id": "new-forked-post-id",
    "userId": "current-user-id",
    "messageRaw": "...",
    "messageCli": "...",
    "forkedFromId": "original-post-id",
    "createdAt": "2026-03-19T13:00:00Z",
    "user": { "username": "...", "displayName": "..." },
    "starCount": 0,
    "replyCount": 0,
    "forkCount": 0,
    "isStarred": false
  }
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| `401` | Not authenticated |
| `404` | Original post not found |
| `409` | Already forked this post |

---

### POST `/posts/:id/star`

Toggle star on a post. Requires authentication.

**Request:** No body required.

**Response:** `200 OK`
```json
{
  "data": {
    "starred": true,
    "starCount": 32
  }
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| `401` | Not authenticated |
| `404` | Post not found |

---

### DELETE `/posts/:id`

Delete a post. Requires authentication. Only the author can delete.

**Response:** `200 OK`
```json
{
  "data": { "message": "Post deleted" }
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| `401` | Not authenticated |
| `403` | Not the author |
| `404` | Post not found |

---

### GET `/posts/by-llm/:model`

Get posts filtered by LLM model.

**Path Parameters:**
| Param | Values |
|-------|--------|
| `model` | `claude-sonnet`, `gpt-4o`, `gemini-2.5-pro`, `llama-3`, `cursor`, `cli`, `api`, `custom` |

**Query Parameters:** Same as global feed (`cursor`, `limit`).

**Response:** Same shape as global feed.

---

## 4. Users

### GET `/users/@:username`

Get a user's profile.

**Response:** `200 OK`
```json
{
  "data": {
    "id": "01912345-6789-7abc-def0-123456789abc",
    "username": "jiyeon_dev",
    "domain": "jiyeon.kim",
    "displayName": "Jiyeon",
    "bio": "Building terminal.social",
    "avatarUrl": null,
    "createdAt": "2026-03-19T12:00:00Z",
    "followerCount": 128,
    "followingCount": 45,
    "postCount": 67,
    "isFollowing": false
  }
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| `404` | User not found |

---

### GET `/users/@:username/posts`

Get a user's posts.

**Query Parameters:** Same as global feed (`cursor`, `limit`).

**Response:** Same shape as global feed.

**Errors:**
| Code | Condition |
|------|-----------|
| `404` | User not found |

---

### GET `/users/@:username/starred`

Get posts starred by a user.

**Query Parameters:** Same as global feed (`cursor`, `limit`).

**Response:** Same shape as global feed.

---

### POST `/users/@:username/follow`

Toggle follow on a user. Requires authentication.

**Request:** No body required.

**Response:** `200 OK`
```json
{
  "data": {
    "following": true,
    "followerCount": 129
  }
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| `400` | Cannot follow yourself |
| `401` | Not authenticated |
| `404` | User not found |

---

### GET `/api/users/@:username/repos`

Returns the user's pinned GitHub repositories.

**Auth:** No

**Response (200):**
```json
{
  "data": [
    {
      "name": "CLItoris",
      "owner": "ccivlcid",
      "description": "CLI-themed SNS",
      "stars": 42,
      "forks": 12,
      "language": "TypeScript",
      "url": "https://github.com/ccivlcid/CLItoris"
    }
  ]
}
```

---

## 5. LLM

### POST `/llm/transform`

Transform natural language to CLI format. Requires authentication.
Rate limited: 30 requests per minute per user.

**Request:**
```json
{
  "message": "CLI is the new lingua franca. Think in any language, post in any language.",
  "model": "claude-sonnet",
  "lang": "en"
}
```

**Validation (zod):**
```
message:  string, min 1, max 2000
model:    enum ["claude-sonnet", "gpt-4o", "gemini-2.5-pro", "llama-3", "cursor", "cli", "api", "custom"]
lang:     string, length 2
```

**Response:** `200 OK`
```json
{
  "data": {
    "messageCli": "post --user=0xmitsuki.sh --lang=en --message=\"CLI flags as universal language layer\" --tags=cli-first --visibility=public",
    "model": "claude-sonnet",
    "tokensUsed": 142
  }
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| `400` | Validation error |
| `401` | Not authenticated |
| `429` | Rate limit exceeded |
| `500` | LLM API error |

---

### GET `/llm/providers`

Get available LLM providers with auto-detection status. No authentication required.

**Response:** `200 OK`
```json
{
  "data": [
    { "provider": "anthropic", "source": "env:ANTHROPIC_API_KEY", "isAvailable": true },
    { "provider": "gemini", "source": "file:~/.config/gcloud/application_default_credentials.json", "isAvailable": true },
    { "provider": "openai", "source": null, "isAvailable": false },
    { "provider": "ollama", "source": "localhost:11434", "isAvailable": true },
    { "provider": "cli:claude", "source": "path:claude", "isAvailable": true }
  ]
}
```

> Credential auto-detection logic: see `docs/llm/LLM_INTEGRATION.md` section 7.

---

### GET `/api/llm/local-models`

Returns locally installed LLM models (Ollama).

**Auth:** Yes

**Response (200):**
```json
{
  "data": [
    { "name": "llama-3-8b", "size": "4.7GB", "quantization": "Q4", "provider": "ollama" }
  ]
}
```

---

## 6. GitHub

### POST `/api/auth/github/sync`

Manually sync profile data from GitHub.

**Auth:** Yes

**Response (200):**
```json
{
  "data": {
    "synced": true,
    "syncedAt": "2026-03-20T10:30:00Z",
    "updated": ["avatarUrl", "bio"]
  }
}
```

---

### GET `/api/github/trending-repos`

Returns repos most mentioned in posts this week.

**Auth:** No

**Response (200):**
```json
{
  "data": [
    {
      "owner": "vercel",
      "name": "next.js",
      "mentionCount": 12,
      "topTags": ["framework", "react"]
    }
  ]
}
```

---

## 7. Analyze

### POST `/api/analyze`

Start a repo analysis.

**Auth:** Yes

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| repoOwner | string | Yes | GitHub repo owner |
| repoName | string | Yes | GitHub repo name |
| outputType | string | Yes | `report`, `pptx`, or `video` |
| llmModel | string | Yes | LLM model to use |
| lang | string | No | Output language (default: `en`) |
| options | object | No | Output-specific options |

**Success Response (202):**
```json
{
  "data": {
    "id": "analysis-uuid",
    "status": "processing",
    "progressUrl": "/api/analyze/analysis-uuid/progress"
  }
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| 404 | Repository not found |
| 413 | Repository too large (>500MB) |
| 429 | Analysis rate limit exceeded |

---

### GET `/api/analyze/:id`

Get analysis result.

**Auth:** Yes

**Response (200):**
```json
{
  "data": {
    "id": "analysis-uuid",
    "repoOwner": "vercel",
    "repoName": "next.js",
    "outputType": "report",
    "status": "completed",
    "resultUrl": "/api/analyze/analysis-uuid/download",
    "resultSummary": "Production-grade React framework...",
    "durationMs": 12300,
    "createdAt": "2026-03-20T10:00:00Z"
  }
}
```

---

### GET `/api/analyze`

List user's analyses.

**Auth:** Yes

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| cursor | string | - | Pagination cursor |
| limit | number | 20 | Page size (max 50) |

**Response (200):**
```json
{
  "data": [...],
  "meta": { "cursor": "next-cursor", "hasMore": true }
}
```

---

## 8. Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /llm/transform` | 30 requests | 1 minute |
| `POST /api/auth/github/callback` | 10 requests | 1 minute |
| `POST /api/auth/setup` | 5 requests | 1 minute |
| `POST /api/analyze` | 10 requests | 1 hour |
| All other endpoints | 120 requests | 1 minute |

Rate limit headers included in every response:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 28
X-RateLimit-Reset: 1710849600
```

### Rate Limit Response Format

When rate limits are exceeded, the API returns a `429` response with a structured error body:

```json
// 429 Too Many Requests response:
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Try again in 45 seconds.",
    "retryAfter": 45
  }
}
```

The `Retry-After` HTTP header is also set (in seconds).

### Retry Logic Pattern

Client-side retry strategy for handling rate limits and server errors:

```
Client retry strategy:
1. On 429: read Retry-After header or error.retryAfter field
2. Wait the specified seconds
3. Retry once
4. On second 429: show error toast, do not retry

On 500/network error:
1. Wait 2 seconds
2. Retry once
3. On second failure: show error toast
```

### Error Response Examples

Standard error responses for each HTTP error code:

```json
// 400 Bad Request
{ "error": { "code": "VALIDATION_ERROR", "message": "message: String must contain at least 1 character(s)" } }

// 401 Unauthorized
{ "error": { "code": "UNAUTHORIZED", "message": "Login required" } }

// 403 Forbidden
{ "error": { "code": "FORBIDDEN", "message": "Not the author of this post" } }

// 404 Not Found
{ "error": { "code": "NOT_FOUND", "message": "Post not found" } }

// 409 Conflict
{ "error": { "code": "CONFLICT", "message": "Already starred this post" } }
```

---

## 9. Pagination

All list endpoints use **cursor-based pagination**:

- Pass `cursor` (ISO timestamp of the last item's `createdAt`) to get the next page
- Response includes `meta.cursor` for the next page and `meta.hasMore` boolean
- Default `limit` is 20, maximum is 50
- First request: omit `cursor` to get the latest items

```
GET /api/posts/feed/global
GET /api/posts/feed/global?cursor=2026-03-19T12:29:00Z&limit=20
GET /api/posts/feed/global?cursor=2026-03-19T12:15:00Z&limit=20
```

---

## 10. Endpoint Summary

29 endpoints across 6 groups.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| **Auth** | | | |
| `GET` | `/api/auth/github` | No | Initiate GitHub OAuth |
| `GET` | `/api/auth/github/callback` | No | OAuth callback |
| `POST` | `/api/auth/setup` | Partial | Complete profile setup |
| `POST` | `/auth/logout` | Yes | Logout |
| `GET` | `/auth/me` | Yes | Current user |
| `PUT` | `/auth/me` | Yes | Update profile |
| `DELETE` | `/auth/me` | Yes | Delete account |
| **Posts** | | | |
| `POST` | `/posts` | Yes | Create post |
| `GET` | `/posts/feed/global` | No | Global feed |
| `GET` | `/posts/feed/local` | Yes | Local feed |
| `GET` | `/posts/:id` | No | Single post |
| `POST` | `/posts/:id/reply` | Yes | Reply to post |
| `POST` | `/posts/:id/fork` | Yes | Fork post |
| `POST` | `/posts/:id/star` | Yes | Toggle star |
| `DELETE` | `/posts/:id` | Yes | Delete post |
| `GET` | `/posts/by-llm/:model` | No | Posts by LLM |
| **Users** | | | |
| `GET` | `/users/@:username` | No | User profile |
| `GET` | `/users/@:username/posts` | No | User posts |
| `GET` | `/users/@:username/starred` | No | User starred |
| `POST` | `/users/@:username/follow` | Yes | Toggle follow |
| `GET` | `/api/users/@:username/repos` | No | User's GitHub repos |
| **LLM** | | | |
| `POST` | `/llm/transform` | Yes | LLM transformation |
| `GET` | `/llm/providers` | No | Available LLM providers |
| `GET` | `/api/llm/local-models` | Yes | Local Ollama models |
| **GitHub** | | | |
| `POST` | `/api/auth/github/sync` | Yes | Sync profile from GitHub |
| `GET` | `/api/github/trending-repos` | No | Trending repos in posts |
| **Analyze** | | | |
| `POST` | `/api/analyze` | Yes | Start repo analysis |
| `GET` | `/api/analyze/:id` | Yes | Get analysis result |
| `GET` | `/api/analyze` | Yes | List user's analyses |

---

## See Also

- [api-schema.json](./api-schema.json) — OpenAPI 3.1 machine-readable schema
- [DATABASE.md](./DATABASE.md) — Database schema backing these endpoints
- [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) — Request lifecycle and error flows
- [TESTING.md](../testing/TESTING.md) — API route test patterns
