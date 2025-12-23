<template>
    <div class="space-y-6">
        <!-- 1. 현재 카테고리 정보 (메인 메뉴 드롭다운) -->
        <div 
            v-if="category" 
            class="px-2 pb-6 border-b border-gray-100"
        >
            <!-- Section Title -->
            <h4 class="text-sm font-bold text-gray-500 mb-4 px-0 uppercase tracking-wider">
                Browse Topics
            </h4>

            <div class="flex items-center mb-2">
                <!-- Dropdown Navigation -->
                <div class="relative flex-1 min-w-0">
                    <select
                        v-model="currentRootId"
                        @change="handleCategoryChange"
                        class="block w-full appearance-none rounded-md border border-gray-300 py-2 pl-3 pr-10 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm font-bold shadow-sm"
                    >
                        <option 
                            v-for="rootCat in rootCategories" 
                            :key="rootCat.id" 
                            :value="rootCat.id"
                        >
                            {{ rootCat.name }}
                        </option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                        <svg class="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. 계층형 카테고리 트리 -->
        <div
            v-if="treeNodes.length > 0"
            class="px-2"
        >
            <h4
                class="text-sm font-bold text-gray-500 mb-4 px-0 uppercase tracking-wider"
            >
                {{ navTitle }}
            </h4>
            
            <ul class="space-y-1">
                <CategoryTreeItem
                    v-for="node in treeNodes"
                    :key="node.id"
                    :category="node"
                    :active-slug="category?.slug"
                    :current-path-ids="currentPathIds"
                />
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Category } from '~/shared/types/article';
import CategoryTreeItem from './CategoryTreeItem.vue';

// Props 정의
const props = defineProps<{
    category?: Category;      // 현재 페이지 카테고리
    treeNodes: any[];         // 표시할 트리 노드들 (Root의 자식들 또는 Root 자체)
    navTitle: string;         // 섹션 제목
    parentCategory?: any;     // (참고용) 상위 정보
    currentPathIds?: number[]; // 현재 경로상에 있는 ID들 (자동 펼침용)
    rootCategories?: any[];    // 전체 Root 카테고리 목록 (Dropdown용)
}>();

const router = useRouter();

// 현재 선택된 Root ID (Dropdown 바인딩)
const currentRootId = ref<number | string>('');

// 초기값 설정 및 변경 감지
watchEffect(() => {
    // currentPathIds의 첫 번째 요소가 Root ID라고 가정
    if (props.currentPathIds && props.currentPathIds.length > 0) {
        currentRootId.value = props.currentPathIds[0] ?? '';
    } else if (props.category && props.category.parentId === null) {
        // 현재 카테고리가 Root인 경우
        currentRootId.value = props.category.id;
    }
});

const handleCategoryChange = () => {
    if (!props.rootCategories) return;
    const selectedCategory = props.rootCategories.find(c => c.id == currentRootId.value); // 타입 불일치 방지 위해 == 사용
    
    if (selectedCategory) {
        router.push(`/${selectedCategory.path || selectedCategory.slug}`);
    }
};
</script>
