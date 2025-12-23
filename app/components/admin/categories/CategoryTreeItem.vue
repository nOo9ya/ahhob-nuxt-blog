<template>
    <li
        class="relative border-l border-gray-200 dark:border-gray-700 last:border-0 pl-4 py-1"
        :class="{ 'dragging-over': isDragOver }"
        :draggable="true"
        @dragstart.stop="onDragStart"
        @dragover.prevent.stop="onDragOver"
        @dragleave.prevent.stop="onDragLeave"
        @drop.prevent.stop="onDrop"
    >
        <!-- Connector Line for tree visual -->
        <div
            v-if="depth > 0"
            class="absolute top-0 left-0 w-4 h-5 border-b border-l border-gray-300 dark:border-gray-600 -translate-y-[10px]"
        ></div>

        <!-- Category Content Card -->
        <div
            class="group flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-gray-800 transition-all duration-200"
            :class="[
                isDragOver
                    ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
            ]"
        >
            <div class="flex items-center gap-3">
                <!-- Drag Handle Icon -->
                <div
                    class="cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Drag to reorder"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 8h16M4 16h16"
                        />
                    </svg>
                </div>

                <!-- Folder Icon -->
                <div class="text-indigo-500 dark:text-indigo-400">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                            clip-rule="evenodd"
                        />
                        <path
                            d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
                        />
                    </svg>
                </div>

                <!-- Name & Info -->
                <div class="flex flex-col">
                    <span
                        class="text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                        {{ category.name }}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                        /{{ category.slug }}
                        <span v-if="hasChildren" class="ml-1 text-gray-400"
                            >({{ category.children.length }} items)</span
                        >
                    </span>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    @click="$emit('edit', category)"
                    class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                    title="Edit"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                <button
                    @click="$emit('delete', category)"
                    class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    title="Delete"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        </div>

        <!-- Recursive Children -->
        <ul v-if="hasChildren" class="mt-1 ml-4 space-y-1">
            <CategoryTreeItem
                v-for="child in category.children"
                :key="child.id"
                :category="child"
                :depth="depth + 1"
                @edit="$emit('edit', $event)"
                @delete="$emit('delete', $event)"
                @drop-category="onChildDrop"
            />
        </ul>
    </li>
</template>

<script setup lang="ts">
/**
 * CategoryTreeItem.vue
 *
 * 카테고리 계층 구조를 재귀적으로 렌더링하는 컴포넌트입니다.
 * HTML5 Drag and Drop API를 사용하여 카테고리 이동 기능을 제공합니다.
 *
 * Props:
 * - category: 현재 카테고리 노드 정보
 * - depth: 현재 깊이 (시각적 들여쓰기 용)
 *
 * Events:
 * - edit: 수정 클릭 시
 * - delete: 삭제 클릭 시
 * - drop-category: 드래그 앤 드롭 완료 시 { draggedId, targetId }
 */

const props = defineProps<{
    category: any;
    depth: number;
}>();

const emit = defineEmits(['edit', 'delete', 'drop-category']);

const isDragOver = ref(false);
const hasChildren = computed(
    () => props.category.children && props.category.children.length > 0
);

/**
 * 드래그 시작 시
 * 현재 카테고리 ID를 dataTransfer에 저장
 */
function onDragStart(event: DragEvent) {
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(props.category.id));
        // 드래그 중인 요소의 투명도 조절 등 스타일링 가능
    }
}

/**
 * 드래그 오버 시
 * 드롭 허용을 위해 preventDefault 호출 및 시각적 피드백 활성화
 */
function onDragOver(event: DragEvent) {
    // 자기 자신이나 직계 자식으로의 이동은 로직에서 걸러내겠지만,
    // UI 상으로는 "놓을 수 있음"을 보여주고 나중에 처리하는 것이 일반적
    isDragOver.value = true;
}

/**
 * 드래그 리브 시
 * 시각적 피드백 비활성화
 */
function onDragLeave(event: DragEvent) {
    isDragOver.value = false;
}

/**
 * 드롭 시
 * 드래그된 ID와 현재 타겟 ID를 상위로 전달
 */
function onDrop(event: DragEvent) {
    isDragOver.value = false;
    if (event.dataTransfer) {
        const draggedId = Number(event.dataTransfer.getData('text/plain'));
        const targetId = props.category.id;

        // 자기 자신에게 드롭 방지
        if (draggedId === targetId) return;

        emit('drop-category', { draggedId, targetId });
    }
}

/**
 * 자식 컴포넌트로부터 올라온 드롭 이벤트 버블링
 */
function onChildDrop(payload: { draggedId: number; targetId: number }) {
    emit('drop-category', payload);
}
</script>

<style scoped>
/* 드래그 중인 항목이 위에 오도록 */
.dragging-over {
    z-index: 10;
}
</style>
