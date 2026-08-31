import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "로그인" };

export const dynamic = "force-dynamic";

export default async function LoginPage() {
    // 이미 로그인했다면 머무를 이유가 없다
    const user = await getUser();
    if (user) redirect("/");

    return (
        // LoginForm 이 useSearchParams 를 쓰므로 Suspense 경계가 필요하다
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    );
}
