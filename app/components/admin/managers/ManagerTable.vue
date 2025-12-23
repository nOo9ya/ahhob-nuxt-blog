<script setup lang="ts">
/**
 * 사용자 목록 테이블 (User Table)
 * Path: app/components/admin/users/UserTable.vue
 * 
 * 설명:
 * 관리자 페이지에서 사용자 목록을 보여주는 테이블 컴포넌트입니다.
 * 순수 Presenter 컴포넌트로, 데이터(`users`)를 받아서 그리고
 * 수정(`edit`), 삭제(`delete`) 이벤트를 부모에게 전달합니다.
 * 
 * 주요 기능:
 * - 사용자 아바타, 이름, 이메일, 권한(Badge), 가입일 표시.
 * - 권한(Role)에 따른 배지 색상 구분.
 * - Loading, Empty 상태 처리.
 */
import type { UserRole, UserStatus } from '~/shared/types/user';
import { formatDate } from '~/shared/utils/date';
import { useUserSession } from '#imports';

const { user } = useUserSession();

defineProps<{
    managers: any[];     // 관리자 목록 데이터
    isLoading: boolean; // 로딩 상태
}>();

const emit = defineEmits<{
    (e: 'edit', manager: any): void;   // 수정 버튼 클릭 시
    (e: 'approve', manager: any): void; // 승인 버튼 클릭 시
}>();

/**
 * 권한 배지 색상 결정 함수
 */
const getRoleColor = (role?: string | UserRole) => {
    if (!role) return 'bg-gray-100 text-gray-700 border-gray-200';
    switch (role) {
        case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'editor': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'writer': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

/**
 * 상태 배지 색상 결정 함수
 */
const getStatusColor = (status?: string | UserStatus) => {
    switch (status) {
        case 'active': return 'bg-green-100 text-green-700 border-green-200';
        case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'suspended': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};
</script>

<template>
    <div class="bg-white rounded-[2rem] shadow-sm p-1 overflow-hidden">
        <div class="overflow-x-auto min-h-[400px]">
            <!-- Loading State -->
            <div v-if="isLoading" class="flex items-center justify-center h-64 text-gray-400">
                <svg class="animate-spin h-5 w-5 mr-3 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading managers...
            </div>

            <!-- Empty State -->
            <div v-else-if="!managers || managers.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-400">
                <span>No managers found</span>
            </div>

            <!-- Table -->
            <table v-else class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-50/50 border-b border-gray-100">
                        <th class="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider pl-8">Manager</th>
                        <th class="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                        <th class="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                        <th class="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Bio</th>
                        <th class="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                        <th class="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right pr-8">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="manager in managers" :key="manager.id" class="group hover:bg-gray-50 transition-colors">
                        <!-- User Info -->
                        <td class="py-5 px-6 pl-8">
                            <div class="flex items-center">
                                <img 
                                    :src="manager.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${manager.name}`" 
                                    class="w-10 h-10 rounded-full bg-gray-200 mr-4 object-cover border border-gray-100"
                                    alt="Avatar"
                                />
                                <div>
                                    <div class="font-bold text-gray-900">{{ manager.name }}</div>
                                    <div class="text-xs text-gray-500">{{ manager.email }}</div>
                                </div>
                            </div>
                        </td>

                        <!-- Role -->
                        <td class="py-5 px-6">
                            <span 
                                class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border"
                                :class="getRoleColor(manager.role)"
                            >
                                {{ manager.role }}
                            </span>
                        </td>

                        <!-- Status -->
                        <td class="py-5 px-6">
                            <span 
                                class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border"
                                :class="getStatusColor(manager.status || 'pending')"
                            >
                                {{ manager.status || 'pending' }}
                            </span>
                        </td>

                        <!-- Bio -->
                        <td class="py-5 px-6">
                            <div class="text-sm text-gray-600 max-w-xs truncate" :title="manager.bio">
                                {{ manager.bio || '-' }}
                            </div>
                        </td>

                        <!-- Joined At -->
                        <td class="py-5 px-6 text-sm text-gray-500">
                            {{ formatDate(manager.createdAt) }}
                        </td>
    
                        <!-- Actions -->
                        <td class="py-5 px-6 text-right pr-8">
                            <div class="flex items-center justify-end space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <!-- Approve Button -->
                                <button v-if="user?.role === 'admin' && manager.status === 'pending'" @click="emit('approve', manager)" 
                                    class="p-2 text-yellow-600 bg-yellow-50 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors ring-1 ring-inset ring-yellow-600/20" 
                                    title="Approve Manager">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                                
                                <button v-if="user?.role === 'admin'" @click="emit('edit', manager)" class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
