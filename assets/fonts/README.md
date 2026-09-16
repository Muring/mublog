# assets/fonts

`src/app/[slug]/opengraph-image.tsx` 가 공유 카드를 그릴 때 읽는 글꼴이다.

`public/fonts` 의 NanumSquareNeo 는 woff2 뿐인데, 카드를 굽는 렌더러(satori)는 woff2 를
읽지 못한다. 그래서 같은 글꼴을 TTF 로 풀어 여기에 둔다. 브라우저에는 나가지 않는다.

woff2 → ttf 변환은 `wawoff2` 의 `decompress` 로 했다. 글꼴 파일을 바꾸면 다시 푼다.
