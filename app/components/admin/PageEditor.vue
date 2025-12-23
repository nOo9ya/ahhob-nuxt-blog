<template>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Editor (Left Column) -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Title -->
            <input
                v-model="form.title"
                type="text"
                placeholder="Enter page title..."
                class="w-full text-4xl font-bold border border-gray-200 outline-none placeholder-gray-300 focus:ring-2 focus:ring-primary-100 focus:border-primary-300 rounded-xl px-6 py-4 bg-gray-50 transition-all"
                @input="onTitleInput"
            />

            <!-- Editor -->
            <div class="bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-300 transition-all overflow-hidden relative">
                <div class="prose prose-lg max-w-none min-h-[500px]">
                    <editor-content :editor="editor" />
                </div>
            </div>

            <!-- Editor Menu Float/Fixed -->
            <div v-if="editor" class="sticky bottom-6 z-50 mx-auto max-w-max bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-full px-4 py-2 flex items-center gap-2">
                <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'text-primary-600 bg-primary-50': editor.isActive('bold') }" class="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Bold">
                    <span class="font-bold">B</span>
                </button>
                <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'text-primary-600 bg-primary-50': editor.isActive('italic') }" class="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Italic">
                    <span class="italic">I</span>
                </button>
                <div class="w-px h-4 bg-gray-200"></div>

                <!-- Color Picker -->
                <div class="relative">
                     <button
                        @click="toggleColorPicker"
                        class="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        :class="{ 'bg-gray-100': isColorPickerOpen }"
                        title="Color"
                    >
                         <span class="font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">A</span>
                     </button>
                     <div v-if="isColorPickerOpen" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex bg-white shadow-lg rounded-lg border border-gray-200 p-2 gap-1 z-10">
                         <button
                            v-for="color in ['#000000', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6']"
                            :key="color"
                            @click="setColor(color)"
                            :style="{ backgroundColor: color }"
                            class="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform"
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

                <!-- Slug -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                        v-model="form.slug"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono bg-gray-50 focus:bg-white transition-colors"
                    />
                </div>
            </div>

            <!-- Thumbnail -->
            <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                 <h3 class="font-semibold text-gray-900 border-b border-gray-100 pb-2">Thumbnail</h3>
                 <div class="aspect-video bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/10 transition-colors relative overflow-hidden" @click="triggerThumbnailUpload">
                     <template v-if="form.thumbnail">
                         <img :src="form.thumbnail" :alt="form.title || '페이지 썸네일 미리보기'" class="absolute inset-0 w-full h-full object-cover">
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
                        v-for="tab in ['SEO', 'Social', 'GEO', 'Preview']"
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
                    <GeoTab v-if="activeTab === 'GEO'" v-model="form" />
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
                    {{ saving ? 'Saving...' : 'Save Page' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * 페이지 에디터 컴포넌트 (Page Editor)
 * Path: app/components/admin/PageEditor.vue
 *
 * 기능:
 * - 정적 페이지(About, Contact 등) 생성/수정 전용 에디터
 * - Tiptap 위지윅 에디터 내장
 * - SEO/GEO/Social Meta 최적화 지원
 *
 * 데이터 흐름:
 * 1. 부모로부터 initialData를 받아 폼 초기화
 * 2. Tiptap 에디터로 본문 작성
 * 3. SEO/GEO/Social 메타 정보 입력
 * 4. Save 시 save 이벤트를 통해 부모에게 전달
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
    // 수정 모드일 때 기존 데이터, 생성 모드일 때는 빈 객체
    initialData: {
        type: Object,
        default: () => ({}),
    },
});

const emit = defineEmits(['save']);

const saving = ref(false);
const thumbnailInput = ref<HTMLInputElement | null>(null);
const editorImageInput = ref<HTMLInputElement | null>(null);
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

// 폼 데이터 상태 관리
const form = reactive({
    title: props.initialData.title || '',
    content: props.initialData.content || '',
    slug: props.initialData.slug || '',
    thumbnail: props.initialData.thumbnail || null,

    // SEO Meta 필드
    metaTitle: props.initialData.metaTitle || '',
    metaDescription: props.initialData.metaDescription || '',
    canonicalUrl: props.initialData.canonicalUrl || '',
    ogImage: props.initialData.ogImage || '',
    ogImageAlt: props.initialData.ogImageAlt || '',

    // JSON Fields (Nested) - SEO Meta
    seoMeta: props.initialData.seoMeta || {
        keywords: [],
        noIndex: false,
        noFollow: false,
        newsKeywords: [],
        locale: 'ko_KR',
    },

    // Social Meta
    socialMeta: props.initialData.socialMeta || {
        ogTitle: '',
        ogDescription: '',
        ogType: 'website',
        ogLocale: 'ko_KR',
        twitterCard: 'summary_large_image',
        twitterSite: '',
        twitterCreator: '',
        twitterTitle: '',
        twitterDescription: '',
        twitterImage: '',
        twitterImageAlt: '',
    },

    // GEO Meta - AI 최적화
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
            codeBlock: false,
        }),
        Image,
        Link,
        Placeholder.configure({
            placeholder: 'Start writing your page content...',
        }),
        TextStyle,
        Color,
        CodeBlockLowlight.configure({
            lowlight,
        }),
    ],
    editorProps: {
        attributes: {
            class: 'min-h-[500px] p-4 focus:outline-none',
        },
    },
    onUpdate: ({ editor }) => {
        form.content = editor.getHTML();

        // Smart Auto-Sync: 본문 내용을 기반으로 메타 자동 채우기
        const text = editor.getText();
        if (text) {
             const excerpt = text.substring(0, 160).trim();
             const summaryExcerpt = text.substring(0, 300).trim();

             // SEO Meta Description 자동 채우기
             if (!form.metaDescription) form.metaDescription = excerpt;

             // Social Meta 자동 채우기
             if (!form.socialMeta.ogDescription) form.socialMeta.ogDescription = excerpt;
             if (!form.socialMeta.twitterDescription) form.socialMeta.twitterDescription = excerpt;

             // GEO Summary 자동 채우기
             if (!form.geoMeta.summary) form.geoMeta.summary = summaryExcerpt;
        }
    },
});

/**
 * 초기 데이터 감지 (수정 모드)
 */
watch(() => props.initialData, (newData) => {
    if (newData && editor.value) {
        if (form.title !== newData.title) form.title = newData.title || '';

        if (newData.content && editor.value.getHTML() !== newData.content) {
            editor.value.commands.setContent(newData.content);
        }

        form.slug = newData.slug || '';
        form.thumbnail = newData.thumbnail || null;

        form.metaTitle = newData.metaTitle || '';
        form.metaDescription = newData.metaDescription || '';
        form.canonicalUrl = newData.canonicalUrl || '';
        form.ogImage = newData.ogImage || '';
        form.ogImageAlt = newData.ogImageAlt || '';

        form.seoMeta = newData.seoMeta || { keywords: [], noIndex: false, noFollow: false };
        form.socialMeta = newData.socialMeta || { ogType: 'website', twitterCard: 'summary_large_image' };
        form.geoMeta = newData.geoMeta || { summary: '', keyTakeaways: [] };
    }
}, { deep: true });

// Smart Auto-Sync: 제목 변경 시 메타 자동 채우기 및 Slug 생성
watch(() => form.title, (newTitle) => {
    if (newTitle) {
        // Meta Title 자동 채우기
        if (!form.metaTitle) form.metaTitle = newTitle;

        // Social Meta Title 자동 채우기
        if (!form.socialMeta.ogTitle) form.socialMeta.ogTitle = newTitle;
        if (!form.socialMeta.twitterTitle) form.socialMeta.twitterTitle = newTitle;

        // Slug 자동 생성 (생성 모드일 때만)
        // 공통 slug 유틸리티 사용 (한글, 영문, 숫자, @ 지원)
        if (!props.initialData.id) {
             form.slug = generateSlug(newTitle);
        }
    }
});

// Smart Auto-Sync: Thumbnail 변경 시 OG Image 자동 채우기
watch(() => form.thumbnail, (newThumb) => {
    if (newThumb) {
        if (!form.ogImage) form.ogImage = newThumb;
        if (!form.socialMeta.twitterImage) form.socialMeta.twitterImage = newThumb;
    }
});

/**
 * 제목 입력 핸들러 - Slug 자동 생성
 * (공통 slug 유틸리티 사용: 한글, 영문, 숫자, @ 지원)
 */
const onTitleInput = () => {
    if (!props.initialData.id && form.title) {
        form.slug = generateSlug(form.title);
    }
};

// 썸네일 업로드 트리거
const triggerThumbnailUpload = () => {
    thumbnailInput.value?.click();
};

const triggerEditorImageUpload = () => {
    editorImageInput.value?.click();
};

/**
 * 썸네일 이미지 업로드 핸들러
 */
const handleThumbnailUpload = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'featured');

    try {
        const res: any = await $fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (res.success && res.files && res.files.length > 0) {
             form.thumbnail = res.files[0].variants?.thumbnail || res.files[0].url;
        }
    } catch (err) {
        toast.error('Failed to upload thumbnail');
    }
};

/**
 * 에디터 본문 이미지 업로드 핸들러
 */
const handleEditorImageUpload = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'body');

    try {
        const res: any = await $fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (res.success && res.files && res.files.length > 0) {
            const imageUrl = res.files[0].url;
            if (editor.value) {
                editor.value.chain().focus().setImage({ src: imageUrl }).run();
            }
        }
    } catch (err) {
        toast.error('Failed to upload image to editor');
    }

    if (e.target) (e.target as HTMLInputElement).value = '';
};

/**
 * 저장 이벤트 발송
 */
const onSave = () => {
    // Fallback: 메타 자동 채우기
    if (!form.metaTitle && form.title) form.metaTitle = form.title;
    if (!form.socialMeta.ogTitle && form.title) form.socialMeta.ogTitle = form.title;
    if (!form.socialMeta.twitterTitle && form.title) form.socialMeta.twitterTitle = form.title;

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
