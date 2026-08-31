"use client";

import styled from "@emotion/styled";

export const StatsWrapper = styled.p`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--desccolor);
    /* 숫자가 오기 전에도 자리를 지켜 목록이 밀리지 않게 한다 */
    min-height: 1.2rem;

    strong {
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        color: var(--foreground);
    }

    .divider {
        color: var(--bordercolor);
    }
`;
