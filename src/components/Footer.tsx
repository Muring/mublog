// src/components/Footer.tsx
"use client";

import styled from "@emotion/styled";

export default function Footer() {
    return (
        <Wrapper>
            <p>© {new Date().getFullYear()} mublog. All rights reserved.</p>
        </Wrapper>
    );
}

const Wrapper = styled.footer`
    padding: 1rem 2rem;
    background-color: #f8f9fa;
    border-top: 1px solid #ddd;
    text-align: center;
    font-size: 0.875rem;
    color: #777;
`;
