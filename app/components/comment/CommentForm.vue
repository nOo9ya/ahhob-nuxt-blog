<template>
    <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <div v-if="!user" class="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
            <NuxtLink to="/login" class="text-primary-600 dark:text-primary-400 font-semibold hover:underline">로그인</NuxtLink> 후 댓글을 남겨보세요.
        </div>
        <form v-else @submit.prevent="onSubmit">
            <div class="mb-3">
                <label for="comment" class="sr-only">댓글 내용</label>
                <textarea
                    id="comment"
                    v-model="content"
                    rows="3"
                    class="block w-full rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm resize-none"
                    placeholder="소중한 의견을 남겨주세요..."
                    required
                ></textarea>
            </div>
            <div class="flex justify-end gap-2">
                <button
                    v-if="parentId"
                    type="button"
                    class="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                    @click="$emit('cancel')"
                >
                    취소
                </button>
                <button
                    type="submit"
                    :disabled="loading || !content.trim()"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <svg
                        v-if="loading"
                        class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ parentId ? '답글 작성' : '댓글 작성' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    parentId?: number;
    loading?: boolean;
}>();

const emit = defineEmits<{
    (e: 'submit', content: string): void;
    (e: 'cancel'): void;
}>();

const { user } = useUserSession();
const content = ref('');

const onSubmit = () => {
    if (!content.value.trim()) return;
    emit('submit', content.value);
    content.value = '';
};
</script>
