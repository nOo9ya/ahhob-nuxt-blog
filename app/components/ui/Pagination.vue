<template>
    <nav v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-12">
        <!-- 모바일 뷰 -->
        <div class="flex flex-1 w-full justify-between sm:hidden mt-4">
            <button 
                @click="onPageChange(currentPage - 1)" 
                :disabled="currentPage === 1"
                class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            <span class="flex items-center text-sm text-gray-700 font-medium">
                {{ currentPage }} / {{ totalPages }}
            </span>
            <button 
                @click="onPageChange(currentPage + 1)" 
                :disabled="currentPage === totalPages"
                class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>

        <!-- 데스크탑 뷰 -->
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center mt-8">
            <div class="flex items-center gap-1">
                <!-- 이전 버튼 -->
                <button
                    @click="onPageChange(currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="inline-flex items-center p-2 rounded-lg text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    aria-label="이전 페이지"
                >
                    <span class="sr-only">Previous</span>
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                    </svg>
                </button>

                <!-- 페이지 번호 -->
                <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="onPageChange(Number(page))"
                    :class="[
                        'inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                        currentPage === page
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : typeof page === 'string'
                                ? 'text-gray-700 dark:text-gray-400 cursor-default hover:bg-transparent'
                                : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100'
                    ]"
                    :disabled="typeof page === 'string'"
                >
                    {{ page }}
                </button>

                <!-- 다음 버튼 -->
                <button
                    @click="onPageChange(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="inline-flex items-center p-2 rounded-lg text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    aria-label="다음 페이지"
                >
                    <span class="sr-only">Next</span>
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
const props = defineProps<{
    currentPage: number;
    totalPages: number;
}>();

const emit = defineEmits<{
    (e: 'change', page: number): void;
}>();

const onPageChange = (page: number) => {
    if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
        emit('change', page);
    }
};

// 페이지네이션 로직 (예: 1 ... 4 5 6 ... 10)
const visiblePages = computed(() => {
    const total = props.totalPages;
    const current = props.currentPage;
    const delta = 2; // 현재 페이지 앞뒤로 보여줄 개수
    
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const left = current - delta;
    const right = current + delta;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= left && i <= right)) {
            range.push(i);
        }
    }

    range.forEach(i => {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    });

    return rangeWithDots;
});
</script>
