<template>
    <footer
        class="bg-gray-900 text-white pt-16 pb-8 mt-auto border-t border-gray-800"
    >
        <div class="container">
            <!-- 1. 메인 Grid (카테고리 목록) -->
            <div
                v-if="categories && categories.length > 0"
                class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12"
            >
                <div
                    v-for="category in categories"
                    :key="category.id"
                    class="flex flex-col space-y-4"
                >
                    <!-- 상위 카테고리 제목 -->
                    <h3
                        class="text-sm font-bold tracking-wider uppercase text-blue-400"
                    >
                        <NuxtLink
                            :to="`/${category.slug}`"
                            class="hover:text-blue-300 transition-colors"
                        >
                            {{ category.name }}
                        </NuxtLink>
                    </h3>

                    <!-- 하위 카테고리 목록 -->
                    <ul
                        v-if="category.children && category.children.length > 0"
                        class="space-y-2 text-sm text-gray-400"
                    >
                        <li v-for="child in category.children" :key="child.id">
                            <NuxtLink
                                :to="`/${child.slug}`"
                                class="hover:text-white transition-colors"
                            >
                                {{ child.name }}
                            </NuxtLink>
                        </li>
                    </ul>
                    <span v-else class="text-xs text-gray-600">-</span>
                </div>
            </div>

            <!-- 2. 하단 정보 (로고, 소셜, 카피라이트) -->
            <div
                class="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4"
            >
                <div class="flex items-center gap-2">
                    <span class="text-xl font-bold tracking-tighter"
                        >Blog</span
                    >
                </div>

                <p class="text-xs text-gray-500 text-center md:text-right">
                    &copy; {{ new Date().getFullYear() }} Blog. All rights
                    reserved. <br class="md:hidden" />
                    <NuxtLink to="/terms" class="hover:text-gray-300"
                        >이용약관</NuxtLink
                    >
                    |
                    <NuxtLink to="/privacy" class="hover:text-gray-300"
                        >개인정보처리방침</NuxtLink
                    >
                    |
                    <NuxtLink to="/login" class="hover:text-gray-300 transition-colors"
                        >Login</NuxtLink
                    >
                </p>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
/**
 * 전역 푸터 (Global Footer)
 * Path: app/components/AppFooter.vue
 * 
 * 설명:
 * 사이트 하단에 고정되어 카테고리 전체 목록(Sitemap 역할)과 법적 고지 링크를 제공합니다.
 * 
 * 데이터 흐름:
 * - `/api/categories/tree`를 호출하여 전체 카테고리 구조를 가져옵니다.
 * - 2단(부모-자식) 깊이까지 순회하며 링크를 생성합니다.
 */

// 카테고리 트리 데이터 조회
const { data } = await useFetch('/api/categories/tree');
const categories = computed(() => (data.value as any)?.data || []);
</script>
