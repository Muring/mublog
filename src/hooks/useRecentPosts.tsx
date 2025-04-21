// src/hooks/useRecentPosts.tsx
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

const RECENT_POSTS_KEY = "recentPosts";

export function useRecentPosts() {
    const queryClient = useQueryClient();

    const { data: recent, isLoading } = useQuery<string[]>({
        queryKey: [RECENT_POSTS_KEY],
        queryFn: () => Promise.resolve(JSON.parse(localStorage.getItem(RECENT_POSTS_KEY) || "[]")),
        staleTime: Infinity,
    });

    const addRecent = useMutation({
        mutationFn: (slug: string) => {
            const current = JSON.parse(localStorage.getItem(RECENT_POSTS_KEY) || "[]") as string[];
            const updated = [slug, ...current.filter((s) => s !== slug)].slice(0, 5);
            localStorage.setItem(RECENT_POSTS_KEY, JSON.stringify(updated));
            return Promise.resolve(updated);
        },
        onSuccess: (data) => {
            queryClient.setQueryData([RECENT_POSTS_KEY], data);
        },
    });

    return {
        recentPosts: recent ?? [],
        isLoading,
        addRecentPost: addRecent.mutate,
    };
}
