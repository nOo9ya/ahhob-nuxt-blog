<script setup lang="ts">
/**
 * Managers Management Page
 * app/pages/admin/managers/index.vue
 * 
 * 기능: 관리자(운영진) 관리 페이지
 */
import ManagerTable from '@/components/admin/managers/ManagerTable.vue';
import ManagerModal from '@/components/admin/managers/ManagerModal.vue';
import { useAdminManagers } from '@/composables/useAdminManagers';
import { useUserSession } from '#imports';

definePageMeta({
    layout: 'admin',
    middleware: ['admin'],
});

const { user } = useUserSession();

const {
    managers,
    isLoading,
    isModalOpen,
    editingManager,
    fetchManagers,
    openCreateModal,
    openEditModal,
    closeModal,
    saveManager,
    approveManager,
} = useAdminManagers();

// Initial Fetch
await fetchManagers();
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">Managers</h2>
                <p class="text-gray-500 text-sm mt-1">Manage admin and staff members.</p>
            </div>
            <button 
                v-if="user?.role === 'admin'"
                @click="openCreateModal"
                class="bg-black text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors flex items-center shadow-lg shadow-gray-200"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 mr-2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Invite Manager
            </button>
        </div>

        <!-- Content Component -->
        <ManagerTable 
            :managers="managers" 
            :is-loading="isLoading" 
            @edit="openEditModal" 
            @approve="approveManager"
        />

        <!-- Modal Component -->
        <ManagerModal 
            :is-open="isModalOpen" 
            :manager="editingManager" 
            @close="closeModal" 
            @save="saveManager" 
        />
    </div>
</template>
