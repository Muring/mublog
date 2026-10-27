"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LoginWrapper, ProviderList, ProviderButton } from "./Login.styled";

const ERROR_MESSAGES: Record<string, string> = {
    missing_code: "인가 코드가 전달되지 않았습니다. 다시 시도해 주세요.",
    exchange_failed: "로그인 처리에 실패했습니다. 다시 시도해 주세요.",
};

type Provider = "github" | "google";

const PROVIDERS: { id: Provider; label: string; icon: string; autoDark: boolean }[] = [
    { id: "github", label: "GitHub", icon: "/icons/github.svg", autoDark: true },
    // Google 로고는 브랜드 색이 정해져 있어 다크 테마에서도 반전하지 않는다
    { id: "google", label: "Google", icon: "/icons/google.svg", autoDark: false },
];

export default function LoginForm() {
    const searchParams = useSearchParams();
    const [pending, setPending] = useState<Provider | null>(null);
    const [message, setMessage] = useState<string | null>(
        ERROR_MESSAGES[searchParams.get("error") ?? ""] ?? null
    );

    // 내부 경로만 허용한다 (open redirect 방지)
    const rawNext = searchParams.get("next") ?? "/";
    const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

    async function signIn(provider: Provider, label: string) {
        setPending(provider);
        setMessage(null);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
            },
        });

        if (error) {
            setMessage(`${label} 로그인을 시작하지 못했습니다.`);
            setPending(null);
        }
    }

    return (
        <LoginWrapper>
            <h2>로그인</h2>
            <p className="desc">
                GitHub 또는 Google 계정으로 로그인하면 댓글을 남길 수 있습니다.
                <br />
                포스트 작성과 수정은 운영자만 가능합니다.
            </p>

            <ProviderList>
                {PROVIDERS.map(({ id, label, icon, autoDark }) => (
                    <ProviderButton
                        key={id}
                        onClick={() => signIn(id, label)}
                        disabled={pending !== null}
                    >
                        <Image
                            src={icon}
                            alt=""
                            width={20}
                            height={20}
                            className={autoDark ? "auto-dark" : undefined}
                        />
                        {pending === id ? "이동 중..." : `${label} 로 계속하기`}
                    </ProviderButton>
                ))}
            </ProviderList>

            {message && <p className="error">{message}</p>}

            {/* 무엇이 저장되는지는 누르기 전에 알아야 한다 */}
            <p className="notice">
                로그인하면 사용자 이름, 프로필 이미지, 이메일 주소가 저장됩니다. 이메일은
                계정 확인에만 쓰고 공개하지 않습니다. 비밀번호는 받지 않습니다.{" "}
                <Link href="/privacy">개인정보 처리방침</Link></p>
        </LoginWrapper>
    );
}
