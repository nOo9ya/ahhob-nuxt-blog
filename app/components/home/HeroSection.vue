<template>
    <div class="relative bg-white overflow-hidden isolate">
        <!-- Background Gradient Blobs with Animation -->
        <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-pulse-slow"></div>
        </div>
        
        <div class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
            <div class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#06b6d4] to-[#3b82f6] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] animate-pulse-slow delay-1000"></div>
        </div>

        <div class="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
            <div class="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
                <div class="mt-24 sm:mt-32 lg:mt-16">
                    <div class="inline-flex items-center space-x-2 rounded-full ring-1 ring-gray-900/10 bg-white/50 backdrop-blur-sm px-3 py-1 text-sm font-medium leading-6 text-gray-600 shadow-sm hover:ring-gray-900/20 transition-all cursor-pointer">
                        <span class="text-primary-600 font-semibold px-1">NEW</span>
                        <span class="h-4 w-px bg-gray-900/10 mx-2"></span>
                        <a href="#" class="flex items-center gap-1">
                            Check out v2.0
                            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                            </svg>
                        </a>
                    </div>
                </div>
                <h1 class="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl font-display">
                    Insights for
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-purple-600 to-indigo-600 animate-gradient-x">Modern Developers</span>
                </h1>
                <p class="mt-6 text-lg leading-8 text-gray-600">
                    Discover the latest trends in tech, tutorials, and deep dives into software engineering. Built for performance, designed for clarity.
                </p>
                <div class="mt-10 flex items-center gap-x-6">
                    <!-- Search Bar (Enhanced with Glassmorphism) -->
                    <div class="relative w-full max-w-lg group">
                        <div class="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                        <input
                            v-model="searchKeyword"
                            @keydown.enter="handleSearch"
                            type="text"
                            class="relative block w-full rounded-2xl border-0 py-4 pl-6 pr-14 text-gray-900 shadow-xl bg-white/80 backdrop-blur-md ring-1 ring-inset ring-gray-200/50 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-lg sm:leading-6 transition-all"
                            placeholder="Search for articles, improvements..."
                        />
                        <div
                            @click="handleSearch"
                            class="absolute inset-y-0 right-0 flex py-3 pr-4 cursor-pointer z-10"
                        >
                            <kbd class="inline-flex items-center rounded-xl border border-gray-200 px-2 font-sans text-xs text-gray-400 bg-gray-50">
                                ↵
                            </kbd>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Hero Image with 3D effect -->
            <div class="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32">
                <div class="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none transform hover:scale-[1.02] transition-transform duration-700 ease-out">
                    <div class="-m-2 rounded-2xl p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-3xl lg:p-4 bg-white/40 backdrop-blur-xl shadow-2xl">
                        <NuxtImg
                            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                            alt="App screenshot"
                            class="w-[76rem] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
                            format="webp"
                            preload
                            loading="eager"
                            fetchpriority="high"
                            sizes="sm:100vw lg:1200px"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * 메인 히어로 섹션 (Hero Section)
 * Path: app/components/home/HeroSection.vue
 * 
 * 설명:
 * 메인 페이지 최상단에 위치하여 사용자의 시선을 끄는 섹션입니다.
 * 화려한 배경 그래디언트 애니메이션과 3D 효과가 적용된 이미지를 포함합니다.
 * 
 * 주요 요소:
 * - Animated Gradient Background: CSS 키프레임 애니메이션 사용.
 * - Search Bar: 기사 검색 입력창 (현재는 UI만 구현됨).
 * - 3D Transform Image: 마우스 호버 시 입체적인 움직임 효과.
 */
const router = useRouter();
const searchKeyword = ref('');

const handleSearch = () => {
    if (!searchKeyword.value.trim()) return;
    router.push({
        path: '/search',
        query: { q: searchKeyword.value }
    });
};
</script>

<style scoped>
/* 배경 원형 블러 효과가 천천히 커졌다 작아지는 애니메이션 */
@keyframes pulse-slow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.05); }
}
.animate-pulse-slow {
    animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 텍스트 그래디언트 애니메이션 (왼쪽 -> 오른쪽 이동) */
@keyframes gradient-x {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
.animate-gradient-x {
    background-size: 200% 200%;
    animation: gradient-x 6s ease infinite;
}
</style>
