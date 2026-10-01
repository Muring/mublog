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
  /* 펼친 목록 안의 태그 버튼에 초점이 가도 목록이 닫히지 않게 focus-within 도 본다 */
  .more:hover .popover, .more:focus-visible .popover, .more:focus-within .popover {
    display: block;
  }

  /*
   * 누르면 거르는 태그(관리 목록). 호버와 선택을 다른 모양으로 나눈다(AGENTS §3) —
   * 호버는 테두리만 진하게, 필터에 걸린 태그는 칩을 채운다.
   */
  button.chip {
    border: 0;
    font: inherit;
    cursor: pointer;
    box-shadow: inset 0 0 0 var(--border-width) transparent;
    transition: box-shadow 150ms, background-color 150ms, color 150ms;
  }
  button.chip:hover { box-shadow: inset 0 0 0 var(--border-width) var(--foreground); color: var(--foreground); }
  button.chip:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }
  button.chip[aria-pressed="true"] { background-color: var(--foreground); color: var(--background); }
  .popover button.chip { display: inline-block; margin: 0.1rem 0.15rem; background-color: var(--background); color: var(--foreground); }
  .popover button.chip[aria-pressed="true"] { box-shadow: inset 0 0 0 var(--border-width) var(--background); background-color: transparent; color: var(--background); }
  @media (prefers-reduced-motion: reduce) { button.chip { transition: none; } }
`;

/**
 * onSelect 를 주면 태그가 버튼이 되어 누를 때마다 그 태그를 넘긴다(관리 목록의 태그 필터).
 * selected 에 든 태그는 눌린 상태(aria-pressed)로 그린다. 주지 않으면 지금처럼 읽기 전용 칩이다.
 */
export default function TagChips({ tags, visibleCount = 2, alignEnd = false, onSelect, selected = [] }: {
    tags: string[]; visibleCount?: number; alignEnd?: boolean; onSelect?: (tag: string) => void; selected?: string[];
}) {
    const hidden = tags.slice(visibleCount);
    const chip = (tag: string) => onSelect
        ? <button key={tag} type="button" className="chip" title={`${tag} 태그로 거르기`} aria-pressed={selected.includes(tag)} onClick={() => onSelect(tag)}>{tag}</button>
        : <span key={tag} className="chip" title={tag}>{tag}</span>;
    return <Tags $alignEnd={alignEnd}>
        {tags.slice(0, visibleCount).map(chip)}
        {hidden.length > 0 && <span className="chip more" tabIndex={0} aria-label={`추가 태그: ${hidden.join(', ')}`} title={onSelect ? undefined : hidden.join(' · ')}>+{hidden.length}
            {onSelect ? <span className="popover">{hidden.map(chip)}</span> : <span className="popover" aria-hidden>{hidden.join(' · ')}</span>}
        </span>}
    </Tags>;
}
