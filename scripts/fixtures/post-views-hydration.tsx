import React from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PostViews from "../../src/components/post/PostViews";
import { queryKeys } from "../../src/lib/queries";

// ISR 응답(0)이 도착한 뒤, 상세 영역 하이드레이션보다 방문 비콘 응답(7)이 먼저 온 상황.
// 서버 숫자와 클라이언트 캐시를 의도적으로 다르게 하고 실제 컴포넌트를 hydrate 한다.
const server = new QueryClient({ defaultOptions: { queries: { enabled: false } } });
const client = new QueryClient({ defaultOptions: { queries: { enabled: false } } });
client.setQueryData(queryKeys.postViews("probe"), 7);
const ui = (queryClient: QueryClient, slug = "probe", initialViews = 0) => <QueryClientProvider client={queryClient}><PostViews slug={slug} initialViews={initialViews} /></QueryClientProvider>;
const container = document.createElement("div");
document.body.append(container);
container.innerHTML = renderToString(ui(server));
const serverText = container.textContent;
const errors: string[] = [];
const root = hydrateRoot(container, ui(client), { onRecoverableError: error => errors.push(String(error)) });
const delay = () => new Promise((resolve) => setTimeout(resolve, 100));
setTimeout(async () => {
    const hydratedText = container.textContent;
    client.setQueryData(queryKeys.postViews("probe"), 9);
    await delay();
    const updatedText = container.textContent;
    client.setQueryData(queryKeys.postViews("next"), 11);
    root.render(ui(client, "next", 2));
    await delay();
    const output = document.createElement("pre");
    output.id = "result";
    output.textContent = JSON.stringify({ pass: errors.length === 0 && hydratedText === "조회 7" && updatedText === "조회 9" && container.textContent === "조회 11", serverText, hydratedText, updatedText, navigatedText: container.textContent, errors });
    document.body.append(output);
}, 500);
