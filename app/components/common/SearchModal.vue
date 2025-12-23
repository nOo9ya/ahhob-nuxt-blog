<!--
    기능: 검색 모달 컴포넌트 (Search Modal Component)
    경로: app/components/common/SearchModal.vue

    데이터 흐름:
    - Props: isOpen (모달 열림 상태)
    - Emits: close (모달 닫기), search (검색 실행)
    - 자동 포커스: 모달 열릴 때 입력창에 자동 포커스
    - ESC 키: 모달 닫기
-->
<script setup lang="ts">
const props = defineProps<{
    isOpen: boolean;
}>();

const emit = defineEmits<{
    close: [];
    search: [keyword: string];
}>();

const searchKeyword = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);

// 모달 열릴 때 자동 포커스
watch(() => props.isOpen, async (isOpen) => {
    if (isOpen) {
        await nextTick();
        searchInputRef.value?.focus();
    }
});

// 검색 실행
const handleSearch = () => {
    if (!searchKeyword.value.trim()) return;
    emit('search', searchKeyword.value);
    searchKeyword.value = '';
};

// ESC 키로 모달 닫기
const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
        emit('close');
    }
};

onMounted(() => {
    document.addEventListener('keydown', handleEscapeKey);
});

onUnmounted(() => {
    document.removeEventListener('keydown', handleEscapeKey);
});
</script>

<template>
    <Teleport to="body">
        <!-- Backdrop -->
        <Transition
            enter-active-class="transition-opacity ease-out duration-200"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity ease-in duration-150"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="isOpen"
                class="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
                @click="emit('close')"
                aria-hidden="true"
            ></div>
        </Transition>

        <!-- 검색 모달 컨텐츠 -->
        <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <div
                v-if="isOpen"
                class="fixed inset-0 z-[70] flex items-start justify-center pt-20 sm:pt-32 px-4"
                @click.self="emit('close')"
            >
                <div
                    class="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
                    @click.stop
                >
                    <!-- 검색 헤더 -->
                    <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <svg
                            class="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                            />
                        </svg>
                        <input
                            ref="searchInputRef"
                            v-model="searchKeyword"
                            @keydown.enter="handleSearch"
                            type="text"
                            placeholder="Search articles, categories, and more..."
                            class="flex-1 bg-transparent border-none text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-0 text-lg"
                        />
                        <button
                            @click="emit('close')"
                            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="검색 닫기"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="w-5 h-5"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- 검색 푸터 (힌트) -->
                    <div class="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div class="flex items-center gap-4">
                            <span class="flex items-center gap-1.5">
                                <kbd class="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-xs font-semibold">Enter</kbd>
                                to search
                            </span>
                            <span class="flex items-center gap-1.5">
                                <kbd class="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-xs font-semibold">Esc</kbd>
                                to close
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
