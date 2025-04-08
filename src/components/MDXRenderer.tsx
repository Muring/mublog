"use client";

import { useMDXComponent } from "next-contentlayer/hooks";

type Props = {
    code: string;
};

export default function MDXRenderer({ code }: Props) {
    const MDXContent = useMDXComponent(code);
    return <MDXContent />;
}
