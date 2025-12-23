<template>
    <div class="bg-gray-50 min-h-screen pb-20">
        <!-- Author Profile Header -->
        <div class="bg-white border-b border-gray-200">
            <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
                <div v-if="author" class="flex flex-col items-center">
                    <NuxtImg
                        :src="author.avatar || 'https://ui-avatars.com/api/?name=' + author.name + '&background=random'"
                        :alt="author.name"
                        class="h-32 w-32 rounded-full border-4 border-white shadow-lg mb-6 object-cover"
                        format="webp"
                    />
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ author.name }}</h1>
                    <p class="text-gray-500 max-w-2xl mx-auto mb-6">{{ author.bio || '등록된 소개가 없습니다.' }}</p>
                    
                    <!-- Social Links -->
                    <div v-if="author.socialLinks" class="flex space-x-4">
                        <a 
                            v-for="(link, platform) in author.socialLinks" 
                            :key="platform" 
                            :href="link" 
                            target="_blank" 
                            class="text-gray-400 hover:text-gray-900 transition-colors uppercase text-sm font-semibold tracking-wide"
                        >
                            {{ platform }}
                        </a>
                    </div>
                </div>
                
                <!-- Loading State (Header) -->
                <div v-else-if="pending" class="animate-pulse flex flex-col items-center">
                    <div class="h-32 w-32 bg-gray-200 rounded-full mb-6"></div>
                    <div class="h-8 w-48 bg-gray-200 rounded mb-2"></div>
                    <div class="h-4 w-64 bg-gray-200 rounded"></div>
                </div>

                <!-- Not Found -->
                <div v-else class="text-center py-10">
                    <p class="text-gray-500">존재하지 않는 사용자입니다.</p>
                </div>
            </div>
        </div>

        <!-- Author's Articles -->
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div class="flex flex-col sm:flex-row justify-between items-center mb-10 pb-6 border-b border-gray-200">
                <h2 class="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                    작성한 기사 <span class="text-gray-500 text-lg font-normal ml-2">({{ total }})</span>
                </h2>
                <SortSelect v-model="currentSort" :options="sortOptions" />
            </div>

            <div v-if="pending" class="flex justify-center py-20">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>

            <div v-else-if="!articles.length" class="text-center py-20">
                <p class="text-gray-500 text-lg">아직 작성한 기사가 없습니다.</p>
            </div>

            <div v-else>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <ArticleCard
                        v-for="article in articles"
                        :key="article.id"
                        :article="article"
                    />
                </div>
                
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
const router = useRouter();
const authorId = computed(() => route.params.id as string);

// State
const currentPage = computed(() => Number(route.query.page) || 1);
const currentSort = ref(route.query.sort?.toString() || 'latest');
const limit = 12;

const sortOptions = [
    { label: 'Latest', value: 'latest' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'Popular', value: 'popular' },
];

watch(currentSort, (newSort) => {
    router.push({ query: { ...route.query, sort: newSort, page: 1 } });
});

const onPageChange = (page: number) => {
    router.push({ query: { ...route.query, page } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Data Fetching
const { data, pending, error } = await useAsyncData(
    `author-${authorId.value}-${currentPage.value}-${currentSort.value}`,
    async () => {
        const [authorRes, articlesRes] = await Promise.all([
            $fetch<any>(`/api/authors/${authorId.value}`).catch(() => null),
            $fetch<any>('/api/articles', {
                query: { 
                    authorId: authorId.value,
                    page: currentPage.value, 
                    limit, 
                    sort: currentSort.value 
                }
            })
        ]);

        return {
            author: authorRes?.data || null,
            articles: articlesRes?.data || [],
            pagination: articlesRes?.pagination || { total: 0, totalPages: 0 }
        };
    },
    {
        watch: [authorId, currentPage, currentSort]
    }
);

const author = computed(() => data.value?.author);
const articles = computed(() => data.value?.articles || []);
const total = computed(() => data.value?.pagination?.total || 0);
const totalPages = computed(() => data.value?.pagination?.totalPages || 0);

// SEO Meta
useSeoMeta({
    title: () => author.value ? `${author.value.name} - Author Profile` : 'Author Not Found',
    description: () => author.value?.bio || `${author.value?.name}님의 작성 기사 목록입니다.`,
    ogTitle: () => author.value?.name,
    ogDescription: () => author.value?.bio,
    ogImage: () => author.value?.avatar,
});
</script>
