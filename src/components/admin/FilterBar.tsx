"use client";

import { Fragment, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Dropdown, { type DropdownOption } from "@/components/ui/Dropdown";
import { Button } from "./Admin.styled";
import { FilterBarRoot, FilterFormRoot, FilterPopover } from "./FilterBar.styled";
import AdminSheet from "./AdminSheet";
import { mobileQuery } from "@/styles/breakpoints";

/** multiple 이면 값은 lib/multi-value 로 이은 문자열이다. 같은 조건 안에서는 "또는" 으로 거른다 */
export type FilterField = { key: string; label: string; search?: string; options: DropdownOption[]; multiple?: boolean };
type Props = {
    status: ReactNode;
    sort: ReactNode;
    /** 검색할 내용이 없는 화면은 생략한다. 그때 필터·정렬은 오른쪽에 붙는다 */
    search?: ReactNode;
    fields: FilterField[];
    values: Record<string, string>;
    dateRange?: boolean | string;
    /** 지정한 조건 바로 앞에 날짜 범위를 배치한다. 기본은 마지막. */
    dateBefore?: string;
    fieldCount: number;
    onApply: (values: Record<string, string>) => void;
    chips?: ReactNode;
    summary: ReactNode;
    pending?: boolean;
    loading?: boolean;
};

/** 검색·상태는 즉시, 상세 조건은 폼에서 한 번에 적용한다. */
export default function FilterBar({ status, sort, search, fields, values, dateRange, dateBefore, fieldCount, onApply, chips, summary, pending, loading = false }: Props) {
    const [presentation, setPresentation] = useState<"sheet" | "popover" | null>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const anchor = useRef<HTMLDivElement>(null);
    const dialogId = useId();
    const close = useCallback(() => {
        setPresentation(null);
        trigger.current?.focus();
    }, []);

    useEffect(() => {
        if (!presentation) return;
        const media = window.matchMedia(mobileQuery);
        media.addEventListener("change", close);
        // 뒤로 가기로 확정 조건이 바뀔 때 열린 초안을 남기지 않는다.
        window.addEventListener("popstate", close);
        const outside = (event: PointerEvent) => {
            if (presentation === "popover" && !anchor.current?.contains(event.target as Node)) close();
        };
        document.addEventListener("pointerdown", outside);
        return () => {
            media.removeEventListener("change", close);
            window.removeEventListener("popstate", close);
            document.removeEventListener("pointerdown", outside);
        };
    }, [presentation, close]);

    const form = (
        <FilterForm fields={fields} values={values} dateRange={dateRange} dateBefore={dateBefore} onApply={(next) => { onApply(next); close(); }} />
    );

    return (
        <FilterBarRoot data-loading={loading || undefined} inert={loading || undefined}>
            <div className="bar-controls">
                <div className="bar-status">{status}</div>
                <div className="bar-main">
                    {search && <div className="bar-search">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg>
                        {search}
                    </div>}
                    <div className="bar-anchor" ref={anchor}>
                        <button ref={trigger} type="button" className="bar-toggle" aria-haspopup="dialog" aria-expanded={presentation !== null}
                            aria-controls={presentation ? dialogId : undefined} onClick={() => presentation ? close() : setPresentation(window.matchMedia(mobileQuery).matches ? "sheet" : "popover")}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="2" /><circle cx="15" cy="17" r="2" /></svg>
                            필터 {fieldCount > 0 && <span className="bar-badge" aria-label={`${fieldCount}개 적용`}>{fieldCount}</span>}
                        </button>
                        {presentation === "popover" && <Popover id={dialogId} onClose={close} onDismiss={() => setPresentation(null)} trigger={trigger}>{form}</Popover>}
                    </div>
                </div>
                <div className="bar-sort">{sort}</div>
            </div>
            {chips}
            <div className="bar-results">
                <p className="bar-summary" role="status" aria-busy={pending || undefined}>{pending ? "결과를 불러오는 중…" : summary}</p>
            </div>
            {presentation === "sheet" && <AdminSheet id={dialogId} title="필터" iconClose onClose={close}>
                {(finish) => <FilterForm fields={fields} values={values} dateRange={dateRange} dateBefore={dateBefore} onApply={(next) => { onApply(next); finish(); }} />}
            </AdminSheet>}
        </FilterBarRoot>
    );
}

function Popover({ id, onClose, onDismiss, trigger, children }: { id: string; onClose: () => void; onDismiss: () => void; trigger: React.RefObject<HTMLButtonElement | null>; children: ReactNode }) {
    const root = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        const fit = () => {
            if (root.current) root.current.style.maxHeight = `${Math.max(0, window.innerHeight - root.current.getBoundingClientRect().top - 16)}px`;
        };
        fit();
        window.addEventListener("resize", fit);
        window.addEventListener("scroll", fit, true);
        root.current?.querySelector<HTMLButtonElement>("button")?.focus();
        return () => { window.removeEventListener("resize", fit); window.removeEventListener("scroll", fit, true); };
    }, []);
    return (
        <FilterPopover ref={root} id={id} role="dialog" aria-label="필터" onKeyDown={(event) => {
            if (event.defaultPrevented) return;
            if (event.key === "Escape") { event.preventDefault(); onClose(); }
        }} onBlur={(event) => {
            if (event.relatedTarget && event.relatedTarget !== trigger.current && !event.currentTarget.contains(event.relatedTarget as Node)) onDismiss();
        }}>
            <div className="filter-heading"><h2>필터</h2><Button type="button" onClick={onClose} aria-label="필터 닫기" className="filter-close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></Button></div>
            {children}
        </FilterPopover>
    );
}

/** 마운트 때만 확정값을 복사한다. 서버 응답이 도착해도 편집 중인 값을 덮어쓰지 않는다. */
function FilterForm({ fields, values, dateRange, dateBefore, onApply }: Pick<Props, "fields" | "values" | "dateRange" | "dateBefore" | "onApply">) {
    const [draft, setDraft] = useState(values);
    const [applying, setApplying] = useState(false);
    const [openField, setOpenField] = useState<string | null>(null);
    const formId = useId();
    const dateLabel = typeof dateRange === "string" ? dateRange : "작성일";
    const reversed = Boolean(dateRange && draft.from && draft.to && draft.from > draft.to);
    const dates = (
        dateRange && <fieldset className="filter-dates">
            <legend className="field-label">{dateLabel} <span className="field-hint">한국 시간</span></legend>
            <div className="date-inputs">
                {([['from', '시작일'], ['to', '종료일']] as const).map(([key, label]) => (
                    <label key={key}>{label}<input type="date" aria-label={`${dateLabel} ${label}`} value={draft[key] ?? ""} max="9999-12-31"
                        aria-invalid={reversed || undefined} aria-describedby={reversed ? `${formId}-date-error` : undefined}
                        onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} /></label>
                ))}
            </div>
            {reversed && <p className="field-error" id={`${formId}-date-error`} role="alert">종료일은 시작일 이후로 선택해 주세요.</p>}
        </fieldset>
    );
    return (
        <FilterFormRoot onSubmit={(event) => { event.preventDefault(); if (!reversed && !applying) { setApplying(true); onApply(draft); } }}>
            <div className="filter-fields" inert={applying || undefined}>
                {fields.map((field) => (
                    <Fragment key={field.key}>
                        {field.key === dateBefore && dates}
                        <div className="filter-field">
                            <span id={`${formId}-${field.key}`} className="field-label">{field.label}</span>
                            <Dropdown label={`${field.label} 필터`} labelledBy={`${formId}-${field.key}`} size="control" value={draft[field.key] ?? ""}
                                options={field.options} searchable={field.search} multiple={field.multiple} floating open={openField === field.key}
                                onOpenChange={(open) => setOpenField(open ? field.key : null)}
                                onChange={(value) => setDraft((current) => ({ ...current, [field.key]: value }))} />
                        </div>
                    </Fragment>
                ))}
                {!fields.some((field) => field.key === dateBefore) && dates}
            </div>
            <div className="filter-actions">
                <Button type="button" disabled={applying || !Object.values(draft).some(Boolean)} onClick={() => {
                    setDraft(Object.fromEntries(Object.keys(draft).map((key) => [key, ""])));
                    setOpenField(null);
                }}>초기화</Button>
                <Button type="submit" className="primary" disabled={reversed || applying}>적용</Button>
            </div>
        </FilterFormRoot>
    );
}
