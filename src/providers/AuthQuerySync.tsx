"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queries";

/** 다른 탭에서 로그인·로그아웃해도 이전 사용자의 선택을 남기지 않는다. */
export default function AuthQuerySync() {
    const client = useQueryClient();
    useEffect(() => {
        const { data: { subscription } } = createClient().auth.onAuthStateChange(event => {
            if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
            // Supabase 알림 콜백 안에서 인증 요청을 기다리지 않는다.
            queueMicrotask(() => {
                void client.cancelQueries({ queryKey: ["likes"] });
                client.removeQueries({ queryKey: ["likes"] });
                void client.resetQueries({ queryKey: queryKeys.me });
            });
        });
        return () => subscription.unsubscribe();
    }, [client]);
    return null;
}
