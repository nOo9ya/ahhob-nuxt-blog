<template>
    <div class="p-6 max-w-7xl mx-auto">
        <div class="mb-8 flex items-center gap-4">
            <NuxtLink to="/admin/articles" class="p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </NuxtLink>
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Write New Article</h1>
                <p class="text-gray-500 mt-1">Share your knowledge with the world.</p>
            </div>
        </div>

        <!-- The v-else here is syntactically incorrect without a preceding v-if. -->
        <!-- Assuming the intent was to wrap AdminArticleEditor in a div, and the v-else was a mistake or part of a larger, unprovided context. -->
        <!-- I will apply the changes to the AdminArticleEditor props as requested, and include the div as specified, but note the v-else issue. -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AdminArticleEditor
                :categories="(categoriesData as any)?.categories || []"
                @save="handleSave"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'admin',
    middleware: ['admin'],
});

const router = useRouter();
const toast = useToast();

// Fetch categories for the select box
const { data: categoriesData } = await useFetch('/api/categories');
const categories = computed(() => (categoriesData.value as any)?.data || []);

const handleSave = async (formData: any) => {
    try {
        await $fetch('/api/articles', {
            method: 'POST',
            body: formData,
        });
        toast.success('Article published successfully!');
        router.push('/admin/articles');
    } catch (e: any) {
        console.error('Failed to save article', e);
        toast.error(e.data?.message || 'Failed to save article');
    }
};
</script>
