<template>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Editor (Left Column) -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Title -->
            <input
                v-model="form.title"
                type="text"
                placeholder="Enter article title..."
                class="w-full text-4xl font-bold border border-gray-200 outline-none placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-xl px-6 py-4 bg-white shadow-sm transition-all"
                @input="onTitleInput"
            />

            <!-- Editor -->
            <div class="bg-white rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 shadow-sm transition-all overflow-hidden relative">
                <div class="prose prose-lg max-w-none min-h-[500px] p-6">
                    <editor-content :editor="editor" />
                </div>
            </div>
            
            <!-- Editor Menu Float/Fixed -->
            <div v-if="editor" class="sticky bottom-6 z-50 mx-auto max-w-max bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-full px-4 py-2 flex items-center gap-2">
                <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'text-primary-600 bg-primary-50': editor.isActive('bold') }" class="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Bold" aria-label="텍스트를 굵게 만들기">
                    <span class="font-bold" aria-hidden="true">B</span>
                </button>
                <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'text-primary-600 bg-primary-50': editor.isActive('italic') }" class="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Italic" aria-label="텍스트를 기울이기">
                    <span class="italic" aria-hidden="true">I</span>
                </button>
                <div class="w-px h-4 bg-gray-200"></div>
                
                <!-- Color Picker -->
                <div class="relative">
                     <button
                        @click="toggleColorPicker"
                        class="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        :class="{ 'bg-gray-100': isColorPickerOpen }"
                        title="Color"
                        aria-label="텍스트 색상 선택"
                        :aria-expanded="isColorPickerOpen"
                    >
                         <span class="font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500" aria-hidden="true">A</span>
                     </button>
                     <div v-if="isColorPickerOpen" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex bg-white shadow-lg rounded-lg border border-gray-200 p-2 gap-1 z-10" role="menu">
                         <button
                            v-for="(color, index) in [
                                { code: '#000000', name: '검정색' },
                                { code: '#EF4444', name: '빨간색' },
                                { code: '#F59E0B', name: '주황색' },
                                { code: '#10B981', name: '초록색' },
                                { code: '#3B82F6', name: '파란색' },
                                { code: '#6366F1', name: '남색' },
                                { code: '#8B5CF6', name: '보라색' }
                            ]"
                            :key="color.code"
                            @click="setColor(color.code)"
                            :style="{ backgroundColor: color.code }"
                            :aria-label="`텍스트 색상을 ${color.name}으로 변경`"
                            class="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                            role="menuitem"
                         ></button>
                     </div>
                     <!-- Backdrop to close on outside click -->
                     <div v-if="isColorPickerOpen" @click="isColorPickerOpen = false" class="fixed inset-0 z-0 cursor-default"></div>
                </div>

                <div class="w-px h-4 bg-gray-200"></div>
                
                <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'text-primary-600 bg-primary-50': editor.isActive('heading', { level: 2 }) }" class="p-2 rounded-full hover:bg-gray-100 transition-colors" title="H2">
                    <span class="font-bold">H2</span>
                </button>
                <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'text-primary-600 bg-primary-50': editor.isActive('heading', { level: 3 }) }" class="p-2 rounded-full hover:bg-gray-100 transition-colors" title="H3">
                    <span class="font-bold text-sm">H3</span>
                </button>
                
                <div class="w-px h-4 bg-gray-200"></div>

                <button @click="editor.chain().focus().toggleCode().run()" :class="{ 'text-primary-600 bg-primary-50': editor.isActive('code') }" class="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Inline Code">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                </button>
                <button @click="editor.chain().focus().toggleCodeBlock().run()" :class="{ 'text-primary-600 bg-primary-50': editor.isActive('codeBlock') }" class="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Code Block">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                </button>
                <button @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'text-primary-600 bg-primary-50': editor.isActive('blockquote') }" class="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Quote">
                    <span class="font-serif text-lg">"</span>
                </button>

                 <div class="w-px h-4 bg-gray-200"></div>

                <!-- List Buttons -->
                <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'text-primary-600 bg-primary-50': editor.isActive('bulletList') }" class="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Bullet List" aria-label="글머리 기호 목록">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M6 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm-3-8a1 1 0 100 2 1 1 0 000-2zm0 4a1 1 0 100 2 1 1 0 000-2zm0 4a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
                    </svg>
                </button>
                <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'text-primary-600 bg-primary-50': editor.isActive('orderedList') }" class="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Ordered List" aria-label="번호 매기기 목록">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>

                 <div class="w-px h-4 bg-gray-200"></div>

                <button @click="triggerEditorImageUpload" class="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Image">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" /></svg>
                </button>
                <input type="file" ref="editorImageInput" class="hidden" accept="image/*" @change="handleEditorImageUpload">
            </div>
        </div>

        <!-- Settings Sidebar (Right Column) -->
        <div class="space-y-6">
            <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h3 class="font-semibold text-gray-900 border-b border-gray-100 pb-2">Publishing</h3>
                
                <!-- Status -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select v-model="form.status" class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white transition-colors">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>

                <!-- Category -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select v-model="form.categoryId" class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white transition-colors">
                        <option value="" disabled>Select category</option>
                        <option v-for="cat in flattenedCategories" :key="cat.id" :value="cat.id">{{ cat.displayName }}</option>
                    </select>
                </div>

                <!-- Comment Policy -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Comment Policy</label>
                    <select v-model="form.commentPolicy" class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white transition-colors">
                        <option value="default">Default (Site Setting)</option>
                        <option value="anyone">Anyone (Guest Allowed)</option>
                        <option value="users_only">Users Only</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </div>

                <!-- Slug -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                        v-model="form.slug"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono bg-gray-50 focus:bg-white transition-colors"
                    />
                </div>

                <!-- Tags -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <div class="flex flex-wrap gap-2 mb-2">
                        <span v-for="tag in form.tags" :key="tag" class="bg-primary-50 text-primary-700 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                            {{ tag }}
                            <button @click="removeTag(tag)" class="hover:text-primary-900">&times;</button>
                        </span>
                    </div>
                    <input
                        v-model="tagInput"
                        @keydown.enter.prevent="addTag"
                        @keydown.space.prevent="addTag"
                        type="text"
                        placeholder="Type & press Enter"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                    />
                </div>
            </div>

            <!-- Thumbnail -->
            <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                 <h3 class="font-semibold text-gray-900 border-b border-gray-100 pb-2">Thumbnail</h3>
                 <div class="aspect-video bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/10 transition-colors relative overflow-hidden" @click="triggerThumbnailUpload">
                     <template v-if="form.thumbnail">
                         <img :src="form.thumbnail" :alt="form.title || '기사 썸네일 미리보기'" class="absolute inset-0 w-full h-full object-cover">
                         <div class="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                             Change Image
                         </div>
                     </template>
                     <template v-else>
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                         </svg>
                         <span class="text-sm text-gray-500">Click to upload</span>
                     </template>
                     <input type="file" ref="thumbnailInput" class="hidden" accept="image/*" @change="handleThumbnailUpload">
                 </div>
            </div>

            <!-- SEO & Meta Settings (Tabbed Interface) -->
             <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="border-b border-gray-100 flex overflow-x-auto">
                    <button 
                        v-for="tab in ['SEO', 'Social', 'Geo', 'Preview']" 
                        :key="tab"
                        @click="activeTab = tab"
                        class="px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap"
                        :class="activeTab === tab ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
                    >
                        {{ tab }}
                    </button>
                </div>
                
                <div class="p-6">
                    <SeoTab v-if="activeTab === 'SEO'" v-model="form" />
                    <SocialTab v-if="activeTab === 'Social'" v-model="form" />
                    <GeoTab v-if="activeTab === 'Geo'" v-model="form" />
                    <MetaPreview v-if="activeTab === 'Preview'" :data="form" />
                </div>
            </div>

            <!-- Save Actions -->
            <div class="flex gap-4">
                <button
                    @click="onSave"
                    :disabled="saving"
                    class="flex-1 bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {{ saving ? 'Saving...' : 'Save Article' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * 기사 에디터 컴포넌트 (Article Editor)
 * Path: app/components/admin/ArticleEditor.vue
 * 
 * 설명:
 * 관리자 페이지에서 기사를 작성하거나 수정할 때 사용하는 핵심 컴포넌트입니다.
 * Tiptap 위지윅 에디터를 내장하고 있으며, 메타데이터(제목, 카테고리, 태그 등) 입력 폼을 포함합니다.
 * 
 * 데이터 흐름:
 * 1. 부모(new.vue, edit/[id].vue)로부터 `initialData`를 받아서 초기화합니다.
 * 2. 사용자가 내용을 수정하면 내부 `form` state가 반응형으로 업데이트됩니다.
 * 3. Tiptap 에디터의 내용은 `onUpdate` 콜백을 통해 `form.content`에 동기화됩니다.
 * 4. 'Save' 버튼 클릭 시 `save` 이벤트를 통해 수정된 `form` 데이터를 부모에게 전달합니다.
 */
// Tiptap Extensions
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

import SeoTab from './MetaEditor/SeoTab.vue';
import SocialTab from './MetaEditor/SocialTab.vue';
import GeoTab from './MetaEditor/GeoTab.vue';
import MetaPreview from './MetaEditor/MetaPreview.vue';

// Slug 생성 유틸리티 (공통)
import { generateSlug } from '~/shared/utils/slug';

// Setup Lowlight for syntax highlighting
const lowlight = createLowlight(common);

const props = defineProps({
    // 수정 모드일 때 기존 데이터, 생성 모드일 때는 빈 객체 또는 초기값
    initialData: {
        type: Object,
        default: () => ({}),
    },
    // 카테고리 선택을 위한 목록 데이터 (부모가 fetch해서 전달)
    categories: {
        type: Array as PropType<any[]>,
        default: () => [],
    },
});

const emit = defineEmits(['save']);

const saving = ref(false);
const tagInput = ref('');
const thumbnailInput = ref<HTMLInputElement | null>(null);
const activeTab = ref('SEO');
const isColorPickerOpen = ref(false);
const toast = useToast();

const toggleColorPicker = () => {
    isColorPickerOpen.value = !isColorPickerOpen.value;
};

const setColor = (color: string) => {
    if (editor.value) {
        editor.value.chain().focus().setColor(color).run();
    }
    isColorPickerOpen.value = false;
};

// Flatten categories with depth for hierarchy display
const flattenedCategories = computed(() => {
    if (!props.categories || props.categories.length === 0) return [];
    
    // Sort logic can be complex, but if backend sends flat list with path/parentId,
    // we can sort by path to ensure hierarchy order if path is maintained correctly.
    // If backend already sorts by created_at, we might need to rely on path string sort for display.
    // Let's try simple sort by path if available, assuming path string '001/002' represents hierarchy.
    
    const cats = [...props.categories];
    // Sort by path if available to group parents and children
    cats.sort((a, b) => (a.path || '').localeCompare(b.path || ''));

    return cats.map(cat => {
        // Depth based on slash count in path or similar logic. 
        // Assuming path format like 'root/child' or just counting parentId chain if fully loaded (which is hard client side without tree).
        // Using path length or slash count is a robust heuristic if path is maintained.
        const depth = cat.path ? cat.path.split('/').length - 1 : 0;
        const prefix = depth > 0 ? '— '.repeat(depth) : '';
        return {
            ...cat,
            displayName: `${prefix}${cat.name}`,
        };
    });
});

// 폼 데이터 상태 관리
// props.initialData가 변경되면 watch를 통해 업데이트됩니다.
const form = reactive({
    title: props.initialData.title || '',
    content: props.initialData.content || '',
    status: props.initialData.status || 'draft',
    categoryId: props.initialData.categoryId || (props.categories[0]?.id || ''),
    slug: props.initialData.slug || '',
    tags: props.initialData.tags?.map((t: any) => t.name) || [],
    thumbnail: props.initialData.thumbnail || null,
    commentPolicy: props.initialData.commentPolicy || 'default',

    // SEO Meta
    metaTitle: props.initialData.metaTitle || '',
    metaDescription: props.initialData.metaDescription || '',
    canonicalUrl: props.initialData.canonicalUrl || '',
    ogImage: props.initialData.ogImage || '',
    ogImageAlt: props.initialData.ogImageAlt || '',
    
    // JSON Fields (Nested)
    seoMeta: props.initialData.seoMeta || {
        noIndex: false,
        noFollow: false,
        geoRegion: '',    // Deprecated but kept for compatibility
        geoPlacename: '', // Deprecated
        geoPosition: '',  // Deprecated
    },
    socialMeta: props.initialData.socialMeta || {
        ogTitle: '',
        ogDescription: '',
        twitterCard: 'summary_large_image',
        twitterCreator: '',
    },
    // GEO Meta - Updated Schema (AI Optimization)
    geoMeta: props.initialData.geoMeta || {
        summary: '',
        keyTakeaways: [],
        relevantEntities: [],
        citations: [],
    },
});

// Tiptap 에디터 설정
const editor = useEditor({
    content: form.content,
    extensions: [
        StarterKit.configure({
            codeBlock: false, // Disable default codeBlock to use lowlight
        }),
        Image,
        Link,
        Placeholder.configure({
            placeholder: 'Start writing your amazing story...',
        }),
        TextStyle,
        Color,
        CodeBlockLowlight.configure({
            lowlight,
        }),
    ],
    editorProps: {
        attributes: {
            // Tailwind Typography 및 Editor Styles
            class: 'min-h-[500px] focus:outline-none',
        },
    },
    onUpdate: ({ editor }) => {
        form.content = editor.getHTML();
        // Smart Auto-Sync: Excerpt (Content based)
        // If content is updated and meta description or summary is empty, suggest/fill?
        // Doing this on every keystroke might be heavy/annoying.
        // Let's implement this as a specific action or on save?
        // User requested "automatically input".
        // Let's try to extract text from editor for summary sync if fields are empty.
        const text = editor.getText();
        if (text) {
             const excerpt = text.substring(0, 160).trim();
             const summaryExcerpt = text.substring(0, 300).trim();
             
             if (!form.metaDescription) form.metaDescription = excerpt;
             // Social Sync
             if (!form.socialMeta.ogDescription) form.socialMeta.ogDescription = excerpt;
             // Geo Sync
             if (!form.geoMeta.summary) form.geoMeta.summary = summaryExcerpt;
        }
    },
});

/**
 * 초기 데이터 감지
 */
watch(() => props.initialData, (newData) => {
    if (newData && editor.value) {
        if (form.title !== newData.title) form.title = newData.title || '';
        
        if (newData.content && editor.value.getHTML() !== newData.content) {
            editor.value.commands.setContent(newData.content);
        }
        
        form.status = newData.status || 'draft';
        form.categoryId = newData.categoryId || '';
        form.slug = newData.slug || '';
        form.tags = newData.tags?.map((t: any) => t.name) || [];
        form.thumbnail = newData.thumbnail || null;
        form.commentPolicy = newData.commentPolicy || 'default';

        form.metaTitle = newData.metaTitle || '';
        form.metaDescription = newData.metaDescription || '';
        form.canonicalUrl = newData.canonicalUrl || '';
        form.ogImage = newData.ogImage || '';
        form.seoMeta = newData.seoMeta || { noIndex: false, noFollow: false };
        form.socialMeta = newData.socialMeta || { twitterCard: 'summary_large_image' };
        // GeoMeta Init
        form.geoMeta = newData.geoMeta || { summary: '', keyTakeaways: [] };
    }
}, { deep: true });

// Smart Auto-Sync: Title
watch(() => form.title, (newTitle) => {
    if (newTitle) {
        if (!form.metaTitle) form.metaTitle = newTitle;
        if (!form.socialMeta.ogTitle) form.socialMeta.ogTitle = newTitle;

        // Slug 자동 생성 (생성 모드일 때만)
        // 공통 slug 유틸리티 사용 (한글, 영문, 숫자, @ 지원)
        if (!props.initialData.id) {
             form.slug = generateSlug(newTitle);
        }
    }
});

// Smart Auto-Sync: Thumbnail
watch(() => form.thumbnail, (newThumb) => {
    if (newThumb && !form.ogImage) {
        form.ogImage = newThumb;
    }
});

/**
 * 제목 입력 핸들러 - Slug 자동 생성
 * - 공통 slug 유틸리티 사용 (한글, 영문, 숫자, @ 지원)
 */
const onTitleInput = () => {
    if (!props.initialData.id && form.title) {
        form.slug = generateSlug(form.title);
    }
};

/**
 * 태그 추가 로직
 * - 중복 태그 방지
 */
const addTag = () => {
    const val = tagInput.value.trim();
    if (val && !form.tags.includes(val)) {
        form.tags.push(val);
    }
    tagInput.value = '';
};

const removeTag = (tag: string) => {
    form.tags = form.tags.filter((t: string) => t !== tag);
};

// 썸네일 업로드 트리거 (숨겨진 file input 클릭)
const triggerThumbnailUpload = () => {
    thumbnailInput.value?.click();
};

const editorImageInput = ref<HTMLInputElement | null>(null);

const triggerEditorImageUpload = () => {
    editorImageInput.value?.click();
};

/**
 * 썸네일 이미지 업로드 핸들러
 * - 파일을 선택하면 서버 API(/api/upload)로 전송하고 반환된 URL을 폼에 설정합니다.
 */
const handleThumbnailUpload = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // 파일 유효성 검사
    if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'featured'); // 썸네일은 featured 타입으로 요청

    // 로딩 토스트 표시
    toast.info('Uploading thumbnail...');

    try {
        const res: any = await $fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        // API 응답 구조: { success: true, files: [{ url: '...' }] }
        if (res.success && res.files && res.files.length > 0) {
             form.thumbnail = res.files[0].variants?.thumbnail || res.files[0].url;
             toast.success('Thumbnail uploaded successfully!');
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (err: any) {
        console.error('Thumbnail upload error:', err);
        toast.error(err.data?.message || 'Failed to upload thumbnail');
    }
};

/**
 * 에디터 본문 이미지 업로드 핸들러
 * - 파일을 선택하면 서버 API(/api/upload)로 전송하고 반환된 URL을 에디터에 삽입합니다.
 */
const handleEditorImageUpload = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // 파일 유효성 검사
    if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'body'); // 본문 이미지는 body 타입으로 요청

    // 로딩 토스트 표시
    const loadingToast = toast.info('Uploading image...');

    try {
        const res: any = await $fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (res.success && res.files && res.files.length > 0) {
            const imageUrl = res.files[0].url;
            if (editor.value) {
                editor.value.chain().focus().setImage({ src: imageUrl }).run();
                toast.success('Image uploaded successfully!');
            }
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (err: any) {
        console.error('Image upload error:', err);
        toast.error(err.data?.message || 'Failed to upload image');
    }

    // Reset input
    if (e.target) (e.target as HTMLInputElement).value = '';
};

/**
 * 저장 이벤트 발송
 * - 폼 데이터를 복사하여 부모에게 전달합니다. (Reactive 객체 직접 전달 방지)
 */
const onSave = () => {
    // Fallback logic: Auto-fill meta titles if empty
    if (!form.metaTitle && form.title) form.metaTitle = form.title;
    if (!form.socialMeta.ogTitle && form.title) form.socialMeta.ogTitle = form.title;

    emit('save', { ...form });
};
</script>

<style>
/* Tiptap specific styles */
.ProseMirror p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
