<script setup lang="ts">
/**
 * Admin Dashboard Main Page
 * app/pages/admin/index.vue
 * 
 * 기능: 
 * - 관리자 대시보드 메인 화면
 * - 서버 통계 API (/api/admin/stats/dashboard)를 호출하여 실시간 데이터 표시
 */
import VisitorChart from '@/components/admin/dashboard/VisitorChart.vue';
import TopArticlesTable from '@/components/admin/dashboard/TopArticlesTable.vue';

definePageMeta({
    layout: 'admin',
    middleware: ['admin'],
});

interface DashboardData {
    stats: {
        totalArticles: number;
        publishedArticles: number;
        totalComments: number;
        totalSubscribers: number;
    };
    topArticles: any[];
    visitorChart: any[];
}

// SSR 시점 또는 클라이언트 마운트 시 데이터 조회
const { data: dashboardData, pending, error } = await useFetch<DashboardData>('/api/admin/stats/dashboard', {
    lazy: true
});

/**
 * 통계 카드 데이터 매핑 (Computed)
 */
const statsCards = computed(() => {
    const s = dashboardData.value?.stats || {
        totalArticles: 0,
        publishedArticles: 0,
        totalComments: 0,
        totalSubscribers: 0,
    };

    return [
        { 
            label: 'Total Articles', 
            value: s.totalArticles.toLocaleString(), 
            subValue: `Published: ${s.publishedArticles.toLocaleString()}`,
            icon: 'document-text', 
            color: 'bg-blue-500',
            textColor: 'text-blue-500'
        },
        { 
            label: 'Total Comments', 
            value: s.totalComments.toLocaleString(), 
            subValue: 'All time', 
            icon: 'chat-bubble', 
            color: 'bg-purple-500',
            textColor: 'text-purple-500'
        },
        { 
            label: 'Newsletter Subscribers', 
            value: s.totalSubscribers.toLocaleString(), 
            subValue: 'Active users', 
            icon: 'users', 
            color: 'bg-orange-500',
            textColor: 'text-orange-500' 
        },
        { 
            label: 'Engagement', 
            value: 'N/A', // TODO: Calculate engagement rate
            subValue: 'Coming soon', 
            icon: 'chart-bar', 
            color: 'bg-green-500', 
            textColor: 'text-green-500'
        },
    ];
});

const visitorData = computed(() => dashboardData.value?.visitorChart || []);
const topArticles = computed(() => dashboardData.value?.topArticles || []);

</script>

<template>
    <div class="space-y-8">
        <!-- Error State -->
        <div v-if="error" class="bg-red-50 text-red-600 p-4 rounded-xl">
            <p class="font-bold">Failed to load dashboard data.</p>
            <p class="text-sm">{{ error.message }}</p>
        </div>

        <!-- 1. Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Loading Skeleton -->
            <template v-if="pending">
                <div v-for="i in 4" :key="i" class="bg-white p-6 rounded-[2rem] shadow-sm animate-pulse h-40">
                    <div class="h-10 w-10 bg-gray-200 rounded-2xl mb-4"></div>
                    <div class="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                    <div class="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
            </template>

            <!-- Real Data Cards -->
            <template v-else>
                <div
                    v-for="stat in statsCards"
                    :key="stat.label"
                    class="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                >
                    <div>
                         <div class="flex items-center justify-between mb-4">
                            <div :class="`p-3 rounded-2xl ${stat.color} bg-opacity-10 ${stat.textColor} group-hover:bg-opacity-20 transition-colors`">
                                <!-- Icons -->
                                <svg v-if="stat.icon === 'document-text'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <svg v-else-if="stat.icon === 'chat-bubble'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                <svg v-else-if="stat.icon === 'users'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                            </div>
                        </div>
                        <div>
                            <h3 class="text-gray-400 text-sm font-semibold mb-1 tracking-wide">{{ stat.label }}</h3>
                            <div class="flex items-baseline gap-2">
                                <p class="text-3xl font-extrabold text-gray-900 group-hover:scale-105 transition-transform origin-left">{{ stat.value }}</p>
                                <span class="text-xs text-gray-500 font-medium">{{ stat.subValue }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- 2. Charts & Tables -->
        <!-- 2. Charts & Tables -->
        <div class="space-y-6">
            
            <!-- Visitor Chart (Main) -->
            <div class="w-full bg-white rounded-[2rem] shadow-sm p-8 flex flex-col min-h-[400px]">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900">Visitor Analytics</h3>
                        <p class="text-sm text-gray-500">Recently 30 days traffic</p>
                    </div>
                </div>
                <!-- Chart Component -->
                 <div class="flex-1 relative">
                    <ClientOnly>
                        <VisitorChart v-if="visitorData.length > 0" :data="visitorData" />
                        <div v-else class="flex h-full items-center justify-center text-gray-400">
                             No visitor data available yet.
                        </div>
                        <template #fallback>
                            <div class="flex h-full items-center justify-center text-gray-400 animate-pulse">
                                Loading chart...
                            </div>
                        </template>
                    </ClientOnly>
                 </div>
            </div>

            <!-- Top Articles Table -->
            <div class="bg-white rounded-[2rem] shadow-sm p-8 flex flex-col">
                 <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-gray-900">Top Articles</h3>
                    <NuxtLink to="/admin/articles" class="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                        View All
                    </NuxtLink>
                </div>
                <!-- Table Component -->
                <TopArticlesTable :articles="topArticles" />
            </div>

        </div>
        
        <!-- 3. System Utilities & Shortcuts (Optional) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div class="bg-gray-900 text-white rounded-[2rem] shadow-xl p-8 relative overflow-hidden group">
                 <div class="relative z-10">
                    <h3 class="text-lg font-bold mb-4">System Utilities</h3>
                    <div class="space-y-3">
                        <a href="/sitemap.xml" target="_blank" class="flex items-center justify-between text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors">
                            <span class="text-sm">Sitemap XML</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                         <a href="/rss.xml" target="_blank" class="flex items-center justify-between text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors">
                            <span class="text-sm">RSS Feed</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                    </div>
                </div>
                 <!-- Background Decoration -->
                <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
            </div>
            
            <!-- Quick Actions -->
             <div class="bg-white rounded-[2rem] shadow-sm p-8 col-span-2">
                <h3 class="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div class="flex gap-4">
                    <NuxtLink to="/admin/articles/new" class="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                        New Article
                    </NuxtLink>
                    <NuxtLink to="/admin/settings" class="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Settings
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>
