<script setup lang="ts">
/**
 * Tags Management Page
 * app/pages/admin/tags/index.vue
 * 
 * 기능: 태그 목록 조회 (이름, 슬러그, 게시글 수) 및 CRUD
 * 데이터: /api/tags API 호출
 * 구조: TagForm 컴포넌트 사용을 통한 리팩토링
 */
import type { Tag, ApiResponse } from '~/shared/types/article';
import TagForm from '~/app/components/admin/tags/TagForm.vue';
import AdminUiModal from '~/app/components/admin/ui/Modal.vue';

// Tag 인터페이스에 articleCount와 createdAt/updatedAt 등이 API에서 내려온다고 가정


definePageMeta({
    layout: 'admin',
    middleware: ['admin']
});

const toast = useToast();

// --- State ---
const { data: response, refresh, status, error } = await useFetch<ApiResponse<Tag[]>>('/api/tags', {
    method: 'GET',
    lazy: true
});

const pending = computed(() => status.value === 'pending');
const tags = computed(() => response.value?.tags || []);

const isModalOpen = ref(false);
const editingTag = ref<Tag | null>(null);

// --- Actions ---

const openCreateModal = () => {
    editingTag.value = null;
    isModalOpen.value = true;
};

const openEditModal = (tag: Tag) => {
    editingTag.value = tag;
    isModalOpen.value = true;
};

const handleSave = async (formData: any) => {
    try {
        if (editingTag.value) {
            // Update
            await $fetch(`/api/tags/${editingTag.value.id}`, {
                method: 'PUT',
                body: formData
            });
            //alert('태그가 수정되었습니다.');
        } else {
            // Create
            await $fetch('/api/tags', {
                method: 'POST',
                body: formData
            });
            //alert('태그가 생성되었습니다.');
        }

        // Success
        isModalOpen.value = false;
        toast.success(editingTag.value ? 'Tag updated successfully!' : 'Tag created successfully!');
        refresh(); // Reload list
    } catch (e: any) {
        console.error('Failed to save tag:', e);
        toast.error(e.data?.message || 'Failed to save tag');
    }
};

const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 태그를 삭제하시겠습니까? 연결된 게시글에서 태그가 제거됩니다.')) return;

    try {
        await $fetch(`/api/tags/${id}`, {
            method: 'DELETE'
        });
        toast.success('Tag deleted successfully!');
        refresh();
    } catch (e: any) {
        console.error('Failed to delete tag:', e);
        toast.error(e.data?.message || 'Failed to delete tag');
    }
};

const handleModalClose = () => {
    isModalOpen.value = false;
};
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">Tags</h2>
                <p class="text-gray-500 text-sm mt-1">게시글을 분류하는 태그를 관리합니다.</p>
            </div>
            <button @click="openCreateModal" class="bg-black text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors flex items-center shadow-lg shadow-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 mr-2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create Tag
            </button>
        </div>

        <!-- Content -->
        <div class="bg-white rounded-[2rem] shadow-sm p-1 overflow-hidden border border-gray-100/50">
            <div class="overflow-x-auto min-h-[400px]">
                <div v-if="pending" class="flex items-center justify-center h-64 text-gray-400">
                    <svg class="animate-spin h-8 w-8 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                
                <div v-else-if="error" class="flex flex-col items-center justify-center h-64 text-red-500">
                    <p class="font-bold">Failed to load tags</p>
                    <button @click="() => refresh()" class="mt-4 text-sm underline text-gray-500 hover:text-black">Retry</button>
                </div>

                <div v-else-if="tags.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-400">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mb-3 opacity-20">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
                    </svg>
                    <span>No tags found</span>
                </div>

                <table v-else class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50/50 border-b border-gray-100">
                            <th class="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider pl-8">Name</th>
                            <th class="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Slug</th>
                            <th class="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Articles</th>
                            <th class="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Created</th>
                            <th class="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right pr-8">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="tag in tags" :key="tag.id" class="group hover:bg-gray-50 transition-colors">
                            <!-- Name -->
                            <td class="py-5 px-6 pl-8">
                                <div class="flex items-center">
                                    <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3 shadow-sm group-hover:scale-110 transition-transform">
                                        <span class="text-sm font-bold">#</span>
                                    </div>
                                    <span class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{ tag.name }}</span>
                                </div>
                            </td>

                            <!-- Slug -->
                            <td class="py-5 px-6">
                                <span class="bg-gray-100 text-gray-600 border border-gray-200 px-2 py-1 rounded-md text-sm font-mono">
                                    {{ tag.slug }}
                                </span>
                            </td>

                            <!-- Articles Count -->
                            <td class="py-5 px-6">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {{ tag.articleCount || 0 }} posts
                                </span>
                            </td>

                            <!-- Created At -->
                            <td class="py-5 px-6 text-sm text-gray-500">
                                {{ tag.createdAt ? new Date(tag.createdAt).toLocaleDateString() : '-' }}
                            </td>

                            <!-- Actions -->
                            <td class="py-5 px-6 text-right pr-8">
                                <div class="flex items-center justify-end space-x-2">
                                    <button @click="openEditModal(tag)" class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                        </svg>
                                    </button>
                                    <button @click="handleDelete(tag.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Create/Edit Modal with TagForm -->
        <AdminUiModal 
            v-model="isModalOpen" 
            :title="editingTag ? 'Edit Tag' : 'New Tag'"
            maxWidth="md"
        >
            <TagForm
                :initialData="editingTag"
                @submit="handleSave"
                @cancel="handleModalClose"
            />
        </AdminUiModal>
    </div>
</template>
