<script setup lang="ts">
const props = defineProps<{
    modelValue: string; // Title
    isSaving: boolean;
    isPublishing: boolean;
    hasUnsavedChanges: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'save'): void;
    (e: 'publish'): void;
    (e: 'back'): void;
}>();
</script>

<template>
    <div class="h-16 px-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 transition-all">
        <!-- Left: Back & Title -->
        <div class="flex items-center gap-4 flex-1">
            <button @click="emit('back')" class="p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
            </button>
            <div class="h-6 w-px bg-gray-200"></div>
            <input 
                :value="modelValue"
                @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
                type="text" 
                placeholder="Enter article title..." 
                class="flex-1 text-lg font-bold text-gray-900 placeholder:text-gray-300 border-none focus:ring-0 focus:outline-none bg-transparent"
            />
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-3">
             <span v-if="hasUnsavedChanges" class="text-xs text-amber-500 font-medium mr-2 animate-pulse">Unsaved changes</span>
             <span v-else class="text-xs text-gray-400 mr-2">Saved</span>

            <button 
                @click="emit('save')" 
                class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                :disabled="isSaving"
            >
                {{ isSaving ? 'Saving...' : 'Save Draft' }}
            </button>
            <button 
                @click="emit('publish')" 
                class="px-5 py-2 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-xl shadow-lg shadow-gray-200 transition-all flex items-center gap-2"
                :disabled="isPublishing"
            >
                 <svg v-if="isPublishing" class="animate-spin -ml-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publish
            </button>
        </div>
    </div>
</template>
