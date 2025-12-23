<template>
    <div class="p-6 max-w-7xl mx-auto">
        <!-- 헤더 -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">통계 대시보드 (Analytics Dashboard)</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">
                방문자 유입 경로 및 트래픽 분석
            </p>
        </div>

        <!-- 기간 선택 -->
        <div class="mb-6 flex gap-2">
            <button
                v-for="option in periodOptions"
                :key="option.days"
                @click="selectedDays = option.days"
                :class="[
                    'px-4 py-2 rounded-lg font-medium transition-colors',
                    selectedDays === option.days
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                ]"
            >
                {{ option.label }}
            </button>
        </div>

        <!-- 로딩 상태 -->
        <div v-if="pending" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- 통계 데이터 -->
        <div v-else-if="analytics?.data" class="space-y-6">
            <!-- 총 방문자 수 -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    총 방문자 수 (Total Page Views)
                </h2>
                <p class="text-4xl font-bold text-blue-600">
                    {{ analytics.data.totalViews.toLocaleString() }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {{ formatDateRange(analytics.data.period.startDate, analytics.data.period.endDate) }}
                </p>
            </div>

            <!-- 유입 유형별 통계 -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    유입 유형별 통계 (Traffic Sources)
                </h2>

                <!-- 도넛 차트 -->
                <div class="mb-6 max-w-md mx-auto">
                    <Doughnut
                        v-if="chartData"
                        :data="chartData"
                        :options="chartOptions"
                    />
                </div>

                <!-- 통계 카드 -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div
                        v-for="stat in analytics.data.referrerTypeStats"
                        :key="stat.type"
                        class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {{ getReferrerTypeName(stat.type) }}
                            </span>
                            <span class="text-lg font-bold text-gray-900 dark:text-white">
                                {{ stat.count }}
                            </span>
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                            {{ stat.percentage }}%
                        </div>
                    </div>
                </div>
            </div>

            <!-- 검색엔진별 통계 (전통 검색 vs AI 검색) -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    검색엔진별 통계 (Search Engines & AI Search)
                </h2>

                <!-- 바 차트 (검색엔진 비교) -->
                <div class="h-64 mb-6">
                    <Bar
                        v-if="searchEngineChartData"
                        :data="searchEngineChartData"
                        :options="barChartOptions"
                    />
                </div>

                <!-- 검색엔진 리스트 -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- 전통 검색엔진 -->
                    <div>
                        <h3 class="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
                            전통 검색엔진 (Traditional Search)
                        </h3>
                        <div class="space-y-2">
                            <div
                                v-for="engine in getSearchEnginesByType('search')"
                                :key="engine.engine"
                                class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded"
                            >
                                <span class="capitalize text-gray-900 dark:text-white">{{ engine.engine }}</span>
                                <span class="font-bold text-blue-600">{{ engine.count }}</span>
                            </div>
                            <div v-if="getSearchEnginesByType('search').length === 0" class="text-gray-500 dark:text-gray-400 text-center py-4">
                                데이터 없음
                            </div>
                        </div>
                    </div>

                    <!-- AI 검색엔진 -->
                    <div>
                        <h3 class="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
                            AI 검색엔진 (AI Search - GEO)
                        </h3>
                        <div class="space-y-2">
                            <div
                                v-for="engine in getSearchEnginesByType('ai_search')"
                                :key="engine.engine"
                                class="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded"
                            >
                                <span class="capitalize text-gray-900 dark:text-white">{{ engine.engine }}</span>
                                <span class="font-bold text-purple-600">{{ engine.count }}</span>
                            </div>
                            <div v-if="getSearchEnginesByType('ai_search').length === 0" class="text-gray-500 dark:text-gray-400 text-center py-4">
                                데이터 없음
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 일별 방문자 추이 -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    일별 방문자 추이 (Daily Trend)
                </h2>
                <div class="h-64">
                    <Line
                        v-if="dailyTrendChartData"
                        :data="dailyTrendChartData"
                        :options="lineChartOptions"
                    />
                </div>
            </div>

            <!-- 검색 키워드 TOP 10 -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    검색 키워드 TOP 10 (Top Search Keywords)
                </h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    순위
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    키워드
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    조회수
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            <tr v-for="(item, index) in analytics.data.topKeywords" :key="item.keyword">
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{{ index + 1 }}</td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{{ item.keyword }}</td>
                                <td class="px-4 py-3 text-sm font-medium text-blue-600">{{ item.count }}</td>
                            </tr>
                            <tr v-if="analytics.data.topKeywords.length === 0">
                                <td colspan="3" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                    데이터 없음
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 인기 페이지 TOP 10 -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    인기 페이지 TOP 10 (Top Pages)
                </h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    순위
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    페이지 경로
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    조회수
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            <tr v-for="(item, index) in analytics.data.topPages" :key="item.path">
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{{ index + 1 }}</td>
                                <td class="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{{ item.path }}</td>
                                <td class="px-4 py-3 text-sm font-medium text-blue-600">{{ item.count }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p class="text-red-600 dark:text-red-400">{{ error.message || '데이터를 불러오는 데 실패했습니다.' }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Doughnut, Line, Bar } from 'vue-chartjs';
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Chart.js 컴포넌트 등록
ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

definePageMeta({
    layout: 'admin',
    middleware: ['admin'],
});

// 기간 선택 옵션
const periodOptions = [
    { days: 7, label: '최근 7일' },
    { days: 30, label: '최근 30일' },
    { days: 90, label: '최근 90일' },
];

const selectedDays = ref(30);

// 통계 데이터 조회
const { data: analytics, pending, error, refresh } = await useFetch('/api/admin/analytics/overview', {
    query: computed(() => ({ days: selectedDays.value })),
    key: 'admin-analytics-overview',
});

// 기간 변경 시 자동 새로고침
watch(selectedDays, () => {
    refresh();
});

// 도넛 차트 데이터 (유입 유형별)
const chartData = computed(() => {
    if (!analytics.value?.data?.referrerTypeStats) return null;

    const stats = analytics.value.data.referrerTypeStats;
    return {
        labels: stats.map((s: any) => getReferrerTypeName(s.type)),
        datasets: [
            {
                data: stats.map((s: any) => s.count),
                backgroundColor: [
                    '#3B82F6', // 직접 접속 - Blue
                    '#10B981', // 검색엔진 - Green
                    '#8B5CF6', // AI 검색 - Purple
                    '#F59E0B', // 소셜 미디어 - Amber
                    '#EF4444', // 외부 링크 - Red
                ],
                borderWidth: 0,
            },
        ],
    };
});

// 도넛 차트 옵션
const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: {
                padding: 15,
                font: {
                    size: 12,
                },
            },
        },
        tooltip: {
            callbacks: {
                label: function(context: any) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${label}: ${value} (${percentage}%)`;
                },
            },
        },
    },
};

// 일별 추이 차트 데이터
const dailyTrendChartData = computed(() => {
    if (!analytics.value?.data?.dailyTrend) return null;

    const trend = analytics.value.data.dailyTrend;
    return {
        labels: trend.map((t: any) => {
            const date = new Date(t.date);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        }),
        datasets: [
            {
                label: '일일 방문자 수',
                data: trend.map((t: any) => t.count),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };
});

// 라인 차트 옵션
const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            mode: 'index' as const,
            intersect: false,
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                precision: 0,
            },
        },
    },
};

// 검색엔진 바 차트 데이터
const searchEngineChartData = computed(() => {
    if (!analytics.value?.data?.searchEngineStats) return null;

    const stats = analytics.value.data.searchEngineStats;
    const traditionalSearch = stats.filter((s: any) => s.type === 'search');
    const aiSearch = stats.filter((s: any) => s.type === 'ai_search');

    // 모든 검색엔진 이름 수집
    const allEngines = [...new Set([...traditionalSearch, ...aiSearch].map((s: any) => s.engine))];

    return {
        labels: allEngines.map((e: string) => e.charAt(0).toUpperCase() + e.slice(1)),
        datasets: [
            {
                label: '전통 검색',
                data: allEngines.map((e: string) => {
                    const found = traditionalSearch.find((s: any) => s.engine === e);
                    return found ? found.count : 0;
                }),
                backgroundColor: '#10B981',
            },
            {
                label: 'AI 검색',
                data: allEngines.map((e: string) => {
                    const found = aiSearch.find((s: any) => s.engine === e);
                    return found ? found.count : 0;
                }),
                backgroundColor: '#8B5CF6',
            },
        ],
    };
});

// 바 차트 옵션
const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        tooltip: {
            mode: 'index' as const,
            intersect: false,
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                precision: 0,
            },
        },
    },
};

// 유입 유형 이름 변환
function getReferrerTypeName(type: string): string {
    const names: Record<string, string> = {
        direct: '직접 접속',
        search: '검색엔진',
        ai_search: 'AI 검색',
        social: '소셜 미디어',
        referral: '외부 링크',
    };
    return names[type] || type;
}

// 검색엔진 통계를 유형별로 분류
function getSearchEnginesByType(type: 'search' | 'ai_search') {
    if (!analytics.value?.data?.searchEngineStats) return [];
    return analytics.value.data.searchEngineStats.filter((s: any) => s.type === type);
}

// 날짜 범위 포맷
function formatDateRange(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('ko-KR')} ~ ${endDate.toLocaleDateString('ko-KR')}`;
}
</script>
