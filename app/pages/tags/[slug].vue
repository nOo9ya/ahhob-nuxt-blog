<template>
    <main class="min-h-screen bg-gray-50 pb-20">
        <!-- 헤더 영역 -->
        <header class="bg-blue-900 text-white py-16 px-4">
            <div class="container mx-auto text-center">
                <NuxtLink
                    to="/tags"
                    class="inline-block px-3 py-1 bg-blue-800 rounded-full text-xs font-bold tracking-wider mb-4 opacity-80 hover:bg-blue-700 transition-colors"
                >
                    TAGS
                </NuxtLink>
                <h1 class="text-3xl md:text-4xl font-bold mb-4">
                    #{{ currentTagName }}
                </h1>
                <p class="text-blue-100 max-w-2xl mx-auto">
                    이 태그와 관련된 총 {{ totalArticles }}개의 기사가 있습니다.
                </p>
            </div>
        </header>

        <!-- 기사 목록 영역 -->
        <div class="container mx-auto px-4 py-12">
            <!-- 로딩 상태 -->
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

            <!-- 에러 상태 -->
            <div v-else-if="error" class="text-center py-20">
                <p class="text-red-500 mb-4">
                    기사 목록을 불러오는 중 오류가 발생했습니다.
                </p>
                <button
                    @click="refresh"
                    class="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
                >
                    다시 시도
                </button>
            </div>

            <!-- 기사 없음 -->
            <div
                v-else-if="!articles || articles.length === 0"
                class="bg-white rounded-2xl p-10 text-center shadow-sm"
            >
                <Icon
                    name="heroicons:newspaper"
                    class="w-12 h-12 text-gray-300 mb-4 mx-auto"
                />
                <h2 class="text-xl font-bold text-gray-900 mb-2">
                    게시글이 없습니다
                </h2>
                <p class="text-gray-500">
                    이 태그와 관련된 기사가 아직 없습니다.
                </p>
            </div>

            <!-- 기사 리스트 -->
            <div
                v-else
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                <ArticleCard
                    v-for="article in articles"
                    :key="article.id"
                    :article="article"
                />
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import type { Article } from '~/shared/types/article';

const route = useRoute();
const tagSlug = computed(() => route.params.slug as string);

// 기사 데이터 Fetch (tagSlug 필터링)
const { data, pending, error, refresh } = await useFetch('/api/articles', {
    query: {
        tagSlug: tagSlug,
        limit: 12,
        page: 1,
    },
    key: `articles-tag-${tagSlug.value}`,
    transform: (res: any) => res, // data, pagination 포함된 전체 객체 반환
});

const articles = computed(() => ((data.value as any)?.data as Article[]) || []);
const totalArticles = computed(
    () => (data.value as any)?.pagination?.total || 0
);
const currentTagName = computed(() => tagSlug.value.toUpperCase()); // 실제 이름은 태그 API를 따로 찔러야 정확하나, 일단 Slug로 대체 (또는 첫 기사의 태그 목록에서 찾을 수도 있음)

const config = useRuntimeConfig();
const siteUrl = config.public.siteUrl;

useSeoMeta({
    title: `#${currentTagName.value} - 태그 검색`,
    description: `${currentTagName.value} 태그와 관련된 기사 목록입니다.`,
    canonical: `${siteUrl}/tags/${tagSlug.value}`,
    ogTitle: `#${currentTagName.value} - 태그 검색`,
    ogDescription: `${currentTagName.value} 태그와 관련된 기사 목록입니다.`,
    ogUrl: `${siteUrl}/tags/${tagSlug.value}`,
});
</script>
