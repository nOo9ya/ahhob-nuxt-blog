<script setup lang="ts">
/**
 * Members Management Page
 * app/pages/admin/users/index.vue
 * 
 * 기능: 일반 회원(Members) 관리 페이지
 * 역할: 데이터 Fetching, 회원 강제 탈퇴
 */
import UserTable from '@/components/admin/users/UserTable.vue';
import { useAdminUsers } from '@/composables/useAdminUsers';

definePageMeta({
    layout: 'admin',
    middleware: ['admin'],
});

const {
    users,
    isLoading,
    fetchUsers,
    deleteUser,
} = useAdminUsers();

// Initial Fetch
await fetchUsers();
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">Members</h2>
                <p class="text-gray-500 text-sm mt-1">Manage registered social login members.</p>
            </div>
            <!-- No Invite Button for Members -->
        </div>

        <!-- Content Component -->
        <UserTable 
            :users="users" 
            :is-loading="isLoading" 
            @delete="deleteUser"
        />
    </div>
</template>
