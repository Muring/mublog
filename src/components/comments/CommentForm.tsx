"use client";

import { useState } from "react";
import { CommentFormWrapper } from "./Comments.styled";

const MAX_LENGTH = 2000;

type Props = {
    initialValue?: string;
    placeholder?: string;
    submitLabel: string;
    isPending: boolean;
    error?: string | null;
    autoFocus?: boolean;
    onSubmit: (body: string) => void;
    onCancel?: () => void;
};

export default function CommentForm({
    initialValue = "",
    placeholder = "댓글을 남겨보세요.",
    submitLabel,
    isPending,
    error,
    autoFocus,
    onSubmit,
    onCancel,
}: Props) {
    const [body, setBody] = useState(initialValue);

    const trimmed = body.trim();
    const isOver = body.length > MAX_LENGTH;
    const canSubmit = trimmed.length > 0 && !isOver && !isPending;

    return (
        <CommentFormWrapper
            onSubmit={(e) => {
                e.preventDefault();
                if (!canSubmit) return;
                onSubmit(trimmed);
                // 수정 폼은 부모가 닫으므로 비우지 않는다
                if (!onCancel) setBody("");
            }}
        >
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={placeholder}
                autoFocus={autoFocus}
                onKeyDown={(e) => {
                    // Ctrl/Cmd + Enter 로 제출. Enter 단독은 줄바꿈으로 둔다.
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSubmit) {
                        e.preventDefault();
                        onSubmit(trimmed);
                        if (!onCancel) setBody("");
                    }
                }}
            />

            <div className="form-footer">
                <span className={isOver ? "counter over" : "counter"}>
                    {body.length} / {MAX_LENGTH}
                </span>
                <div className="buttons">
                    {onCancel && (
                        <button type="button" onClick={onCancel} disabled={isPending}>
                            취소
                        </button>
                    )}
                    <button type="submit" className="primary" disabled={!canSubmit}>
                        {isPending ? "저장 중..." : submitLabel}
                    </button>
                </div>
            </div>

            <span className={error ? "form-error visible" : "form-error"} aria-live="polite">
                {error ?? " "}
            </span>
        </CommentFormWrapper>
    );
}
