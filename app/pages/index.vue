<template>
    <div class="space-y-12">
        <!-- Hero Section -->
        <HeroSection />

        <!-- Features / Topics -->
        <HomeTopicGrid />

        <!-- Latest Articles Config -->
        <div id="latest" class="relative pt-10 lg:pt-12">
            <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="text-center">
                    <h2
                        class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
                    >
                        Latest Articles
                    </h2>
                    <p
                        class="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4"
                    >
                        Explore our latest thoughts, tutorials, and insights.
                    </p>
                </div>

                <!-- Article Grid -->
                <div
                    class="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none"
                >
                    <!-- Loading State (Skeleton UI) -->
                    <template v-if="pending">
                        <div v-for="n in 3" :key="n" class="flex flex-col overflow-hidden rounded-lg shadow-lg">
                            <div class="flex-shrink-0 animate-pulse bg-gray-200 h-48 w-full"></div>
                            <div class="flex-1 bg-white p-6 flex flex-col justify-between">
                                <div class="flex-1">
                                    <div class="animate-pulse bg-gray-200 h-4 w-1/3 mb-3 rounded"></div>
                                    <div class="block mt-2">
                                        <div class="animate-pulse bg-gray-200 h-6 w-3/4 mb-2 rounded"></div>
                                        <div class="animate-pulse bg-gray-200 h-4 w-full mb-1 rounded"></div>
                                        <div class="animate-pulse bg-gray-200 h-4 w-2/3 rounded"></div>
                                    </div>
                                </div>
                                <div class="mt-6 flex items-center">
                                    <div class="flex-shrink-0">
                                        <div class="animate-pulse bg-gray-200 h-10 w-10 rounded-full"></div>
                                    </div>
                                    <div class="ml-3">
                                        <div class="animate-pulse bg-gray-200 h-3 w-20 mb-1 rounded"></div>
                                        <div class="animate-pulse bg-gray-200 h-3 w-16 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                    
                    <div v-else-if="error" class="col-span-3 text-center py-12">
                        <p class="text-red-500">Failed to load articles.</p>
                        <button @click="() => refresh()" class="mt-2 text-indigo-600 hover:text-indigo-500 font-medium">Retry</button>
                    </div>

                    <template v-else>
                        <ArticleCard
                            v-for="(article, index) in articles"
                            :key="article.id"
                            :article="article"
                            :loading="index === 0 ? 'eager' : 'lazy'"
                        />
                    </template>
                </div>
            </div>
        </div>

        <!-- Newsletter Section -->
        <NewsletterSection />
    </div>
</template>

<script setup lang="ts">
import HeroSection from '@/components/home/HeroSection.vue';
import HomeTopicGrid from '@/components/home/HomeTopicGrid.vue';
import NewsletterSection from '@/components/home/NewsletterSection.vue';
import ArticleCard from '@/components/article/ArticleCard.vue';

definePageMeta({
    layout: 'default',
});

// Fetch articles from API
const { data, pending, error, refresh } = await useFetch('/api/articles', {
    query: { limit: 6 },
});

// Extract articles from response
const articles = computed(() => {
    if (!data.value) return [];
    // API returns { success: true, data: [...], pagination: ... }
    const res = (data.value as any).data || (data.value as any).articles || [];
    return res;
});

useSeoMeta({
    title: 'Blog - Insights for Developers',
    description: 'The best place to stay up to date with technology.',
});
</script>
