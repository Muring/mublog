import styled from "@emotion/styled";
import { hoverSurface } from "@/styles/surface";

export const Article = styled.article`
  /* 기본 레이아웃 설정 */
  background-color: var(--background);
  color: var(--foreground);
  max-width: 900px;
  min-height: 85vh;
  margin: 0 auto;
  padding: 4rem 1rem;
  line-height: 2.5;
  animation: fadeIn 1s ease forwards;
  animation-fill-mode: forwards;

  /* 타이포그래피 기본 구조 */
  h1 {
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }
  h2 {
    margin-top: 2rem;
    line-height: 1.5;
  }
  h3 {
    margin-top: 1.5rem;
    line-height: 1.5;
  }
  p {
    margin-top: 1rem;
  }
  li {
    margin-left: 1rem;
    font-size: 0.95rem;
    list-style-type: circle;
  }
  a {
    color: var(--linkcolor);
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  /* 테이블 스타일 */
  table {
    width: 100%;
    border-radius: 0.5rem;
    font-size: 0.9rem;
    border-collapse: collapse;
  }
  table td,
  table th {
    border: 1px solid var(--bordercolor);
  }
  table th {
    background-color: var(--codefontbgcolor);
  }
  table td {
    padding: 0 0.5rem;
  }

  /* 이미지 스타일 */
  p img {
    display: block;
    /* max-width: 656px; */
    max-width: 100%;
    border: 1px solid var(--bordercolor);
    margin: 2rem auto 0 auto;
    border-radius: 6px;
  }

  /* 이미지 캡션 스타일 */
  p + em,
  p + p > em {
    display: block;
    text-align: center;
    font-size: 0.875rem;
    color: var(--desccolor);
    margin-top: 0 !important;
    margin-bottom: 2rem;
  }

  /* 세부 정보 헤더 */
  .article-detail {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1rem;

    .article-item {
      display: flex;
      align-items: center;
      min-width: 8rem;
      gap: 0.5rem;
    }
    .article-detail-icon {
      border-radius: 0;
      margin-right: 0.2rem;
    }
    .desc {
      padding-top: 0.1rem;
      font-size: 0.8rem;
      margin: 0;
    }
    /* 조회수는 보조 정보라 날짜보다 한 단계 물러나게 한다 */
    .desc.views {
      opacity: 0.7;
    }
    .desc.views::before {
      content: "·";
      margin-right: 0.4rem;
    }
    .tag {
      font-size: 0.75rem;
      height: 100%;
      line-height: 2;
    }
    ul {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 0;
    }
    li {
      display: flex;
      align-items: center;
      color: var(--foreground);
      margin: 0;
    }
    /* 색을 직접 적어두었던 자리다. 다크에서도 밝은 회색 칩이 그대로 떠서
       페이지 혼자 라이트 테마처럼 보였다. 호버는 프로젝트 공용 짝을 쓴다 */
    a {
      background-color: var(--codefontbgcolor);
      border-radius: 12px;
      padding: 0 0.5rem;
      font-size: 0.8rem;
      color: var(--foreground);
      font-weight: bold;
      &:hover {
        ${hoverSurface}
        transition-duration: 0.2s;
        text-decoration: none;
      }
    }
  }

  /* Notion 스타일의 callout 블록 */
  aside {
    gap: 0.75rem;
    border-left: 0.5rem solid var(--calloutaccent);
    border-right: 1px solid var(--calloutborder);
    border-top: 1px solid var(--calloutborder);
    border-bottom: 1px solid var(--calloutborder);
    border-radius: 0.75rem;
    padding: 1rem;
    margin: 2rem 0;
    font-size: 0.95rem;
    overflow-x: auto;
  }
  aside h3 {
    margin-bottom: 1rem;
  }
  aside li {
    line-height: 2;
  }
  aside blockquote {
    border-left: 0.3rem solid var(--foreground);
    border-radius: 0;
    font-style: normal;
    padding: 0.5rem;
    margin: auto;
  }
  aside p {
    line-height: 2;
  }
  aside > :first-of-type {
    font-size: 1.15rem;
    line-height: 1;
    margin-top: 0.2rem;
    position: relative;
  }

  /* 일반 blockquote */
  blockquote {
    border-left: 0.5rem solid var(--bordercolor);
    border-radius: 0.5rem;
    padding: 0.2rem 1rem;
    font-style: italic;
    color: var(--foreground);
    margin: 1.5rem 0;
    p {
      margin: 0;
    }
  }

  /*
   * 인라인 코드.
   *
   * pre 안쪽은 제외해야 한다. 그냥 code 로 두면 이 규칙(0,1,1)이 prism 테마의
   * pre code(0,0,2)를 특이도로 이겨, 코드블록이 인라인용 padding 과 색을 쓴다.
   * 언어 태그가 붙은 블록만 code[class*="language-"](0,1,1) 로 동점을 이뤄
   * 살아남았고, 태그 없는 블록은 라이트에서 주황 글씨에 여백 없이 나왔다.
   * (다크는 html.dark pre code 가 0,1,2 라 색만 우연히 맞았다)
   *
   * & 를 반드시 붙인다. : 로 시작하면 stylis 가 &:hover 처럼 뿌리 클래스에
   * 이어붙여 .css-xxx:not(pre) > code 가 되고, 그러면 article 의 직계 자식만
   * 잡혀 <p> 안의 인라인 코드가 통째로 빠진다. 오류는 나지 않는다.
   */
  & :not(pre) > code {
    background: var(--codefontbgcolor);
    padding: 0.1rem 0.3em;
    border-radius: 4px;
    font-size: 0.85rem;
    font-family: "Consolas";
    color: var(--codefontcolor);
  }

  /* 구분선 */
  hr {
    border: none;
    border-top: 1px solid var(--bordercolor);
    margin: 2rem 0;
  }
`;
