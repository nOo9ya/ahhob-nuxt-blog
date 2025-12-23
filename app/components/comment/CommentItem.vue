<template>
    <div :id="`comment-${comment.id}`" class="group">
        <div class="flex gap-3 items-start">
            <!-- Avatar -->
            <img
                :src="comment.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.guestName || comment.author?.name || 'User'}`"
                class="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0"
                alt=""
            />
            
            <div class="flex-1 space-y-1">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-semibold text-gray-900">
                            {{ comment.guestName || comment.author?.name || 'Unknown' }}
                        </span>
                        <span v-if="!comment.userId" class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">
                            GUEST
                        </span>
                        <span class="text-xs text-gray-400">{{ timeAgo(comment.createdAt) }}</span>
                    </div>
                </div>

                <!-- Content -->
                <div class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    <div v-if="comment.isPrivate" class="flex items-center text-gray-500 mb-1">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span class="text-xs">비공개 댓글</span>
                    </div>
                    {{ comment.content }}
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-4 mt-1">
                    <button
                        @click="showReplyForm = !showReplyForm"
                        class="text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors"
                    >
                        답글 달기
                    </button>
                    
                    <button
                        v-if="canDelete"
                        @click="$emit('delete', comment.id)"
                        class="text-xs font-medium text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        삭제
                    </button>
                </div>

                <!-- Reply Form -->
                <div v-if="showReplyForm" class="mt-3">
                    <CommentFormExtended
                        :parent-id="comment.id"
                        :loading="isReplying"
                        @submit="onReply"
                        @cancel="showReplyForm = false"
                    />
                </div>
            </div>
        </div>

        <!-- Children (Recursive) -->
        <div v-if="comment.children?.length" class="mt-4 pl-6 border-l-2 border-gray-100 space-y-4 ml-4">
            <CommentItem
                v-for="child in comment.children"
                :key="child.id"
                :comment="child"
                @reply="$emit('reply', $event)"
                @delete="$emit('delete', $event)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Comment } from '~/shared/types/comment';
import { timeAgo } from '~/shared/utils/date';
import CommentFormExtended from './CommentFormExtended.vue';

const props = defineProps<{
    comment: Comment;
}>();

const emit = defineEmits<{
    (e: 'reply', payload: { parentId: number; content: string; isPrivate: boolean; guestName?: string; guestEmail?: string; guestPassword?: string }): void;
    (e: 'delete', id: number): void;
}>();

const { user } = useUserSession();
const showReplyForm = ref(false);
const isReplying = ref(false);

const canDelete = computed(() => {
    // 관리자
    if (user.value?.role === 'admin') return true;
    // 작성자 (회원)
    if (user.value && props.comment.userId && user.value.id === props.comment.userId) return true;
    // 비회원 댓글 (비밀번호 확인 필요하지만 버튼은 노출)
    if (!props.comment.userId) return true;
    
    return false;
});

const onReply = async (data: any) => {
    isReplying.value = true;
    try {
        emit('reply', { 
            parentId: props.comment.id, 
            ...data
        });
        showReplyForm.value = false;
    } finally {
        isReplying.value = false;
    }
};
</script>
