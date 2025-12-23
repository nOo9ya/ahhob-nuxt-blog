/**
 * 기능: 단일 기사 데이터 조회 및 상태 관리
 * 경로: app/composables/useArticle.ts
 * 데이터 흐름: Client -> API (/api/articles/:id) -> Server -> DB
 */

import type { Article } from '~/shared/types/article';

export const useArticle = () => {
    const route = useRoute();

    // [slug].vue 또는 [category]/[slug].vue 모두에서 slug 파라미터를 가져옴
    // route.params.slug가 배열일 수도 있으므로(Catch-all), 문자열로 변환 처리
    const slug = computed(() => {
        const param = route.params.slug;
        return Array.isArray(param) ? param[0] : param;
    });

    // 기사 상세 데이터 Fetch
    const {
        data: article,
        pending,
        error,
        refresh,
    } = useFetch<any>(() => `/api/articles/${slug.value}`, {
        key: `article-${slug.value}`,
        watch: [slug],
        // API 응답 구조({ success: true, data: { ... } })에서 실제 데이터만 추출
        transform: (response) => {
            return response.data || response;
        },
    });

    return {
        article,
        pending,
        error,
        refresh,
    };
};
