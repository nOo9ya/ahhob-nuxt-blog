<!--
파일 기능: 다크모드 토글 버튼 컴포넌트
위치: app/components/common/DarkModeToggle.vue
설명: useColorMode를 사용하여 light/dark 모드를 전환하는 토글 버튼

데이터 흐름:
- useColorMode() composable에서 현재 colorMode 상태 가져오기
- 버튼 클릭 시 light ↔ dark 전환
- 아이콘: Sun (light mode), Moon (dark mode)
-->

<script setup lang="ts">
const colorMode = useColorMode();

/**
 * 다크모드 토글 함수
 * light ↔ dark 전환
 */
const toggleDarkMode = () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};
</script>

<template>
    <button
        @click="toggleDarkMode"
        class="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        :title="colorMode.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    >
        <span class="sr-only">Toggle dark mode</span>
        <!-- Sun Icon (Light Mode) -->
        <svg
            v-if="colorMode.value === 'dark'"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-5 w-5"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
            />
        </svg>
        <!-- Moon Icon (Dark Mode) -->
        <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-5 w-5"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
            />
        </svg>
    </button>
</template>
