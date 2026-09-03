"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LoginWrapper, GithubButton } from "./Login.styled";

const ERROR_MESSAGES: Record<string, string> = {
    missing_code: "인가 코드가 전달되지 않았습니다. 다시 시도해 주세요.",
    exchange_failed: "로그인 처리에 실패했습니다. 다시 시도해 주세요.",
};

export default function LoginForm() {
    const searchParams = useSearchParams();
    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState<string | null>(
        ERROR_MESSAGES[searchParams.get("error") ?? ""] ?? null
    );

    // 내부 경로만 허용한다 (open redirect 방지)
    const rawNext = searchParams.get("next") ?? "/";
    const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

    async function signIn() {
        setIsPending(true);
        setMessage(null);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
            },
        });

        if (error) {
            setMessage("GitHub 로그인을 시작하지 못했습니다.");
            setIsPending(false);
        }
    }

    return (
        <LoginWrapper>
            <h2>로그인</h2>
            <p className="desc">
                GitHub 계정으로 로그인하면 댓글을 남길 수 있습니다.
                <br />
                포스트 작성과 수정은 운영자만 가능합니다.
            </p>

            <GithubButton onClick={signIn} disabled={isPending}>
                <Image
                    src="/icons/github.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="auto-dark"
                />
                {isPending ? "이동 중..." : "GitHub 로 계속하기"}
            </GithubButton>

            {message && <p className="error">{message}</p>}

            {/* 무엇이 저장되는지는 누르기 전에 알아야 한다 */}
            <p className="notice">
                로그인하면 GitHub 사용자명과 프로필 이미지가 저장됩니다. 이메일과 비밀번호는
                받지 않습니다. <Link href="/privacy">개인정보 처리방침</Link></p>
        </LoginWrapper>
    );
}
