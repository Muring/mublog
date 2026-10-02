"use client";
import { useEffect, useRef, type ReactNode } from "react";
import FilterBar, { type FilterField } from "@/components/admin/FilterBar";
import FilterChips, { type FilterChip } from "@/components/admin/FilterChips";
import Dropdown, { type DropdownOption } from "@/components/ui/Dropdown";
import { splitMulti, withoutMulti } from "@/lib/multi-value";
import { number } from "./AiControls";
import manage from "./AiManagement.module.css";

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
export default function AiFilterBar({ loading, period, onPeriod, view, sort, onSort, q, onSearch, searchPlaceholder, fields, values, defaults = {}, onApply, onReset, summary }: Props) {
    const input = useRef<HTMLInputElement>(null);
    const composing = useRef(false);
    useEffect(() => {
        if (input.current && !composing.current) input.current.value = q;
    }, [q]);

    const active = (key: string) => Boolean(values[key]) && values[key] !== defaults[key];
    const chips: FilterChip[] = fields.filter((field) => active(field.key)).flatMap((field) => {
        const label = (value: string) => field.options.find((option) => option.value === value)?.label ?? value;
        return field.multiple
            ? splitMulti(values[field.key]).map((value) => ({ key: `${field.key}:${value}`, name: field.label, value: label(value) }))
            : [{ key: field.key, name: field.label, value: label(values[field.key]) }];
    });

    return <div className={manage.filterBar}>
        <FilterBar
            loading={loading}
            status={<>
                <div className={manage.periodControls}><div className="status-filters" role="group" aria-label="조회 기간">
                    {[["4", "4주"], ["8", "8주"], ["12", "12주"], ["year", "연도 전체"]].map(([value, label]) => <button key={value} type="button" aria-pressed={period === value} onClick={() => onPeriod(value)}>{label}</button>)}
                </div>
                {view && <div className="status-filters" role="group" aria-label="표 구성">
                    {[["groups", "프로젝트별"], ["weeks", "주별"]].map(([value, label]) => <button key={value} type="button" aria-pressed={view.value === value} onClick={() => view.onChange(value)}>{label}</button>)}
                </div>}
                </div>
            </>}
            sort={<Dropdown className="sort-control" label="정렬" size="control" variant="ghost" value={sort} align="right"
                options={[{ value: "newest", label: "최신순" }, { value: "oldest", label: "오래된순" }]} onChange={(value) => onSort(value as "newest" | "oldest")} />}
            search={searchPlaceholder && <input type="search" ref={input} defaultValue={q} readOnly={loading}
                onCompositionStart={() => { composing.current = true; }}
                onCompositionEnd={(event) => { composing.current = false; onSearch(event.currentTarget.value); }}
                onChange={(event) => { if (!composing.current) onSearch(event.currentTarget.value); }}
                placeholder={searchPlaceholder} aria-label={searchPlaceholder.endsWith("검색") ? searchPlaceholder : `${searchPlaceholder} 검색`} />}
            fields={fields as FilterField[]}
            values={values}
            onApply={next => onApply({ ...values, ...next })}
            fieldCount={fields.filter((field) => active(field.key)).length}
            summary={summary}
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
    return [{ value: "", label: "전체" }, ...[...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([value, n]) => ({ value, label: label(value), hint: number(n) }))];
}
