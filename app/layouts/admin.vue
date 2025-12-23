<script setup lang="ts">
/**
 * 관리자 레이아웃 (Admin Layout)
 * Path: layouts/admin.vue
 *
 * 설명:
 * 관리자 페이지(/admin/*) 전용 레이아웃입니다.
 * 좌측 사이드바 내비게이션과 상단 헤더, 그리고 메인 콘텐츠 영역으로 구성됩니다.
 *
 * 주요 기능:
 * 1. 사이드바 내비게이션: 주요 관리 메뉴 (대시보드, 기사, 카테고리 등) 링크 제공
 * 2. 현재 활성 메뉴 하이라이팅
 * 3. 반응형 디자인 (모바일 대응 고려 구조)
 */

const route = useRoute();
import DarkModeToggle from '@/components/common/DarkModeToggle.vue';

/**
 * 네비게이션 메뉴 목록
 * - name: 메뉴명
 * - path: 이동 경로
 * - icon: 아이콘 (Heroicons 등 사용 시 이름 또는 SVG)
 */
const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: 'home' },
    { name: 'Analytics', path: '/admin/analytics', icon: 'chart-bar' },
    { name: 'Articles', path: '/admin/articles', icon: 'document-text' },
    { name: 'Pages', path: '/admin/pages', icon: 'document-duplicate' },
    { name: 'Categories', path: '/admin/categories', icon: 'folder' },
    { name: 'Tags', path: '/admin/tags', icon: 'tag' },
    { name: 'Members', path: '/admin/users', icon: 'users' },
    { name: 'Managers', path: '/admin/managers', icon: 'shield-check' },
    { name: 'Newsletter', path: '/admin/newsletter', icon: 'envelope' },
    { name: 'AdSense', path: '/admin/adsense', icon: 'currency-dollar' },
    { name: 'Settings', path: '/admin/settings', icon: 'cog' },
];

/**
 * 현재 경로가 해당 메뉴와 일치하는지 확인 (Active State)
 */
const isActive = (path: string) => {
    if (path === '/admin') return route.path === '/admin';
    return route.path.startsWith(path);
};
</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <!-- Sidebar Navigation -->
        <aside role="navigation" aria-label="관리자 사이드바 메뉴" class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col fixed h-full z-20">
            <!-- Logo Area -->
            <div class="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-700">
                <NuxtLink to="/" class="flex items-center gap-2 group">
                    <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:bg-indigo-700 transition-colors">
                        B
                    </div>
                    <span class="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">BlogAdmin</span>
                </NuxtLink>
            </div>

            <!-- Menu Items -->
            <nav role="navigation" aria-label="관리자 주요 메뉴" class="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                <NuxtLink
                    v-for="item in menuItems"
                    :key="item.path"
                    :to="item.path"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
                    :class="isActive(item.path)
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-800'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'"
                >
                    <!-- Icon Implementation (Example with simple SVG based on name) -->
                    <!-- 실제 프로젝트에서는 Heroicons 컴포넌트 등을 사용 권장 -->
                    <span class="w-5 h-5 flex items-center justify-center transition-transform group-hover:scale-110">
                         <!-- Simple SVG placeholders -->
                        <svg v-if="item.icon === 'home'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                        <svg v-else-if="item.icon === 'document-text'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                        <svg v-else-if="item.icon === 'folder'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
                        <svg v-else-if="item.icon === 'tag'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.593l6.202-2.073c1.721-.575 2-2.758.628-4.13l-9.58-9.581a2.25 2.25 0 00-1.591-.659zM9.75 9.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                        <svg v-else-if="item.icon === 'users'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                        <svg v-else-if="item.icon === 'shield-check'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
                        <svg v-else-if="item.icon === 'cog'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 018.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.467a23.78 23.78 0 00-8.835-2.535m0 2.535a23.74 23.74 0 00-8.835-2.535" /></svg>
                        <svg v-else-if="item.icon === 'envelope'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                        <svg v-else-if="item.icon === 'currency-dollar'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <svg v-else-if="item.icon === 'document-duplicate'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>
                        <svg v-else-if="item.icon === 'chart-bar'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                    </span>
                    {{ item.name }}
                </NuxtLink>
            </nav>

            <!-- User Profile (Bottom) -->
            <div class="h-16 border-t border-gray-100 dark:border-gray-700 flex items-center px-6 gap-3">
                 <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500"></div>
                 <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">Admin User</p>
                    <p class="text-xs text-gray-400 truncate">admin@example.com</p>
                 </div>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main role="main" class="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300">
            <!-- Header (Mobile Toggle & Title) -->
            <header role="banner" class="h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                <div class="flex items-center gap-4">
                     <!-- Mobile Menu Button (Hidden on Desktop) -->
                    <button aria-label="모바일 메뉴 열기" class="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                    </button>
                    <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100 capitalize">{{ route.name?.toString().replace('admin-', '') }}</h1>
                </div>

                <!-- Header Actions -->
                <div class="flex items-center gap-4">
                     <!-- Dark Mode Toggle -->
                     <DarkModeToggle />

                     <button aria-label="알림 확인" class="text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative">
                        <span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800" aria-hidden="true"></span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                     </button>
                     <NuxtLink to="/" class="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        View Site &rarr;
                     </NuxtLink>
                </div>
            </header>

            <!-- Page Content -->
            <div class="p-8">
                <slot />
            </div>
        </main>
    </div>
</template>
