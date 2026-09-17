"use client";
import styled from "@emotion/styled";
import { truncate } from "@/styles/text";

const Tags = styled.div<{ $alignEnd: boolean }>`
  /* 팝오버가 태그 줄 전체를 기준으로 놓이도록 여기서 기준점을 만든다 */
  position: relative;
  display: flex;
  gap: 0.3rem;
  min-height: 1.6em;
  align-items: center;
  font-size: 0.7rem;
  overflow: visible;

  .chip {
    flex-shrink: 1;
    padding: 0.1rem 0.45rem;
    border-radius: 999px;
    background-color: var(--codefontbgcolor);
    color: var(--desccolor);
    font-weight: 700;
    line-height: 1.6;
    /* 태그 하나가 아주 길면 그것만 줄어들며 말줄임 된다 */
    min-width: 0;
    ${truncate}
  }

  .more {
    flex-shrink: 0;
    cursor: help;
    /* 팝오버가 태그 줄이 아니라 이 칩을 기준으로 열리게 한다 */
    position: relative;
    /*
     * .chip 의 말줄임에는 overflow: hidden 이 들어 있어서, 그대로 두면
     * 이 칩이 자기 팝오버를 잘라버린다. "+3" 은 잘릴 일이 없으므로 푼다.
     */
    overflow: visible;
  }

  /*
   * 숨은 태그 목록. +N 칩의 바로 오른쪽에서 펼쳐진다.
   * 태그 줄을 기준으로 잡으면 카드 왼쪽 끝에서 열려 무엇에 딸린 것인지 안 보였다.
   *
   * 색은 다른 툴팁(툴바·차트)과 같은 짝을 쓴다. 배경에 --foreground,
   * 글자에 --background 라 두 테마 모두 확실히 떠 보인다.
   */
  .popover {
    position: absolute;
    top: calc(100% + 4px);
    ${({ $alignEnd }) => $alignEnd ? "right: 0;" : "left: 0;"}
    transform: none;
    z-index: 3;
    display: none;
    padding: 0.25rem 0.5rem;
    border-radius: 8px;
    background-color: var(--foreground);
    color: var(--background);
    font-weight: 700;
    box-shadow: 0px 3px 8px -2px var(--shadowcolor);
    /*
     * 기준 상자가 +N 칩(20px 남짓)이라 백분율 폭을 쓰면 그만큼으로 짜부라진다.
     * 내용에 맞춰 늘리되 상한을 둬서, 태그가 많아도 카드 밖으로 길게 뻗지 않게 한다.
     */
    width: max-content;
    max-width: 11rem;
    white-space: normal;
    font-weight: 700;
  }

  .more:hover, .more:focus-visible { background-color: var(--foreground); color: var(--background); }
  .more:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }
  .more:hover .popover, .more:focus-visible .popover {
    display: block;
  }
`;

export default function TagChips({ tags, visibleCount = 2, alignEnd = false }: { tags: string[]; visibleCount?: number; alignEnd?: boolean }) {
    const hidden = tags.slice(visibleCount);
    return <Tags $alignEnd={alignEnd}>
        {tags.slice(0, visibleCount).map(tag => <span key={tag} className="chip" title={tag}>{tag}</span>)}
        {hidden.length > 0 && <span className="chip more" tabIndex={0} aria-label={`추가 태그: ${hidden.join(', ')}`} title={hidden.join(' · ')}>+{hidden.length}<span className="popover" aria-hidden>{hidden.join(' · ')}</span></span>}
    </Tags>;
}
