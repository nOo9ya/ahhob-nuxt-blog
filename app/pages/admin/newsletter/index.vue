<script setup lang="ts">
/**
 * 뉴스레터 구독자 관리 페이지
 * Path: pages/admin/newsletter/index.vue
 *
 * 기능:
 * 1. 구독자 목록 조회 (GET /api/newsletter/subscribers)
 * 2. 구독자 삭제 (DELETE /api/newsletter/subscribers/:id)
 * 3. 페이지네이션
 */

definePageMeta({
    layout: 'admin',
    middleware: ['admin'],
});

const toast = useToast();

const page = ref(1);
const limit = ref(20);

// API 데이터 Fetch
const { data, refresh, pending, error } = await useFetch(
    '/api/newsletter/subscribers',
    {
        query: {
            page,
            limit,
        },
        watch: [page, limit],
    }
);

// limit 변경 시 페이지 1로 초기화
watch(limit, () => {
    page.value = 1;
});

// 삭제 핸들러
const handleDelete = async (id: number, email: string) => {
    if (!confirm(`'${email}' 님의 구독을 정말 취소하시겠습니까?`)) return;

    try {
        await $fetch(`/api/newsletter/subscribers/${id}`, {
            method: 'DELETE',
        });
        toast.success('Subscriber deleted successfully!');
        refresh(); // 목록 갱신
    } catch (e) {
        toast.error('Failed to delete subscriber');
        console.error(e);
    }
};

// 상태 변경 핸들러
const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const action = currentStatus ? '구독 중지' : '구독 재개';
    if (!confirm(`해당 사용자를 ${action} 처리하시겠습니까?`)) return;

    try {
        await $fetch(`/api/newsletter/subscribers/${id}`, {
            method: 'PUT',
            body: { isActive: !currentStatus },
        });
        toast.success('Status updated successfully!');
        refresh(); // 목록 갱신
    } catch (e) {
        toast.error('Failed to update status');
        console.error(e);
    }
};

// 날짜 포맷팅
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">
                    뉴스레터 구독자
                </h2>
                <p class="mt-1 text-sm text-gray-500">
                    뉴스레터 구독 신청자 목록을 관리합니다.
                </p>
            </div>
            <div class="flex items-center gap-2">
                <select 
                    v-model="limit" 
                    class="border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 pl-3 pr-8"
                >
                    <option :value="10">10개씩 보기</option>
                    <option :value="15">15개씩 보기</option>
                    <option :value="20">20개씩 보기</option>
                    <option :value="30">30개씩 보기</option>
                    <option :value="50">50개씩 보기</option>
                    <option :value="100">100개씩 보기</option>
                </select>
                <div class="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                    총 구독자:
                    <span class="font-bold text-indigo-600">{{
                        data?.pagination.total || 0
                    }}</span>
                    명
                </div>
            </div>
        </div>

        <!-- Content -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <!-- Loading State -->
            <div v-if="pending" class="p-8 text-center text-gray-500">
                데이터를 불러오는 중입니다...
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="p-8 text-center text-red-500">
                데이터를 불러오는데 실패했습니다: {{ error.message }}
            </div>

            <!-- Empty State -->
            <div v-else-if="!data?.subscribers.length" class="p-8 text-center text-gray-500">
                구독자가 없습니다.
            </div>

            <!-- Data Table -->
            <div v-else class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                            <th class="px-6 py-4">ID</th>
                            <th class="px-6 py-4">이메일</th>
                            <th class="px-6 py-4">상태</th>
                            <th class="px-6 py-4">구독 신청일</th>
                            <th class="px-6 py-4 text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr
                            v-for="subscriber in data.subscribers"
                            :key="subscriber.id"
                            class="hover:bg-gray-50 transition-colors group"
                        >
                            <td class="px-6 py-4 text-sm text-gray-500">
                                #{{ subscriber.id }}
                            </td>
                            <td class="px-6 py-4">
                                <span class="font-medium text-gray-900">{{
                                    subscriber.email
                                }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <span
                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                    :class="
                                        subscriber.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    "
                                >
                                    {{ subscriber.isActive ? '구독중' : '중지됨' }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500">
                                {{ formatDate(subscriber.createdAt) }}
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <button
                                        @click="handleToggleStatus(subscriber.id, subscriber.isActive)"
                                        class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 shadow-sm"
                                        :class="subscriber.isActive 
                                            ? 'bg-white text-yellow-600 border-yellow-200 hover:bg-yellow-50 ring-1 ring-transparent hover:ring-yellow-200' 
                                            : 'bg-white text-green-600 border-green-200 hover:bg-green-50 ring-1 ring-transparent hover:ring-green-200'"
                                    >
                                        <svg v-if="subscriber.isActive" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                                            <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                                        </svg>
                                        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                        </svg>
                                        {{ subscriber.isActive ? '중지' : '재개' }}
                                    </button>
                                    
                                    <button
                                        @click="handleDelete(subscriber.id, subscriber.email)"
                                        class="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-100 bg-white text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm flex items-center gap-1"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                                            <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
                                        </svg>
                                        삭제
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div
                v-if="data?.pagination && data.pagination.totalPages > 1"
                class="px-6 py-4 border-t border-gray-100 flex justify-center gap-2"
            >
                <button
                    v-for="p in data.pagination.totalPages"
                    :key="p"
                    @click="page = p"
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors"
                    :class="
                        page === p
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                    "
                >
                    {{ p }}
                </button>
            </div>
        </div>
    </div>
</template>
