<script setup lang="ts">
/**
 * Featured Section (Latest Stories)
 * app/components/home/FeaturedSection.vue
 */

const { data } = await useAsyncData('home-articles', () =>
    $fetch('/api/articles', {
        query: {
            limit: 5,
            sort: 'createdAt:desc',
        },
    })
);

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
    });
};

const featuredPost = computed(() => {
    const article = data.value?.data?.[0];
    if (!article) return null;
    return {
        title: article.title,
        excerpt: article.excerpt || article.content?.substring(0, 150) + '...',
        image:
            article.thumbnail ||
            'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
        category: article.category?.name || 'General',
        author: {
            name: article.author?.name || 'Anonymous',
            avatar: article.author?.avatar || 'https://i.pravatar.cc/150',
        },
        date: formatDate(article.publishedAt || article.createdAt), // Use publishedAt if available
        readTime: '5 min read',
        slug: article.slug,
    };
});

const latestPosts = computed(() => {
    return (
        data.value?.data?.slice(1).map((article: any) => ({
            title: article.title,
            date: formatDate(article.publishedAt || article.createdAt),
            category: article.category?.name || 'General',
            image:
                article.thumbnail ||
                'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=200&q=80',
            slug: article.slug,
        })) || []
    );
});
</script>

<template>
    <section class="py-12 bg-white">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-2xl font-bold tracking-tight text-gray-900">
                    Editor's Pick & Latest
                </h2>
                <NuxtLink
                    to="/articles"
                    class="hidden sm:block text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                    View all articles
                </NuxtLink>
            </div>

            <div class="lg:grid lg:grid-cols-3 lg:gap-8">
                <!-- Featured Post (Left, 2 cols) -->
                <div class="lg:col-span-2 mb-8 lg:mb-0" v-if="featuredPost">
                    <NuxtLink
                        :to="`/articles/${featuredPost.slug}`"
                        class="group block h-full"
                    >
                        <div
                            class="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden rounded-2xl"
                        >
                            <NuxtImg
                                :src="featuredPost.image"
                                :alt="featuredPost.title"
                                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                format="webp"
                                sizes="100vw sm:50vw md:600px"
                                placeholder
                            />
                            <div class="absolute top-4 left-4">
                                <span
                                    class="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full uppercase tracking-wider"
                                >
                                    {{ featuredPost.category }}
                                </span>
                            </div>
                        </div>
                        <div class="mt-6">
                            <div
                                class="flex items-center text-sm text-gray-500 mb-2"
                            >
                                <span class="font-medium text-gray-900">{{
                                    featuredPost.author.name
                                }}</span>
                                <span class="mx-2">•</span>
                                <time>{{ featuredPost.date }}</time>
                                <span class="mx-2">•</span>
                                <span>{{ featuredPost.readTime }}</span>
                            </div>
                            <h3
                                class="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors"
                            >
                                {{ featuredPost.title }}
                            </h3>
                            <p class="mt-3 text-lg text-gray-600 line-clamp-2">
                                {{ featuredPost.excerpt }}
                            </p>
                            <div
                                class="mt-4 flex items-center text-indigo-600 font-medium group-hover:underline"
                            >
                                Read full story <span class="ml-1">→</span>
                            </div>
                        </div>
                    </NuxtLink>
                </div>

                <!-- Latest List (Right, 1 col) -->
                <div
                    class="lg:col-span-1 space-y-8 pl-0 lg:pl-4"
                    v-if="latestPosts.length > 0"
                >
                    <h3
                        class="text-lg font-bold text-gray-900 border-b pb-2 mb-4"
                    >
                        Latest Stories
                    </h3>

                    <NuxtLink
                        v-for="post in latestPosts"
                        :key="post.slug"
                        :to="`/articles/${post.slug}`"
                        class="group flex gap-4 items-start"
                    >
                        <div
                            class="flex-shrink-0 relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100"
                        >
                            <NuxtImg
                                :src="post.image"
                                :alt="post.title"
                                class="h-full w-full object-cover group-hover:opacity-90"
                                format="webp"
                                width="80"
                                height="80"
                            />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-medium text-indigo-600 mb-1">
                                {{ post.category }}
                            </p>
                            <h4
                                class="text-sm font-bold text-gray-900 leading-tight group-hover:text-indigo-600 line-clamp-2"
                            >
                                {{ post.title }}
                            </h4>
                            <p class="text-xs text-gray-500 mt-1">
                                {{ post.date }}
                            </p>
                        </div>
                    </NuxtLink>

                    <!-- More Link for Mobile -->
                    <div class="block sm:hidden mt-4 text-center">
                        <NuxtLink
                            to="/articles"
                            class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            View all articles →
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
