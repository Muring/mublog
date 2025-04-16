# 📝 Mublog 

**프론트엔드를 꿈꾸는 세일즈포스 개발자의 기술 블로그**


## ✨ 소개

Mublog는 **Next.js App Router 기반의 정적 기술 블로그**입니다.  
Contentlayer와 MDX를 통해 콘텐츠를 관리하며, Emotion과 커스텀 CSS로 정돈된 UI/UX를 제공합니다.

프론트엔드 기술에 대한 실험과 학습을 기록하기 위한 용도로 제작되었으며,  
**Toss 프론트엔드 채용 문화를 기준으로 스택을 구성**하였습니다.


## 🔧 기술 스택

| 분야             | 기술                     |
|------------------|--------------------------|
| 프레임워크       | Next.js 15 (App Router)  |
| 언어             | TypeScript               |
| 스타일링         | Emotion, Global CSS      |
| 콘텐츠 관리      | MDX + Contentlayer       |
| 상태관리         | React Hook (간단 용도)   |
| 이미지 최적화    | `next/image`             |
| 배포             | Vercel                   |


## 📁 주요 기능

- [x] 📚 **정적 블로그 구성** (SSG)
- [x] 🏷 **태그 필터링 기능**
- [ ] 🎨 **다크모드 대응**
- [x] 💅 **Emotion 기반 스타일링**
- [x] 🧱 **컴포넌트 단위 구조 관리**
- [x] 📷 **썸네일 이미지 지원 (예외처리 포함)**
- [x] 🧭 **사이드바 메뉴 & 애니메이션**
- [x] 🐢 **Lazy Loading (그리드 콘텐츠)**
- [x] 🚀 **Vercel 자동 배포**


## 🗂 프로젝트 구조

```
src/
├── app/                  # App Router 기반 라우팅
│   └── [slug]/           # 동적 포스트 페이지
├── components/           # 재사용 가능한 컴포넌트
│   ├── Header/
│   ├── Footer/
│   ├── SideMenu/
│   ├── PostCard/
│   └── ...
├── contents/posts/       # MDX 포스트 모음
├── public/               # 정적 파일 (icons, thumbnails 등)
└── styles/               # 글로벌 스타일 (globals.css 등)
```


## 🖥️ 로컬 실행

```bash
# 1. 의존성 설치
$ yarn install

# 2. contentlayer 초기화 및 dev 서버 실행
$ yarn dev
```

> ✅ `contentlayer.config.ts`와 `posts/*.mdx` 경로가 일치해야 합니다.  
> ✅ Windows에서는 CRLF 문제로 인한 Contentlayer YAML 파싱 에러가 발생할 수 있으니 주의하세요.



## 📦 배포

- [Vercel 링크 바로가기](https://muring-blog.vercel.app/)  


## 📬 개선 예정

- [ ] 검색 기능 (Full-text search)
- [ ] 카테고리 기반 라우팅
- [ ] 포스트별 댓글 시스템


## 📄 라이선스

본 프로젝트는 MIT License로 자유롭게 사용하실 수 있습니다.


## 🙋🏻‍♂️ 만든 사람

- **Muring (무링무링)**
- GitHub: [@Muring](https://github.com/Muring)
- Email: esh5218@gmail.com
