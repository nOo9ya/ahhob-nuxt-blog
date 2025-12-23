<template>
    <NuxtLink
        :to="
            article.category
                ? `/${article.category.path || article.category.slug}/${article.slug}`
                : `/${article.slug}`
        "
        class="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out overflow-hidden h-full"
    >

        <!-- Thumbnail with overflow hidden for zoom effect -->
        <div class="flex-shrink-0 relative overflow-hidden h-52">
            <div class="absolute inset-0 bg-gray-900/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
            <NuxtImg
                class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                :src="
                    article.thumbnail ||
                    '/images/default_thumbnail.png'
                "
                :alt="article.title"
                format="webp"
                :loading="loading"
                placeholder
            />
            <!-- Category Badge (Glassmorphism) -->
            <div
                v-if="article.category"
                class="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-lg border border-white/20 tracking-wide"
            >
                {{ article.category?.name }}
            </div>
        </div>

        <div class="flex flex-1 flex-col justify-between p-6">
            <div class="flex-1">
                <!-- Date -->
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    <ClientOnly>
                        <time :datetime="String(article.publishedAt)">{{
                            timeAgo(article.publishedAt)
                        }}</time>
                    </ClientOnly>
                </p>

                <!-- Title -->
                <h3
                    class="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2"
                    v-html="highlightText(article.title)"
                ></h3>

                <!-- Excerpt -->
                <p
                    class="mt-3 text-sm text-gray-600 line-clamp-3 leading-relaxed"
                    v-html="highlightText(article.excerpt || article.summary || 'Click to read more details about this interesting topic.')"
                ></p>
            </div>

            <!-- Footer: Author -->
            <div
                class="mt-6 flex items-center gap-3 pt-6 border-t border-gray-50"
            >
                <NuxtLink 
                    v-if="article.author?.id"
                    :to="`/author/${article.author.id}`"
                    class="flex items-center gap-3 group/author relative z-10 hover:opacity-80 transition-opacity"
                    @click.stop
                >
                    <NuxtImg
                        class="h-8 w-8 rounded-full ring-2 ring-white"
                        :src="
                            article.author?.avatar ||
                            '/images/default_avatar.png'
                        "
                        :alt="`${article.author?.name || 'Editor'} 프로필 사진`"
                        format="webp"
                    />
                    <div class="text-sm">
                        <p class="font-medium text-gray-900 group-hover/author:text-blue-600 transition-colors">
                            {{ article.author?.name || 'Editor' }}
                        </p>
                    </div>
                </NuxtLink>
                
                <div v-else class="flex items-center gap-3">
                    <NuxtImg class="h-8 w-8 rounded-full ring-2 ring-white" src="/images/default_avatar.png" alt="Editor 프로필 사진" />
                    <span class="text-sm font-medium text-gray-900">Editor</span>
                </div>
            </div>
        </div>
    </NuxtLink>
</template>

<script setup lang="ts">
/**
 * 기사 카드 컴포넌트 (Article Card)
 * Path: app/components/article/ArticleCard.vue
 * 
 * 설명:
 * 기사 목록에서 각 기사의 요약 정보를 카드 형태로 보여주는 UI 컴포넌트입니다.
 * 클릭 시 해당 기사의 상세 페이지(`/category/slug`)로 이동합니다.
 * 이미지 최적화(NuxtImg), 날짜 포맷팅, 카테고리 표시 기능을 포함합니다.
 * 
 * 데이터 흐름:
 * - 부모로부터 `article` 객체를 Props로 전달받아 렌더링합니다.
 * - 별도의 내부 상태(State)는 없으며 순수하게 프레젠테이션 역할만 합니다.
 */

const props = defineProps({
    /**
     * 기사 데이터 객체
     * (Title, Slug, Thumbnail, CreatedAt, Author, Category 정보 포함)
     */
    article: {
        type: Object,
        required: true,
    },
    /**
     * 검색어 (하이라이팅용)
     */
    searchKeyword: {
        type: String,
        default: '',
    },
    /**
     * 이미지 로딩 전략 ('lazy' | 'eager')
     * LCP 요소인 경우 'eager'로 설정하세요.
     */
    loading: {
        type: String as PropType<'lazy' | 'eager'>,
        default: 'lazy',
        validator: (value: string) => ['lazy', 'eager'].includes(value),
    },
});

/**
 * 텍스트 하이라이팅 함수
 * @param text 원본 텍스트
 * @returns 하이라이팅 태그가 적용된 HTML 문자열
 */
const highlightText = (text: string) => {
    if (!text) return '';
    if (!props.searchKeyword) return text;

    const regex = new RegExp(`(${props.searchKeyword})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 text-gray-900">$1</mark>');
};

import { timeAgo } from '~/shared/utils/date';
import type { PropType } from 'vue';
</script>
