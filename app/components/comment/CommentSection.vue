<template>
    <section id="comments" class="py-12 border-t border-gray-100">
        <div class="flex items-center justify-between mb-8">
            <h3 class="text-2xl font-bold text-gray-900">
                Comments 
                <span class="text-primary-600 text-lg font-medium ml-1">({{ total }})</span>
            </h3>
        </div>

        <div class="space-y-8">
            <!-- Main Comment Form -->
            <CommentFormExtended
                :comment-policy="commentPolicy"
                :loading="submitting"
                @submit="createComment($event)"
            />

            <!-- Comment List -->
            <div v-if="pending" class="py-12 flex justify-center">
                <svg class="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
            <div v-else-if="error" class="text-center py-8 text-red-500 bg-red-50 rounded-lg">
                댓글을 불러오는 중 오류가 발생했습니다.
            </div>
            <CommentList
                v-else
                :comments="comments"
                @reply="createComment($event)"
                @delete="handleDeleteAttempt"
            />
        </div>

        <!-- Guest Password Modal -->
        <GuestPasswordModal
            :show="showPasswordModal"
            @close="closePasswordModal"
            @verified="confirmDelete"
        />
    </section>
</template>

<script setup lang="ts">
import type { Comment } from '~/shared/types/comment';
import CommentFormExtended from './CommentFormExtended.vue';
import CommentList from './CommentList.vue';
import GuestPasswordModal from './GuestPasswordModal.vue';


const props = defineProps<{
    articleId: number;
    commentPolicy?: 'disabled' | 'users_only' | 'anyone';
}>();

const { user } = useUserSession();
const toast = useToast();

// Fetch Comments
const { data, pending, error, refresh } = await useFetch<{ comments: Comment[], total: number }>(
    `/api/articles/${props.articleId}/comments`,
    {
        key: `comments-${props.articleId}`,
    }
);

const comments = computed(() => data.value?.comments || []);
const total = computed(() => data.value?.total || 0);

const submitting = ref(false);
const showPasswordModal = ref(false);
const pendingDeleteId = ref<number | null>(null);

// Create Comment (or Reply)
const createComment = async (payload: any) => {
    submitting.value = true;
    try {
        await $fetch(`/api/articles/${props.articleId}/comments`, {
            method: 'POST',
            body: payload,
        });
        await refresh();
        toast.success('댓글이 등록되었습니다.');
    } catch (e: any) {
        console.error(e);
        toast.error(e.data?.message || '댓글 등록 실패');
    } finally {
        submitting.value = false;
    }
};

// Delete Attempt
const handleDeleteAttempt = (id: number) => {
    // 1. Find comment to check if guest
    // (Flatten recursively or traverse?)
    // API should handle permission check, but we need to know if we should ask for password.
    // Simple way: Try delete -> if 403/401 code specific for guest pw -> ask password?
    // Better: Check if I am admin or owner (if logged in).
    // If guest comment (userId is null) -> Ask password.
    
    // 재귀적으로 댓글 찾기
    const findComment = (items: Comment[], targetId: number): Comment | null => {
        for (const item of items) {
            if (item.id === targetId) return item;
            if (item.children) {
                const found = findComment(item.children, targetId);
                if (found) return found;
            }
        }
        return null;
    };

    const targetComment = findComment(comments.value, id);
    if (!targetComment) return;

    if (user.value) {
        // Logged in user
        if (user.value.role === 'admin' || user.value.id === targetComment.userId) {
            deleteComment(id);
            return;
        }
    }
    
    // Guest or not owner (Try guest password)
    if (!targetComment.userId) {
        pendingDeleteId.value = id;
        showPasswordModal.value = true;
    } else {
        toast.error('삭제 권한이 없습니다.');
    }
};

const closePasswordModal = () => {
    showPasswordModal.value = false;
    pendingDeleteId.value = null;
};

const confirmDelete = (password: string) => {
    if (pendingDeleteId.value) {
        deleteComment(pendingDeleteId.value, password);
        closePasswordModal();
    }
};

// Real Delete
const deleteComment = async (id: number, guestPassword?: string) => {
    if (!guestPassword && !confirm('정말 삭제하시겠습니까?')) return;

    try {
        await $fetch(`/api/comments/${id}`, {
            method: 'DELETE',
            body: { guestPassword } // DELETE body 지원 여부 확인 필요 (Nuxt/Nitro는 지원)
        });
        await refresh();
        toast.success('댓글이 삭제되었습니다.');
    } catch (e: any) {
        toast.error(e.data?.message || '댓글 삭제에 실패했습니다.');
    }
};
</script>
