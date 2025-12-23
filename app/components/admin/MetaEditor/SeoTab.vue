<template>
    <div class="space-y-6">
        <!-- Meta Title -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
                <span class="text-xs text-gray-500 font-normal ml-1">
                    ({{ modelValue.metaTitle?.length || 0 }}/60)
                </span>
            </label>
            <input
                v-model="modelValue.metaTitle"
                type="text"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="SEO에 최적화된 제목을 입력하세요"
            />
            <p class="mt-1 text-xs text-gray-500">
                기본값: 기사 제목
            </p>
        </div>

        <!-- Meta Description -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
            <textarea
                v-model="modelValue.metaDescription"
                rows="3"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                placeholder="Brief description for search engines..."
                maxlength="160"
            ></textarea>
             <div class="flex justify-between mt-1">
                <p class="text-xs text-gray-500">검색 결과에 표시될 요약문입니다. (권장: 160자 이내)</p>
                <span class="text-xs text-gray-400">{{ modelValue.metaDescription?.length || 0 }}/160</span>
            </div>
        </div>

        <!-- Canonical URL -->
        <div>
             <label class="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
             <input
                v-model="modelValue.canonicalUrl"
                type="text"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono text-gray-600 bg-gray-50"
                placeholder="Auto-generated if empty"
            />
            <p class="text-xs text-gray-500 mt-1">
                <span class="font-medium text-indigo-600">Auto-generated</span>: 비워두면 저장 시 사이트 주소, 카테고리, 슬러그를 조합하여 자동으로 생성됩니다.
            </p>
        </div>

        <!-- Robots -->
        <div class="pt-4 border-t border-gray-100">
            <label class="block text-sm font-medium text-gray-700 mb-3">Robots Settings</label>
            <div class="flex flex-col gap-4">
                <!-- No Index -->
                <div class="flex items-center gap-3">
                    <Switch
                        v-model="modelValue.seoMeta.noIndex"
                        :class="modelValue.seoMeta.noIndex ? 'bg-primary-600' : 'bg-gray-200'"
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                        <span class="sr-only">No Index</span>
                        <span
                            :class="modelValue.seoMeta.noIndex ? 'translate-x-6' : 'translate-x-1'"
                            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        />
                    </Switch>
                    <span class="text-sm font-medium text-gray-700">noindex (검색 제외)</span>
                </div>

                <!-- No Follow -->
                <div class="flex items-center gap-3">
                     <Switch
                        v-model="modelValue.seoMeta.noFollow"
                        :class="modelValue.seoMeta.noFollow ? 'bg-primary-600' : 'bg-gray-200'"
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                        <span class="sr-only">No Follow</span>
                        <span
                            :class="modelValue.seoMeta.noFollow ? 'translate-x-6' : 'translate-x-1'"
                            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        />
                    </Switch>
                    <span class="text-sm font-medium text-gray-700">nofollow (링크 추적 금지)</span>
                </div>
            </div>
             <p class="text-xs text-gray-500 mt-2">특별한 이유가 없다면 체크하지 마세요.</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Switch } from '@headlessui/vue';

const props = defineProps<{
    modelValue: {
        metaTitle: string;
        metaDescription: string;
        canonicalUrl: string;
        seoMeta: {
            noIndex: boolean;
            noFollow: boolean;
        };
    };
}>();

const emit = defineEmits(['update:modelValue']);
</script>
