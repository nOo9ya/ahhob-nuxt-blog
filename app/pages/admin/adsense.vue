<script setup lang="ts">
/**
 * Admin AdSense Configuration Page
 * app/pages/admin/adsense.vue
 * 
 * 기능:
 * - Google AdSense Client ID 설정 (Auto Ads)
 */

definePageMeta({
    layout: 'admin',
    middleware: ['admin'],
});

interface AdSenseSettings {
    client_id: string;
    slots: {
        header: string;
        footer: string;
        article_top: string;
        article_bottom: string;
        sidebar: string;
    };
    enabled: {
        header: boolean;
        footer: boolean;
        article_top: boolean;
        article_bottom: boolean;
        sidebar: boolean;
    };
}

const toast = useToast();
const isLoading = ref(false);

const settings = ref<AdSenseSettings>({
    client_id: '',
    slots: {
        header: '',
        footer: '',
        article_top: '',
        article_bottom: '',
        sidebar: '',
    },
    enabled: {
        header: true,
        footer: true,
        article_top: true,
        article_bottom: true,
        sidebar: true,
    },
});

// Fetch Settings
const { data: fetchedSettings, refresh } = await useFetch('/api/admin/settings');

watch(fetchedSettings, (newSettings: any) => {
    if (newSettings) {
        settings.value = {
            client_id: newSettings.adsense_client_id || '',
            slots: {
                header: newSettings.adsense_slots?.header || '',
                footer: newSettings.adsense_slots?.footer || '',
                article_top: newSettings.adsense_slots?.article_top || '',
                article_bottom: newSettings.adsense_slots?.article_bottom || '',
                sidebar: newSettings.adsense_slots?.sidebar || '',
            },
            enabled: {
                header: newSettings.adsense_enabled?.header ?? true,
                footer: newSettings.adsense_enabled?.footer ?? true,
                article_top: newSettings.adsense_enabled?.article_top ?? true,
                article_bottom: newSettings.adsense_enabled?.article_bottom ?? true,
                sidebar: newSettings.adsense_enabled?.sidebar ?? true,
            },
        };
    }
}, { immediate: true });

const saveSettings = async () => {
    isLoading.value = true;
    try {
        await $fetch('/api/admin/settings', {
            method: 'PUT',
            body: {
                adsense_client_id: settings.value.client_id,
                adsense_slots: settings.value.slots,
                adsense_enabled: settings.value.enabled,
            },
        });
        toast.success('AdSense settings saved successfully!');
        refresh();
    } catch (error: any) {
        console.error('Failed to save settings:', error);
        toast.error('Failed to save settings');
    } finally {
        isLoading.value = false;
    }
};

const sections = [
    { key: 'header', label: 'Header (Global)', description: 'Appears at the top of every page', previewClass: 'w-full h-[90px]' },
    { key: 'footer', label: 'Footer (Global)', description: 'Appears at the bottom of every page', previewClass: 'w-full h-[90px]' },
    { key: 'article_top', label: 'Article Top', description: 'Above the article content', previewClass: 'w-full h-[90px]' },
    { key: 'article_bottom', label: 'Article Bottom', description: 'Below the article content', previewClass: 'w-full h-[90px]' },
    { key: 'sidebar', label: 'Sidebar', description: 'In the sidebar for Article/Category pages', previewClass: 'w-[300px] h-[250px]' },
];
</script>

<template>
    <div class="max-w-5xl mx-auto space-y-8 pb-20">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Google AdSense</h1>
            <p class="text-gray-500 mt-1">Configure your advertising settings.</p>
        </div>

        <!-- Global Settings -->
        <div class="bg-white p-6 rounded-2xl shadow-sm space-y-4">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Global Configuration</h2>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">AdSense Client ID (pub-xxxxxxxxxxxxxxxx)</label>
                <input 
                    v-model="settings.client_id" 
                    type="text" 
                    class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none font-mono text-sm" 
                    placeholder="pub-xxxxxxxxxxxxxxxx"
                />
            </div>
        </div>

        <!-- Slot Configuration -->
        <div class="bg-white p-6 rounded-2xl shadow-sm">
            <div class="flex items-center justify-between mb-6">
                 <h2 class="text-lg font-semibold text-gray-900">Ad Units & Placement</h2>
                 <button 
                    @click="saveSettings" 
                    :disabled="isLoading"
                    class="bg-black text-white px-5 py-2 rounded-xl font-medium text-sm hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                    <svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Save Changes
                </button>
            </div>
           

            <div class="space-y-8 divide-y divide-gray-100">
                <div v-for="section in sections" :key="section.key" class="pt-8 first:pt-0 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Config -->
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-medium text-gray-900">{{ section.label }}</h3>
                                <p class="text-sm text-gray-500">{{ section.description }}</p>
                            </div>
                             <!-- Toggle -->
                            <button 
                                type="button" 
                                @click="settings.enabled[section.key as keyof typeof settings.enabled] = !settings.enabled[section.key as keyof typeof settings.enabled]"
                                :class="settings.enabled[section.key as keyof typeof settings.enabled] ? 'bg-green-500' : 'bg-gray-200'"
                                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                role="switch"
                                :aria-checked="settings.enabled[section.key as keyof typeof settings.enabled]"
                            >
                                <span class="sr-only">Toggle {{ section.label }}</span>
                                <span 
                                    aria-hidden="true" 
                                    :class="settings.enabled[section.key as keyof typeof settings.enabled] ? 'translate-x-5' : 'translate-x-0'"
                                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                                ></span>
                            </button>
                        </div>

                        <div>
                            <label class="block text-xs font-medium text-gray-500 mb-1">Slot ID (Data Ad Slot)</label>
                            <input 
                                v-model="settings.slots[section.key as keyof typeof settings.slots]" 
                                type="text" 
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-1 focus:ring-black focus:border-transparent outline-none font-mono text-sm bg-gray-50" 
                                placeholder="1234567890"
                            />
                        </div>
                    </div>

                    <!-- Preview -->
                    <div class="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col items-center justify-center">
                        <p class="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Preview Size</p>
                        
                        <!-- Preview Box -->
                        <div 
                            :class="[section.previewClass, 'bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden transition-opacity']"
                            :style="{ opacity: settings.enabled[section.key as keyof typeof settings.enabled] ? 1 : 0.4 }"
                        >
                            <div class="text-center p-4">
                                <p class="text-sm font-bold text-gray-400">AdSense</p>
                                <p class="text-xs text-gray-300 mt-1" v-if="!settings.enabled[section.key as keyof typeof settings.enabled]">(Disabled)</p>
                            </div>

                            <!-- Diagnostic Overlay -->
                             <div class="absolute inset-0 bg-blue-500/5 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                                <span class="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    {{ section.previewClass.replace('w-full', 'Full Width').replace('h-', 'Height: ') }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
