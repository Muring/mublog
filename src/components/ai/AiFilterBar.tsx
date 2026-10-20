"use client";
import { useEffect, useRef, type ReactNode } from "react";
import FilterBar, { type FilterField } from "@/components/admin/FilterBar";
import FilterChips, { type FilterChip } from "@/components/admin/FilterChips";
import Dropdown, { type DropdownOption } from "@/components/ui/Dropdown";
import { splitMulti, withoutMulti } from "@/lib/multi-value";
import { mobileQuery } from "@/styles/breakpoints";
import { number } from "./AiControls";
import { useImeInput } from "@/hooks/useImeInput";
import { ALL_OPTION, NEWEST_OLDEST } from "@/lib/admin-filters";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export type AiField = { key: string; label: string; options: DropdownOption[]; multiple?: boolean; search?: string };
type Props = {
    loading: boolean;
    period: string;
    onPeriod: (value: string) => void;
    /** 사용량 탭만 표를 프로젝트별·주별로 바꾼다 */
    view?: { value: string; onChange: (value: string) => void };
    sort: string;
    onSort: (value: "newest" | "oldest") => void;
    q: string;
    onSearch: (value: string) => void;
    /** 없으면 검색창을 두지 않는다(수집 상태 탭) */
    searchPlaceholder?: string;
    fields: AiField[];
    values: Record<string, string>;
    /** 기본값과 같으면 조건으로 세지 않는 값(연도의 최신 연도) */
    defaults?: Record<string, string>;
    onApply: (values: Record<string, string>) => void;
    onReset: () => void;
    summary: ReactNode;
};

/**
 * 블로그 관리 목록과 같은 한 줄 필터 바. 기간·표 구성은 바로 바뀌고, 프로젝트·연도 등 나머지 조건은
 * 블로그의 태그·시리즈처럼 필터 창(좁은 화면에서는 하단 시트)에서 한 번에 적용한다. 고른 값은 칩으로 늘어놓는다. 걸린 조건은 칩으로 늘어놓아 하나씩 푼다.
 */
const VIEW_OPTIONS: DropdownOption[] = [{ value: "groups", label: "프로젝트별" }, { value: "weeks", label: "주별" }];


export default function AiFilterBar({ loading, period, onPeriod, view, sort, onSort, q, onSearch, searchPlaceholder, fields, values, defaults = {}, onApply, onReset, summary }: Props) {
    const { inputProps: searchInput } = useImeInput(q, onSearch);
    /*
     * 좁은 화면은 컨트롤을 한 줄에 모은다(공용 FilterBar). 표 구성 전환은 그 줄에 둘 자리가 없어 필터 시트로 들어간다.
     */
    const isMobile = useMediaQuery(mobileQuery);
    const sheetFields = isMobile && view ? [{ key: "view", label: "표 구성", options: VIEW_OPTIONS }, ...fields] : fields;
    /*
     * 좁은 화면에서 이 바는 헤더 아래에 붙고(Ai.styled 의 관리 쪽 규칙), 사용량 표 머리글은 그 아래에 붙는다.
     * 바 높이는 칩·검색 상태로 바뀌므로 바의 아래 끝을 --filter-bottom 으로 부모(workspace)에 알린다.
     * 표는 바의 형제 쪽에 있어 CSS 만으로는 이 높이를 알 수 없다.
     */
    const wrapper = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const bar = wrapper.current, host = bar?.parentElement;
        if (!bar || !host) return;
        const update = () => host.style.setProperty("--filter-bottom", `${(parseFloat(getComputedStyle(bar).top) || 0) + bar.offsetHeight}px`);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(bar);
        const media = window.matchMedia(mobileQuery);
        media.addEventListener("change", update);
        return () => { observer.disconnect(); media.removeEventListener("change", update); host.style.removeProperty("--filter-bottom"); };
    }, []);

    const active = (key: string) => Boolean(values[key]) && values[key] !== defaults[key];
    const chips: FilterChip[] = fields.filter((field) => active(field.key)).flatMap((field) => {
        const label = (value: string) => field.options.find((option) => option.value === value)?.label ?? value;
        return field.multiple
            ? splitMulti(values[field.key]).map((value) => ({ key: `${field.key}:${value}`, name: field.label, value: label(value) }))
            : [{ key: field.key, name: field.label, value: label(values[field.key]) }];
    });

    return <div ref={wrapper} className="aim-filterBar">
        <FilterBar
            loading={loading}
            status={<>
                <div className="aim-periodControls"><div className="status-filters" role="group" aria-label="조회 기간">
                    {[["4", "4주"], ["8", "8주"], ["12", "12주"], ["year", "연도 전체"]].map(([value, label]) => <button key={value} type="button" aria-pressed={period === value} onClick={() => onPeriod(value)}>
                        {value === "year" ? <><span className="aim-wideLabel">{label}</span><span className="aim-narrowLabel">연도</span></> : label}
                    </button>)}
                </div>
                {view && <div className="status-filters aim-viewToggle" role="group" aria-label="표 구성">
                    {[["groups", "프로젝트별"], ["weeks", "주별"]].map(([value, label]) => <button key={value} type="button" aria-pressed={view.value === value} onClick={() => view.onChange(value)}>{label}</button>)}
                </div>}
                </div>
            </>}
            sort={<Dropdown className="sort-control" label="정렬" size="control" variant="ghost" value={sort} align="right"
                options={NEWEST_OLDEST} onChange={(value) => onSort(value as "newest" | "oldest")} />}
            search={searchPlaceholder && <input type="search" {...searchInput} readOnly={loading}
                placeholder={searchPlaceholder} aria-label={searchPlaceholder.endsWith("검색") ? searchPlaceholder : `${searchPlaceholder} 검색`} />}
            fields={sheetFields as FilterField[]}
            values={isMobile && view ? { ...values, view: view.value } : values}
            onApply={({ view: nextView, ...next }) => {
                if (view && nextView !== undefined) view.onChange(nextView || "groups");
                onApply({ ...values, ...next });
            }}
            fieldCount={fields.filter((field) => active(field.key)).length}
            summary={summary}
            searchActive={Boolean(q)}
            chips={!loading && <FilterChips items={chips} onClear={onReset} canClear={chips.length > 0 || Boolean(q)}
                onRemove={(key) => {
                    const cut = key.indexOf(":");
                    const field = cut < 0 ? key : key.slice(0, cut);
                    onApply({ ...values, [field]: cut < 0 ? "" : withoutMulti(values[field], key.slice(cut + 1)) });
                }} />}
        />
    </div>;
}

/** 값별 행 수를 힌트로 달고 많은 순으로 늘어놓는다. 블로그 태그 필터와 같은 순서다 */
export function countOptions(values: string[], label: (value: string) => string = (value) => value): DropdownOption[] {
    const counts = new Map<string, number>();
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
    return [ALL_OPTION, ...[...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([value, n]) => ({ value, label: label(value), hint: number(n) }))];
}
