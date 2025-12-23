<template>
    <div class="space-y-4">
        <!-- Toolbar -->
        <div class="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div class="relative w-full sm:w-64">
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search articles..."
                    class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                    @input="onSearch"
                />
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>
            
            <div class="flex gap-2 w-full sm:w-auto">
                <select
                    v-model="statusFilter"
                    class="px-4 py-2 rounded-lg border border-gray-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                    @change="onFilterChange"
                >
                    <option value="">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>
                
                <NuxtLink
                    to="/admin/articles/new"
                    class="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95 whitespace-nowrap"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                    New Article
                </NuxtLink>
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-100">
                            <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Article</th>
                            <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="article in articles" :key="article.id" class="group hover:bg-gray-50/50 transition-colors">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-4">
                                    <div class="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        <NuxtImg
                                            v-if="article.thumbnail"
                                            :src="article.thumbnail"
                                            class="h-full w-full object-cover"
                                            width="48"
                                            height="48"
                                        />
                                        <div v-else class="h-full w-full flex items-center justify-center text-gray-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <NuxtLink 
                                            :to="`/admin/articles/edit/${article.id}`"
                                            class="font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-1 block"
                                        >
                                            {{ article.title }}
                                        </NuxtLink>
                                        <p class="text-xs text-gray-400 mt-0.5">
                                            {{ formatDate(article.createdAt) }}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex flex-wrap gap-1">
                                    <span 
                                        v-if="article.category?.parent?.name" 
                                        class="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500"
                                    >
                                        {{ article.category.parent.name }}
                                    </span>
                                    <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-900">
                                        {{ article.category?.name || 'Uncategorized' }}
                                    </span>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span
                                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                                    :class="getStatusClass(article.status)"
                                >
                                    <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(article.status)"></span>
                                    {{ getStatusLabel(article.status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <NuxtLink
                                        :to="`/admin/articles/edit/${article.id}`"
                                        class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                        title="Edit"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </NuxtLink>
                                    <button
                                        @click="$emit('delete', article.id)"
                                        class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="articles.length === 0">
                            <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                                No articles found.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <span class="text-sm text-gray-500">
                    Showing page <span class="font-medium text-gray-900">{{ page }}</span> of <span class="font-medium text-gray-900">{{ totalPages }}</span>
                </span>
                <div class="flex gap-2">
                    <button
                        :disabled="page <= 1"
                        @click="$emit('page-change', page - 1)"
                        class="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <button
                        :disabled="page >= totalPages"
                        @click="$emit('page-change', page + 1)"
                        class="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * 기사 목록 테이블 컴포넌트 (Article List Table)
 * Path: app/components/admin/ArticleList.vue
 * 
 * 설명:
 * 관리자 페이지에서 기사 목록을 테이블 형태로 보여주는 Presenter 컴포넌트입니다.
 * 데이터 표시 외에 검색, 필터링, 페이지네이션, 삭제 이벤트를 부모에게 전달하는 역할을 합니다.
 * 순수하게 UI와 이벤트를 담당하며, 실제 API 호출은 부모(페이지)에서 담당합니다.
 * 
 * 주요 기능:
 * - 기사 목록 렌더링 (썸네일, 제목, 카테고리, 상태)
 * - 검색어 Debounce 입력 처리
 * - 상태 필터링 (All, Published, Draft)
 * - 페이지네이션 컨트롤
 */
import { useDebounceFn } from '@vueuse/core';

const props = defineProps({
    // 기사 목록 데이터
    articles: {
        type: Array as PropType<any[]>, // TODO: Article[]로 변경 필요하지만 현재 any 유지 (점진적 전환)
        default: () => [],
    },
    // 현재 페이지 번호
    page: {
        type: Number,
        default: 1,
    },
    // 전체 페이지 수
    totalPages: {
        type: Number,
        default: 1,
    },
});

// 부모에게 알릴 이벤트 정의
const emit = defineEmits(['search', 'filter', 'page-change', 'delete']);

const searchQuery = ref('');
const statusFilter = ref('');

/**
 * 검색어 입력 핸들러 (Debounced)
 * - 사용자가 타이핑을 멈춘 후 300ms 뒤에 이벤트를 발생시켜 불필요한 API 호출을 줄입니다.
 */
const onSearch = useDebounceFn(() => {
    emit('search', searchQuery.value);
}, 300);

// 필터 변경 시 즉시 이벤트 발생
const onFilterChange = () => {
    emit('filter', statusFilter.value);
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'published': return 'Published';
        case 'review': return 'In Review';
        case 'draft': return 'Draft';
        default: return status || 'Unknown';
    }
};

const getStatusClass = (status: string) => {
    switch (status) {
        case 'published': return 'bg-green-50 text-green-700 border-green-100';
        case 'review': return 'bg-orange-50 text-orange-700 border-orange-100';
        case 'draft': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
        default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
};

const getStatusDotClass = (status: string) => {
    switch (status) {
        case 'published': return 'bg-green-500';
        case 'review': return 'bg-orange-500';
        case 'draft': return 'bg-yellow-500';
        default: return 'bg-gray-500';
    }
};

// Auto-imported utils are available in script but explicit import ensures template access and avoids lint errors in some setups.
// Also, locally declaring it makes it available to template without auto-import magic reliance.
import { formatDate } from '~/shared/utils/date';
</script>
