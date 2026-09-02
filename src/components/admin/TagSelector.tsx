"use client";

import { useState } from "react";
import { TagSelectorWrapper } from "./TagSelector.styled";
import { compareTags } from "@/lib/tags";

type Props = {
    /** 기존 포스트에서 수집한 태그 목록 */
    knownTags: string[];
    selected: string[];
    onChange: (tags: string[]) => void;
    /** 저장 시도 시에만 채워진다. 평소에는 null. */
    error?: string | null;
};

/**
 * 태그는 이미 쓰던 것 중에서 고르는 것을 기본으로 한다.
 * 자유 입력이면 devOps / devops / DevOps 처럼 미묘하게 다른 태그가 쌓여
 * 태그 필터가 갈라진다.
 *
 * 새 태그가 필요할 때만 명시적으로 추가하게 해서, 실수로 새로 만드는 일을 막는다.
 */
export default function TagSelector({ knownTags, selected, onChange, error }: Props) {
    const [isAdding, setIsAdding] = useState(false);
    const [draft, setDraft] = useState("");

    // 기존 목록에 없지만 이 글에 이미 붙어 있는 태그도 함께 보여준다
    const options = [...new Set([...knownTags, ...selected])].sort(compareTags);

    function toggle(tag: string) {
        onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);
    }

    function addNew() {
        const tag = draft.trim();
        if (!tag) return;
        if (!selected.includes(tag)) onChange([...selected, tag]);
        setDraft("");
        setIsAdding(false);
    }

    return (
        <TagSelectorWrapper>
            <div className="tag-list">
                {options.map((tag) => (
                    <button
                        key={tag}
                        type="button"
                        className={selected.includes(tag) ? "tag-chip active" : "tag-chip"}
                        onClick={() => toggle(tag)}
                    >
                        {tag}
                    </button>
                ))}

                {isAdding ? (
                    <span className="new-tag">
                        <input
                            autoFocus
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addNew();
                                }
                                if (e.key === "Escape") {
                                    setDraft("");
                                    setIsAdding(false);
                                }
                            }}
                            onBlur={addNew}
                            placeholder="새 태그"
                        />
                    </span>
                ) : (
                    <button
                        type="button"
                        className="tag-chip add"
                        onClick={() => setIsAdding(true)}
                    >
                        + 새 태그
                    </button>
                )}
            </div>

            {/*
              문구가 나타났다 사라질 때 아래 내용이 밀리지 않도록
              항상 자리를 차지하게 두고 보이기만 토글한다.
            */}
            <span className={error ? "hint error" : "hint"} aria-live="polite">
                {error ?? " "}
            </span>
        </TagSelectorWrapper>
    );
}
