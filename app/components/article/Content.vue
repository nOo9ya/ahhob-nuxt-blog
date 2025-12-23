<!--
    기능: 기사 상세 페이지 중앙 본문 영역
    경로: app/components/article/Content.vue
-->
<template>
    <article class="flex-1 min-w-0">
        <!-- 헤더 영역 -->
        <header class="mb-10 text-center lg:text-left">
            <div
                class="flex items-center gap-2 mb-4 justify-center lg:justify-start"
            >
                <span
                    v-if="article.category"
                    class="px-3 py-1 bg-blue-50 text-blue-900 rounded-full text-xs font-bold tracking-wide uppercase"
                >
                    {{ article.category.name }}
                </span>
                <span class="text-gray-400 text-xs">•</span>
                <time class="text-xs text-gray-500 font-medium">
                    <ClientOnly>
                        {{ formatDate(article.createdAt || '') }}
                    </ClientOnly>
                </time>
            </div>

            <h1
                class="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-6 break-keep"
            >
                {{ article.title }}
            </h1>

            <div
                class="flex items-center gap-3 justify-center lg:justify-start border-b border-gray-100 pb-8 relative"
            >
                <!-- 작성자 아바타 (임시 이미지) -->
                <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    <img
                        v-if="article.author?.avatar"
                        :src="article.author.avatar"
                        alt="Author"
                        class="w-full h-full object-cover"
                    />
                    <div
                        v-else
                        class="w-full h-full flex items-center justify-center bg-blue-900 text-white font-bold text-sm"
                    >
                        {{ article.author?.name?.charAt(0) || 'A' }}
                    </div>
                </div>
                <div class="text-left">
                    <p class="text-sm font-bold text-gray-900">
                        {{ article.author?.name || '익명' }}
                    </p>
                    <p class="text-xs text-gray-500">
                        {{ article.author?.bio || 'Blog Editor' }}
                    </p>
                </div>

                <!-- 북마크 버튼 (우측 정렬) -->
                <div class="ml-auto">
                    <ArticleBookmarkButton :article-id="article.id" :show-label="false" />
                </div>
            </div>
        </header>

        <!-- 본문 영역 -->
        <!-- 
            prose: Tailwind Typography 적용
            prose-lg: 데스크탑에서 글자 크기 키움
            prose-slate: 회색조 컬러 테마
            max-w-none: 3단 레이아웃 내에서 가로폭 100% 사용
        -->
        <div
            id="article-content"
            class="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-headings:scroll-mt-24 prose-p:text-gray-700 prose-p:leading-8 prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-md"
            v-html="renderedContent"
        ></div>

        <!-- 태그 및 공유 -->
        <footer class="mt-16 pt-8 border-t border-gray-100">
            <div class="flex flex-wrap gap-2 mb-8">
                <NuxtLink
                    v-for="tag in article.tags"
                    :key="tag.id"
                    :to="`/tags/${tag.slug}`"
                    class="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 hover:text-blue-900 transition-colors"
                >
                    # {{ tag.name }}
                </NuxtLink>
            </div>
        </footer>
    </article>
</template>

<script setup lang="ts">
/**
 * 기사 본문 컴포넌트 (Article Content)
 * Path: app/components/article/Content.vue
 * 
 * 설명:
 * 기사의 상세 내용을 보여주는 핵심 컴포넌트입니다.
 * 제목, 작성자, 작성일 등 메타 정보와 Markdown으로 작성된 본문을 렌더링합니다.
 * Tailwind Typography (`prose` 클래스)를 사용하여 아름다운 타이포그래피를 제공합니다.
 * 
 * 기능:
 * - Markdown 렌더링 (`markdown-it` 사용)
 * - 작성자 정보 및 소셜 카드 표시
 * - 태그 목록 표시
 */
import type { Article } from '~/shared/types/article';
import MarkdownIt from 'markdown-it';

const props = defineProps<{
    article: Article; // 기사 전체 데이터
}>();

// Markdown 파서 설정
const md = new MarkdownIt({
    html: true,       // HTML 태그 허용 (Tiptap 결과물 호환용)
    linkify: true,    // URL 자동 링크 변환
    typographer: true, // 기호 보정 (따옴표 등)
});

/**
 * 본문 렌더링 (Computed)
 * - article.content(Markdown/HTML)를 안전한 HTML 문자열로 변환합니다.
 */
const renderedContent = computed(() => {
    if (!props.article.content) return '';
    return md.render(props.article.content);
});

const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};
</script>
