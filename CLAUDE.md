# CLAUDE.md — mublog

README는 **무엇이 어떻게 돼 있는지**를 설명한다. 이 문서는 **건드릴 때 지켜야 할 것**만 적는다.
여기 있는 항목은 대부분 실제로 한 번씩 깨뜨려 본 것들이다.

---

## 1. 절대 하면 안 되는 것

**저장소가 public이다.** publishable key는 번들에 그대로 나간다.

- `SUPABASE_SECRET_KEY`에 `NEXT_PUBLIC_` 접두사를 붙이지 않는다. 서버에서만 쓴다.
- `public` 테이블의 **RLS 정책을 만들지 않는다.** 정책이 하나도 없는 RLS가 익명 접근을
  막는 유일한 장치다. Prisma는 `postgres` 롤이라 RLS를 우회하므로 앱은 영향받지 않는다.
- 관리자 판별은 **`profiles.role` 컬럼만** 쓴다. `user_metadata`는 사용자가 직접 쓸 수 있어서
  거기서 권한을 도출하면 아무나 관리자가 된다.
- 비밀값을 커밋하거나 터미널에 출력하지 않는다. 커밋 전 `sb_secret_`, DB 비밀번호,
  `postgres.<ref>:` 패턴을 훑는다.

**댓글 본문은 평문이다.** `renderMarkdown`을 태우지 않는다.
URL만 정규식으로 잘라 `<a>` **엘리먼트**로 만든다 — HTML 문자열을 만들지 않는다.
포스트 본문은 sanitize하지 않는데, 작성자가 소유자 한 명이고 서버에서 강제되기 때문이다.
이 비대칭을 없애려 하지 않는다.

**방문 통계에 요청당 행을 만들지 않는다.** 무료 티어 500MB를 갉아먹는 유일한 벡터다.
`daily_stats`는 KST 하루 1행을 유지한다.

---

## 2. 자주 밟는 함정

### 서버 / 클라이언트 경계

`.styled.tsx` 24개 중 16개에는 `"use client"`가 없다.
**서버 컴포넌트에서 그런 파일을 import하면 `f.createContext is not a function`으로 죽는다.**
서버에서 써야 하면 그 파일에 `"use client"`를 먼저 넣는다.

### 마크다운 파이프라인

`src/lib/markdown/` 을 건드렸으면 **반드시 `yarn verify:render`** 를 돌린다.
여기 버그는 대부분 무증상이다 — 렌더는 되고 내용만 틀리다.

- `rehypeRaw`는 `remarkRehype` **뒤**, `rehypePrism` **앞**이어야 한다.
  그 전까지 `<aside>`는 불투명한 문자열이라 Prism이 보지 못한다.
- refractor는 `lib/core.js`에 필요한 언어만 명시 등록한다. `common` 번들에는 jsx·tsx가 없다.
  `ignoreMissing: true`가 오류를 삼키므로 조용히 깨진다.
- `js-extras`는 `javascript` **뒤**, `jsx`/`tsx` **앞**에 등록한다.
  jsx/tsx가 등록 시점에 javascript의 정의를 복사해간다.

### 캐시 무효화

포스트를 고쳤으면 `revalidatePost(slug, previousSlug)`를 부른다.
**slug를 바꿨을 때 `previousSlug`를 빠뜨리면 옛 URL에 낡은 페이지가 영원히 남는다.**

### DB 접속

Prisma 7은 접속 URL을 스키마가 아니라 `prisma.config.ts`에 둔다.
Supabase 대시보드가 보여주는 `schema.prisma` 예시를 그대로 쓰지 않는다.

`DATABASE_URL`은 6543 + `?pgbouncer=true&connection_limit=1`, `DIRECT_URL`은 5432다.
`?pgbouncer=true`를 빠뜨리면 **로컬에서는 재현되지 않고 프로덕션에서만** 간헐적으로 터진다.

---

## 3. 스타일 규칙

### 색은 토큰으로만

컴포넌트에 색을 직접 적지 않는다. `globals.css`의 CSS 변수를 쓰고,
새 토큰은 `:root`와 `html.dark`에 **한 벌씩** 정의한다.
한쪽에만 정의하면 반대 테마에서 조용히 어긋난다. 본문 글자는 양 테마 모두 **AA**(4.5:1)를 넘긴다.

**`prefers-color-scheme` 를 쓰지 않는다.** 테마는 `next-themes` 가 붙이는 `html.dark` 로 갈린다.
OS 설정을 보면 사용자가 고른 테마와 어긋난다 — 라이트를 골라도 OS 가 다크면 발동한다.
(이 패턴이 Header·Footer·PostContent 세 곳에 남아 있었다.)

**`--hovercolor`는 두 테마 모두 밝은 회색이다** (라이트 `#f4f4f4` / 다크 `#dadada`).
다크 테마인데 호버하면 면이 밝아지므로, 그 위 글자는 전부 어두워져야 한다.
호버 배경을 쓰는 자리에는 `--hoverfontcolor`(주 텍스트) 또는 `--hoverdesccolor`(보조)를 함께 지정한다.

> 이 계열 버그가 세 번 났다(관리 목록 행, 삭제 버튼, 사이드 메뉴 설명).
> 원인은 항상 같다 — **자식이 스스로 `color`를 정하면 부모의 호버 `color` 상속이 닿지 않는다.**

대비를 `opacity`로 낮추지 않는다. 감사기는 `color`만 보므로 **측정에는 안 잡히고 실제로는 안 보이는** 상태가 된다.

### 레이아웃

- **폭 계산은 CSS에 맡긴다.** 측정값을 상태로 들면 하이드레이션 전에 폭이 0이라 납작하게 그려진다.
  JS는 "몇 개 보일지"만 정하고 폭은 `calc()`로 나눈다.
- **flex·grid 아이템에는 `min-width: 0`을 단다.** 기본값이 `auto`라
  `ContentDocumentLink` 같은 안 끊기는 단어가 지정한 폭을 무시하고 밀어낸다.
- **높이는 바깥 상자가 잡고, 글은 제 높이대로 둔다.** 제목·설명 상자를 각각 고정하면
  짧은 제목에서 그 아래가 붕 뜬다. 본문 전체 높이만 잡으면 남는 자리가 한 곳에 모인다.
- **한 값이 레이아웃 비율을 끌고 다니지 않게 한다.** 열 폭을 `--card-width` 로 직접
  묶었더니 카드가 커지는 1px 지점에서 옆 열이 153px 를 한 번에 잃고 화면이 반반으로 꺾였다.
- **레이아웃을 고칠 때 옛 미디어 쿼리를 함께 지운다.** 4열 시절 규칙이 남아
  1100px 이하에서 열 폭을 반반으로 덮어쓰고 있었고, 한참 뒤에야 드러났다.

### 컴포넌트 배치

`기능 폴더` → `쓰이는 화면` → `루트` 순으로 정한다.
루트(`Profile`)는 두 영역 이상이 함께 쓰는 것만 두는 자리이지,
분류를 미룬 것을 쌓아두는 곳이 아니다.

---

## 4. 작업 흐름

| 언제 | 명령 |
|---|---|
| 커밋 전 항상 | `yarn lint` · `yarn tsc --noEmit` |
| 마크다운 손댔으면 | `yarn verify:render` (12가지 회귀 검사) |
| DB 접속이 의심되면 | `yarn check:db` (비밀값은 출력하지 않는다) |
| 글을 쓰거나 고친 뒤 | `yarn backup:posts` → 커밋. **무료 플랜에는 자동 백업이 없다** |

`yarn build`는 `prisma generate && eslint . && next build`다.
Vercel이 이 스크립트를 그대로 돌리므로 **lint 오류는 배포를 막는다**(경고는 막지 않는다).

**`yarn start`가 떠 있는 채로 다시 빌드하지 않는다.** 청크가 어긋나 클라이언트 예외가 나고,
Windows에서는 sharp DLL이 잠겨 `EPERM`으로 설치가 실패한다. 먼저 서버를 내린다.

DB는 맞는데 페이지가 낡았으면 `.next/cache`를 지운다. `unstable_cache`가 빌드 사이에도 남는다.

### Windows

- `core.ignorecase=true`다. **대소문자만 바꾸는 이름 변경은 커밋에 반영되지 않는다.**
  `git rm -r --cached <옛경로>` 후 새 경로로 다시 `git add` 한다.
  그대로 두면 Linux인 Vercel에서 폴더가 둘로 갈라진다.
- 저장소 파일 상당수가 CRLF다. 스크립트로 문자열을 치환할 때 `\n` 기준으로 앵커를 잡으면
  조용히 실패한다. Edit 도구를 쓰거나 줄바꿈을 감지해서 처리한다.

---

## 5. 검증할 때 속지 말 것

**브라우저 자동화 탭은 백그라운드로 뜬다**(`document.hidden === true`).
숨겨진 문서에는 렌더링 스텝이 돌지 않으므로:

- `requestAnimationFrame`이 안 돈다 — rAF를 기다리는 스크립트는 **탭을 멈춘다**
- `ResizeObserver` / `IntersectionObserver` 콜백이 전달되지 않는다
- lazy 이미지가 로드되지 않아 썸네일이 비어 보인다

여기서 "반응형이 안 된다", "이미지가 안 뜬다"고 결론내지 않는다. 환경 탓이다.

**CSS 전환 도중에 찍은 스크린샷은 깨져 보인다.** 캐러셀처럼 움직이는 것은
전환이 끝난 뒤(0.5s+) 지오메트리를 재고 판단한다.

**셸에서 `grep | head -1`은 매치가 없어도 exit 0이다.** 이걸로 "없음"을 판정하면
거짓 결과가 나온다. 존재 여부는 `grep -c` 나 명시적 분기로 확인한다.

**styled 템플릿의 CSS 문법 오류는 빌드가 잡아주지 않는다.** 중괄호가 짝이 안 맞아도
`yarn build` 는 통과하고 Emotion 이 조용히 삼킨다. 스크립트로 블록을 옮겼다면
중괄호 균형을 따로 세어 본다.

**열 폭과 그 안의 요소 폭을 따로 잰다.** 이미지에 `max-width` 가 걸려 있으면
이미지만 재서는 옆에 남는 빈 자리가 숫자에 잡히지 않는다.

`pg` 드라이버는 `DATE` 컬럼을 로컬 시간 `Date`로 준다. ISO 문자열로 잘라 쓰면 날짜가 하루 어긋난다.
