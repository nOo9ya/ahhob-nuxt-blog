<script setup lang="ts">
/**
 * ImageUploader.vue
 * 대표 이미지(Featured Image) 업로드 전용 컴포넌트
 */
const props = defineProps<{
    modelValue: string; // 이미지 URL
    uploadContext?: {
        categoryPath: string;
        slug: string;
    };
    label?: string;
}>();

const emit = defineEmits(['update:modelValue', 'update:variants']);

const isUploading = ref(false);
const previewUrl = ref(props.modelValue);
const inputRef = ref<HTMLInputElement | null>(null);
const toast = useToast();

watch(() => props.modelValue, (val) => {
    previewUrl.value = val;
});

const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    // 만약 uploadContext가 없으면 기본값(공용 자산)으로 처리
    const categoryPath = props.uploadContext?.categoryPath || 'common';
    const slug = props.uploadContext?.slug || 'assets';

    isUploading.value = true;
    const formData = new FormData();
    formData.append('files', file);
    formData.append('categoryPath', categoryPath);
    formData.append('slug', slug);
    formData.append('type', 'featured'); // Featured Type (Thumb, OG 생성)
    formData.append('optimize', 'true');

    try {
        const { files } = await $fetch<{ files: any[] }>('/api/upload', {
            method: 'POST',
            body: formData,
        });
        
        const result = files[0];
        
        // 메인 URL 업데이트
        emit('update:modelValue', result.url);

        if (result.variants) {
            emit('update:variants', result.variants);
        }

        previewUrl.value = result.url;
    } catch (e) {
        console.error('Upload failed', e);
        toast.error('Upload failed');
    } finally {
        isUploading.value = false;
        if (inputRef.value) inputRef.value.value = ''; // Reset input
    }
};

const triggerUpload = () => {
    inputRef.value?.click();
};

const removeImage = () => {
    emit('update:modelValue', '');
    previewUrl.value = '';
    // Variants 초기화 이벤트도 필요하다면 추가
};
</script>

<template>
    <div class="space-y-3">
        <label v-if="label" class="block text-sm font-medium text-gray-700">{{ label }}</label>
        
        <div 
            @click="!previewUrl ? triggerUpload() : null"
            class="relative w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 hover:border-black transition-colors bg-gray-50 flex flex-col items-center justify-center cursor-pointer group overflow-hidden"
            :class="{ 'border-transparent': previewUrl, 'cursor-default': previewUrl }"
        >
            <!-- Preview -->
            <img v-if="previewUrl" :src="previewUrl" class="absolute inset-0 w-full h-full object-cover" alt="Preview" />
            
            <!-- Upload Placeholder -->
            <div v-if="!previewUrl && !isUploading" class="text-center p-4">
                <div class="bg-white p-3 rounded-full shadow-sm inline-flex mb-3 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
                <p class="text-sm font-medium text-gray-900">Click to upload image</p>
                <p class="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF</p>
            </div>

            <!-- Loading State -->
            <div v-if="isUploading" class="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10">
                <svg class="animate-spin h-8 w-8 text-black mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700">Uploading...</span>
            </div>

            <!-- Actions Overlay (When image exists) -->
            <div v-if="previewUrl && !isUploading" class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button @click.stop="triggerUpload" class="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                    Change
                </button>
                <button @click.stop="removeImage" class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                    Remove
                </button>
            </div>

            <input ref="inputRef" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
        </div>
        
        <p class="text-xs text-gray-500">
            Featured images are auto-cropped to 1200x630 for social sharing.
        </p>
    </div>
</template>
