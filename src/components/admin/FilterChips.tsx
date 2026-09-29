"use client";

import styled from "@emotion/styled";
import { mobile } from "@/styles/breakpoints";

export type FilterChip = { key: string; name: string; value: string };

/**
 * 걸려 있는 필터를 칩으로 늘어놓는다. 칩을 누르면 그 조건 하나만 풀린다.
 * 드롭다운 버튼만으로는 무엇이 걸려 있는지 한눈에 안 들어온다. 포스트·댓글 관리가 같이 쓴다.
 */
export default function FilterChips({ items, onRemove, onClear, canClear = items.length > 0 }: { items: FilterChip[]; onRemove: (key: string) => void; onClear: () => void; canClear?: boolean }) {
    if (items.length === 0 && !canClear) return null;
    // 초기화는 걸린 조건 바로 옆, 칩 줄의 오른쪽 끝에 둔다. 걸린 것이 없으면 줄째 사라진다 — 세 관리 화면 공통
    return (
        <ChipRow>
        <Chips aria-label="적용된 필터">
            {items.map((chip) => (
                <li key={chip.key}>
                    <button type="button" onClick={() => onRemove(chip.key)} title={`${chip.name}: ${chip.value}`} aria-label={`${chip.name} ${chip.value} 필터 해제`}>
                        <span className="chip-name">{chip.name}</span>
                        <span className="chip-value">{chip.value}</span>
                        <span className="chip-x" aria-hidden="true" />
                    </button>
                </li>
            ))}
        </Chips>
        <button type="button" className="chips-clear" onClick={onClear}>전체 초기화</button>
        </ChipRow>
    );
}

const ChipRow = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 0;

    /* 조건 칩보다 눈에 덜 띄는 텍스트 버튼. 호버 때만 옅은 면을 보여준다. */
    .chips-clear {
        flex-shrink: 0;
        margin-left: auto;
        padding: 4px 8px;
        border: 0;
        border-radius: 6px;
        background: none;
        color: var(--linkcolor);
        font: inherit;
        font-size: 12px;
        font-weight: 400;
        line-height: 1.5;
        cursor: pointer;
        box-shadow: inset 0 0 0 var(--border-width) transparent;
        transition: background-color 180ms ease, box-shadow 180ms ease, color 180ms ease;
    }
    .chips-clear:hover {
        background: color-mix(in srgb, var(--linkcolor) 6%, var(--background));
        box-shadow: inset 0 0 0 var(--border-width) color-mix(in srgb, var(--linkcolor) 20%, transparent);
        color: var(--linkhovercolor);
    }
    .chips-clear:active {
        background: color-mix(in srgb, var(--linkcolor) 10%, var(--background));
    }
    .chips-clear:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }
    ${mobile} {
        .chips-clear { min-height: 44px; }
    }
`;

/*
 * 적용된 필터 칩.
 * 색은 태그 칩(ui/TagChips)과 같은 짝이다 — 바탕 --codefontbgcolor, 글자 --foreground 로 양 테마 모두 AA 를 넉넉히 넘는다.
 * (--activecolor 를 바탕에 쓰면 라이트는 검정, 다크는 밝은 회색이라 --foreground 글자가 바탕에 묻힌다.)
 * 누를 수 있으므로 호버를 둔다. 툴바 컨트롤과 같은 outline + 8% 섞기라 한 화면에서 호버 표현이 갈리지 않는다.
 * 칩 모양이 이미 필터임을 말하므로 이름은 흐리게, 값은 진하게 둔다.
 */
const Chips = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex: 1;
    min-width: 0;
    margin: 0;
    padding: 0;
    list-style: none;

    li { min-width: 0; max-width: 100%; }
    button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        max-width: 100%;
        padding: 4px 8px 4px 10px;
        border: var(--border-width) solid var(--bordercolor);
        border-radius: 999px;
        background: var(--codefontbgcolor);
        color: var(--foreground);
        font: inherit;
        font-size: 12px;
        line-height: 1.5;
        cursor: pointer;
        outline: 1px solid transparent;
        outline-offset: calc(-1 * var(--border-width));
        transition: background-color .15s, color .15s, border-color 150ms ease, outline-color .15s;
    }
    button:hover {
        border-color: transparent;
        outline-color: var(--foreground);
        background: color-mix(in srgb, var(--foreground) 8%, var(--codefontbgcolor));
        color: var(--foreground);
    }
    button:focus-visible { outline: 2px solid var(--linkhovercolor); outline-offset: 2px; }
    ${mobile} {
        button { min-height: 44px; }
    }
    .chip-name { flex-shrink: 0; color: var(--desccolor); }
    .chip-value { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
    /* × 는 글꼴마다 굵기·높이가 달라 두 선을 돌려 그린다. currentColor 라 테마를 따라간다 */
    .chip-x { position: relative; flex-shrink: 0; width: 10px; height: 10px; }
    .chip-x::before, .chip-x::after { content: ""; position: absolute; left: 50%; top: 50%; width: 10px; height: 1.5px; border-radius: 1px; background: currentColor; }
    .chip-x::before { transform: translate(-50%, -50%) rotate(45deg); }
    .chip-x::after { transform: translate(-50%, -50%) rotate(-45deg); }
`;
