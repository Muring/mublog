"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import { fetchMe, queryKeys } from "@/lib/queries";
import { buttonSubtle } from "@/styles/button";

const StatusLink = styled(Link)`
    ${buttonSubtle}
    padding: .55rem .8rem;
    font-size: .85rem;
    text-decoration: none;
    white-space: nowrap;
    &:focus-visible { outline: 2px solid var(--linkcolor); outline-offset: 2px; }
`;

export default function AiStatusLink() {
    const { data } = useQuery({ queryKey: queryKeys.me, queryFn: fetchMe });
    if (!data?.isAdmin) return null;
    return <StatusLink href="/ai/manage">AI 현황</StatusLink>;
}
