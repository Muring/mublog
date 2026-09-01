"use client";

import * as React from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";

export default function EmotionRegistry({ children }: { children: React.ReactNode }) {
    const [{ cache, flush }] = React.useState(() => {
        const cache = createCache({ key: "css", prepend: true });
        cache.compat = true;

        let inserted: string[] = [];
        const prevInsert = cache.insert;

        // ✅ 핵심: insert의 원래 파라미터 타입을 그대로 사용 (rest tuple 유지)
        cache.insert = ((...args: Parameters<typeof prevInsert>) => {
            const serialized = args[1];
            if (cache.inserted[serialized.name] === undefined) {
                inserted.push(serialized.name);
            }
            return prevInsert(...args);
        }) as typeof prevInsert;

        const flush = () => {
            const prev = inserted;
            inserted = [];
            return prev;
        };

        return { cache, flush };
    });

    useServerInsertedHTML(() => {
        const names = flush();
        if (names.length === 0) return null;

        let styles = "";
        for (const name of names) styles += cache.inserted[name];

        return <style data-emotion={`${cache.key} ${names.join(" ")}`} dangerouslySetInnerHTML={{ __html: styles }} />;
    });

    return <CacheProvider value={cache}>{children}</CacheProvider>;
}
