<script setup lang="ts">
/**
 * 에디터 사이드바 컴포넌트 (Editor Sidebar Component)
 * 경로: app/components/admin/editor/EditorSidebar.vue
 * 기능: 기사 에디터의 사이드바 (카테고리, 태그, 썸네일, SEO 설정)
 *
 * 데이터 흐름:
 * - Parent → Props (article, categories)
 * - User Input → Emit (update:thumbnail, update:tags, update:seo)
 */
import type { Article, Category, ApiResponse } from '~/shared/types/article';

const props = defineProps<{
    article: Article;
}>();

const emit = defineEmits<{
    (e: 'update:thumbnail', file: File): void;
    (e: 'update:tags', tags: string[]): void;
    (e: 'update:seo', seo: { title: string; description: string }): void;
}>();

// 카테고리 목록 가져오기 (실제 API 호출)
const { data: categoryResponse } = await useFetch<ApiResponse<Category[]>>('/api/categories');
const categories = computed(() => categoryResponse.value?.categories || []);

// 태그 이름 배열 (Article.tags에서 name 추출)
const tagNames = ref<string[]>(props.article.tags?.map(t => t.name) || []);

// 태그 입력 핸들러
const handleTagInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newTags = target.value.split(',').map(t => t.trim()).filter(Boolean);
    tagNames.value = newTags;
    emit('update:tags', newTags);
};

// SEO 메타 데이터 (양방향 바인딩)
const seoTitle = ref(props.article.seoMeta?.title || '');
const seoDescription = ref(props.article.seoMeta?.description || '');

// SEO 메타 변경 감지 및 emit
watch([seoTitle, seoDescription], ([newTitle, newDescription]) => {
    emit('update:seo', {
        title: newTitle,
        description: newDescription
    });
});

// 파일 업로드 핸들러
const fileInput = ref<HTMLInputElement | null>(null);

const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        emit('update:thumbnail', file);
    }
};

const openFileDialog = () => {
    fileInput.value?.click();
};
</script>

<template>
    <div class="w-80 border-l border-gray-200 bg-white p-6 space-y-8 h-full overflow-y-auto hidden xl:block">
        <!-- Status Card (상태 카드) -->
        <div class="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</h4>
            <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :class="article.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'"></span>
                <span class="font-medium text-gray-700 capitalize">{{ article.status }}</span>
            </div>
        </div>

        <!-- Settings (설정) -->
        <div class="space-y-6">
            <!-- Category (카테고리) -->
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select
                    v-model="article.categoryId"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                >
                    <option :value="null">Select Category...</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
            </div>

            <!-- Tags (태그) -->
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Tags</label>
                <input
                    type="text"
                    placeholder="Enter tags separated by comma"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm mb-1"
                    :value="tagNames.join(', ')"
                    @input="handleTagInput"
                />
                <div class="flex flex-wrap gap-1">
                    <span v-for="tag in tagNames" :key="tag" class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-xs">
                        #{{ tag }}
                    </span>
                </div>
            </div>

            <!-- Thumbnail (썸네일) -->
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Thumbnail</label>
                <div
                    class="aspect-video rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all relative overflow-hidden group"
                    @click="openFileDialog"
                >
                    <img v-if="article.thumbnail" :src="article.thumbnail" :alt="article.title || '기사 썸네일'" class="absolute inset-0 w-full h-full object-cover" />
                    <div v-else class="text-center p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 mx-auto text-gray-300 mb-2 group-hover:text-indigo-400">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        <span class="text-xs text-gray-400 font-medium">Click to upload</span>
                    </div>
                </div>
                <!-- Hidden Input (숨겨진 입력 필드) -->
                <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileChange" />
            </div>

            <!-- SEO Settings (SEO 설정) -->
            <div class="border-t border-gray-100 pt-6">
                <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">SEO Settings</h4>
                <div class="space-y-3">
                    <div>
                        <label class="text-xs font-medium text-gray-600 block mb-1">Meta Title</label>
                        <input v-model="seoTitle" type="text" class="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-600 block mb-1">Meta Description</label>
                        <textarea v-model="seoDescription" rows="3" class="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 focus:outline-none resize-none"></textarea>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
