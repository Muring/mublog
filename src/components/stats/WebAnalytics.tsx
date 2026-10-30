"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/** 공개 페이지의 유입 분석. 검색어·인증 값이 들어갈 수 있는 쿼리는 보내지 않는다. */
export function beforeSendPublicPage(event: BeforeSendEvent): BeforeSendEvent | null {
    const url = new URL(event.url);
    if (/^\/(admin|login|auth|api)(\/|$)/.test(url.pathname)) return null;

    url.search = "";
    url.hash = "";
    return { ...event, url: url.toString() };
}

export default function WebAnalytics() {
    return <Analytics beforeSend={beforeSendPublicPage} />;
}
