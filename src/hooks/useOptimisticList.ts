import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";

/**
 * 목록을 낙관적으로 고치는 mutation.
 *
 * 댓글의 작성 / 수정 / 삭제가 다음 다섯 단계를 똑같이 적고 있었다.
 *
 *   cancelQueries -> 스냅샷 -> setQueryData -> onError 롤백 -> onSettled invalidate
 *
 * 세 벌에서 실제로 다른 것은 가운데 한 줄, "목록을 어떻게 바꾸는가" 뿐이다.
 * 그 한 줄만 apply 로 받고 나머지는 여기서 한 번만 적는다.
 *
 * cancelQueries 를 먼저 부르는 것이 핵심이다. 이미 날아간 조회가 나중에 도착하면
 * 방금 낙관적으로 올린 값을 도로 덮어쓴다.
 */
export function useOptimisticList<TItem, TInput, TResult = unknown>(options: {
    queryKey: QueryKey;
    mutationFn: (input: TInput) => Promise<TResult>;
    /** 응답을 기다리지 않고 목록을 어떻게 바꿀지. 그대로 두려면 스냅샷을 돌려준다. */
    apply: (list: TItem[], input: TInput) => TItem[];
    onError?: (message: string, input: TInput) => void;
    onSuccess?: (result: TResult, input: TInput) => void;
    /** 낙관적 갱신을 시작하기 직전에 할 일 (예: 이전 오류 문구 지우기) */
    onStart?: (input: TInput) => void;
}) {
    const queryClient = useQueryClient();
    const { queryKey, mutationFn, apply, onError, onSuccess, onStart } = options;

    return useMutation<TResult, Error, TInput, { snapshot: TItem[] }>({
        mutationFn,
        onMutate: async (input) => {
            onStart?.(input);
            await queryClient.cancelQueries({ queryKey });
            const snapshot = queryClient.getQueryData<TItem[]>(queryKey) ?? [];
            queryClient.setQueryData<TItem[]>(queryKey, apply(snapshot, input));
            return { snapshot };
        },
        onError: (error, input, context) => {
            if (context) queryClient.setQueryData(queryKey, context.snapshot);
            onError?.(error.message, input);
        },
        onSuccess,
        onSettled: () => queryClient.invalidateQueries({ queryKey }),
    });
}
