<!--
    기능: 검색 결과 페이지
    경로: app/pages/search.vue
-->
<template>
    <main class="bg-gray-50 min-h-screen pb-20">
        <!-- 검색 헤더 -->
        <div class="bg-white border-b border-gray-200">
            <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 class="text-3xl font-bold tracking-tight text-gray-900 mb-4">
                    '{{ searchQuery }}' 검색 결과
                </h1>
                <p class="text-gray-500">
                    총 <span class="font-bold text-blue-600">{{ total }}</span>개의 글이 발견되었습니다.
                </p>
            </div>
        </div>

        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <!-- 필터 및 정렬 -->
            <div v-if="total > 0" class="flex justify-end mb-8">
                <SortSelect v-model="currentSort" :options="sortOptions" />
            </div>

            <!-- 로딩 상태 -->
            <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div v-for="n in 6" :key="n" class="animate-pulse">
                    <div class="bg-gray-200 h-52 rounded-2xl mb-4"></div>
                    <div class="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>

            <!-- 결과 없음 -->
            <div v-else-if="!articles || articles.length === 0" class="text-center py-20 bg-white rounded-3xl shadow-sm">
                <div class="mx-auto h-24 w-24 text-gray-300 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-900 mb-2">검색 결과가 없습니다</h3>
                <p class="text-gray-500 mb-8">다른 키워드로 검색해 보시거나 철자를 확인해 주세요.</p>
                <NuxtLink to="/" class="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                    메인으로 돌아가기 &rarr;
                </NuxtLink>
            </div>

            <!-- 결과 목록 -->
            <div v-else>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <ArticleCard
                        v-for="article in articles"
                        :key="article.id"
                        :article="article"
                        :search-keyword="searchQuery"
                    />
                </div>
                
                <!-- 페이지네이션 -->
                <Pagination 
                    :current-page="currentPage" 
                    :total-pages="totalPages" 
                    @change="onPageChange" 
                />
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import type { Article } from '~/shared/types/article';
import ArticleCard from '@/components/article/ArticleCard.vue';
import Pagination from '@/components/ui/Pagination.vue';
import SortSelect from '@/components/ui/SortSelect.vue';

const route = useRoute();
const router = useRouter();

// State
const searchQuery = computed(() => (route.query.q as string) || '');
const currentPage = computed(() => Number(route.query.page) || 1);
const currentSort = ref(route.query.sort?.toString() || 'latest');
const limit = 12;

const sortOptions = [
    { label: 'Latest', value: 'latest' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'Popular', value: 'popular' },
];

// 정렬 변경 시
watch(currentSort, (newSort) => {
    if (route.query.sort === newSort) return;
    router.push({
        query: { ...route.query, sort: newSort, page: 1 }
    });
});

// 페이지 변경
const onPageChange = (page: number) => {
    router.push({
        query: { ...route.query, page }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Data Fetching
const { data, pending, error } = await useFetch('/api/articles', {
    query: computed(() => ({
        search: searchQuery.value,
        limit,
        page: currentPage.value,
        sort: currentSort.value
    })),
    key: `search-${searchQuery.value}-${currentPage.value}-${currentSort.value}`,
    transform: (res: any) => res,
    watch: [searchQuery, currentPage, currentSort]
});

const articles = computed(() => (data.value?.data as Article[]) || []);
const total = computed(() => data.value?.pagination?.total || 0);
const totalPages = computed(() => data.value?.pagination?.totalPages || 0);

// SEO Meta
useSeoMeta({
    title: () => `'${searchQuery.value}' 검색 결과 - Blog`,
    description: `검색어 '${searchQuery.value}'에 대한 검색 결과입니다.`
});
</script>
