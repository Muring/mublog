"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SearchTrigger } from "./Search.styled";
import SearchIcon from "./SearchIcon";
import SearchDialog from "./SearchDialog";

/** 헤더의 검색 버튼. Ctrl/⌘+K 로도 연다. 결과를 고르면 대화상자가 스스로 닫는다. */
export default function SearchButton() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleKey = (event: globalThis.KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setOpen((value) => !value);
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    return (
        <>
            <SearchTrigger type="button" aria-label="검색" title="검색 (Ctrl+K)" onClick={() => setOpen(true)}>
                <SearchIcon />
            </SearchTrigger>
            {/*
              헤더 트리 안에서 그리면 HeaderWrapper 의 `a { width: 3rem }` 규칙이 결과 링크까지
              덮는다. body 로 내보내서 헤더 스타일 밖에 둔다.
            */}
            {open && createPortal(<SearchDialog onClose={() => setOpen(false)} />, document.body)}
        </>
    );
}
