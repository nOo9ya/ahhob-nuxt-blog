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
                <h1 class="text-2xl font-bold text-gray-900">Create New Page</h1>
                <p class="text-gray-500 mt-1">Create a static page with SEO/GEO optimization.</p>
            </div>
        </div>

        <!-- Page Editor Component -->
        <AdminPageEditor @save="handleSave" />
    </div>
</template>

<script setup lang="ts">
/**
 * 페이지 생성 페이지 (New Page)
 * Path: app/pages/admin/pages/new.vue
 *
 * 기능:
 * - 새 정적 페이지 생성 (About, Contact 등)
 * - PageEditor 컴포넌트를 사용하여 에디터 렌더링
 * - SEO/GEO/Social Meta 최적화 지원
 *
 * 데이터 흐름:
 * 1. PageEditor에서 save 이벤트 수신
 * 2. POST /api/pages로 페이지 생성
 * 3. 성공 시 목록 페이지로 이동
 */

definePageMeta({
    layout: 'admin',
    middleware: ['admin'],
});

const router = useRouter();
const toast = useToast();

/**
 * 페이지 저장 핸들러
 * - PageEditor에서 전달받은 폼 데이터를 API로 전송
 */
const handleSave = async (formData: any) => {
    try {
        const response = await $fetch('/api/pages', {
            method: 'POST',
            body: formData,
        });

        toast.success('Page created successfully!');
        router.push('/admin/pages');
    } catch (e: any) {
        console.error('Failed to create page', e);
        toast.error(e.data?.message || 'Failed to create page');
    }
};
</script>
