<template>
    <li class="relative">
        <!-- 1. Category Item Row -->
        <div
            class="group flex items-center justify-between py-2 px-1 rounded-lg transition-colors duration-200"
            :class="[
                isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            ]"
        >
            <!-- Link -->
            <NuxtLink
                :to="`/${category.path || category.slug}`"
                class="flex-1 truncate"
                @click.stop
            >
                {{ category.name }}
            </NuxtLink>

            <!-- Toggle Button (Only if has children) -->
            <button
                v-if="hasChildren"
                @click.prevent="toggle"
                class="p-1 rounded-md transition-colors ml-1 focus:outline-none"
                :class="[
                    isActive
                        ? 'text-blue-500 hover:bg-blue-100'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200',
                ]"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    class="w-4 h-4 transition-transform duration-200"
                    :class="{ 'rotate-180': isOpen }"
                >
                    <path
                        fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clip-rule="evenodd"
                    />
                </svg>
            </button>
        </div>

        <!-- 2. Children (Recursive) -->
        <div
            v-if="hasChildren"
            v-show="isOpen"
            class="overflow-hidden transition-all duration-300 ease-in-out"
        >
            <ul class="pl-4 mt-1 border-l border-gray-100 space-y-1">
                <CategoryTreeItem
                    v-for="child in category.children"
                    :key="child.id"
                    :category="child"
                    :active-slug="activeSlug"
                    :current-path-ids="currentPathIds"
                />
            </ul>
        </div>
    </li>
</template>

<script setup lang="ts">
/**
 * 재귀적 카테고리 트리 아이템 (Category Tree Item)
 * Path: app/components/article/CategoryTreeItem.vue
 * 
 * 설명:
 * 카테고리 구조를 트리 형태로 표현합니다.
 * - 자식이 있으면 토글 버튼을 표시합니다.
 * - 현재 경로(currentPathIds)에 포함되면 자동으로 펼쳐집니다(Auto-expand).
 * - 현재 보고 있는 카테고리(activeSlug)와 일치하면 하이라이트됩니다.
 */

interface CategoryNode {
    id: number;
    name: string;
    slug: string;
    children?: CategoryNode[];
    [key: string]: any;
}

const props = defineProps<{
    category: CategoryNode;
    activeSlug?: string;          // 현재 페이지의 카테고리 Slug (하이라이트용)
    currentPathIds?: number[];    // 현재 경로에 포함된 모든 카테고리 ID (자동 펼침용)
}>();

const hasChildren = computed(() => {
    return props.category.children && props.category.children.length > 0;
});

// 현재 활성화된 카테고리인지 여부
const isActive = computed(() => props.category.slug === props.activeSlug);

// 현재 경로에 포함되어 있는지 여부
const isInPath = computed(() => {
    return props.currentPathIds?.includes(props.category.id) ?? false;
});

// 상태 관리
const isOpen = ref(false);

const toggle = () => {
    isOpen.value = !isOpen.value;
};

// 초기화 & 감지 로직
// 경로에 포함되어 있으면 자동으로 펼침
watch(
    () => props.currentPathIds,
    (newPathIds) => {
        if (hasChildren.value && newPathIds?.includes(props.category.id)) {
            isOpen.value = true;
        }
    },
    { immediate: true, deep: true }
);
</script>
