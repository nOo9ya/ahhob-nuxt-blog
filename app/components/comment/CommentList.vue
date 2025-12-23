<template>
    <div class="space-y-6">
        <CommentItem
            v-for="comment in comments"
            :key="comment.id"
            :comment="comment"
            @reply="$emit('reply', $event)"
            @delete="$emit('delete', $event)"
        />
        
        <div v-if="comments.length === 0" class="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p>아직 작성된 댓글이 없습니다.</p>
            <p class="text-sm mt-1">첫 번째 의견을 남겨보세요!</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Comment } from '~/shared/types/comment';
import CommentItem from './CommentItem.vue';

defineProps<{
    comments: Comment[];
}>();

defineEmits<{
    (e: 'reply', payload: { parentId: number; content: string }): void;
    (e: 'delete', id: number): void;
}>();
</script>
