<script setup lang="ts">
import { HeartIcon, EyeIcon } from '@heroicons/vue/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/vue/24/solid';

import { formatNumber } from '~/shared/utils/string';

const props = defineProps<{
    articleId: number;
    initialViewCount: number;
    initialLikeCount: number;
}>();

const { loggedIn } = useUserSession();
const { add: addToast } = useToast();

const viewCount = ref(props.initialViewCount);
const likeCount = ref(props.initialLikeCount);
const isLiked = ref(false);
const isLoading = ref(false);

// Fetch initial like status
const fetchLikeStatus = async () => {
    if (!loggedIn.value) return;
    try {
        const { liked } = await $fetch<{ liked: boolean }>(`/api/articles/${props.articleId}/like`);
        isLiked.value = liked;
    } catch (e) {
        console.error('Failed to fetch like status', e);
    }
};

// Toggle like
const toggleLike = async () => {
    if (!loggedIn.value) {
        addToast('로그인이 필요한 기능입니다.', 'warning');
        return navigateTo('/login');
    }

    if (isLoading.value) return;
    isLoading.value = true;

    try {
        const { liked } = await $fetch<{ liked: boolean }>(`/api/articles/${props.articleId}/like`, {
            method: 'POST',
        });
        
        isLiked.value = liked;
        likeCount.value += liked ? 1 : -1;
    } catch (e) {
        addToast('오류가 발생했습니다.', 'error');
    } finally {
        isLoading.value = false;
    }
};

// Increment view count on mount
onMounted(() => {
    fetchLikeStatus();
    
    // Increment view count
    $fetch<{ viewed: boolean }>(`/api/articles/${props.articleId}/view`, {
        method: 'POST',
    }).then((res) => {
        if (res.viewed) {
            viewCount.value++;
        }
    }).catch(() => {
        // Ignore view count errors (silent fail)
    });
});
</script>

<template>
    <div class="flex items-center gap-6 py-6 border-t border-gray-100 dark:border-gray-800 mt-8">
        <!-- View Count -->
        <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400" title="조회수">
            <EyeIcon class="w-5 h-5" />
            <span class="font-medium">{{ formatNumber(viewCount) }}</span>
        </div>

        <!-- Like Button -->
        <button 
            @click="toggleLike"
            class="flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-200 group"
            :class="[
                isLiked 
                    ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            ]"
        >
            <component 
                :is="isLiked ? HeartIconSolid : HeartIcon" 
                class="w-5 h-5 transition-transform group-active:scale-90"
                :class="{ 'animate-pulse-once': isLiked }"
            />
            <span class="font-medium">{{ formatNumber(likeCount) }}</span>
        </button>
    </div>
</template>

<style scoped>
.animate-pulse-once {
    animation: pulse 0.3s cubic-bezier(0.4, 0, 0.6, 1);
}
@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
}
</style>
