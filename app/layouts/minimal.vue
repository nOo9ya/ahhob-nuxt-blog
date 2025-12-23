<script setup lang="ts">
/**
 * Minimal Layout
 * app/layouts/minimal.vue
 *
 * 설명: 로그인, 회원가입 등 단독 페이지용 레이아웃
 * 포함: 중앙 정렬된 콘텐츠 영역만 포함 (헤더/푸터 없음)
 */
</script>

<template>
    <div
        class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
    >
        <div class="w-full max-w-md space-y-8">
            <slot />
        </div>
    </div>
</template>
