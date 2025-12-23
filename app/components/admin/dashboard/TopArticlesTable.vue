<script setup lang="ts">
/**
 * TopArticlesTable.vue
 * 조회수 상위 게시글 목록 표시
 */
defineProps<{
    articles: Array<{
        id: number;
        title: string;
        viewCount: number;
        publishedAt: string;
        authorName: string;
        status: string;
    }>;
}>();
</script>

<template>
    <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th class="py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                    <th class="py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Views</th>
                    <th class="py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Date</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                <tr v-for="article in articles" :key="article.id" class="hover:bg-gray-50 transition-colors group">
                    <td class="py-4 px-4">
                        <NuxtLink :to="`/admin/articles/${article.id}`" class="block">
                            <span class="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                {{ article.title }}
                            </span>
                        </NuxtLink>
                    </td>
                    <td class="py-4 px-4 text-right">
                        <span class="font-bold text-gray-900">{{ article.viewCount.toLocaleString() }}</span>
                    </td>
                    <td class="py-4 px-4 text-gray-500 text-sm text-right whitespace-nowrap">
                        {{ article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : '-' }}
                    </td>
                </tr>
                <tr v-if="articles.length === 0">
                    <td colspan="3" class="py-8 text-center text-gray-400">
                        데이터가 없습니다.
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
