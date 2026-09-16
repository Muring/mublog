"use client";

import { useEffect } from "react";
import { useToast } from "@/providers/Toast";

const COPIED_MS = 1500;

/**
 * 본문 코드블록마다 언어 라벨과 복사 버튼을 붙인다. 화면에는 아무것도 그리지 않는다.
 *
 * 본문은 서버가 렌더한 HTML 문자열이라(dangerouslySetInnerHTML) React 트리 밖이다.
 * 마크다운 파이프라인에 넣지 않는 이유는 두 가지다 — 버튼은 브라우저에서만 뜻이 있고,
 * 파이프라인을 건드리면 verify:render 의 기준 출력을 전부 다시 맞춰야 한다.
 *
 * html 이 바뀌면 React 가 innerHTML 을 통째로 갈아끼우므로 붙였던 요소도 같이 사라진다.
 * 그래서 effect 가 html 에 의존하고, 따로 되돌릴 게 없다.
 */
export default function CodeBlockTools({ html }: { html: string }) {
    const toast = useToast();

    useEffect(() => {
        const body = document.getElementById("post-body");
        if (!body) return;

        body.querySelectorAll<HTMLPreElement>("pre").forEach((pre) => {
            // StrictMode 는 effect 를 두 번 돌린다. 이미 붙어 있으면 그대로 둔다.
            if (pre.querySelector(":scope > .code-tools")) return;
            const code = pre.querySelector("code");
            if (!code) return;

            // HTML 문자열을 만들지 않고 엘리먼트로 조립한다.
            const tools = document.createElement("div");
            tools.className = "code-tools";

            const language = /\blanguage-([\w-]+)/.exec(code.className)?.[1];
            if (language) {
                const label = document.createElement("span");
                label.className = "code-lang";
                label.textContent = language;
                tools.append(label);
            }

            const button = document.createElement("button");
            button.type = "button";
            button.className = "code-copy";
            button.textContent = "복사";
            button.setAttribute("aria-label", "코드 복사");
            tools.append(button);

            pre.append(tools);
        });

        // 버튼마다 리스너를 달지 않고 본문 하나에 위임한다.
        const handleClick = async (event: MouseEvent) => {
            const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".code-copy");
            if (!button) return;
            const code = button.closest("pre")?.querySelector("code");
            if (!code) return;
            try {
                await navigator.clipboard.writeText(code.textContent ?? "");
                button.textContent = "복사됨";
                button.classList.add("copied");
                window.setTimeout(() => {
                    button.textContent = "복사";
                    button.classList.remove("copied");
                }, COPIED_MS);
            } catch {
                toast.error("복사하지 못했습니다.");
            }
        };
        body.addEventListener("click", handleClick);
        return () => body.removeEventListener("click", handleClick);
    }, [html, toast]);

    return null;
}
