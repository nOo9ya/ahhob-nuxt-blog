/**
 * 기능: 목차 (Table of Contents) 관리 Composable
 * 경로: app/composables/useTOC.ts
 * 권한: Public
 * 데이터 흐름: ArticleContent(DOM) -> useTOC -> TOC Component
 */

export interface TocItem {
    id: string;
    text: string;
    depth: number;
}

export const useTOC = () => {
    const toc = ref<TocItem[]>([]);
    const activeId = ref<string>('');
    let observer: IntersectionObserver | null = null;

    /**
     * 목차 생성 함수
     * @param selector 검색할 부모 요소의 CSS 선택자
     */
    const generateTOC = (selector: string) => {
        // SSR 환경에서는 실행하지 않음
        if (import.meta.server) return;

        // 약간의 지연을 주어 DOM 렌더링 완료 후 실행
        setTimeout(() => {
            const contentElement = document.querySelector(selector);
            if (!contentElement) return;

            // H2, H3 태그 수집
            const headings = Array.from(contentElement.querySelectorAll('h2, h3'));
            
            toc.value = headings.map((heading) => {
                const id = heading.id || `toc-${Math.random().toString(36).substr(2, 9)}`;
                // ID가 없으면 강제로 부여
                if (!heading.id) heading.id = id;

                return {
                    id,
                    text: heading.textContent || '',
                    depth: parseInt(heading.tagName.substring(1)), // h2 -> 2, h3 -> 3
                };
            });

            // 스크롤 감시 시작
            initObserver(headings);
        }, 100);
    };

    /**
     * IntersectionObserver 초기화
     * 현재 화면 상단에 위치한 헤딩을 감지하여 activeId 업데이트
     */
    const initObserver = (elements: Element[]) => {
        if (observer) observer.disconnect();

        const callback: IntersectionObserverCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    activeId.value = entry.target.id;
                }
            });
        };

        // rootMargin을 조절하여 헤딩이 화면 상단 근처에 왔을 때 감지
        const options: IntersectionObserverInit = {
            rootMargin: '0px 0px -80% 0px',
            threshold: 0.1,
        };

        observer = new IntersectionObserver(callback, options);
        elements.forEach((el) => observer!.observe(el));
    };

    // 컴포넌트 언마운트 시 옵저버 해제
    onUnmounted(() => {
        if (observer) {
            observer.disconnect();
        }
    });

    return {
        toc,
        activeId,
        generateTOC,
    };
};
