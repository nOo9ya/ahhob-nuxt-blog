<template>
    <div class="p-6 max-w-7xl mx-auto">
        <div class="mb-8 flex items-center gap-4">
            <NuxtLink to="/admin/articles" class="p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </NuxtLink>
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Edit Article</h1>
                <p class="text-gray-500 mt-1">Update your content.</p>
            </div>
        </div>

        <div v-if="pending" class="flex justify-center py-20">
             <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>

        <div v-else-if="article" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AdminArticleEditor
                :initial-data="article"
                :categories="(categoriesData as any)?.categories || []"
                @save="handleSave"
            />
        </div>

        <div v-else class="text-center py-20 text-gray-500">
            Article not found.
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * Edit Article Page
 * app/pages/admin/articles/edit/[id].vue
 *
 * 기능: 기존 게시글 수정
 * 구성: AdminArticleEditor 컴포넌트 사용 (new.vue와 동일 구조)
 */
definePageMeta({
    layout: 'admin',
    middleware: ['admin'],
});

const route = useRoute();
const router = useRouter();
const toast = useToast();
const articleId = route.params.id as string;

// Fetch categories for the select box
const { data: categoriesData } = await useFetch('/api/categories');
const categories = computed(() => (categoriesData.value as any)?.data || []);

// Fetch article data
const { data: articleData, pending } = await useFetch(`/api/articles/${articleId}`);
const article = computed(() => (articleData.value as any)?.data);

const handleSave = async (formData: any) => {
    try {
        await $fetch(`/api/articles/${articleId}`, {
            method: 'PUT',
            body: formData,
        } as any);

        toast.success('Article updated successfully!');
        router.push('/admin/articles');
    } catch (e: any) {
        console.error('Failed to update article', e);
        toast.error(e.data?.message || 'Failed to update article');
    }
};
</script>
