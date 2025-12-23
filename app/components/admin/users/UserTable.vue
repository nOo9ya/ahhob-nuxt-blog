<script setup lang="ts">
/**
 * 회원 목록 테이블 (User Table)
 * Path: app/components/admin/users/UserTable.vue
 * 
 * 설명:
 * 일반 회원(Members) 목록을 보여주는 테이블입니다.
 * 소셜 로그인 정보(Provider)를 표시하며, 삭제(강제 탈퇴) 기능만 제공합니다.
 */
import { formatDate } from '~/shared/utils/date';
import { useUserSession } from '#imports';

defineProps<{
    users: any[];     // 사용자 목록 데이터
    isLoading: boolean; // 로딩 상태
}>();

const { user: currentUser } = useUserSession();

const emit = defineEmits<{
    (e: 'delete', id: number): void; // 삭제 버튼 클릭 시
}>();

const getProviderIcon = (provider: string) => {
    // Return icon class or svg path based on provider
    // Simple text for now or implementation dependent
    return provider;
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
                Loading members...
            </div>

            <!-- Empty State -->
            <div v-else-if="!users || users.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-400">
                <span>No members found</span>
            </div>

            <!-- Table -->
            <table v-else class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-50/50 border-b border-gray-100">
                        <th class="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider pl-8">Member</th>
                        <th class="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Provider</th>
                        <th class="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                        <th class="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right pr-8">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="user in users" :key="user.id" class="group hover:bg-gray-50 transition-colors">
                        <!-- User Info -->
                        <td class="py-5 px-6 pl-8">
                            <div class="flex items-center">
                                <img 
                                    :src="user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`" 
                                    class="w-10 h-10 rounded-full bg-gray-200 mr-4 object-cover border border-gray-100"
                                    alt="Avatar"
                                />
                                <div>
                                    <div class="font-bold text-gray-900">{{ user.name }}</div>
                                    <div class="text-xs text-gray-500">{{ user.email }}</div>
                                </div>
                            </div>
                        </td>

                        <!-- Provider -->
                        <td class="py-5 px-6">
                            <span class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-gray-100 text-gray-700 border border-gray-200">
                                {{ user.provider }}
                            </span>
                        </td>

                        <!-- Joined At -->
                        <td class="py-5 px-6 text-sm text-gray-500">
                            {{ formatDate(user.createdAt) }}
                        </td>

                        <!-- Actions -->
                        <td class="py-5 px-6 text-right pr-8">
                            <div class="flex items-center justify-end space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button v-if="currentUser?.role === 'admin'" @click="emit('delete', user.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Force Delete">
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
</template>
