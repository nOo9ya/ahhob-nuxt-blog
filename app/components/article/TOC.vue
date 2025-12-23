<!--
    기능: 기사 상세 페이지 우측 목차 (TOC)
    경로: app/components/article/TOC.vue
-->
<template>
    <aside class="hidden lg:block w-[250px] flex-shrink-0">
        <div class="sticky top-24">
            <div class="mb-4 flex items-center gap-2">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-5 h-5 text-gray-400"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                </svg>
                <span
                    class="text-xs font-bold text-gray-400 uppercase tracking-wider"
                    >On this page</span
                >
            </div>

            <nav class="relative">
                <!-- 활성 인디케이터 (왼쪽 보더 라인) -->
                <div
                    class="absolute left-0 top-0 bottom-0 w-[2px] bg-gray-100"
                ></div>

                <ul class="space-y-1">
                    <li v-for="item in toc" :key="item.id">
                        <a
                            :href="`#${item.id}`"
                            @click.prevent="scrollTo(item.id)"
                            class="block py-1.5 pl-4 text-sm transition-all duration-200 border-l-[2px] -ml-[2px]"
                            :class="[
                                activeId === item.id
                                    ? 'border-blue-900 text-blue-900 font-bold'
                                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300',
                            ]"
                            :style="{
                                paddingLeft:
                                    item.depth === 3 ? '1.5rem' : '1rem',
                            }"
                        >
                            {{ item.text }}
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    </aside>
</template>

<script setup lang="ts">
/**
 * 기능: 목차 컴포넌트 (Table of Contents)
 * 경로: app/components/article/TOC.vue
 * 
 * 설명:
 * 기사의 헤딩(H2, H3)을 추출하여 만든 목차를 우측 사이드바에 표시합니다.
 * 현재 읽고 있는 위치를 하이라이팅하고, 클릭 시 부드럽게 스크롤합니다.
 * 
 * Props:
 * - toc: 목차 아이템 배열 (id, text, depth)
 * - activeId: 현재 화면에 보이는 헤딩 ID (ScrollSpy)
 */
import type { TocItem } from '@/composables/useTOC';

defineProps<{
    toc: TocItem[];
    activeId: string;
}>();

/**
 * 스크롤 이동 함수
 * - 헤더 높이를 고려하여 오프셋(offset)을 적용 후 스크롤합니다.
 * - behavior: 'smooth'를 사용하여 부드러운 이동 효과를 제공합니다.
 */
const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        // 헤더(Sticky Header) 높이 + 여백 고려
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
        });
    }
};
</script>
