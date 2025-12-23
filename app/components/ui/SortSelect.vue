<template>
    <div class="flex items-center space-x-2">
        <label for="sort" class="text-sm font-medium text-gray-700">Sort by:</label>
        <div class="relative">
            <select
                id="sort"
                :value="modelValue"
                @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
                class="block w-full rounded-lg border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 cursor-pointer bg-white shadow-sm hover:bg-gray-50 transition-colors"
            >
                <option v-for="option in options" :key="option.value" :value="option.value">
                    {{ option.label }}
                </option>
            </select>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    modelValue: string;
    options: { label: string; value: string }[];
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();
</script>
