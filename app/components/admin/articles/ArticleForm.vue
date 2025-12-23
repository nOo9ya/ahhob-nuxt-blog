<script setup lang="ts">
/**
 * Article Form Component
 * app/components/admin/articles/ArticleForm.vue
 * 
 * 기능: 게시글 작성 및 수정을 위한 공통 폼 컴포넌트
 * 특징:
 * - Tiptap Editor 통합
 * - 카테고리/태그 관리
 * - SEO 메타데이터 입력
 * - 생성(Create) 및 수정(Edit) 모드 지원
 */
import type { Article, Category, ApiResponse } from '~/shared/types/article';
import TiptapEditor from '~/app/components/common/TiptapEditor.vue';
import ImageUploader from '~/app/components/common/ImageUploader.vue';

const props = defineProps<{
    initialData?: Partial<Article>;
    isSubmitting: boolean;
    submitLabel?: string;
}>();

const emit = defineEmits<{
    (e: 'submit', payload: any): void;
    (e: 'cancel'): void;
}>();

const toast = useToast();

// Form Data (Initialize with props or defaults)
const form = reactive({
    title: props.initialData?.title || '',
    slug: props.initialData?.slug || '',
    content: props.initialData?.content || '',
    categoryId: props.initialData?.categoryId || ('' as string | number),
    tags: props.initialData?.tags?.map(t => t.slug).join(', ') || '', // Handle Tag array if editing
    status: props.initialData?.status || 'draft',
    thumbnail: props.initialData?.thumbnail || '',
    excerpt: props.initialData?.excerpt || '',
    // Metadata
    metaTitle: props.initialData?.seoMeta?.title || '',
    metaDescription: props.initialData?.seoMeta?.description || '',
    // Social
    ogTitle: props.initialData?.socialMeta?.ogTitle || '',
    ogDescription: props.initialData?.socialMeta?.ogDescription || '',
    ogImage: props.initialData?.socialMeta?.ogImage || '',
    // GEO
    geoRegion: props.initialData?.geoMeta?.region || '',
    geoPlacename: props.initialData?.geoMeta?.placename || '',
    geoPosition: props.initialData?.geoMeta?.position || '',
    summary: props.initialData?.geoMeta?.summary || '',
});

const activeMetaTab = ref<'seo' | 'social' | 'geo'>('seo');


// If initialData has tag names as string (from direct separate API call potentially), handle it?
// Usually API returns tags array. We map it to comma string for input.

// Fetch Categories
const { data: categoryResponse } = await useFetch<ApiResponse<Category[]>>('/api/categories');
const categories = computed(() => categoryResponse.value?.categories || []);

const categoryMap = computed(() => {
    const map = new Map<number, Category>();
    categories.value.forEach((cat: Category) => map.set(cat.id, cat));
    return map;
});

// Compute Category Path (Recursive)
const categoryPath = computed(() => {
    if (!form.categoryId) return '';
    
    let currentId = Number(form.categoryId);
    const slugs: string[] = [];
    
    while (currentId) {
        const cat = categoryMap.value.get(currentId);
        if (!cat) break;
        slugs.unshift(cat.slug);
        currentId = cat.parentId ? cat.parentId : 0;
    }
    
    return slugs.join('/') || 'uncategorized';
});

// Upload Context for Child Components
const uploadContext = computed(() => ({
    categoryPath: categoryPath.value,
    slug: form.slug || 'temp-draft',
}));

// Slug Auto-generation from Title
const generateSlug = (text: string) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
};

const onTitleInput = () => {
    // Only auto-generate slug if it's empty or if we are in create mode (optional policy)
    // For now, only if empty to avoid overwriting custom slugs on edit
    if (!form.slug) {
        form.slug = generateSlug(form.title);
    }
};

const handleSubmit = () => {
    if (!form.title || !form.content || !form.categoryId) {
        toast.error('Please fill in all required fields (Title, Content, Category).');
        return;
    }

    const payload = {
        ...form,
        categoryId: Number(form.categoryId),
        tagNames: form.tags.split(',').map(t => t.trim()).filter(t => t),
        // Structure nested objects for API
        seoMeta: {
            title: form.metaTitle,
            description: form.metaDescription,
        },
        socialMeta: {
            ogTitle: form.ogTitle,
            ogDescription: form.ogDescription,
            ogImage: form.ogImage,
        },
        geoMeta: {
            region: form.geoRegion,
            placename: form.geoPlacename,
            position: form.geoPosition,
            summary: form.summary,
        }
    };

    emit('submit', payload);
};
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between mb-8">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ initialData ? 'Edit Article' : 'Write New Article' }}</h1>
                <p class="text-gray-500 text-sm mt-1">
                    {{ initialData ? 'Update your existing content.' : 'Create a new blog post using the rich text editor.' }}
                </p>
            </div>
            <div class="flex gap-3">
                <button 
                    @click="$emit('cancel')"
                    class="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    @click="handleSubmit" 
                    :disabled="isSubmitting"
                    class="bg-black text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition-all flex items-center shadow-lg shadow-gray-200"
                >
                    <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isSubmitting ? 'Saving...' : (submitLabel || 'Publish Article') }}
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Editor -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Title & Slug -->
                <div class="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Title <span class="text-red-500">*</span></label>
                        <input 
                            v-model="form.title" 
                            @input="onTitleInput"
                            type="text" 
                            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none font-bold text-lg" 
                            placeholder="Enter article title..."
                        />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1">Slug (URL)</label>
                        <div class="flex items-center">
                            <span class="text-gray-400 text-sm mr-1">/</span>
                            <input 
                                v-model="form.slug" 
                                type="text" 
                                class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm text-gray-600 focus:ring-1 focus:ring-gray-300 outline-none" 
                                placeholder="article-url-slug"
                            />
                        </div>
                    </div>
                </div>

                <!-- Content Editor (Tiptap) -->
                <div class="bg-white p-6 rounded-2xl shadow-sm">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Content <span class="text-red-500">*</span></label>
                    <TiptapEditor 
                        v-model="form.content" 
                        :upload-context="uploadContext"
                        placeholder="Write your amazing story here..."
                    />
                </div>

                <!-- Excerpt -->
                <div class="bg-white p-6 rounded-2xl shadow-sm">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                    <textarea 
                        v-model="form.excerpt" 
                        rows="3" 
                        class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none text-sm" 
                        placeholder="Brief summary for search results and cards..."
                    ></textarea>
                </div>
            </div>

            <!-- Sidebar Settings -->
            <div class="space-y-6">
                <!-- Publishing -->
                <div class="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 class="font-semibold text-gray-900">Publishing</h3>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select 
                            v-model="form.status" 
                            class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white text-sm"
                        >
                            <option value="draft">Draft</option>
                            <option value="review">Review</option>
                            <option value="published">Published</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Category <span class="text-red-500">*</span></label>
                        <select 
                            v-model="form.categoryId" 
                            class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white text-sm"
                        >
                            <option value="" disabled>Select Category</option>
                            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                                {{ cat.name }}
                            </option>
                        </select>
                         <p v-if="categoryPath" class="text-xs text-gray-400 mt-1 pl-1">Path: {{ categoryPath }}</p>
                    </div>
                </div>

                <!-- Organization -->
                <div class="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 class="font-semibold text-gray-900">Organization</h3>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                        <input 
                            v-model="form.tags" 
                            type="text" 
                            class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm" 
                            placeholder="tech, news, tutorial (comma separated)"
                        />
                    </div>
                </div>

                <!-- Media -->
                <div class="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 class="font-semibold text-gray-900">Featured Image</h3>
                    <ImageUploader 
                        v-model="form.thumbnail"
                        :upload-context="uploadContext"
                    />
                </div>

                <!-- Metadata Tabs (SEO, Social, GEO) -->
                <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div class="flex border-b border-gray-100 bg-gray-50/50">
                        <button 
                            @click="activeMetaTab = 'seo'" 
                            :class="[activeMetaTab === 'seo' ? 'bg-white text-black font-semibold border-b-2 border-black' : 'text-gray-500 hover:text-gray-700']"
                            class="flex-1 py-3 text-xs uppercase tracking-wider transition-colors"
                        >
                            SEO
                        </button>
                        <button 
                            @click="activeMetaTab = 'social'" 
                            :class="[activeMetaTab === 'social' ? 'bg-white text-black font-semibold border-b-2 border-black' : 'text-gray-500 hover:text-gray-700']"
                            class="flex-1 py-3 text-xs uppercase tracking-wider transition-colors"
                        >
                            Social
                        </button>
                        <button 
                            @click="activeMetaTab = 'geo'" 
                            :class="[activeMetaTab === 'geo' ? 'bg-white text-black font-semibold border-b-2 border-black' : 'text-gray-500 hover:text-gray-700']"
                            class="flex-1 py-3 text-xs uppercase tracking-wider transition-colors"
                        >
                            GEO
                        </button>
                    </div>

                    <div class="p-6">
                        <!-- SEO Tab -->
                        <div v-show="activeMetaTab === 'seo'" class="space-y-4 animate-fadeIn">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                                <input v-model="form.metaTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="Same as title if empty" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                <textarea v-model="form.metaDescription" rows="3" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="Search engine description..."></textarea>
                            </div>
                        </div>

                        <!-- Social Tab -->
                        <div v-show="activeMetaTab === 'social'" class="space-y-4 animate-fadeIn">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
                                <input v-model="form.ogTitle" type="text" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="Open Graph Title" />
                            </div>
                             <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">OG Image</label>
                                <input v-model="form.ogImage" type="text" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="https://..." />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                                <textarea v-model="form.ogDescription" rows="3" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="Social sharing description..."></textarea>
                            </div>
                        </div>

                        <!-- GEO Tab -->
                        <div v-show="activeMetaTab === 'geo'" class="space-y-4 animate-fadeIn">
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Region</label>
                                    <input v-model="form.geoRegion" type="text" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs" placeholder="KR-11" />
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Placename</label>
                                    <input v-model="form.geoPlacename" type="text" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs" placeholder="Seoul" />
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                <input v-model="form.geoPosition" type="text" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="37.5665;126.9780" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Location Summary</label>
                                <textarea v-model="form.summary" rows="2" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="GEO specific summary..."></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
