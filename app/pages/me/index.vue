<script setup lang="ts">

import { useUserSession } from '#imports'; // Ensure other imports work or are auto-imported
import {
    UserCircleIcon,
    BookmarkIcon,
    ChatBubbleLeftEllipsisIcon,
    KeyIcon,
} from '@heroicons/vue/24/outline';


const { loggedIn, user, fetch: refreshSession } = useUserSession();
const { add: addToast } = useToast();

definePageMeta({
    middleware: 'auth',
});

// 탭 상태 타입 정의
type TabType = 'profile' | 'bookmarks' | 'comments';
const activeTab = ref<TabType>('profile');

// --- Profile Edit ---
const profileForm = reactive({
    name: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    avatar: '', // TODO: 이미지 업로드 구현 시 연동
});

const isProfileLoading = ref(false);

// 초기값 설정
watchEffect(() => {
    if (user.value) {
        profileForm.name = user.value.name;
        profileForm.bio = user.value.bio || '';
        profileForm.avatar = user.value.avatar || '';
    }
});

const handleProfileUpdate = async () => {
    isProfileLoading.value = true;
    try {
        await $fetch('/api/users/me', {
            method: 'PUT',
            body: profileForm,
        });

        addToast('프로필이 업데이트되었습니다.', 'success');
        
        // 세션 정보 갱신 (이름 등이 바뀌었으므로)
        await refreshSession();
        
        // 비밀번호 필드 초기화
        profileForm.currentPassword = '';
        profileForm.newPassword = '';
    } catch (error: any) {
        addToast(error.statusMessage || '프로필 업데이트 실패', 'error');
    } finally {
        isProfileLoading.value = false;
    }
};

// --- Bookmarks ---
// 타입 정의
interface BookmarkItem {
    id: number;
    bookmarkedAt: string;
    article: {
        id: number;
        title: string;
        slug: string;
        category: {
            name: string;
            slug: string;
        };
        author: {
            name: string;
        };
    };
}

const { data: bookmarksData } = await useFetch<{ success: boolean; data: BookmarkItem[] }>('/api/bookmarks', {
    query: { limit: 100 },
    immediate: true,
});

// --- Comments ---
interface CommentItem {
    id: number;
    content: string;
    createdAt: string;
    article: {
        id: number;
        title: string;
        slug: string;
        category: {
            slug: string;
        };
    };
}

const { data: commentsData } = await useFetch<{ success: boolean; data: CommentItem[] }>('/api/users/me/comments', {
    query: { limit: 50 },
    immediate: true,
});

// Computed for date formatting
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};
</script>

<template>
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">마이페이지</h1>

        <div class="flex flex-col md:flex-row gap-8">
            <!-- Sidebar / Tabs -->
            <aside class="w-full md:w-64 flex-shrink-0">
                <nav class="space-y-1">
                    <button
                        @click="activeTab = 'profile'"
                        class="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
                        :class="
                            activeTab === 'profile'
                                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                        "
                    >
                        <UserCircleIcon class="mr-3 h-5 w-5 flex-shrink-0" />
                        내 정보 수정
                    </button>
                    <button
                        @click="activeTab = 'bookmarks'"
                        class="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
                        :class="
                            activeTab === 'bookmarks'
                                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                        "
                    >
                        <BookmarkIcon class="mr-3 h-5 w-5 flex-shrink-0" />
                        내 북마크
                        <span class="ml-auto bg-gray-100 dark:bg-gray-700 py-0.5 px-2 rounded-full text-xs text-gray-600 dark:text-gray-300">
                            {{ bookmarksData?.data?.length || 0 }}
                        </span>
                    </button>
                    <button
                        @click="activeTab = 'comments'"
                        class="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
                        :class="
                            activeTab === 'comments'
                                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                        "
                    >
                        <ChatBubbleLeftEllipsisIcon class="mr-3 h-5 w-5 flex-shrink-0" />
                        내 댓글
                        <span class="ml-auto bg-gray-100 dark:bg-gray-700 py-0.5 px-2 rounded-full text-xs text-gray-600 dark:text-gray-300">
                            {{ commentsData?.data?.length || 0 }}
                        </span>
                    </button>
                </nav>
            </aside>

            <!-- Content Area -->
            <main class="flex-1 min-w-0">
                
                <!-- 1. Profile Tab -->
                <div v-if="activeTab === 'profile'" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <UserCircleIcon class="h-6 w-6 mr-2" />
                        프로필 정보
                    </h2>

                    <form @submit.prevent="handleProfileUpdate" class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름 (닉네임)</label>
                            <input
                                v-model="profileForm.name"
                                type="text"
                                required
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">자기소개 (Bio)</label>
                            <textarea
                                v-model="profileForm.bio"
                                rows="3"
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            ></textarea>
                        </div>

                        <hr class="border-gray-200 dark:border-gray-700 my-6" />

                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                            <KeyIcon class="h-5 w-5 mr-2" />
                            비밀번호 변경
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">현재 비밀번호</label>
                                <input
                                    v-model="profileForm.currentPassword"
                                    type="password"
                                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="변경하려면 입력하세요"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">새 비밀번호</label>
                                <input
                                    v-model="profileForm.newPassword"
                                    type="password"
                                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="변경하려면 입력하세요"
                                />
                                <p class="mt-1 text-xs text-gray-500">8자 이상, 영문/숫자/특수문자 조합 권장</p>
                            </div>
                        </div>

                        <div class="flex justify-end pt-4">
                            <button
                                type="submit"
                                :disabled="isProfileLoading"
                                class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                <span v-if="isProfileLoading">저장 중...</span>
                                <span v-else>변경사항 저장</span>
                            </button>
                        </div>
                    </form>
                </div>

                <!-- 2. Bookmarks Tab -->
                <div v-else-if="activeTab === 'bookmarks'" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <BookmarkIcon class="h-6 w-6 mr-2" />
                        내 북마크
                    </h2>

                    <div v-if="bookmarksData?.data?.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
                        저장한 북마크가 없습니다.
                    </div>

                    <div v-else class="grid gap-6 sm:grid-cols-2">
                        <div
                            v-for="item in bookmarksData?.data"
                            :key="item.id"
                            class="group relative bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
                        >
                            <NuxtLink 
                                v-if="item.article?.slug && item.article?.category?.slug"
                                :to="`/${item.article.category.slug}/${item.article.slug}`" 
                                class="absolute inset-0 z-0"
                            >
                                <span class="sr-only">기사 보기</span>
                            </NuxtLink>
                            
                            <div class="relative z-10">
                                <div class="flex items-start justify-between">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 mb-2">
                                        {{ item.article?.category?.name || 'UnCategorized' }}
                                    </span>
                                    <ArticleBookmarkButton 
                                        v-if="item.article?.id"
                                        :article-id="item.article.id" 
                                        :initial-bookmarked="true" 
                                    />
                                </div>
                                <h3 class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-2">
                                    {{ item.article?.title || 'Untitled' }}
                                </h3>
                                <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <span>{{ item.article?.author?.name || 'Unknown' }}</span>
                                    <span class="mx-2">•</span>
                                    <time>{{ formatDate(item.bookmarkedAt) }} 에 저장됨</time>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3. Comments Tab -->
                <div v-else-if="activeTab === 'comments'" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <ChatBubbleLeftEllipsisIcon class="h-6 w-6 mr-2" />
                        내 댓글
                    </h2>

                    <div v-if="commentsData?.data?.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
                        작성한 댓글이 없습니다.
                    </div>

                    <div v-else class="space-y-4">
                        <div
                            v-for="comment in commentsData?.data"
                            :key="comment.id"
                            class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <div class="flex justify-between items-start mb-2">
                                <NuxtLink
                                    v-if="comment.article?.slug && comment.article?.category?.slug"
                                    :to="`/${comment.article.category.slug}/${comment.article.slug}#comment-${comment.id}`"
                                    class="text-sm font-medium text-gray-900 dark:text-white hover:underline"
                                >
                                    {{ comment.article.title || 'Untitled' }}
                                </NuxtLink>
                                <span class="text-xs text-gray-500">{{ formatDate(comment.createdAt) }}</span>
                            </div>
                            <p class="text-gray-700 dark:text-gray-300 line-clamp-2">
                                {{ comment.content }}
                            </p>
                        </div>
                    </div>
                </div>
                
            </main>
        </div>
    </div>
</template>
