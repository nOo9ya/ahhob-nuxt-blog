<script setup lang="ts">
/**
 * Category Form Component
 * app/components/admin/categories/CategoryForm.vue
 * 
 * 기능: 카테고리 생성 및 수정 양식 (SEO, 메타필드 포함)
 * Props: initialData (수정 시)
 * Emits: submit, cancel
 */
import type { Category } from '~/shared/types/article';

const props = defineProps<{
    initialData?: Category | null;
    isSubmitting?: boolean;
}>();

const emit = defineEmits<{
    (e: 'submit', payload: any): void;
    (e: 'cancel'): void;
}>();

// Form State
const form = reactive({
    name: '',
    slug: '',
    description: '',
    metaTitle: '',
    metaDescription: '',
    ogImage: '',
    summary: '',
    keyTakeaways: [] as string[]
});

// Initialize Form
watch(() => props.initialData, (newData) => {
    if (newData) {
        form.name = newData.name;
        form.slug = newData.slug;
        form.description = newData.description || '';
        form.metaTitle = newData.seoMeta?.title || '';
        form.metaDescription = newData.seoMeta?.description || '';
        form.ogImage = newData.socialMeta?.ogImage || '';
        form.summary = newData.geoMeta?.summary || '';
        form.keyTakeaways = newData.geoMeta?.keyTakeaways || [];
    } else {
        // Reset
        form.name = '';
        form.slug = '';
        form.description = '';
        form.metaTitle = '';
        form.metaDescription = '';
        form.ogImage = '';
        form.summary = '';
        form.keyTakeaways = [];
    }
}, { immediate: true });

// Slug Auto-generation
watch(() => form.name, (newName) => {
    if (!props.initialData && newName) {
        form.slug = newName.toLowerCase()
            .replace(/[^\w\s가-힣-]/g, '')
            .replace(/\s+/g, '-');
    }
});

const handleSubmit = () => {
    emit('submit', { ...form });
};
</script>

<template>
    <form @submit.prevent="handleSubmit" id="categoryForm" class="space-y-5">
        <!-- Name & Slug -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
                <label class="text-sm font-semibold text-gray-700">Name</label>
                <input v-model="form.name" type="text" required placeholder="e.g. Technology" 
                    class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-300" />
            </div>
            <div class="space-y-1.5">
                <label class="text-sm font-semibold text-gray-700">Slug</label>
                <input v-model="form.slug" type="text" required placeholder="e.g. technology" 
                    class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-300 bg-gray-50/50" />
            </div>
        </div>

        <!-- Description -->
        <div class="space-y-1.5">
            <label class="text-sm font-semibold text-gray-700">Description</label>
            <textarea v-model="form.description" rows="3" placeholder="Category description for display..." 
                class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-300"></textarea>
        </div>

        <!-- SEO Section -->
        <div class="pt-4 border-t border-gray-100">
            <h4 class="text-sm font-bold text-gray-900 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clip-rule="evenodd" />
                </svg>
                SEO & Social Settings
            </h4>
            <div class="grid grid-cols-1 gap-4">
                <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Meta Title</label>
                    <input v-model="form.metaTitle" type="text" placeholder="Same as Name if empty" 
                        class="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Meta Description</label>
                    <input v-model="form.metaDescription" type="text" placeholder="Same as Description if empty" 
                        class="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                 <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">OG Image URL</label>
                    <input v-model="form.ogImage" type="text" placeholder="https://..." 
                        class="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="flex space-x-3 w-full sm:w-auto pt-4">
            <button type="button" @click="$emit('cancel')" 
                class="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
            </button>
            <button type="submit" 
                class="flex-1 sm:flex-none px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors">
                {{ initialData ? 'Update Category' : 'Create Category' }}
            </button>
        </div>
    </form>
</template>
