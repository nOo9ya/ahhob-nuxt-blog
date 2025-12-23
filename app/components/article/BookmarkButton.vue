<script setup lang="ts">
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/vue/24/solid';
import { BookmarkIcon as BookmarkIconOutline } from '@heroicons/vue/24/outline';


const props = defineProps<{
    articleId: number;
    initialBookmarked?: boolean;
    showLabel?: boolean;
}>();

const { loggedIn } = useUserSession();
const { add: addToast } = useToast();

const isBookmarked = ref(props.initialBookmarked || false);
const isLoading = ref(false);

const toggleBookmark = async () => {
    if (!loggedIn.value) {
        addToast('로그인이 필요합니다. 북마크 기능은 로그인 후 이용 가능합니다.', 'warning', 3000);
        return navigateTo('/login');
    }

    if (isLoading.value) return;

    // Optimistic Update
    const previousState = isBookmarked.value;
    isBookmarked.value = !previousState;
    isLoading.value = true;

    try {
        const { bookmarked } = await $fetch<{ success: boolean; bookmarked: boolean }>(
            `/api/articles/${props.articleId}/bookmark`,
            {
                method: 'POST',
            }
        );

        // 서버 응답으로 상태 동기화
        isBookmarked.value = bookmarked;
        
        const message = bookmarked ? '북마크에 저장되었습니다.' : '북마크가 해제되었습니다.';
        addToast(message, 'success', 2000);

    } catch (error) {
        // 실패 시 롤백
        isBookmarked.value = previousState;
        console.error('Bookmark toggle failed:', error);
        addToast('북마크 처리 중 문제가 발생했습니다.', 'error');
    } finally {
        isLoading.value = false;
    }
};

// 초기 상태가 제공되지 않았고 로그인 상태라면 서버에서 확인
onMounted(async () => {
    if (loggedIn.value && props.initialBookmarked === undefined) {
        try {
            const { data } = await $fetch<{ data: any[] }>('/api/bookmarks', {
                params: { limit: 1000 },
            });
            
            if (data.some((b: any) => b.article.id === props.articleId)) {
                isBookmarked.value = true;
            }
        } catch (e) {
            console.error('Failed to check bookmark status', e);
        }
    }
});
</script>

<template>
    <button
        @click.prevent="toggleBookmark"
        class="inline-flex items-center gap-1.5 transition-colors focus:outline-none"
        :class="[
            isBookmarked 
                ? 'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        ]"
        :title="isBookmarked ? '북마크 해제' : '북마크 저장'"
        aria-label="북마크"
    >
        <component
            :is="isBookmarked ? BookmarkIconSolid : BookmarkIconOutline"
            class="h-6 w-6"
            :class="{ 'animate-pulse': isLoading }"
        />
        <span v-if="showLabel" class="text-sm font-medium">
            {{ isBookmarked ? '저장됨' : '저장' }}
        </span>
    </button>
</template>
