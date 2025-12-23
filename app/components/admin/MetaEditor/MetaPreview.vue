<template>
    <div class="space-y-8 bg-gray-50/50 p-6 rounded-xl border border-dashed border-gray-200">
        <!-- Google Search Preview -->
        <div class="space-y-2">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide">Google Search</h4>
            <div class="bg-white p-4 rounded shadow-sm border border-gray-100 max-w-[600px]">
                <div class="flex items-center gap-2 mb-1">
                    <div class="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500 overflow-hidden">
                        <img src="/favicon.ico" alt="사이트 파비콘" class="w-4 h-4 opacity-50" onerror="this.style.display='none'">
                    </div>
                    <div>
                        <div class="text-sm text-gray-800">{{ siteName }}</div>
                        <div class="text-xs text-gray-500">{{ displayUrl }}</div>
                    </div>
                </div>
                <h3 class="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate font-normal">
                    {{ title }}
                </h3>
                <p class="text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                    {{ description || 'No description provided.' }}
                </p>
            </div>
        </div>

        <!-- Facebook/OG Preview -->
        <div class="space-y-2">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide">Facebook / Social Share</h4>
            <div class="bg-white rounded border border-gray-200 max-w-[500px] overflow-hidden">
                <div class="aspect-[1.91/1] bg-gray-100 relative">
                    <img 
                        v-if="image" 
                        :src="image" 
                        class="w-full h-full object-cover" 
                        alt="Preview"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                    </div>
                </div>
                <div class="p-3 bg-[#f0f2f5] border-t border-gray-100">
                    <div class="text-xs text-gray-500 uppercase truncate mb-0.5">{{ host }}</div>
                    <div class="font-bold text-gray-900 truncate mb-1 leading-tight">{{ ogTitle || title }}</div>
                    <div class="text-sm text-gray-600 line-clamp-1">{{ description }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    data: {
        title: string;
        metaTitle: string;
        metaDescription: string;
        slug: string;
        ogImage: string;
        socialMeta: {
            ogTitle: string;
        };
    };
}>();

const config = useRuntimeConfig();
const siteName = 'My Awesome Blog'; // 설정에서 가져오거나 하드코딩

const title = computed(() => {
    return props.data.metaTitle || props.data.title || 'Untitled Article';
});

const description = computed(() => {
    return props.data.metaDescription || 'Please enter a meta description to see how it looks in search results.';
});

const image = computed(() => props.data.ogImage);
const ogTitle = computed(() => props.data.socialMeta?.ogTitle);

const host = computed(() => {
    try {
        return new URL(config.public.siteUrl || 'https://example.com').hostname.toUpperCase();
    } catch {
        return 'EXAMPLE.COM';
    }
});

const displayUrl = computed(() => {
    const baseUrl = config.public.siteUrl || 'https://example.com';
    const slug = props.data.slug || 'article-slug';
    return `${baseUrl} › article › ${slug}`;
});
</script>
