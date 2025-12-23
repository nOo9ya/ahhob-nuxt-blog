<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-4">Analytics Test Page</h1>
        <p class="mb-4">이 페이지가 보이면 라우팅은 정상입니다.</p>

        <div class="space-y-4">
            <div>
                <h2 class="font-bold">1. 페이지 로드 확인</h2>
                <p class="text-green-600">✓ 페이지가 로드되었습니다!</p>
            </div>

            <div>
                <h2 class="font-bold">2. API 테스트</h2>
                <button
                    @click="testAPI"
                    class="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    API 호출 테스트
                </button>
                <pre v-if="apiResult" class="mt-2 p-4 bg-gray-100 rounded">{{ apiResult }}</pre>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'admin',
    middleware: ['admin'],
});

const apiResult = ref(null);

const testAPI = async () => {
    try {
        const response = await $fetch('/api/admin/analytics/overview?days=7');
        apiResult.value = JSON.stringify(response, null, 2);
    } catch (error: any) {
        apiResult.value = `ERROR: ${error.message}\n${JSON.stringify(error.data || error, null, 2)}`;
    }
};
</script>
