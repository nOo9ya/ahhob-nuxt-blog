<template>
    <main class="min-h-screen bg-gray-50 pb-20">
        <!-- 헤더 영역 -->
        <header class="bg-blue-900 text-white py-16 px-4">
            <div class="container mx-auto text-center">
                <span
                    class="inline-block px-3 py-1 bg-blue-800 rounded-full text-xs font-bold tracking-wider mb-4 opacity-80"
                    >TAGS</span
                >
                <h1 class="text-3xl md:text-4xl font-bold mb-4">주제별 탐색</h1>
                <p class="text-blue-100 max-w-2xl mx-auto">
                    관심 있는 키워드를 선택하여 관련 기사를 찾아보세요.
                </p>
            </div>
        </header>

        <!-- 태그 클라우드 영역 -->
        <div class="container mx-auto px-4 py-12">
            <!-- 로딩 상태 -->
            <div v-if="pending" class="flex justify-center py-20">
                <Icon
                    name="svg-spinners:180-ring-with-bg"
                    class="w-10 h-10 text-blue-900"
                />
            </div>

            <!-- 에러 상태 -->
            <div v-else-if="error" class="text-center py-20">
                <p class="text-red-500 mb-4">
                    태그를 불러오는 중 오류가 발생했습니다.
                </p>
                <button
                    @click="refresh"
                    class="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
                >
                    다시 시도
                </button>
            </div>

            <!-- 태그 목록 -->
            <div
                v-else
                class="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm"
            >
                <div class="flex flex-wrap justify-center gap-4 items-center">
                    <NuxtLink
                        v-for="tag in sortedTags"
                        :key="tag.id"
                        :to="`/tags/${tag.slug}`"
                        class="transition-all duration-300 hover:scale-110 hover:text-blue-600 font-bold"
                        :class="getTagStyle(tag.articleCount)"
                        :style="{ opacity: getOpacity(tag.articleCount) }"
                    >
                        #{{ tag.name }}
                        <span class="text-xs font-normal opacity-50 ml-0.5"
                            >({{ tag.articleCount }})</span
                        >
                    </NuxtLink>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import type { Tag } from '~/shared/types/article';

// Tag 인터페이스 확장 (articleCount 포함)
interface TagWithCount extends Tag {
    articleCount: number;
}

// 태그 데이터 Fetch
// transform을 사용하여 response.tags 배열만 추출
const {
    data: tags,
    pending,
    error,
    refresh,
} = await useFetch<TagWithCount[]>('/api/tags', {
    transform: (res: any) => res.tags || [],
});

// 기사 개수 많은 순으로 정렬 (API에서도 하긴 하지만 확실하게)
const sortedTags = computed(() => {
    return [...(tags.value || [])].sort(
        (a, b) => b.articleCount - a.articleCount
    );
});

// 기사 수에 따른 크기 클래스 반환
const getTagStyle = (count: number) => {
    if (count >= 10) return 'text-4xl text-blue-900';
    if (count >= 5) return 'text-3xl text-blue-800';
    if (count >= 3) return 'text-2xl text-blue-700';
    if (count >= 1) return 'text-xl text-gray-700';
    return 'text-base text-gray-400';
};

// 기사 수에 따른 투명도 반환 (선택 사항)
const getOpacity = (count: number) => {
    if (count === 0) return 0.6;
    return 1;
};

const config = useRuntimeConfig();
const siteUrl = config.public.siteUrl;

useSeoMeta({
    title: '태그 목록', // titleTemplate에 의해 " - 사이트명"이 붙음
    description: '다양한 주제의 태그를 통해 관심 있는 기사를 찾아보세요.',
    canonical: `${siteUrl}/tags`,
    ogTitle: '태그 목록',
    ogDescription: '다양한 주제의 태그를 통해 관심 있는 기사를 찾아보세요.',
    ogUrl: `${siteUrl}/tags`,
});
</script>
