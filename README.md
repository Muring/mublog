# 📝 Mublog

**프론트엔드를 꿈꾸는 세일즈포스 개발자의 기술 블로그**

<br>

## ✨ 소개

Mublog는 **Next.js App Router 기반 기술 블로그**입니다.

처음에는 MDX 파일을 Contentlayer로 읽는 정적 블로그였지만,
지금은 **포스트를 DB에 두고 웹에서 직접 작성·수정**합니다.
Notion에서 글을 쓰고 마크다운으로 변환해 파일로 커밋하던 과정을 걷어내고,
브라우저에서 쓰고 발행하면 **재배포 없이** 반영되도록 바꿨습니다.

글쓰기 권한은 소유자만 가지며, 다른 사용자는 GitHub으로 로그인해 **댓글**을 남길 수 있습니다.

<br>

## 📦 배포

- [mublog 링크 바로가기](https://muring-blog.vercel.app/)

<br>

## 🔧 기술 스택

| 분야          | 기술                                      |
| ------------- | ----------------------------------------- |
| 프레임워크    | Next.js 16 (App Router, Turbopack)        |
| 언어          | TypeScript                                |
| 스타일링      | Emotion, CSS 변수 기반 테마               |
| 데이터베이스  | Supabase (PostgreSQL)                     |
| ORM           | Prisma 7 (드라이버 어댑터)                |
| 인증          | Supabase Auth (GitHub OAuth)              |
| 파일 저장소   | Supabase Storage                          |
| 서버 상태     | TanStack Query                            |
| 본문 렌더링   | remark / rehype (+ Prism 하이라이팅)      |
| 배포          | Vercel                                    |

<br>

## 📁 주요 기능

### 읽기

- [x] 📚 **포스트 목록·상세** (SSG + ISR)
- [x] 🏷 **태그 필터링**
- [x] 🔗 **연관 글 캐러셀**, 최근 본 글
- [x] 🎨 **다크모드 토글**
- [x] 🐢 **Lazy Loading** (그리드 콘텐츠)

### 쓰기 (관리자 전용)

- [x] ✏️ **웹 에디터** — 마크다운 + 실시간 미리보기
- [x] 🖼 **이미지 업로드** — 드래그&드롭 / 붙여넣기
- [x] 📝 **초안 / 발행** 상태 관리
- [x] ⚡ **재배포 없이 반영** (`revalidateTag`)

### 참여

- [x] 🔐 **GitHub 로그인**
- [x] 💬 **댓글 · 답글** (2단, 낙관적 갱신)
- [x] 📊 **방문자 수 · 조회수 집계**

<br>

## 🗂 프로젝트 구조

```
prisma/
├── schema.prisma         # Post / Comment / Profile / DailyStat
└── migrations/           # RLS·트리거 포함 마이그레이션

scripts/                  # 일회성·운영 스크립트 (tsx 로 실행)

src/
├── app/
│   ├── [slug]/           # 포스트 상세
│   ├── admin/            # 관리자 화면 (목록·에디터)
│   ├── api/              # 라우트 핸들러
│   ├── auth/             # OAuth 콜백 · 로그아웃
│   └── login/
├── components/
│   ├── admin/            # 에디터·태그 선택기
│   ├── comments/         # 댓글 스레드
│   └── ...
├── lib/
│   ├── markdown/         # 마크다운 → HTML 파이프라인
│   ├── supabase/         # 브라우저·서버·프록시 클라이언트
│   ├── posts.ts          # 데이터 접근 계층
│   ├── comments.ts
│   ├── stats.ts
│   └── storage.ts
├── contents/posts/       # DB 내보내기 백업 (읽지 않음)
└── proxy.ts              # 세션 갱신 · /admin 가드
```

<br>

## 🖥️ 로컬 실행

```bash
# 1. 의존성 설치
$ yarn install

# 2. 환경변수 설정
$ cp .env.example .env    # 값은 Supabase 대시보드에서

# 3. 접속 확인
$ yarn check:db

# 4. 스키마 적용
$ yarn prisma migrate deploy

# 5. 개발 서버
$ yarn dev
```

> ✅ `DATABASE_URL`은 **6543(Transaction pooler)**, `DIRECT_URL`은 **5432(Session pooler)** 입니다.
> `?pgbouncer=true`를 빠뜨리면 동시 요청 시에만 오류가 나서 로컬에서는 재현되지 않습니다.

<br>

## 🛠 스크립트

| 명령                    | 설명                                            |
| ----------------------- | ----------------------------------------------- |
| `yarn check:db`         | DB 접속과 환경변수 점검 (비밀값은 출력하지 않음) |
| `yarn backup:posts`     | DB 포스트를 mdx로 내보내기 (백업)               |
| `yarn migrate:posts`    | mdx를 DB로 가져오기 (복구·최초 이전)            |
| `yarn verify:migration` | 백업과 DB 대조                                  |
| `yarn verify:render`    | 마크다운 파이프라인 회귀 검사                   |
| `yarn audit:render`     | 전체 포스트 렌더링 점검                         |
| `yarn sweep:images`     | 참조 없는 이미지 정리 (기본 dry-run)            |

> 💾 Supabase 무료 플랜에는 자동 백업이 없습니다.
> 글을 쓰거나 고친 뒤 `yarn backup:posts`를 돌려 커밋하면 git이 백업이 됩니다.

<br>

## ⏰ 자동화

`vercel.json`의 cron이 하루 한 번(`0 3 * * *`) 도는 동안 두 가지를 처리합니다.

- **Supabase 깨우기** — 무료 프로젝트는 7일 무활동 시 정지되고, 정지되면 빌드까지 실패합니다
- **고아 이미지 정리** — 본문에서 지웠거나, 저장 없이 창을 닫았거나, 글이 삭제되어 참조를 잃은 파일

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
