<template>
    <div>
        <!-- 로딩 중 -->
        <div
            v-if="pending"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
            <div v-for="n in 6" :key="n" class="animate-pulse">
                <div class="bg-gray-200 h-52 rounded-2xl mb-4"></div>
                <div class="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>

        <!-- 에러 발생 -->
        <div v-else-if="error" class="text-center py-12">
            <p class="text-red-600">
                글 목록을 불러오는 중 오류가 발생했습니다.
            </p>
        </div>

        <!-- 데이터 있음 -->
        <div v-else-if="articles && articles.length > 0">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <ArticleCard
                    v-for="article in articles"
                    :key="article.id"
                    :article="article"
                />
            </div>

            <!-- 더보기 버튼 (Pagination 대응) -->
            <!-- <div class="mt-12 text-center" v-if="hasMore">
                <button class="px-8 py-3 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors">
                    더 보기
                </button>
            </div> -->
        </div>

        <!-- 데이터 없음 -->
        <div v-else class="bg-white rounded-2xl p-10 text-center shadow-sm">
            <Icon
                name="heroicons:newspaper"
                class="w-12 h-12 text-gray-300 mb-4 mx-auto"
            />
            <h2 class="text-xl font-bold text-gray-900 mb-2">
                아직 게시글이 없습니다
            </h2>
            <p class="text-gray-500">
                이 카테고리의 첫 번째 글이 곧 올라올 예정입니다.
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * 카테고리별 기사 목록 (Article List by Category)
 * Path: app/components/category/ArticleList.vue
 * 
 * 설명:
 * 특정 카테고리에 속한 기사들을 그리드 형태로 보여주는 컴포넌트입니다.
 * API(`/api/articles`)를 호출하여 데이터를 가져오며, 로딩/에러/데이터 없음 상태를 처리합니다.
 * 
 * 데이터 흐름:
 * 1. Props로 `slug`(카테고리 슬러그)를 받습니다.
 * 2. `useFetch`로 해당 슬러그의 기사 목록을 요청합니다.
 * 3. 받아온 데이터를 `ArticleCard` 컴포넌트로 반복 렌더링합니다.
 */
import type { Article } from '~/shared/types/article';

const props = defineProps<{
    slug: string; // 카테고리 슬러그 (API 요청 파라미터)
}>();

// API 호출 및 상태 관리
// useFetch의 key를 slug 기반으로 설정하여 카테고리 변경 시 재호출되도록 함
const { data, pending, error } = await useFetch('/api/articles', {
    query: {
        categorySlug: props.slug,
        limit: 12, // 한 페이지당 표시할 개수
        page: 1,   // (추후 페이지네이션 확장 가능)
    },
    key: `category-articles-${props.slug}`,
    // API 응답 구조 분해: { success: true, data: [...] } -> [...]
    transform: (res: any) => {
        return res.data;
    },
});

const articles = computed(() => (data.value as Article[]) || []);
</script>
