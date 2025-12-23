<template>
    <!-- 1. 데스크탑용 사이드바 -->
    <aside class="hidden lg:block w-[250px] flex-shrink-0">
        <div class="sticky top-24 space-y-8">
            <SidebarContent
                :category="category"
                :tree-nodes="sidebarTreeData"
                :nav-title="navTitle"
                :parent-category="parentCategory"
                :current-path-ids="currentPathIds"
                :root-categories="fullTree"
            />
        </div>
    </aside>

    <!-- 2. 모바일용 (Drawer) -->
    <div class="lg:hidden">
        <!-- Drawer (Overlay + Sidebar) -->
        <Transition
            enter-active-class="transition-opacity duration-300 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="isOpen"
                class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                @click="isOpen = false"
            ></div>
        </Transition>

        <Transition
            enter-active-class="transition-transform duration-300 ease-out"
            enter-from-class="-translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transition-transform duration-200 ease-in"
            leave-from-class="translate-x-0"
            leave-to-class="-translate-x-full"
        >
            <aside
                v-if="isOpen"
                class="fixed top-0 left-0 bottom-0 w-[280px] z-50 bg-white shadow-xl overflow-y-auto p-6"
            >
                <div class="flex justify-between items-center mb-6 px-2">
                    <h2 class="text-lg font-bold text-gray-900">카테고리</h2>
                    <button
                        @click="isOpen = false"
                        class="p-2 -mr-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="size-6"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M6 18 18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <SidebarContent
                    :category="category"
                    :tree-nodes="sidebarTreeData"
                    :nav-title="navTitle"
                    :parent-category="parentCategory"
                    :current-path-ids="currentPathIds"
                    :root-categories="fullTree"
                />
            </aside>
        </Transition>
    </div>
</template>

<script setup lang="ts">
/**
 * 기사 사이드바 (Article Sidebar)
 * Path: app/components/article/Sidebar.vue
 * 
 * 설명:
 * 기사 상세 및 목록 페이지 좌측에 위치하여 카테고리 네비게이션을 제공합니다.
 * 계층형 트리(Accordion) 구조를 사용하여 사용자에게 전체적인 네비게이션 경험을 제공합니다.
 */
import type { Category } from '~/shared/types/article';
import SidebarContent from './SidebarContent.vue';

const props = defineProps<{
    category?: Category; // 현재 보고 있는 카테고리 (옵션)
}>();

// --- Mobile Sidebar Logic ---
const { isOpen, register, unregister } = useMobileSidebar();
const route = useRoute();

watch(
    () => route.path,
    () => {
        isOpen.value = false;
    }
);

onMounted(() => register());
onUnmounted(() => unregister());

// --- Data Fetching ---
const { data: treeData } = await useFetch('/api/categories/tree', {
    key: 'category-tree',
    dedupe: 'defer',
});

const fullTree = computed(() => (treeData.value as any)?.data || []);

// --- Tree Navigation Logic ---
const parentCategory = ref<any>(null);
const currentPathIds = ref<number[]>([]);

// 재귀적으로 트리를 탐색하여 현재 노드와 경로를 찾습니다.
const findNodeAndPath = (nodes: any[], targetSlug: string, path: number[] = []): { node: any, path: number[] } | null => {
    for (const node of nodes) {
        const currentPath = [...path, node.id];
        if (node.slug === targetSlug) {
            return { node, path: currentPath };
        }
        if (node.children?.length) {
            const found = findNodeAndPath(node.children, targetSlug, currentPath);
            if (found) return found;
        }
    }
    return null;
};

// 표시할 트리 데이터 계산
const sidebarTreeData = computed(() => {
    // 1. 전체 트리가 없거나 현재 카테고리가 없으면 -> 전체 트리 반환 (Fallback)
    if (!fullTree.value.length) return [];
    if (!props.category) return fullTree.value;

    // 2. 현재 카테고리의 Root Node 찾기
    //    (요구사항: "현재 글이 해당하는 카테고리의 최상위 부모 카테고리부터...")
    const result = findNodeAndPath(fullTree.value, props.category.slug);
    
    if (result) {
        // 경로 저장 (Auto-expand용)
        currentPathIds.value = result.path;
        
        // Root Node 찾기 (경로의 첫 번째 ID를 가진 노드)
        const rootId = result.path[0];
        const rootNode = fullTree.value.find((n: any) => n.id === rootId);
        
        // Root Node가 있으면 그것만 반환? 아니면 전체?
        // -> 보통 사이드바는 "현재 섹션"의 네비게이션을 보여주는 것이 일반적.
        // -> 하지만 "다른 최상위 카테고리"로 이동하고 싶을 수도 있음.
        // -> 여기서는 "전체 트리"를 보여주되, 현재 경로는 Auto-expand되므로
        //    사용자가 현재 위치를 파악하기 쉬움.
        //    (만약 Root Subtree만 보여주면 다른 대분류로 이동이 불가능해짐)
        
        // 요구사항 재확인: "현재 글이 해당하는 카테고리의 최상위 부모 카테고리부터 모든 카테고리가 나오고"
        // 해석 A: Root부터 시작하는 Subtree만 보여준다. (다른 Root는 안 보임)
        // 해석 B: 전체 트리를 보여주되, Root 레벨부터 시작한다.
        // -> "나머지는 접혀있는 상태"라는 말에서 "나머지"가 있다는 뜻이므로, 전체 트리를 보여주는 것이 맞음.
        
        return fullTree.value;
    }

    return fullTree.value;
});

const navTitle = computed(() => 'Category Navigation');

// 부모 카테고리 찾기 (바로 윗 단계)
watchEffect(() => {
    if (props.category && sidebarTreeData.value.length) {
        const result = findNodeAndPath(sidebarTreeData.value, props.category.slug);
        if (result && result.path.length > 1) {
             // 경로의 뒤에서 두 번째 ID가 직계 부모
             const parentId = result.path[result.path.length - 2];
             
             // 다시 트리에서 부모 노드 객체 찾기 (비효율적이지만 안전함)
             const findParent = (nodes: any[]): any => {
                 for(const node of nodes) {
                     if (node.id === parentId) return node;
                     if (node.children) {
                         const found = findParent(node.children);
                         if (found) return found;
                     }
                 }
                 return null;
             };
             parentCategory.value = findParent(fullTree.value);
        } else {
            parentCategory.value = null;
        }
    }
});
</script>
