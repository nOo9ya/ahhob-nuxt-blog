<template>
    <div class="space-y-6">
        <!-- Open Graph Image -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">OG Image</label>
            <div class="flex items-start gap-4">
                <div 
                    class="w-32 h-32 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden relative group cursor-pointer"
                    @click="triggerUpload"
                >
                    <img 
                        v-if="modelValue.ogImage" 
                        :src="modelValue.ogImage" 
                        class="w-full h-full object-cover" 
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                </div>
                <div class="flex-1 space-y-3">
                    <input
                        v-model="modelValue.ogImage"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="https://..."
                    />
                    <button 
                        @click="triggerUpload"
                        class="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Upload Image
                    </button>
                    <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleUpload" />
                    <p class="text-xs text-gray-500">SNS 공유 시 표시될 썸네일 이미지입니다. 비워두면 대표 썸네일을 사용합니다.</p>
                </div>
            </div>
        </div>

        <div class="space-y-4">
            <!-- Twitter Card Type -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Twitter Card Type</label>
                <select
                    v-model="modelValue.socialMeta.twitterCard"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                    <option value="summary_large_image">Summary Large Image (추천)</option>
                    <option value="summary">Summary</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">트위터에서 링크 공유 시 표시될 카드 스타일입니다.</p>
            </div>
            
            <!-- Twitter Creator -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Twitter Creator</label>
                <input
                    v-model="modelValue.socialMeta.twitterCreator"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="@username"
                />
                 <p class="text-xs text-gray-500 mt-1">작성자의 트위터 계정입니다.</p>
            </div>
        </div>

        <div class="space-y-4 pt-4 border-t border-gray-100">
             <!-- OG Title Override -->
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">OG Title Override</label>
                <input
                    v-model="modelValue.socialMeta.ogTitle"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="기본값: Meta Title"
                />
                <p class="text-xs text-gray-500 mt-1">SNS 공유 시 제목만 다르게 설정하고 싶을 때 입력하세요.</p>
            </div>

            <!-- OG Description -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                <textarea
                    v-model="modelValue.socialMeta.ogDescription"
                    rows="2"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                    placeholder="기본값: Meta Description"
                ></textarea>
                <p class="text-xs text-gray-500 mt-1">SNS 공유 시 표시될 설명입니다. 비워두면 검색엔진 설명을 사용합니다.</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    modelValue: {
        ogImage: string;
        ogImageAlt: string;
        socialMeta: {
            ogTitle: string;
            ogDescription: string;
            twitterCard: string;
            twitterCreator: string;
        };
    };
}>();

const emit = defineEmits(['update:modelValue']);
const fileInput = ref<HTMLInputElement | null>(null);
const toast = useToast();

const triggerUpload = () => {
    fileInput.value?.click();
};

const handleUpload = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const res: any = await $fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });
        props.modelValue.ogImage = res.url;
    } catch (err) {
        toast.error('Failed to upload image');
    }
};
</script>
