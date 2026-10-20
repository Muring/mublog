# assets/fonts

`src/app/[slug]/opengraph-image.tsx` 가 공유 카드를 그릴 때 읽는 글꼴이다.

`public/fonts` 의 NanumSquareNeo 는 woff2 뿐인데, 카드를 굽는 렌더러(satori)는 woff2 를
읽지 못한다. 그래서 같은 글꼴을 TTF 로 풀어 여기에 둔다. 브라우저에는 나가지 않는다.

woff2 → ttf 변환은 `wawoff2` 의 `decompress` 로 했다. 글꼴 파일을 바꾸면 다시 푼다.

## 브라우저용 woff2 원본

`NanumSquareNeo-*.woff2` 는 한글 11,172자를 다 담은 원본이다. 브라우저에는 이걸 그대로 주지 않고
`yarn subset:fonts` 로 자주 쓰는 한글 2,350자(KS X 1001)만 남겨 `public/fonts` 에 쓴다
(굵기당 약 390KB → 150KB). 글꼴을 바꾸면 여기 원본을 바꾸고 다시 돌린다. 실행에는 `uv` 가 필요하다.

2,350자 밖의 음절은 그 글자만 시스템 글꼴로 보인다. `uv run --with fonttools --with brotli python scripts/subset-fonts.py --check`
가 백업된 글에서 그런 글자를 찾는다.
