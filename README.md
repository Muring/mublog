# 📝 Mublog

**프론트엔드를 꿈꾸는 세일즈포스 개발자의 기술 블로그**

<br>

## ✨ 소개

Mublog는 **Next.js App Router 기반 기술 블로그**입니다.

처음에는 MDX 파일을 Contentlayer로 읽는 정적 블로그였습니다.
글 하나를 올리려면 Notion에서 쓰고 → 마크다운으로 변환하고 → mdx 파일을 만들고 → 커밋하고 → 재배포해야 했습니다.
지금은 **포스트가 DB에 있고, 브라우저에서 쓰고 발행하면 재배포 없이 반영**됩니다.

글쓰기 권한은 소유자만 가지며, 다른 사용자는 GitHub으로 로그인해 **댓글**을 남길 수 있습니다.

전환하면서 Contentlayer는 완전히 제거했고, 마크다운 → HTML 파이프라인을 직접 구성해
기존 25개 글의 렌더 결과가 바뀌지 않도록 맞췄습니다.

<br>

## 📦 배포

- [mublog 링크 바로가기](https://muring-blog.vercel.app/)

<br>

## 🔧 기술 스택

| 분야         | 기술                                                        |
| ------------ | ----------------------------------------------------------- |
| 프레임워크   | Next.js 16 (App Router, Turbopack)                          |
| 언어         | TypeScript 5.9                                               |
| UI           | React 19                                                     |
| 스타일링     | Emotion, CSS 변수 기반 테마, next-themes                     |
| 데이터베이스 | Supabase (PostgreSQL)                                        |
| ORM          | Prisma 7 (`@prisma/adapter-pg` 드라이버 어댑터)              |
| 인증         | Supabase Auth (GitHub OAuth) + `@supabase/ssr`               |
| 파일 저장소  | Supabase Storage                                             |
| 서버 상태    | TanStack Query 5                                             |
| 검증         | Zod 4                                                        |
| 본문 렌더링  | unified (remark / rehype) + refractor 기반 Prism 하이라이팅  |
| 배포         | Vercel (Hobby) + Vercel Cron                                 |

> 무료 티어(Supabase Free + Vercel Hobby)에서 돌아가는 것을 전제로 설계했습니다.
> 이 제약이 스키마와 집계 방식에 그대로 반영되어 있습니다.

<br>

## 📁 주요 기능

### 읽기

- [x] 📚 **포스트 목록·상세** (SSG + ISR)
- [x] 🏷 **태그 필터링**
- [x] 🔗 **연관 글 캐러셀**, 최근 본 글
- [x] 🎨 **다크모드 토글**
- [x] 🐢 **Lazy Loading** (그리드 콘텐츠)
- [x] 📱 **반응형** — 카드 최소 폭에서 열 수를 거꾸로 계산
- [x] 🃏 **포스트 카드** — 썸네일·태그·제목·설명·날짜·조회수·댓글수를 담고 높이가 모두 같음

### 쓰기 (관리자 전용)

- [x] ✏️ **웹 에디터** — 마크다운 + 실시간 미리보기
- [x] 🖼 **이미지 업로드** — 드래그&드롭 / 붙여넣기
- [x] 📝 **초안 / 공개** 상태 관리
- [x] ⚡ **재배포 없이 반영** (`revalidateTag`)
- [x] 🔎 **목록 검색** — 제목·주소·태그로 거르기 (표는 자기 안에서 스크롤)
- [x] 📈 **방문자 추이 차트** — Daily · Weekly · Monthly(연도 선택)
- [x] 🧭 **좁은 화면 대응** — 관리 표는 열을 접다 카드로, 에디터는 본문/미리보기 탭으로

### 참여

- [x] 🔐 **GitHub 로그인**
- [x] 💬 **댓글 · 답글** (2단, 낙관적 갱신)
- [x] 📊 **방문자 수 · 조회수 집계**
- [x] 🔒 **개인정보 처리방침** (`/privacy`) — 저장하는 것과 쿠키 세 개를 그대로 적음

<br>

---

# 🏗 아키텍처

## 데이터베이스

Supabase의 PostgreSQL 하나를 씁니다. `public` 스키마만 Prisma가 관리하고,
`auth` 스키마는 Supabase 소유이므로 건드리지 않습니다.

### 모델

| 모델        | 역할                                                            |
| ----------- | --------------------------------------------------------------- |
| `Profile`   | `auth.users`의 미러. 사용자명·아바타·권한(`role`)                |
| `Post`      | 포스트. 마크다운 원문과 렌더된 HTML을 함께 보관                  |
| `Comment`   | 댓글. 자기참조 `parentId`로 답글, soft delete(`deletedBy`로 관리자 삭제 구분) |
| `DailyStat` | 사이트 전체 방문 집계. KST 기준 **하루 1행**                     |

### 설계 결정과 근거

**`Profile`을 `auth.users`와 Prisma 관계로 묶지 않습니다.**
`multiSchema`로 모델링하면 `prisma migrate`가 Supabase 소유 스키마에 손댑니다.
대신 FK와 동기화 트리거(`on_auth_user_created`)를 **raw SQL 마이그레이션**으로 넣어,
제약은 DB에 두고 Prisma Migrate는 `public`에만 가둡니다.

**태그는 `String[]` 컬럼이고 조인 테이블이 아닙니다.**
포스트 25개·태그 6종·작성자 1명이며 태그에 별도 메타데이터가 없습니다.
조인 테이블은 모든 목록 쿼리에 조인을 더하고 컴포넌트가 쓰는 `tags: string[]` 형태를 깨뜨립니다.
검색은 GIN 인덱스로 충분하고, 태그 이름 변경은 25행 `UPDATE` 하나입니다.

**`Post.contentMd`와 `contentHtml`을 둘 다 저장합니다.**
HTML은 저장 시점에 한 번만 렌더합니다. 읽기 경로에서 마크다운을 파싱하지 않습니다.

**`commentCount` / `viewCount`는 비정규화했습니다.**
목록 렌더마다 `_count` 서브쿼리를 돌리지 않기 위해서고,
댓글 insert/delete와 **같은 트랜잭션**에서 갱신해 어긋나지 않게 합니다.

**댓글은 soft delete입니다.**
hard delete하면 달려 있던 답글이 함께 사라집니다. 행은 남기고 API가 본문과 작성자를 가립니다.

**방문 통계는 하루 정수 한 개입니다.**
요청당 행을 남기지 않습니다 — 무료 티어 500MB를 갉아먹는 유일한 벡터입니다.
연 365행(약 20KB)이고, 총 방문자는 `SUM(visitors)`입니다.

### 인덱스

```
posts     (status, published_at DESC)   -- 목록 정렬
posts     GIN (tags)                     -- 태그 필터
comments  (post_id, created_at)          -- 스레드 조회
comments  (author_id, created_at)        -- 레이트 리밋 카운트
```

### 접속 경로

Prisma 7은 접속 URL을 스키마가 아니라 `prisma.config.ts`에 둡니다.
런타임 접속은 `PrismaClient`에 넘기는 드라이버 어댑터(`@prisma/adapter-pg`)가 담당합니다.

| 용도                 | 포트                     | 비고                                    |
| -------------------- | ------------------------ | --------------------------------------- |
| 앱 런타임            | **6543** Transaction 풀러 | `?pgbouncer=true&connection_limit=1` 필수 |
| 마이그레이션         | **5432** Session 풀러     | `db.<ref>...:5432`는 IPv6 전용이라 CI 실패 |

<br>

## 백엔드

Route Handler와 서버 컴포넌트가 전부입니다. 별도 서버는 없습니다.

### 계층

```
Route Handler  ──▶  lib/*.ts (도메인 로직)  ──▶  Prisma  ──▶  Postgres
      │                     │
      │                     └── unstable_cache + 태그 (읽기 경로)
      └── requireAdminApi / parseBody(zod)
```

- **`lib/posts.ts`** — 읽기 전용 데이터 접근 계층. 모든 조회를 `unstable_cache`로 감싸고
  `posts:list` / `post:<slug>` 태그를 답니다. 여기서 `Date`를 ISO 문자열로 바꿔
  클라이언트 컴포넌트까지 `Date` 객체가 새어 hydration이 어긋나는 것을 막습니다.
- **`lib/comments.ts`** — 댓글 CRUD, 2단 깊이 강제, soft delete, 도배 방지
- **`lib/stats.ts`** — 방문·조회 집계, KST 날짜 키, 차트용 일별 추이
- **`lib/auth.ts`** — 세션 조회와 권한 확인 (`requireAdmin` / `requireAdminApi`)
- **`lib/api.ts`** — 라우트 헬퍼. `parseBody`가 zod로 본문을 검증하고 실패 시
  `HttpError(400)`을 던지면, `handleApiError`가 한 곳에서 응답으로 바꿉니다.
  요청을 **보내는** 쪽은 `lib/fetcher.ts`로 방향이 반대입니다.
- **`lib/revalidate.ts`** — 포스트 변경 후 캐시 무효화
- **`lib/queries.ts`** — 클라이언트 쿼리 키와 페처. 키를 컴포넌트마다 문자열로 적으면
  같은 데이터를 두 이름으로 부르게 되고, 무엇보다 데이터 계약이 UI 파일에 얹힙니다.
  실제로 `stats/VisitTracker`가 `post/PostViews`를, `comments/Comments`가
  `layout/HeaderAuth`를 import하고 있었습니다. 계약을 여기 두면 그 화살표가 사라집니다.

### API

| 라우트                            | 메서드            | 권한        |
| --------------------------------- | ----------------- | ----------- |
| `/api/posts/summary`              | GET               | 공개        |
| `/api/posts/[slug]/comments`      | GET, POST         | 조회 공개 / 작성 로그인 |
| `/api/posts/[slug]/views`         | POST              | 공개        |
| `/api/comments/[id]`              | PATCH, DELETE     | 본인 (삭제는 관리자도) |
| `/api/stats`, `/api/visit`        | GET / POST        | 공개        |
| `/api/me`                         | GET               | 공개        |
| `/api/admin/posts`                | POST              | **관리자**  |
| `/api/admin/posts/[id]`           | PATCH, DELETE     | **관리자**  |
| `/api/admin/slug-check`           | GET               | **관리자**  |
| `/api/admin/upload`               | POST              | **관리자**  |
| `/api/cron/daily`                 | GET               | `CRON_SECRET` |

### 렌더링·캐싱 전략

댓글과 방문자 수를 의도적으로 클라이언트 페치로 두어,
본질적으로 동적인 두 기능이 이를 담는 페이지까지 동적으로 만들지 않게 했습니다.

| 라우트                       | 모드                                   | 무효화                              |
| ---------------------------- | -------------------------------------- | ----------------------------------- |
| `/`                          | Static + ISR 3600s                     | `posts:list` + `revalidatePath("/")` |
| `/privacy`                   | 완전 정적                              | —                                   |
| `/[slug]`                    | `generateStaticParams` + ISR 3600s     | `post:<slug>` (**이름 바꾸면 옛 slug도**) |
| `/about`                     | 완전 정적                              | —                                   |
| `/admin/**`                  | `force-dynamic`                        | —                                   |
| `/api/posts/summary`         | ISR 3600s, `posts:list`                | 포스트 변경 · **댓글 작성/삭제**    |
| `/api/posts/[slug]/comments` | 캐시 안 함                             | TanStack Query                      |
| `/api/stats`                 | ISR 60s                                | 시간                                |
| `/api/visit`, `/api/me`      | `force-dynamic`                        | —                                   |

`/api/stats`와 `/api/me`는 홈이 그려진 **뒤에** 클라이언트가 부르는 값이라,
서버리스에서는 각각이 콜드 스타트와 DB 연결을 따로 겪습니다. 그래서 둘을 다르게 다룹니다.

- `/api/stats`는 사용자별 값이 아니므로 60초 ISR로 두어 함수가 아예 깨어나지 않게 합니다.
  방문자 본인의 숫자는 `/api/visit` 응답이 TanStack Query 캐시에 직접 심어 즉시 맞춥니다
  (그때 진행 중인 `/api/stats` 요청은 `cancelQueries`로 끊습니다. 캐시된 옛 값이 늦게
  도착해 방금 올린 숫자를 되돌리는 것을 막기 위해서입니다).
- `/api/me`는 사용자별이라 캐시할 수 없습니다. 대신 `getDisplayProfile()`이
  `getClaims()`로 JWT 서명만 로컬 검증해 Auth 서버 왕복 하나를 없앱니다.
  인가는 여전히 `getProfile()`(`getUser()` 기반)이 담당합니다 — 아래 인증 절 참고.

`generateStaticParams`는 빌드 시점에 DB를 조회하므로 `try/catch`로 감싸
정지된 Supabase나 빌드 환경의 `DATABASE_URL` 누락이 배포를 깨지 않게 하고,
실패하면 온디맨드 렌더로 degrade시킵니다.

**이것이 "재배포 없이 새 글이 보이는" 메커니즘입니다.**
`generateStaticParams`는 빌드 시점 것만 프리렌더하고, `dynamicParams`(기본 true)가
새 slug를 첫 요청에 렌더하며, `revalidateTag`가 기존 것을 갱신합니다.

### 마크다운 파이프라인

```
remarkParse → remarkGfm → remarkRehype(allowDangerousHtml)
            → rehypeRaw → rehypeSlug → rehypePrism(refractor) → rehypeStringify
```

- `rehypeRaw`는 반드시 `remarkRehype` **뒤**, `rehypePrism` **앞**이어야 합니다.
  그 전까지 `<aside>` 같은 raw HTML은 불투명한 문자열 노드라 Prism이 볼 수 없습니다.
- `refractor`는 `lib/core.js`에 필요한 언어만 **명시적으로 등록**합니다.
  `common` 번들에는 jsx·tsx가 없어서 그대로 쓰면 코드블록 72개가 조용히 깨집니다
  (`ignoreMissing: true`가 오류를 삼켜 무증상 회귀가 됩니다).
- 등록 순서가 중요합니다. `js-extras`는 `javascript` 뒤, `jsx`/`tsx` **앞**이어야 합니다.
  jsx/tsx가 등록 시점에 javascript의 정의를 복사해가기 때문입니다.
- `normalizeCallouts()`가 `<aside>` 앞뒤에 빈 줄을 넣습니다.
  MDX는 이를 JSX flow element로 파싱해 내부 마크다운을 처리했지만,
  CommonMark는 다음 빈 줄까지 전부 raw HTML로 삼켜 `**굵게**`가 문자 그대로 렌더됩니다.

`yarn verify:render`가 이 12가지를 회귀 검사합니다.

### 권한과 보안

**관리자 판별은 `profiles.role` 컬럼이 유일한 진실입니다.**
환경변수로 GitHub id를 비교하는 방식을 쓰지 않은 이유는,
그 자연스러운 구현이 `user.user_metadata.provider_id`를 보는데
**`user_metadata`는 사용자가 직접 쓸 수 있기 때문**입니다.
아무 로그인 사용자나 `updateUser({ data: { provider_id: ... } })`로 관리자가 될 수 있습니다.

**모든 테이블에 정책 없는 RLS를 켰습니다.**
저장소가 public이라 publishable key가 번들에 노출되고,
Supabase는 `public` 테이블을 PostgREST로 자동 노출합니다.
정책이 하나도 없는 RLS를 켜면 익명 접근이 전부 막히고,
Prisma는 `postgres` 롤로 붙어 RLS를 우회하므로 앱은 영향받지 않습니다.

**`/admin`은 403이 아니라 404를 반환합니다.** public 저장소에서 존재를 확인시켜주지 않습니다.

**인가는 `layout.tsx`가 아니라 각 `page.tsx`에서 합니다.** 레이아웃에서 `await`하면
그것이 끝날 때까지 껍데기가 흘러나가지 못합니다. `loading.tsx`는 페이지의 Suspense
폴백이라 레이아웃 안쪽에 있어서 함께 막히고, 그 사이 브라우저는 이전 화면에 머뭅니다 —
"관리를 눌렀는데 홈에 몇 초 있다가 넘어간다"가 이것이었습니다.
경계는 그대로입니다. 데이터를 그리는 것은 페이지이고, 그 전에 `requireAdmin()`이
통과해야 하며, 로그인하지 않은 사람은 `proxy.ts`가 이미 `/login`으로 돌려보냅니다.

**댓글은 평문으로 저장·렌더합니다.** (`white-space: pre-wrap`)
URL만 정규식으로 분리해 `<a rel="nofollow ugc noopener noreferrer">` **엘리먼트**를 만듭니다 — HTML 문자열이 아닙니다.
저장형 XSS 표면을 sanitize로 막는 게 아니라 아예 없앴습니다.

> **포스트 본문과의 비대칭:** 포스트는 sanitize하지 **않습니다.**
> 작성자가 소유자 한 명이고 서버에서 `requireAdmin`으로 강제되며,
> `rehype-sanitize` 기본 스키마는 지금 지키려는 `<aside>` 콜아웃을 제거해버립니다.

**도배 방지는 DB 카운트로 합니다.** 인메모리 `Map`은 서버리스 인스턴스 간에 동작하지 않습니다.

| 규칙                     | 응답  |
| ------------------------ | ----- |
| 1분에 3개 이상           | `429` |
| 1시간에 20개 이상        | `429` |
| 직전 댓글과 본문이 동일  | `429` |

`@@index([authorId, createdAt])`를 쓰므로 밀리초 수준입니다.

**이미지 업로드는 반드시 자체 라우트를 경유합니다.**
브라우저에서 Storage로 직접 올리면 인가 경로가 둘(라우트 가드 + Storage RLS)이 됩니다.
`/api/admin/upload` 하나만 두어 `requireAdminApi`가 유일한 관문이 되게 했습니다.
secret key는 서버에서만 쓰이며 버킷에는 insert 정책이 없습니다.

### 집계 방식

| 지표          | 기준                                                             |
| ------------- | ---------------------------------------------------------------- |
| 오늘 / 누적 방문 | **순 방문자.** `mublog_seen` 쿠키가 오늘 날짜(KST)면 DB에 아예 안 씁니다 |
| 포스트 조회수 | 같은 방문자는 **30분** 안에 다시 세지 않습니다                    |

방문 기록은 `INSERT ... ON CONFLICT DO UPDATE` **단일 문장**입니다.
`prisma.upsert`가 아니라 `$executeRaw`를 쓰는 이유는 raw 형태가 레이스 없는 한 문장임이 보장되기 때문입니다.
트리거는 미들웨어가 아니라 클라이언트 이펙트입니다 — Edge에서는 Prisma가 Postgres에 닿지 못하고,
캐시된 요청을 포함한 모든 요청의 TTFB에 DB 지연이 붙습니다.

<br>

## 프론트엔드

### 서버 / 클라이언트 경계

`.styled.tsx` 24개 중 16개에는 `"use client"`가 없습니다.
따라서 이들을 import하는 컴포넌트는 **클라이언트를 벗어날 수 없습니다.**
서버 쪽은 `page.tsx` / `layout.tsx`와 데이터 접근 계층뿐입니다.

```
page.tsx (서버)  ──▶  DAL 조회  ──▶  props  ──▶  클라이언트 컴포넌트
```

`SideMenu`처럼 root layout 안에 있어 서버 props를 받을 수 없는 컴포넌트는
`/api/posts/summary`를 TanStack Query로 페치합니다.

### 상태

- **서버 데이터** — TanStack Query. `QueryClient`는 `useState`로 컴포넌트 안에서 만듭니다.
  모듈 스코프에 두면 서버에서 동시 요청 간에 공유되어 A의 캐시가 B에게 갑니다.
- **댓글** — `useOptimisticList`. `cancelQueries` → 스냅샷 → 낙관적 갱신 →
  `onError` 롤백 → `onSettled` invalidate. 작성·수정·삭제가 이 뼈대를 함께 씁니다.
  `cancelQueries`를 먼저 부르지 않으면 이미 날아간 조회가 나중에 도착해
  방금 올린 값을 도로 덮어씁니다
- **테마** — next-themes가 `html`에 `.dark`를 붙이고, 색은 전부 CSS 변수로 갈립니다

### 알림과 확인

둘 다 컨텍스트 프로바이더로 두고 훅으로 부릅니다. 화면 어디서든 같은 모양이 나옵니다.

| | 훅 | 쓰는 곳 |
|---|---|---|
| 알림 | `useToast()` | 저장·삭제 결과, 실패 문구 |
| 확인 | `useConfirm()` | 되돌릴 수 없는 동작 앞 |

```ts
if (await confirm({ title: "...", description: "...", danger: true })) { ... }
```

**브라우저의 `confirm` / `alert` / `prompt`는 쓰지 않습니다.** 테마도 폰트도 우리 것이
아니라 화면에서 혼자 튀고, 문구를 꾸밀 수 없어 "무엇이 함께 사라지는지"를 줄바꿈으로
우겨넣게 됩니다. 무엇보다 **떠 있는 동안 페이지의 자바스크립트가 통째로 멈춥니다** —
브라우저 자동화로 검증할 때 탭이 응답을 멈춰 세션이 끊깁니다.

네이티브 창이 공짜로 주던 것은 직접 챙겨야 합니다.

- `role="alertdialog"` + `aria-modal`, 제목과 설명을 `aria-labelledby` / `aria-describedby`로 연결
- **포커스는 취소에 놓습니다.** Enter를 무심코 눌렀을 때 일어나는 일이 "아무 일도 없음"이어야 합니다
- Tab을 대화상자 안에 가둡니다. 그러지 않으면 뒤에 가려진 페이지로 빠져나가 보이지 않는 곳에 포커스가 놓입니다
- Escape와 바깥 클릭으로 취소하고, 닫을 때 열었던 버튼으로 포커스를 돌려줍니다

토스트에 확인 버튼을 다는 방법도 있지만 지금의 두 자리(포스트 삭제·댓글 삭제)에는
맞지 않습니다. 토스트는 스스로 사라지는 자리라 못 보고 지나가기도 실수로 누르기도 쉽고,
포커스를 가져가지 않아 키보드로 도달하기 어렵습니다. 되돌릴 수 있는 동작이라면
그때는 토스트 쪽이 낫습니다.

### 에디터 툴바

서식 버튼은 아이콘이고, 호버·포커스하면 한글 설명이 뜹니다.

글자로 두면 "인라인코드" 같은 긴 라벨이 툴바를 밀어내고 좁은 화면에서 줄바꿈됩니다.
대신 아이콘만 두면 이름이 화면에서 사라지므로 **두 가지를 함께** 줍니다 —
눈으로 보는 사람에게는 툴팁을, 스크린리더에는 `aria-label`을.
툴팁만 두면 키보드·스크린리더 사용자는 버튼이 무엇인지 알 방법이 없습니다.

`title` 속성을 쓰지 않는 이유는 브라우저가 그리는 것이라 테마를 따르지 않고,
뜨기까지 1초 넘게 걸리기 때문입니다. `data-tip` + `::after`로 직접 그립니다.

**`B` / `I` 만 글자로 남기되 세리프를 씁니다.** 산세리프 대문자 `I`는 곧게 서 있어서
그냥 세로줄로 보이고 기울임이라는 것이 드러나지 않습니다.
다만 툴팁은 그 서식을 물려받으면 안 되므로(`::after`는 버튼의 자식입니다)
`--font-body`와 `font-style: normal`로 되돌립니다.

### 방문자 차트

관리 화면의 추이 차트는 `daily_stats`에 이미 쌓여 있는 값을 그립니다.
새로 모으는 것은 없습니다.

**꺾은선입니다.** 처음에는 막대로 그렸는데, 점 개수가 단위마다 30개와 12개로
달라지는 것이 문제였습니다. 막대 폭에 상한을 두면 남는 자리가 단위마다 달라져
간격이 어긋나 보이고, 상한을 없애면 Monthly의 막대가 슬래브처럼 두꺼워집니다.
선은 개수와 무관하게 늘 2px라 세 단위가 같은 그림으로 보입니다. 애초에
시간에 따른 추이는 선이 맞는 형태입니다.

**묶는 단위로 나눕니다.** 1년치를 하루 한 점으로 그리면 850px 안에서 한 칸이
2.3px가 되어 읽을 수도 조준할 수도 없습니다. 점을 30개 남짓으로 붙잡습니다.

| 탭 | 창 | 점 수 |
| --- | --- | --- |
| Daily | 최근 30일 | 30 |
| Weekly | 최근 12주 (월요일 시작) | 12 |
| Monthly | 고른 해의 1~12월 | 12 |

**Yearly는 두지 않았습니다.** 집계를 시작한 해가 하나뿐이라 점이 1개고, 해가
바뀌어도 2개·3개입니다. 점 하나짜리 차트는 차트가 아니라 그냥 숫자이고,
그 숫자는 접힌 줄의 "누적"이 이미 말하고 있습니다.

**같은 이유로, 점이 하나뿐인 단위는 선을 긋지 않고 숫자로 적습니다.** 이을 상대가
없어 아주 짧은 가로 선이 되고, 그 아래를 바닥까지 채운 면이 바늘처럼 솟은 막대가
됩니다 — 없는 추이를 그린 것처럼 보입니다. 집계를 막 시작해 하루치밖에 없을 때
Weekly·Monthly가 늘 이 상태입니다. 값과 "추이를 그리려면 주가 둘 이상 쌓여야
합니다"를 그림 자리에 그대로 적어, 단위를 오가도 카드 높이가 튀지 않습니다.

**Monthly는 연도를 골라 그 해의 열두 달을 전부 세웁니다.** 열두 칸을 유지해야
해가 달라져도 같은 자리에서 같은 달을 비교할 수 있습니다. 고를 수 있는 해는
기록이 있는 해뿐입니다. 전환은 서버로 왕복하지 않습니다 — 하루 1행이라 한 해가
365행이고 날짜와 숫자뿐이라, 몇 해가 쌓여도 payload가 수십 KB를 넘지 않습니다.

**기록이 없는 자리는 0으로 채우지 않습니다.** 집계 전 달이나 아직 오지 않은 달의
0은 "아무도 안 왔다"가 아니라 "세지 않았다"입니다. 그 구간에서는 **선을 끊습니다** —
앞뒤를 이어버리면 "그 사이에도 이만큼 왔다"는 없던 사실이 그려집니다. 값이 있는
점만 이어진 덩어리로 나누고 덩어리마다 선을 따로 그립니다.
반대로 기록 구간 **안쪽**의 빈 날은 진짜 0이므로 채웁니다.

**선 색은 눈으로 고르지 않았습니다.** `--chartbar`는 카드 배경 위에서 OKLCH
명도대와 3:1 대비를 통과하는 값입니다(라이트 `#0d9488` / 다크 `#14a89a`).
상태색(`--okcolor` 등)을 데이터 계열에 돌려쓰지 않습니다 — 그쪽은 "정상/주의"라는
뜻을 이미 갖고 있어서, 데이터에 쓰면 없는 의미가 생깁니다.

계열이 하나라 범례를 두지 않습니다(제목이 무엇을 그린 것인지 이미 말합니다).
왼쪽 y축에 0·절반·천장 세 눈금을 두고 연한 눈금선을 깔되, **값은 가장 높은 점
하나에만 적습니다.** 서른 개에 숫자를 다 적으면 아무도 읽지 않습니다.
나머지는 호버·포커스 툴팁이 맡습니다. 눈금 천장은 1·2·5의 배수로 올려
7이나 13 같은 읽기 나쁜 수가 축에 오지 않게 합니다. 최댓값이 같은 점이 여럿이면
첫 번째에만 적습니다 — 같은 숫자가 두 번 뜨면 어느 쪽을 말하는지 흐려집니다.

**꼭짓점은 평소에 찍지 않습니다.** 서른 개를 늘 찍으면 점이 선을 덮습니다.
대신 값마다 위아래로 꽉 찬 세로 띠를 히트 영역으로 깔아, 커서를 세로로 맞추지
않아도 툴팁과 점이 뜨게 했습니다.

**날짜 눈금은 오른쪽 끝에서부터 거꾸로 셉니다.** 앞에서부터 세면 마지막 눈금이
바로 앞 눈금에 붙습니다(30개를 4칸씩 세면 28과 29가 나란히 섭니다).

늘 보는 값이 아니라 `details`로 접어두되, 접힌 줄에 오늘과 누적을 남겨 펼치지
않아도 알 것은 알게 했습니다. 여닫는 전환은 `::details-content`에 겁니다 —
`[open]`에 keyframe을 걸면 열릴 때만 움직이고 닫힐 때는 끊깁니다.
그림이 왼쪽에서 오른쪽으로 드러나는 애니메이션(`clip-path`)은 **단위를 바꿀 때만**
돕니다. 카드가 열리는 동안에는 카드 높이도 함께 전환 중이라 두 움직임이 겹칩니다.

### 레이아웃 규칙

반복해서 문제를 일으켰던 것들을 규칙으로 굳혔습니다.

**폭 계산은 CSS에 맡깁니다.** 캐러셀은 카드 폭을 JS 상태로 들지 않습니다.
측정값을 상태로 두면 하이드레이션 전에 폭이 0이라 납작하게 그려집니다.
JS는 **몇 장 보일지**만 정하고, 폭은 `calc((100% - gap × (n-1)) / n)`로 CSS가 나눕니다.
홈 그리드도 같은 규칙을 `repeat(auto-fill, minmax(min(100%, 290px), 1fr))`로 표현합니다.

**flex·grid 아이템에는 `min-width: 0`을 답니다.**
기본값이 `auto`라 `ContentDocumentLink` 같은 안 끊기는 단어가
지정한 폭을 무시하고 아이템을 밀어냅니다.

**카드 높이는 본문 상자가 책임집니다.** 제목·설명 상자를 각각 고정하면 제목이
한 줄일 때 제목과 설명 사이가 붕 뜹니다. 본문 전체 높이만 잡아두고 글은 제 높이대로
두면, 남는 자리가 메타 줄 위 한 곳에만 모입니다. 제목은 두 줄, 설명은 세 줄에서
말줄임합니다 — 지금 글이 그 길이라서가 아니라 격자에서 각자가 가질 몫을 정한 것이고,
더 긴 글이 와도 잘릴 뿐 격자는 흐트러지지 않습니다.

**크기가 변하는 것은 자리를 미리 비워 막습니다.** 화면 안에서 무엇이 나타났다
사라질 때마다 옆이나 아래가 밀리는데, 관리 화면에서 세 번 났습니다.

- 검색 개수 글자가 길어지면 `flex: 1`인 입력창이 그만큼 줄어듭니다 → 개수 자리를
  `4rem`으로 고정합니다. 개수는 걸러진 수만 적습니다 — 전체 수는 위 통계 카드가
  이미 말하고 있습니다
- 걸러진 행이 줄어 세로 스크롤이 사라지면 표가 스크롤바 폭만큼 넓어집니다
  → `scrollbar-gutter: stable`
- 차트의 연도 드롭박스가 Monthly에서만 뜨면 컨트롤 줄이 2px 커집니다
  → 늘 두고 `visibility: hidden`으로 감춥니다 (자리는 남고 탭 순서에서는 빠집니다)

같은 이유로 차트의 **그림 높이는 `--plot-h` 한 곳에서 나옵니다.** 선이 그려질 때와
"아직 쌓이지 않았다"는 글이 뜰 때의 높이가 다르면 단위를 오갈 때 카드가 움찔합니다.

**목록 카드의 폭은 `--card-width` 한 곳에서 나옵니다.** 뷰포트에 따라 3/2/1 열이
되며 290~588px 로 변하는데, 에디터의 썸네일 미리보기가 같은 값을 써야
"목록에서 보일 크기" 라는 말이 실제로 맞습니다. 옆에 다른 열을 두는 자리에서는
상한이 걸린 `--card-width-capped` 를 씁니다 — 열 수가 바뀌는 1px 지점에서
카드가 290 → 443px 로 뛰면 옆 열이 한 번에 153px 를 잃기 때문입니다.

<br>

## 🎨 테마와 접근성

색은 전부 `globals.css`의 CSS 변수로 정의하고, `:root`(라이트)와 `html.dark`(다크)에
**같은 이름으로 한 벌씩** 둡니다. 컴포넌트에 색을 직접 적지 않는 것이 규칙입니다 —
한쪽에만 정의된 토큰은 반대 테마에서 조용히 어긋납니다.

| 토큰                                    | 쓰임                          |
| --------------------------------------- | ----------------------------- |
| `--background` / `--foreground`         | 페이지 바탕과 본문            |
| `--cardbackground` / `--bordercolor`    | 카드·버튼 면과 테두리         |
| `--desccolor`                           | 설명·날짜 등 보조 텍스트      |
| `--codefontcolor` / `--codefontbgcolor` | 인라인 코드                   |
| `--dangercolor` / `--dangerfontcolor`   | 삭제 등 되돌릴 수 없는 동작   |
| `--hovercolor` / `--hoverfontcolor`     | 호버 상태                     |
| `--hoverdesccolor`                      | 호버 면 위의 보조 텍스트      |
| `--activecolor` / `--activefontcolor`   | 선택·주요 동작                |
| `--okcolor` / `--okbg` / `--okborder`   | 공개처럼 정상적으로 켜진 상태 |
| `--warncolor` / `--warnbg` / `--warnborder` | 초안처럼 아직인 상태      |
| `--linkcolor`                           | 본문·댓글 안의 링크           |
| `--calloutborder` / `--calloutaccent`   | 본문 콜아웃 테두리와 강조 막대 |
| `--shadowcolor`                         | 그림자 (다크에서는 흰 글로우) |
| `--card-width` / `--card-width-capped`  | 목록 카드 한 장의 폭          |
| `--chartbar`                            | 차트 선·면 (상태색과 겹치지 않게 따로) |
| `--font-body`                           | 본문 폰트 (색이 아닌 유일한 토큰) |

> `--hovercolor` 는 **양 테마 모두 밝은 회색**입니다(라이트 `#f4f4f4` / 다크 `#dadada`).
> 다크인데 호버하면 면이 밝아지므로 그 위 글자는 전부 어두워져야 합니다.
> 호버 배경을 쓰는 자리에는 `--hoverfontcolor`(주 텍스트) 또는
> `--hoverdesccolor`(보조)를 반드시 함께 지정합니다 — 이 계열 버그가 세 번 났습니다.
>
> 테마는 `next-themes` 의 `html.dark` 로 갈립니다. **`prefers-color-scheme` 를 쓰지 않습니다** —
> OS 설정을 보면 사용자가 고른 테마와 어긋납니다.

본문 글자는 두 테마 모두 **WCAG AA**(일반 4.5:1, 큰 글자 3:1)를 넘도록 맞췄습니다.
코드 하이라이팅은 색상(hue)을 유지한 채 명도만 올린 GitHub Primer 대응값을 씁니다.

되풀이되는 스타일 조각은 `styles/`에 모아두고 각 컴포넌트가 깔아 씁니다.
토큰이 바뀌었을 때 일부만 어긋나는 것을 막기 위해서입니다.

| 파일 | 조각 |
|---|---|
| `button.ts` | `buttonBase` / `buttonQuiet` / `buttonPrimary` / `buttonDanger` |
| `surface.ts` | `surface(radius)` (카드·입력창 면) / `hoverSurface` / `cardHoverLift` |
| `text.ts` | `truncate` (한 줄 말줄임) / `clampLines(n)` |
| `motion.ts` | `fadeSlide` |
| `breakpoints.ts` | `mobile` (640px) |

크기처럼 자리마다 달라야 하는 값은 조각에 넣지 않고 쓰는 쪽에서 덧붙입니다.

`hoverSurface`가 두 줄을 한 덩어리로 묶는 데는 이유가 있습니다. `--hovercolor`는
두 테마 모두 밝은 회색이라 다크에서도 호버하면 면이 밝아지고, 그 위 글자를 함께
뒤집지 않으면 사라집니다. `clampLines`도 마찬가지로 `keep-all`과 `break-word`가
늘 같이 가야 해서 함께 넣었습니다.

<br>

## 🗂 프로젝트 구조

```
prisma/
├── schema.prisma         # Post / Comment / Profile / DailyStat
└── migrations/           # RLS·트리거 포함 마이그레이션

scripts/                  # 일회성·운영 스크립트 (tsx 로 실행)
backup/posts/             # DB 내보내기 백업 (앱은 읽지 않음)

src/
├── app/
│   ├── [slug]/           # 포스트 상세 (SSG + ISR)
│   ├── admin/            # 관리자 화면 (목록·에디터), force-dynamic
│   │                     # loading.tsx 는 page.tsx 가 있는 세그먼트에만 둔다
│   ├── api/              # 라우트 핸들러
│   ├── auth/             # OAuth 콜백 · 로그아웃
│   ├── login/
│   ├── privacy/          # 개인정보 처리방침
│   └── globals.css       # 테마 토큰
├── components/           # X.tsx + X.styled.tsx 짝
│   ├── layout/           # Header, Footer, SideMenu, ThemeSwitcher …
│   ├── post/             # PostCard, PostGrid, PostContent, CarouselSlider …
│   ├── about/            # Introduction, HistoryTimeline, ProjectTimeline
│   ├── admin/            # 목록·검색·차트·에디터·태그 선택기·툴바 아이콘
│   │                     # useSlugCheck / useEditorUploads / usePostSave
│   ├── comments/         # 댓글 스레드
│   ├── stats/            # 방문 집계: 세는 쪽(VisitTracker)과 보여주는 쪽(SiteStats)
│   ├── trackers/         # 화면에 아무것도 그리지 않고 부수효과만 내는 null 컴포넌트
│   ├── ui/               # Skeleton · Toast · ConfirmDialog 같은 범용 조각
│   └── Profile.tsx       # 루트에는 두 영역 이상이 함께 쓰는 것만 둔다
├── lib/
│   ├── markdown/         # 마크다운 → HTML 파이프라인
│   ├── supabase/         # 브라우저·서버·프록시 클라이언트
│   ├── posts.ts          # 데이터 접근 계층 (캐시 태그 포함)
│   ├── comments.ts
│   ├── stats.ts
│   ├── storage.ts
│   ├── auth.ts           # 세션·권한 확인
│   ├── api.ts            # 라우트 헬퍼 (본문 검증 + 에러 응답)
│   ├── fetcher.ts        # 클라이언트 fetch 래퍼
│   ├── queries.ts        # 쿼리 키 + 페처 (UI 가 아니라 여기가 데이터 계약)
│   ├── revalidate.ts
│   └── date.ts / tags.ts / reading-time.ts / validation.ts   # 순수 함수
├── providers/            # RootProvider 가 감싸는 컨텍스트 트리
│   ├── Toast.tsx         # 알림 (useToast)
│   ├── Confirm.tsx       # 확인 대화상자 (useConfirm)
│   └── Query / Theme / EmotionRegistry / HeaderTitleProvider
├── hooks/
│   ├── useRecentPosts.tsx     # 최근 본 글 (localStorage)
│   ├── useOptimisticList.ts   # 목록의 낙관적 갱신 + 롤백
│   └── useDebouncedEffect.ts  # 디바운스 + 늦게 온 응답 버리기
├── styles/
│   ├── button.ts         # 버튼 공통 조각
│   ├── surface.ts        # 면·호버·카드 들어올림
│   ├── text.ts           # 말줄임·여러 줄 자르기
│   ├── motion.ts         # 페이드·슬라이드 전환
│   ├── breakpoints.ts    # 공용 미디어 기준선
│   └── prism-notion-theme.css
├── types/                # post.ts / comment.ts
├── data/                 # about 페이지 정적 데이터
└── proxy.ts              # 세션 갱신 · /admin 가드
```

> `src/` 안에는 앱이 실제로 읽는 것만 둔다. mdx 백업이 `backup/` 으로 나가 있는 것도
> 같은 이유다 — 참조하는 것은 `scripts/` 뿐이다.

**컴포넌트를 어디에 둘지**는 이 순서로 정합니다.

1. 한 기능이 여러 조각으로 나뉘면 **기능 폴더**에 함께 둔다 (`stats/`, `comments/`, `admin/`)
2. 아니면 **쓰이는 화면**을 따른다 (`layout/`, `post/`, `about/`)
3. 두 영역 이상이 함께 쓰면 **루트**에 둔다 (`Profile`)

루트는 "아직 분류 안 한 것"을 쌓아두는 자리가 아닙니다. 3번에 해당하지 않으면
어느 폴더로든 들어가야 합니다.

> `proxy.ts`(구 `middleware.ts`)는 **UX이지 보안 경계가 아닙니다.**
> Edge에서 돌고 DB에 닿지 못하며 우회 가능합니다. 실제 권한 확인은 서버에서 합니다.

### 토큰 검증을 두 갈래로 나눈 이유

같은 세션 쿠키를 읽는 방법이 둘인데, 비용과 보장이 다릅니다.

| | 하는 일 | 비용 | 폐기 반영 |
|---|---|---|---|
| `getUser()` | Auth 서버에 토큰을 물어봄 | 네트워크 왕복 1회 | 즉시 |
| `getClaims()` | JWT 서명을 로컬 검증 | JWKS 캐시 후 사실상 0 | 만료(기본 1시간)까지 지연 |

**인가 결정에는 `getUser()`를 씁니다.** `requireAdmin()` / `requireAdminApi()`가
쓰는 `getProfile()`이 그 경로입니다. 관리자를 강등하거나 토큰을 폐기했을 때
한 시간 동안 통과되면 안 되기 때문입니다.

**결정하지 않는 곳에서는 `getClaims()`를 씁니다.** `proxy.ts`의 `/admin` 가드와
`/api/me`의 `getDisplayProfile()`이 여기 해당합니다. 둘 다 잘못돼도 결과는
"메뉴에 링크가 보인다" 뿐이고, 그 링크로 도달하는 `/admin`은 `requireAdmin()`이
다시 확인합니다.

`getClaims()`는 서명 키를 **supabase 클라이언트 인스턴스에** 캐시하는데
서버는 요청마다 새 클라이언트를 만듭니다. 그대로 두면 로그인한 사용자의 모든
요청이 JWKS를 새로 받아 왕복을 없앤 의미가 사라집니다. `lib/supabase/jwks.ts`가
이를 프로세스 단위(10분 TTL, 동시 요청은 in-flight 공유)로 캐시해 넘겨줍니다.
넘긴 키에서 `kid`를 못 찾으면 `getClaims()`가 알아서 다시 받으므로,
키가 교체돼도 인증이 깨지지 않습니다.

<br>

## 🖥️ 로컬 실행

```bash
# 1. 의존성 설치
$ yarn install

# 2. 환경변수 설정
$ cp .env.example .env    # 값은 Supabase 대시보드 [Connect] 에서

# 3. 접속 확인
$ yarn check:db

# 4. 스키마 적용
$ yarn prisma migrate deploy

# 5. 개발 서버
$ yarn dev
```

### 환경변수

| 키                                     | 용도                                          |
| -------------------------------------- | --------------------------------------------- |
| `DATABASE_URL`                         | 앱 런타임. **6543** (Transaction pooler)      |
| `DIRECT_URL`                           | 마이그레이션. **5432** (Session pooler)       |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase 프로젝트 URL                         |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 구 anon key. 번들 노출이 정상                 |
| `SUPABASE_SECRET_KEY`                  | 구 service_role key. **`NEXT_PUBLIC_` 금지**  |
| `NEXT_PUBLIC_SITE_URL`                 | OAuth 콜백 URL 구성                           |
| `CRON_SECRET`                          | cron 라우트 보호                              |

> ⚠️ `?pgbouncer=true`를 빠뜨리면 **동시 요청 시에만** `prepared statement "s0" already exists`가
> 간헐적으로 납니다. 로컬에서는 재현되지 않고 프로덕션에서만 터집니다.
> `connection_limit=1`도 필수입니다 — 서버리스 인스턴스마다 풀이 생기므로
> 그 이상이면 무료 티어 커넥션이 고갈됩니다.

> Vercel에서는 **Production·Preview·Development 전부**에 등록해야 합니다.
> `generateStaticParams`가 빌드 시점에 DB를 조회하므로 빌드에도 `DATABASE_URL`이 필요합니다.

<br>

## 🛠 스크립트

| 명령                    | 설명                                            |
| ----------------------- | ----------------------------------------------- |
| `yarn check:db`         | DB 접속과 환경변수 점검 (비밀값은 출력하지 않음) |
| `yarn backup:posts`     | DB 포스트를 mdx로 내보내기 (백업)               |
| `yarn migrate:posts`    | mdx를 DB로 가져오기 (복구·최초 이전)            |
| `yarn verify:migration` | 백업과 DB 대조                                  |
| `yarn verify:render`    | 마크다운 파이프라인 회귀 검사 (12가지)          |
| `yarn audit:render`     | 전체 포스트 렌더링 점검                         |
| `yarn sweep:images`     | 참조 없는 이미지 정리 (기본 dry-run)            |

> 💾 Supabase 무료 플랜에는 자동 백업이 없습니다.
> 글을 쓰거나 고친 뒤 `yarn backup:posts`를 돌려 커밋하면 git이 백업이 됩니다.

<br>

## ⏰ 자동화

`vercel.json`의 cron이 하루 한 번(`0 3 * * *`) 도는 동안 두 가지를 처리합니다.

- **Supabase 깨우기** (`SELECT 1`) — 무료 프로젝트는 7일 무활동 시 정지되고,
  정지되면 빌드타임 `generateStaticParams`까지 실패합니다
- **고아 이미지 정리** — 본문에서 지웠거나, 저장 없이 창을 닫았거나,
  글이 삭제되어 참조를 잃은 파일. 24시간 유예를 둡니다

<br>

## 🌏 리전

`vercel.json`의 `"regions": ["icn1"]`은 **성능상 필수**입니다.

Vercel의 기본 함수 리전은 `iad1`(미국 동부)인데 Supabase는 `ap-northeast-2`(서울)입니다.
그대로 두면 서울 엣지로 들어온 요청이 미국 동부에서 실행되고, 거기서 다시 서울의 DB를
부릅니다. DB 쿼리 한 번마다 태평양을 왕복하는 셈입니다. Prisma의 연결 수립은
TCP·TLS·인증으로 왕복이 여러 번이라, 콜드 연결이면 그것만으로 1~2초가 됩니다.

`X-Vercel-Id`로 확인할 수 있습니다. `icn1::iad1::…`이면 엣지와 함수가 갈라진 것이고,
`icn1::icn1::…`이면 제대로 붙은 것입니다.

```
                    /api/me   /api/stats
iad1 (기본값)       0.38~1.80s   0.15s
icn1 (현재)         0.15~0.20s   0.14s
```

**로컬에서는 절대 재현되지 않습니다.** 태평양을 건너지 않기 때문입니다.
프로덕션만 느리다면 여기를 먼저 의심합니다.

<br>

## ⚠️ 알아둘 함정

이 저장소에서 실제로 시간을 잡아먹었던 것들입니다.

| 증상                                     | 원인                                                    |
| ---------------------------------------- | ------------------------------------------------------- |
| 코드블록 색이 조용히 사라짐              | `refractor/common`에 jsx·tsx가 없음. `ignoreMissing`이 삼킴 |
| `<aside>` 안의 `**굵게**`가 그대로 보임  | CommonMark HTML-block 규칙. 빈 줄 정규화 필요           |
| DB는 맞는데 페이지가 낡음                | `unstable_cache`가 `.next/cache`에 남음. `rm -rf .next/cache` |
| `f.createContext is not a function`      | 서버 컴포넌트가 `"use client"` 없는 `.styled.tsx`를 import |
| 무작위 로그아웃                          | `@supabase/ssr`에서 만든 응답 객체를 그대로 반환하지 않음  |
| 옛 URL에 낡은 페이지가 남음              | slug 변경 시 이전 slug의 태그·경로를 무효화하지 않음      |
| 프로덕션에서만 나는 prepared statement 오류 | `?pgbouncer=true` 누락                                  |

<br>

## 📬 개선 예정

- [ ] 🔍 검색 기능 (Full-text search)
- [ ] 📈 포스트별 통계 대시보드
- [ ] 📦 블로그 템플릿화

<br>

## 📄 라이선스

본 프로젝트는 MIT License로 자유롭게 사용하실 수 있습니다.

<br>

## 🙋🏻‍♂️ 만든 사람

- **Muring (무링무링)**
- GitHub: [@Muring](https://github.com/Muring)
- Email: esh5218@gmail.com
