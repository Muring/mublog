import { useEffect, type DependencyList } from "react";

/**
 * 디바운스한 뒤 비동기 작업을 돌리고, 다음 입력이 오면 이전 결과를 버린다.
 *
 * 에디터가 이 패턴을 두 벌 갖고 있었다(미리보기 렌더 / slug 중복 확인).
 * 둘 다 타이핑마다 돌면 안 되고, 늦게 도착한 이전 응답이 최신 결과를
 * 덮어써서도 안 된다.
 *
 * clearTimeout 만으로는 부족하다. 이미 시작된 비동기 작업은 타이머를 지워도
 * 계속 진행되므로, cancelled 플래그를 함께 넘겨 결과를 쓰기 직전에 확인하게 한다.
 */
export function useDebouncedEffect(
    run: (isCancelled: () => boolean) => void | Promise<void>,
    deps: DependencyList,
    delayMs: number
) {
    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(() => {
            void run(() => cancelled);
        }, delayMs);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
        // run 은 매 렌더 새로 만들어지므로 의존성에 넣지 않는다.
        // 언제 다시 돌릴지는 호출하는 쪽이 deps 로 정한다.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, delayMs]);
}
