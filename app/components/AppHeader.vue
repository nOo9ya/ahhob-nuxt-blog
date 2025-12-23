<script setup lang="ts">
/**
 * App Header Component
 * app/components/common/AppHeader.vue
 */

const { showButton: showSidebarToggle, toggle: toggleSidebar } =
    useMobileSidebar();
const isMobileMenuOpen = ref(false);
const route = useRoute();

// Components
import DarkModeToggle from '@/components/common/DarkModeToggle.vue';
import SearchModal from '@/components/common/SearchModal.vue';

// 라우트 변경 시 모바일 메뉴 닫기
watch(
    () => route.path,
    () => {
        isMobileMenuOpen.value = false;
        isSearchOpen.value = false; // 페이지 이동 시 검색창 닫기
    }
);

// --- Data Fetching (Dynamic Navigation) ---
// 1. 최상위 카테고리 가져오기 (Depth=0 or Root list)
//    - /api/categories/tree 에서 데이터를 가져온 뒤, depth가 0인 것(최상위)만 필터링하거나,
//    - API가 전체 트리를 주면 최상위 노드만 사용.
//    - 여기서는 기존 tree API를 활용합니다.
const { data: categoryData } = await useFetch('/api/categories/tree', {
    key: 'header-categories',
    dedupe: 'defer',
});

// 2. 정적 페이지 가져오기
const { data: pageData } = await useFetch('/api/pages', {
    key: 'header-pages',
    dedupe: 'defer',
});

// 네비게이션 아이템 계산
// (최상위 카테고리 + 정적 페이지 중 필요한 것들)
const navItems = computed(() => {
    const items: Array<{ name: string; path: string }> = [];

    // 1. Categories (Root levels only)
    const rawCategories = (categoryData.value as any)?.data || [];
    // tree 형태이므로 최상위 노드들이 바로 배열로 들어옴
    rawCategories.forEach((cat: any) => {
        // 혹시 모르니 depth 체크나 parentId 체크가 필요할 수 있으나, tree API 특성상 최상위 배열이 root임.
        items.push({
            name: cat.name,
            path: `/${cat.path || cat.slug}`, // path 우선 사용
        });
    });

    // 2. Pages (Static Pages)
    //    TODO: 헤더에 노출할 페이지를 필터링하는 로직이 필요할 수 있음 (e.g. is_header_menu)
    //    현재는 예시로 모든 페이지를 추가하거나, 특정 페이지만 추가.
    const rawPages = (pageData.value as any)?.data || [];
    // 예: 'About', 'Contact' 등
    rawPages.forEach((page: any) => {
        // 이미 Articles, Categories 등이 있으므로 중복 주의.
        // 여기서는 일단 다 추가해봄.
        items.push({
            name: page.title,
            path: `/${page.slug}`,
        });
    });
    
    // (Optional) 하드코딩된 'Articles' 링크는 전체 글 목록으로 유용하므로 맨 앞에 추가?
    // items.unshift({ name: 'Articles', path: '/articles' });

    return items;
});


// --- Search Logic ---
const router = useRouter();
const isSearchOpen = ref(false);

const toggleSearch = () => {
    isSearchOpen.value = !isSearchOpen.value;
};

const handleSearch = (keyword: string) => {
    router.push({
        path: '/search',
        query: { q: keyword }
    });
    isSearchOpen.value = false;
};
</script>

<template>
    <header class="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50">
        <div
            class="container flex h-16 items-center justify-between"
        >
            <!-- Logo -->
            <div class="flex items-center">
                <NuxtLink
                    to="/"
                    class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight"
                >
                    News<span class="text-indigo-600 dark:text-indigo-400">Blog</span>
                </NuxtLink>
                <!-- Navigation (Dynamic) -->
                <nav role="navigation" aria-label="주요 메뉴" class="ml-10 hidden space-x-8 md:flex">
                    <!-- 'Articles' 전체보기 링크는 고정으로 두거나 제거 가능 -->
                    <NuxtLink
                        to="/articles"
                        class="text-sm font-medium text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
                        active-class="text-indigo-600 dark:text-indigo-400 font-bold"
                    >
                        Articles
                    </NuxtLink>

                    <NuxtLink
                        v-for="item in navItems"
                        :key="item.path"
                        :to="item.path"
                        class="text-sm font-medium text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
                        active-class="text-indigo-600 dark:text-indigo-400 font-bold"
                    >
                        {{ item.name }}
                    </NuxtLink>
                </nav>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-2 lg:space-x-4">
                <!-- 검색 버튼 -->
                <button
                    @click="toggleSearch"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="검색 열기"
                    :aria-expanded="isSearchOpen"
                >
                    <span class="sr-only">Search</span>
                    <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        />
                    </svg>
                </button>

                <!-- 1. 기사 상세 페이지일 때: 카테고리 사이드바 토글 -->
                <button
                    v-if="showSidebarToggle"
                    @click="toggleSidebar"
                    class="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-6"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                        />
                    </svg>
                    <!-- <span class="text-xs font-bold">카테고리</span> -->
                </button>

                <!-- 2. 일반 페이지일 때: 메인 메뉴 토글 (GNB) -->
                <button
                    v-else
                    @click="isMobileMenuOpen = !isMobileMenuOpen"
                    class="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="모바일 메뉴 열기"
                    :aria-expanded="isMobileMenuOpen"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-6"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                        />
                    </svg>
                </button>

                <!-- Dark Mode Toggle -->
                <DarkModeToggle />

                <NuxtLink
                    to="/login"
                    class="rounded-full bg-gray-900 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition hidden sm:block"
                >
                    Sign in
                </NuxtLink>
            </div>
        </div>

        <!-- Backdrop (Overlay) -->
        <Transition
            enter-active-class="transition-opacity ease-linear duration-200"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity ease-linear duration-150"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="isMobileMenuOpen"
                class="fixed inset-0 top-16 z-40 bg-black/25 backdrop-blur-sm lg:hidden"
                @click="isMobileMenuOpen = false"
                aria-hidden="true"
            ></div>
        </Transition>

        <!-- 모바일 GNB 메뉴 (Slide Down + Backdrop Blur) -->
        <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
        >
            <div
                v-if="isMobileMenuOpen"
                class="lg:hidden absolute top-full left-0 w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl rounded-b-2xl border-t border-gray-100 dark:border-gray-800 overflow-hidden"
            >
                <nav role="navigation" aria-label="모바일 주요 메뉴" class="flex flex-col p-4 space-y-2">
                    <NuxtLink
                        to="/articles"
                        class="block w-full px-4 py-3 text-lg font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        active-class="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                        @click="isMobileMenuOpen = false"
                    >
                        Articles
                    </NuxtLink>
                    <NuxtLink
                        v-for="item in navItems"
                        :key="item.path"
                        :to="item.path"
                        class="block w-full px-4 py-3 text-lg font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        active-class="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                        @click="isMobileMenuOpen = false"
                    >
                        {{ item.name }}
                    </NuxtLink>

                    <div class="h-px bg-gray-100 dark:bg-gray-800 my-2 mx-2"></div>

                    <NuxtLink
                        to="/login"
                        class="block w-full px-4 py-3 text-center text-base font-bold text-white bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-500 rounded-xl transition-colors shadow-md transform active:scale-[0.98]"
                        @click="isMobileMenuOpen = false"
                    >
                        Sign in
                    </NuxtLink>
                </nav>
            </div>
        </Transition>
    </header>

    <!-- 검색 모달 컴포넌트 -->
    <SearchModal
        :is-open="isSearchOpen"
        @close="isSearchOpen = false"
        @search="handleSearch"
    />
</template>

