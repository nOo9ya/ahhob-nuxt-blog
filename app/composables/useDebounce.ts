
/**
 * Debounce 기능을 제공하는 Composable
 * Path: app/composables/useDebounce.ts
 * 
 * @param fn 실행할 함수
 * @param delay 지연 시간 (ms)
 * @returns debounced function
 */
export function useDebounce<T extends (...args: any[]) => any>(fn: T, delay: number = 300) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const debouncedFn = (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };

    return debouncedFn;
}
