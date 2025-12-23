<template>
    <div class="bg-gray-50 min-h-screen py-12 sm:py-20">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
            <!-- Header -->
            <div class="mx-auto max-w-2xl text-center mb-16">
                <h2 class="text-base font-semibold leading-7 text-indigo-600">Tag</h2>
                <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    #{{ tag?.name || slug }}
                </p>
                <div class="mt-4 flex justify-center">
                    <span class="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                        {{ articles.length }} Articles
                    </span>
                </div>
            </div>

            <!-- Filters & Count -->
            <div class="flex flex-col sm:flex-row justify-between items-center mb-10 pb-6 border-b border-gray-200">
                <span class="text-gray-500 font-medium mb-4 sm:mb-0">
                    Total {{ total }} articles
                </span>
                <SortSelect v-model="currentSort" :options="sortOptions" />
            </div>

            <!-- Loading State -->
            <div v-if="pending" class="flex justify-center py-20">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>

            <!-- Empty State -->
            <div v-else-if="!articles.length" class="text-center py-20">
                <p class="text-gray-500 text-lg">이 태그와 관련된 기사가 없습니다.</p>
                <NuxtLink to="/" class="mt-6 inline-block text-indigo-600 hover:text-indigo-500 font-medium">
                    홈으로 돌아가기 &rarr;
                </NuxtLink>
            </div>

            <!-- Article Grid -->
            <div v-else>
                <div class="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    <ArticleCard 
                        v-for="article in articles" 
                        :key="article.id" 
                        :article="article" 
                    />
                </div>
                
                <!-- Pagination -->
                <Pagination 
                    :current-page="currentPage" 
                    :total-pages="totalPages" 
                    @change="onPageChange" 
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ArticleCard from '@/components/article/ArticleCard.vue';
import Pagination from '@/components/ui/Pagination.vue';
import SortSelect from '@/components/ui/SortSelect.vue';


const route = useRoute();
const router = useRouter(); // [NEW] URL 쿼리 업데이트용
const config = useRuntimeConfig();
const slug = computed(() => route.params.slug as string);

// State for Filtering & Pagination
const currentPage = computed(() => Number(route.query.page) || 1);
const currentSort = ref(route.query.sort?.toString() || 'latest');
const limit = 12; // 페이지당 12개

const sortOptions = [
    { label: 'Latest', value: 'latest' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'Popular', value: 'popular' },
];

// 정렬 변경 시 페이지 1로 초기화 및 라우터 푸시
watch(currentSort, (newSort) => {
    router.push({
        query: { ...route.query, sort: newSort, page: 1 }
    });
});

const onPageChange = (page: number) => {
    router.push({
        query: { ...route.query, page }
    });
    // 스크롤 상단 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 1. Fetch Tag Info & Articles Parallelly
const { data, pending, error } = await useAsyncData(
    `tag-${slug.value}-${currentPage.value}-${currentSort.value}`,
    async () => {
        const [tagRes, articlesRes] = await Promise.all([
            $fetch<any>(`/api/tags/${slug.value}`).catch(() => null),
            $fetch<any>('/api/articles', {
                query: { 
                    tagSlug: slug.value, 
                    page: currentPage.value, 
                    limit, 
                    sort: currentSort.value 
                }
            })
        ]);

        return {
            tag: tagRes?.data || null,
            articles: articlesRes?.data || [],
            pagination: articlesRes?.pagination || { total: 0, totalPages: 0 }
        };
    },
    {
        // 키가 변경될 때마다 자동 refetch됨 (watch 불필요)
        watch: [slug, currentPage, currentSort] 
    }
);

const tag = computed(() => data.value?.tag);
const articles = computed(() => data.value?.articles || []);
const total = computed(() => data.value?.pagination.total || 0);
const totalPages = computed(() => data.value?.pagination.totalPages || 0);


// Error Handling (Tag not found is 404)
if (error.value || (!tag.value && !pending.value)) {
    throw createError({
        statusCode: 404,
        message: 'Tag not found',
        fatal: true
    });
}

// SEO
useSeoMeta({
    title: tag.value ? `#${tag.value.name} - ${config.public.siteName}` : 'Tag Archive',
    description: `Articles tagged with #${tag.value?.name || slug.value}`,
    ogTitle: tag.value ? `#${tag.value.name} - ${config.public.siteName}` : 'Tag Archive',
    ogDescription: `Explore articles about ${tag.value?.name || slug.value}`,
});

// JSON-LD
const { setBreadcrumbsJsonLd } = useJsonLd();

watchEffect(() => {
    if (tag.value) {
        setBreadcrumbsJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Tags', path: '/tags' }, // Tags 목록 페이지가 있다면
            { name: `#${tag.value.name}`, path: route.path }
        ]);
    }
});
</script>
