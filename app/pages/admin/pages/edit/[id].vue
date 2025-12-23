<template>
    <div class="space-y-6">
        <!-- Header with Back Button -->
        <div class="flex items-center gap-4">
            <NuxtLink
                to="/admin/pages"
                class="p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </NuxtLink>
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Edit Page</h1>
                <p class="text-gray-500 mt-1">Update page content and SEO settings.</p>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="pending" class="flex justify-center py-20">
             <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>

        <!-- Page Editor Component -->
        <AdminPageEditor
            v-else-if="page"
            :initial-data="page"
            @save="handleSave"
        />

        <!-- Not Found State -->
        <div v-else class="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Page not found</h3>
            <p class="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
            <NuxtLink
                to="/admin/pages"
                class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
                Back to Pages
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * 페이지 수정 페이지 (Edit Page)
 * Path: app/pages/admin/pages/edit/[id].vue
 *
 * 기능:
 * - 기존 정적 페이지 수정
 * - PageEditor 컴포넌트에 초기 데이터 전달
 * - SEO/GEO/Social Meta 수정 지원
 *
 * 데이터 흐름:
 * 1. GET /api/pages/:id로 기존 페이지 데이터 조회
 * 2. PageEditor에 initialData로 전달
 * 3. 수정 후 PUT /api/pages/:id로 업데이트
 * 4. 성공 시 목록 페이지로 이동
 */

definePageMeta({
    layout: 'admin',
    middleware: ['admin'],
});

const route = useRoute();
const router = useRouter();
const toast = useToast();
const pageId = route.params.id as string;

// 페이지 데이터 조회
const { data: pageData, pending } = await useFetch(`/api/pages/${pageId}`);
const page = computed(() => (pageData.value as any)?.data);

/**
 * 페이지 저장 핸들러
 * - PageEditor에서 전달받은 수정된 폼 데이터를 API로 전송
 */
const handleSave = async (formData: any) => {
    try {
        await $fetch(`/api/pages/${pageId}`, {
            method: 'PUT',
            body: formData,
        });

        toast.success('Page updated successfully!');
        router.push('/admin/pages');
    } catch (e: any) {
        console.error('Failed to update page', e);
        toast.error(e.data?.message || 'Failed to update page');
    }
};
</script>
