<template>
    <draggable 
        v-model="localCategories" 
        item-key="id"
        class="space-y-2"
        group="categories"
        :animation="200"
        ghost-class="ghost"
    >
        <template #item="{ element }">
            <div class="border border-gray-200 rounded-lg bg-white overflow-hidden">
                <!-- Category Item Header -->
                <div class="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-move">
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-400">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                        <div class="cursor-pointer hover:opacity-70 transition-opacity" @click="$emit('edit', element)">
                            <span class="font-medium text-gray-900">{{ element.name }}</span>
                            <span class="text-xs text-gray-500 ml-2 font-mono">{{ element.slug }}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 bg-gray-200 rounded-full text-xs font-medium text-gray-600">
                            {{ element.articleCount ? element.articleCount : '-' }}
                        </span>
                        <div class="h-4 w-px bg-gray-300 mx-1"></div>
                        <button 
                            @click="$emit('edit', element)" 
                            class="text-xs text-gray-500 hover:text-primary-600"
                        >
                            Edit
                        </button>
                        <button 
                            @click="$emit('delete', element.id)" 
                            class="text-xs text-gray-500 hover:text-red-600"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <!-- Nested Children (Recursive) -->
                <!-- children이 없더라도 빈 배열로 초기화해줘야 vuedraggable이 동작할 수 있음 -->
                <div class="pl-8 pr-2 pb-2 bg-gray-50/50" v-if="element.children">
                     <CategoryTreeItem 
                        v-model:categories="element.children"
                        @edit="$emit('edit', $event)" 
                        @delete="$emit('delete', $event)" 
                    />
                </div>
            </div>
        </template>
    </draggable>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable';
import { computed } from 'vue';

defineOptions({
    name: 'CategoryTreeItem',
});

const props = defineProps<{
    categories: any[];
}>();

const emit = defineEmits(['update:categories', 'edit', 'delete']);

const localCategories = computed({
    get: () => props.categories,
    set: (value) => emit('update:categories', value),
});
</script>

<style scoped>
.ghost {
    /* @apply opacity-50 bg-primary-50 border-primary-200 border-dashed; */
    /* Tailwind Config 핫 리로딩 지연 문제로 직접 스타일 지정 */
    opacity: 0.5;
    background-color: #f0f9ff; /* primary-50 */
    border: 1px dashed #bae6fd; /* primary-200 */
}
</style>
