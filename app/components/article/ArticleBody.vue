<script setup lang="ts">
/**
 * 파일 기능: 기사 본문 렌더링 컴포넌트
 * 위치: app/components/article/ArticleBody.vue
 * 
 * 기능:
 * - HTML 문자열을 받아서 렌더링 (v-html)
 * - Tailwind Typography (prose) 적용하여 스타일링
 * - 이미지, 링크, 헤딩 등에 대한 세부 스타일 조정
 */

defineProps<{
    content: string;
}>();
</script>

<template>
    <article class="relative">
        <div 
            id="article-content"
            class="
                prose prose-lg max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 
                prose-p:text-gray-700 prose-p:leading-8 prose-p:mb-6
                prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:text-indigo-500 hover:prose-a:underline prose-a:transition-colors
                prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8 prose-img:w-full prose-img:object-cover
                prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-gray-700
                prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:font-medium
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:shadow-lg prose-pre:rounded-xl
                prose-li:text-gray-700
                prose-strong:text-gray-900 prose-strong:font-bold
                prose-hr:border-gray-200 prose-hr:my-10
            "
            v-html="content"
        >
        </div>
    </article>
</template>
