<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Pages</h1>
                <p class="text-gray-500 mt-1">Manage static pages (About, Contact, etc.)</p>
            </div>
            <NuxtLink
                to="/admin/pages/new"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                New Page
            </NuxtLink>
        </div>

        <!-- Loading State -->
        <div v-if="pending" class="bg-white rounded-xl shadow-sm p-8 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p class="text-gray-500 mt-4">Loading pages...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 text-red-600 p-6 rounded-xl">
            <p class="font-bold">Failed to load pages</p>
            <p class="text-sm">{{ error.message }}</p>
        </div>

        <!-- Pages Table -->
        <div v-else-if="pages.length > 0" class="bg-white rounded-xl shadow-sm overflow-hidden">
            <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                        <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="page in pages" :key="page.id" class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4">
                            <div class="font-medium text-gray-900">{{ page.title }}</div>
                        </td>
                        <td class="px-6 py-4">
                            <span class="text-sm text-gray-600 font-mono">/{{ page.slug }}</span>
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-500">
                            {{ formatDate(page.createdAt) }}
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <NuxtLink
                                    :to="`/admin/pages/edit/${page.id}`"
                                    class="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                                >
                                    Edit
                                </NuxtLink>
                                <NuxtLink
                                    :to="`/${page.slug}`"
                                    target="_blank"
                                    class="text-gray-600 hover:text-gray-800 font-medium text-sm"
                                >
                                    View
                                </NuxtLink>
                                <button
                                    @click="handleDelete(page.id)"
                                    class="text-red-600 hover:text-red-800 font-medium text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Empty State -->
        <div v-else class="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No pages yet</h3>
            <p class="text-gray-500 mb-6">Get started by creating your first static page.</p>
            <NuxtLink
                to="/admin/pages/new"
                class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Create First Page
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * Pages 목록 페이지 (Pages List)
 * Path: app/pages/admin/pages/index.vue
 *
 * 기능:
 * - 정적 페이지 목록 표시 (About, Contact 등)
 * - 페이지 생성/수정/삭제 기능
 * - SEO/GEO 최적화된 페이지 관리
 *
 * 데이터 흐름:
 * - GET /api/pages로 페이지 목록 조회
 * - DELETE /api/pages/:id로 페이지 삭제
 */

definePageMeta({
    layout: 'admin',
    middleware: ['admin'],
});

const toast = useToast();

// 페이지 목록 조회
const { data, pending, error, refresh } = await useFetch('/api/pages');

const pages = computed(() => (data.value as any)?.data || []);

/**
 * 날짜 포맷 함수
 */
const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
};

/**
 * 페이지 삭제 핸들러
 */
const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
        return;
    }

    try {
        await $fetch(`/api/pages/${id}`, {
            method: 'DELETE',
        });
        toast.success('Page deleted successfully!');
        refresh(); // 목록 새로고침
    } catch (e) {
        console.error('Failed to delete page', e);
        toast.error('Failed to delete page');
    }
};
</script>
