"use client";

import styled from "@emotion/styled";
import { statusBadgeBase } from "@/styles/status-badge";

const Badge = styled.span`
    ${statusBadgeBase}
    &[data-status="published"] {
        color: var(--okcolor);
        background: var(--okbg);
        border-color: var(--okborder);
    }
    &[data-status="draft"] {
        color: var(--warncolor);
        background: var(--warnbg);
        border-color: var(--warnborder);
    }
`;

export default function PostStatusBadge({ status, publishedLabel = "발행" }: { status: string; publishedLabel?: string }) {
    const published = status === "PUBLISHED";
    return <Badge className="badge" data-status={published ? "published" : "draft"}>{published ? publishedLabel : "초안"}</Badge>;
}
