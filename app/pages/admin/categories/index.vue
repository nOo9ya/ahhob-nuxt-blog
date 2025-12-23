<template>
    <div class="p-6 max-w-7xl mx-auto">
        <div class="mb-8 flex justify-between items-end">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Categories</h1>
                <p class="text-gray-500 mt-1">Manage article categories hierarchy.</p>
            </div>
            <button
                @click="saveOrder"
                :disabled="!isDirty || isSaving"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                <span v-if="isSaving">Saving...</span>
                <span v-else>Save Order</span>
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Create/Edit Form -->
            <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit sticky top-6">
                <h2 class="text-lg font-semibold mb-4">{{ isEditing ? 'Edit Category' : 'New Category' }}</h2>
                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            v-model="form.name"
                            type="text"
                            required
                            class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="e.g., Technology"
                            @input="onNameInput"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                        <div class="relative">
                            <input
                                v-model="form.slug"
                                type="text"
                                required
                                :class="[
                                    'w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-colors pr-10',
                                    !isSlugValid 
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50 text-red-900' 
                                        : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100 bg-gray-50'
                                ]"
                                @input="onSlugInput"
                            />
                            <!-- Loading / Error Icon -->
                            <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                                <svg v-if="isCheckingSlug" class="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <svg v-else-if="!isSlugValid" class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <p v-if="!isSlugValid && slugErrorMessage" class="text-xs text-red-600 mt-1 font-medium">
                            {{ slugErrorMessage }}
                        </p>
                        <p v-else class="text-xs text-gray-500 mt-1">Allowed: Korean, English, Numbers, -, @</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Path (Readonly)</label>
                        <input
                            :value="previewPath"
                            type="text"
                            readonly
                            class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            v-model="form.description"
                            rows="3"
                            class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        ></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                        <select
                            v-model="form.parentId"
                            class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                        >
                            <option :value="null">None (Root)</option>
                            <option
                                v-for="cat in flatCategories"
                                :key="cat.id"
                                :value="cat.id"
                                v-show="cat.id !== editingId"
                            >
                                {{ '—'.repeat(cat.depth) }} {{ cat.name }}
                            </option>
                        </select>
                    </div>

                    <div class="flex gap-2 pt-2">
                        <button
                            type="submit"
                            :disabled="!isSlugValid || isCheckingSlug"
                            :class="[
                                'flex-1 py-2 rounded-lg transition-colors',
                                !isSlugValid || isCheckingSlug
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                            ]"
                        >
                            {{ isEditing ? 'Apply (Local)' : 'Create (Immediate)' }}
                        </button>
                        <button
                            v-if="isEditing"
                            type="button"
                            @click="resetForm"
                            class="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            <!-- Draggable Tree List -->
            <div class="md:col-span-2">
                <div v-if="loading" class="text-center py-12 text-gray-500">Loading...</div>
                <div v-else-if="treeData.length === 0" class="bg-white p-12 text-center rounded-xl border border-gray-100 text-gray-500">
                    No categories found. Create one to get started.
                </div>
                <!-- 
                     v-model:categories="treeData"를 통해 드래그 시 treeData가 실시간 변경됨.
                     CategoryTreeItem 내부에서 update:categories 이벤트를 발생시켜야 함.
                -->
                <CategoryTreeItem 
                    v-else
                    v-model:categories="treeData"
                    @edit="editCategory" 
                    @delete="deleteCategory" 
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import CategoryTreeItem from '@/components/admin/category/CategoryTreeItem.vue';
import { generateSlug } from '~/shared/utils/slug';
import { useDebounce } from '~/app/composables/useDebounce';

definePageMeta({
    layout: 'admin',
    middleware: ['admin'],
});

const toast = useToast();

const { data: treeResponse, refresh, pending: loading } = await useFetch('/api/categories/tree');
const treeData = ref<any[]>([]);
const savedTreeData = ref<string>(''); // JSON string for deep comparison
const flatCategories = ref<any[]>([]); // For Parent Dropdown

// 재귀적으로 평탄화 리스트 생성 (Dropdown용 및 비교용)
const flattenNodes = (nodes: any[], depth = 0) => {
    const flat: any[] = [];
    const traverse = (items: any[], currentDepth: number) => {
        for (const item of items) {
            flat.push({ ...item, depth: currentDepth }); // depth 정보 추가
            if (item.children && item.children.length > 0) {
                traverse(item.children, currentDepth + 1);
            }
        }
    };
    traverse(nodes, depth);
    return flat;
};

const updateFlatCategories = () => {
    flatCategories.value = flattenNodes(treeData.value);
};

// Clean data for comparison (구조/순서 변경만 감지 - 내용 변경 제외)
const getCleanTreeString = (data: any[]) => {
    const extractStructure = (nodes: any[]): any[] => {
        return nodes.map(node => ({
            id: node.id,
            // name, slug 등 내용 필드는 제외 -> 순서/구조 변경만 감지
            children: node.children ? extractStructure(node.children) : []
        }));
    };
    return JSON.stringify(extractStructure(data));
};

// 초기 로딩
watch(() => treeResponse.value, (newVal: any) => {
    if (newVal?.success && newVal?.data) {
        treeData.value = JSON.parse(JSON.stringify(newVal.data));
        updateFlatCategories(); // depth 계산 포함
        // 초기 로딩 시점의 상태를 스냅샷으로 저장
        savedTreeData.value = getCleanTreeString(treeData.value);
    }
}, { immediate: true });

// Dirty Check
const isDirty = computed(() => {
    return getCleanTreeString(treeData.value) !== savedTreeData.value;
});

const isEditing = ref(false);
const editingId = ref<number | null>(null);
const isSaving = ref(false);

const form = reactive({
    name: '',
    slug: '',
    description: '',
    parentId: null as number | null,
});

// Path Preview
const previewPath = computed(() => {
    if (!form.slug) return '';
    if (form.parentId) {
        const parent = flatCategories.value.find(c => c.id === form.parentId);
        if (parent) {
            return `${parent.path}/${form.slug}`;
        }
    }
    return form.slug;
});

const onNameInput = () => {
    if (!isEditing.value) {
        form.slug = generateSlug(form.name);
        debouncedCheckSlug(form.slug);
    }
};

const onSlugInput = (e: Event) => {
    const val = (e.target as HTMLInputElement).value;
    form.slug = generateSlug(val);
    debouncedCheckSlug(form.slug);
};

// 슬러그 중복 체크 상태
const isSlugValid = ref(true);
const slugErrorMessage = ref('');
const isCheckingSlug = ref(false);

const checkSlugAvailability = async (slugToCheck: string) => {
    if (!slugToCheck) {
        isSlugValid.value = false;
        slugErrorMessage.value = '';
        return;
    }

    isCheckingSlug.value = true;
    try {
        const { isValid, message } = await $fetch<{ isValid: boolean; message?: string }>('/api/validation/check-slug', {
            params: {
                slug: slugToCheck,
                type: 'category',
                excludeId: isEditing.value ? editingId.value : undefined
            }
        });

        isSlugValid.value = isValid;
        slugErrorMessage.value = message || '';
    } catch (e) {
        console.error('Failed to check slug availability:', e);
        // API 오류 시 일단 통과시키고 제출 시 서버에서 다시 검증하도록 유도
        isSlugValid.value = true;
        slugErrorMessage.value = '';
    } finally {
        isCheckingSlug.value = false;
    }
};

const debouncedCheckSlug = useDebounce(checkSlugAvailability, 300);

const resetForm = () => {
    isEditing.value = false;
    editingId.value = null;
    form.name = '';
    form.slug = '';
    form.description = '';
    form.parentId = null;
    isSlugValid.value = true;
    slugErrorMessage.value = '';
};

const editCategory = (cat: any) => {
    isEditing.value = true;
    editingId.value = cat.id;
    form.name = cat.name;
    form.slug = cat.slug;
    form.description = cat.description || '';
    form.parentId = cat.parentId || null;
};

// 트리에서 노드 찾아 수정하는 재귀 함수
const updateNodeInTree = (nodes: any[], id: number, updates: any): boolean => {
    for (const node of nodes) {
        if (node.id === id) {
            Object.assign(node, updates);
            return true;
        }
        if (node.children && node.children.length > 0) {
            if (updateNodeInTree(node.children, id, updates)) return true;
        }
    }
    return false;
};

// 로컬 트리 이동 로직 (부모 변경 시)
const moveNodeInLocalTree = (id: number, newParentId: number | null) => {
    let targetNode: any = null;
    const removeAndFind = (nodes: any[]): boolean => {
        const idx = nodes.findIndex(n => n.id === id);
        if (idx !== -1) {
            targetNode = nodes[idx];
            nodes.splice(idx, 1);
            return true;
        }
        for (const node of nodes) {
             if (node.children && removeAndFind(node.children)) return true;
        }
        return false;
    };

    removeAndFind(treeData.value);

    if (!targetNode) return;

    targetNode.parentId = newParentId;

    if (newParentId === null) {
        treeData.value.push(targetNode);
    } else {
        const insertToParent = (nodes: any[]): boolean => {
            for (const node of nodes) {
                if (node.id === newParentId) {
                    if (!node.children) node.children = [];
                    node.children.push(targetNode);
                    return true;
                }
                if (node.children && insertToParent(node.children)) return true;
            }
            return false;
        };
        if (!insertToParent(treeData.value)) {
            treeData.value.push(targetNode);
        }
    }
};

const deleteCategory = async (id: number) => {
    if (!confirm('Delete this category? Articles in this category will be Uncategorized.')) return;
    try {
        await $fetch(`/api/categories/${id}`, {
            method: 'DELETE',
        });
        toast.success('Category deleted successfully!');
        await refresh();
    } catch (e) {
        toast.error('Failed to delete category');
    }
};

const handleSubmit = async () => {
    try {
        if (isEditing.value && editingId.value) {
            // [UPDATE] 내용 즉시 저장 (API 호출)
            await $fetch(`/api/categories/${editingId.value}`, {
                method: 'PUT',
                body: {
                    name: form.name,
                    slug: form.slug,
                    description: form.description,
                    parentId: form.parentId
                }
            });

            // 로컬 상태 업데이트 (Refresh 없이)
            const success = updateNodeInTree(treeData.value, editingId.value, {
                name: form.name,
                slug: form.slug,
                description: form.description,
                parentId: form.parentId
            });
            
            if (success) {
                if (form.parentId !== null || form.parentId === null) {
                     moveNodeInLocalTree(editingId.value, form.parentId);
                }

                treeData.value = [...treeData.value];
                updateFlatCategories();
                resetForm();
                toast.success('Changes updated successfully!');
            }
        } else {
            // [CREATE] 즉시 생성
            await $fetch('/api/categories', {
                method: 'POST',
                body: { ...form },
            });
            await refresh();
            resetForm();
            toast.success('Category created successfully!');
        }
    } catch (e: any) {
        toast.error(e.data?.message || 'Failed to save category');
    }
};

// 명칭 변경: saveAll -> saveOrder (순서만 저장)
const saveOrder = async () => {
    if (isSaving.value) return;
    isSaving.value = true;

    try {
        // [SAVE ORDER] 오직 순서만 저장 (Reorder API)
        const reorderUpdates: any[] = [];
        const processNode = (nodes: any[], parentId: number | null) => {
            nodes.forEach((node, index) => {
                reorderUpdates.push({
                    id: node.id,
                    parentId: parentId,
                    order: index,
                });
                if (node.children && node.children.length > 0) {
                    processNode(node.children, node.id);
                }
            });
        };
        processNode(treeData.value, null);

        await $fetch('/api/categories/reorder', {
            method: 'PUT',
            body: reorderUpdates,
        });

        await refresh(); // DB 동기화 및 Dirty 상태 초기화
        toast.success('Order saved successfully!');
    } catch (e) {
        console.error(e);
        toast.error('Failed to save order');
    } finally {
        isSaving.value = false;
    }
};
</script>
