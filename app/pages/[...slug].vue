<!--
    기능: Catch-all 라우트 (기사, 페이지, 카테고리 통합 처리)
    경로: app/pages/[...slug].vue
-->
<template>
    <main>
        <!-- 로딩 상태 -->
        <div v-if="pending" class="container mx-auto px-4 py-10 flex justify-center">
            <div class="animate-pulse flex flex-col items-center">
                <div class="h-8 w-64 bg-gray-200 rounded mb-4"></div>
                <div class="h-4 w-40 bg-gray-200 rounded"></div>
            </div>
        </div>

        <!-- 404 에러 -->
        <div v-else-if="isNotFound" class="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
            <h1 class="text-9xl font-black text-primary-600">404</h1>
            <p class="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Page not found</p>
            <p class="mt-6 text-base leading-7 text-gray-600">Sorry, we couldn’t find the page you’re looking for.</p>
            <div class="mt-10 flex items-center justify-center gap-x-6">
                <NuxtLink 
                    to="/" 
                    class="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                    Go back home
                </NuxtLink>
            </div>
        </div>

        <!-- 정적 페이지 -->
        <div v-else-if="page" class="container mx-auto px-4 py-12 max-w-4xl prose lg:prose-xl">
            <h1 class="mb-8">{{ page?.title }}</h1>
            <div v-html="page?.content"></div>
        </div>

        <!-- 카테고리 -->
        <div v-else-if="category" class="bg-gray-50 min-h-screen">
            <div class="container pt-8 pb-24 sm:pt-12 sm:pb-32">
                <div class="mx-auto max-w-2xl text-center mb-16">
                    <h2 class="text-base font-semibold leading-7 text-primary-600">
                        Category
                    </h2>
                    <p class="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                        {{ category?.name }}
                    </p>
                    <p class="mt-6 text-lg leading-8 text-gray-600">
                        {{ category?.description }}
                    </p>
                </div>

                <!-- Filters & Count -->
                <div class="flex flex-col sm:flex-row justify-between items-center mb-10 pb-6 border-b border-gray-200">
                    <span class="text-gray-500 font-medium mb-4 sm:mb-0">
                        Total {{ pagination.total }} articles
                    </span>
                    <SortSelect v-model="currentSort" :options="sortOptions" />
                </div>

                <div class="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    <ArticleCard v-for="item in categoryArticles" :key="item.id" :article="item" />
                </div>
                
                <!-- Pagination -->
                <Pagination 
                    :current-page="pagination.page" 
                    :total-pages="pagination.totalPages" 
                    @change="onPageChange" 
                />

                <!-- 빈 카테고리 안내 -->
                <div v-if="categoryArticles.length === 0" class="text-center py-32">
                    <div class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 mb-6">
                        <svg class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    </div>
                    <h3 class="mt-2 text-lg font-semibold text-gray-900">
                        작성된 글이 없습니다
                    </h3>
                    <p class="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                        이 카테고리에는 아직 게시된 기사가 없습니다.
                    </p>
                    <div class="mt-8">
                        <NuxtLink to="/"
                            class="inline-flex items-center rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                            <svg class="mr-2 -ml-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor"
                                aria-hidden="true">
                                <path fill-rule="evenodd"
                                    d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                                    clip-rule="evenodd" />
                            </svg>
                            홈으로 돌아가기
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>

        <!-- 기사 렌더링 -->
        <div v-else-if="article" class="container py-12">
            <div class="lg:flex lg:gap-12 relative">
                <ArticleSidebar :category="article.category" />
                <div class="flex-1 min-w-0 w-full max-w-none">
                    <!-- Article Title -->
                    <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                        {{ article.title }}
                    </h1>
                    
                    <!-- AdSense Article Top -->
                    <ClientOnly>
                        <AppAdSense section="article_top" className="mb-8" />
                    </ClientOnly>

                    <ArticleBody :content="article.content || ''" />
                    
                    <ClientOnly>
                         <ArticleReaction 
                            :article-id="article.id" 
                            :initial-view-count="article.viewCount || 0" 
                            :initial-like-count="article.likeCount || 0" 
                        />
                    </ClientOnly>


                    <!-- Comment Section -->

                    <ClientOnly>
                        <div v-if="article.commentPolicy === 'disabled' && user?.role === 'admin'" class="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-center text-sm">
                            ⚠️ <strong>관리자 모드</strong>: 현재 댓글이 비활성화되어 있지만, 관리자 권한으로 표시됩니다.
                        </div>

                        <div v-if="article.commentPolicy !== 'disabled' || user?.role === 'admin'">
                            <CommentSection :article-id="article.id" :comment-policy="article.commentPolicy" />
                        </div>
                    </ClientOnly>
                </div>
                
                <ClientOnly>
                    <ArticleTOC :toc="toc" :active-id="activeId" class="hidden lg:block w-64 shrink-0" />
                </ClientOnly>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import type { Article as IArticle, Category as ICategory, Page as IPage } from '~/shared/types/article';
import ArticleCard from '@/components/article/ArticleCard.vue';
import ArticleSidebar from '@/components/article/Sidebar.vue';
import ArticleBody from '@/components/article/ArticleBody.vue';
import ArticleReaction from '@/components/article/ArticleReaction.vue';
import CommentSection from '@/components/comment/CommentSection.vue';
import Pagination from '@/components/ui/Pagination.vue';
import SortSelect from '@/components/ui/SortSelect.vue';
import AppAdSense from '@/components/common/AppAdSense.vue';



const route = useRoute();
const router = useRouter(); // URL 쿼리 업데이트용
const config = useRuntimeConfig();
const { user } = useUserSession(); // Admin check for comments override

// State for Filtering & Pagination
const currentPage = computed(() => Number(route.query.page) || 1);
const currentSort = ref(route.query.sort?.toString() || 'latest');
const limit = 12; // 페이지당 12개

const sortOptions = [
    { label: 'Latest', value: 'latest' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'Popular', value: 'popular' },
];

// 정렬 변경 시 페이지 1로 초기화 및 라우터 푸시
watch(currentSort, (newSort) => {
    // 이미 URL query와 일치하면 스킵 (중복 호출 방지)
    if (route.query.sort === newSort) return;
    
    router.push({
        query: { ...route.query, sort: newSort, page: 1 }
    });
});

const onPageChange = (page: number) => {
    router.push({
        query: { ...route.query, page }
    });
    // 스크롤 상단 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// URL 파라미터 처리
const slugs = computed(() => {
    const s = route.params.slug;
    const array = Array.isArray(s) ? s : [s];
    return array.filter(segment => !!segment);
});

const targetSlug = computed(() => slugs.value[slugs.value.length - 1]);

// TOC 관련
const { toc, activeId, generateTOC } = useTOC();

interface IContentResponse {
    type: 'page' | 'article' | 'category' | 'error';
    data: IPage | IArticle | ICategory;
    articles?: IArticle[];
    pagination?: { total: number; totalPages: number; page: number; limit: number };
}

const { data, pending } = await useAsyncData<IContentResponse | null>(
    // 키에 쿼리 파라미터 포함하여 자동 Refetch 유도 (Category일 때만 유효하지만 통합 키 사용)
    // Key에 쿼리 파라미터를 포함하여, URL 변경 시(페이지네이션/정렬/경로이동) 자동으로 데이터 갱신 유도
    // watch 옵션 제거 (키 변경 감지로 충분함)
    `content-${route.fullPath}`,
    async () => {
        const fullPath = slugs.value.join('/'); // 전체 경로
        const lastSlug = targetSlug.value;      // 마지막 슬러그
        const currentDepth = slugs.value.length;
        
        if (!fullPath) return null;

        // 1. Page 확인
        if (currentDepth === 1) {
            try {
                const pageRes = await $fetch<any>(`/api/pages/${lastSlug}`);
                if (pageRes.data) return { type: 'page', data: pageRes.data };
            } catch (e: any) { }
        }

        // 2. Category Path 비교
        try {
            const categoryRes = await $fetch<any>('/api/categories', {
                query: { path: fullPath }
            });

            if (categoryRes.categories && categoryRes.categories.length > 0) {
                const category = categoryRes.categories[0];
                
                // 해당 카테고리의 기사 목록 조회 (페이지네이션 적용)
                let articles = [];
                let pagination = { total: 0, totalPages: 0, page: 1, limit };
                
                try {
                    const articlesRes = await $fetch<any>('/api/articles', {
                        query: { 
                            categoryId: category.id, 
                            limit,
                            page: currentPage.value,
                            sort: currentSort.value
                        }
                    });
                    articles = articlesRes.data || [];
                    pagination = articlesRes.pagination || pagination;
                } catch (e: any) {
                    console.error('[SSR] Category Articles Fetch Error:', e.message);
                }

                return { type: 'category', data: category, articles, pagination };
            }
        } catch (e: any) {
            console.warn('[SSR] Category Path Check Failed:', e.message);
        }

        // 3. Article 확인
        try {
            const articleRes = await $fetch<any>(`/api/articles/${lastSlug}`);
            const article = articleRes.data;

            if (article) {
                const urlCategoryPath = slugs.value.slice(0, -1).join('/');
                const articleCategoryPath = article.category?.path || '';

                if ((urlCategoryPath && urlCategoryPath === articleCategoryPath) || (!urlCategoryPath && !articleCategoryPath)) {
                    return { type: 'article', data: article };
                } else {
                     console.warn('[SSR] Article Path Mismatch:', { url: urlCategoryPath, actual: articleCategoryPath });
                }
            }
        } catch (e: any) { }

        return null;
    },
    {
        default: () => null
    }
);

const article = computed(() => data.value?.type === 'article' ? data.value.data as IArticle : null);
const page = computed(() => data.value?.type === 'page' ? data.value.data as IPage : null);
const category = computed(() => data.value?.type === 'category' ? data.value.data as ICategory : null);
const categoryArticles = computed(() => data.value?.type === 'category' ? data.value.articles as IArticle[] : []);
const pagination = computed(() => data.value?.pagination || { total: 0, totalPages: 0, page: 1, limit });

const isNotFound = computed(() => (!data.value || data.value.type === 'error') && !pending.value);

// SEO & 리디렉션
const checkAndRedirect = (articleItem: IArticle) => {
    const correctPath = articleItem.category?.path || '';
    const correctUrl = `/${correctPath ? correctPath + '/' : ''}${articleItem.slug}`;
    // 트레일링 슬래시 이슈 방지를 위해 정규화 비교 필요할 수 있음
    const currentPath = route.path;

    if (correctPath && currentPath !== correctUrl) {
        console.warn('[SlugPage] Redirecting (SSR/CSR):', {
            from: currentPath,
            to: correctUrl
        });
        return navigateTo(correctUrl, { replace: true, redirectCode: 301 });
    }
};

// SSR 및 초기 로드 시 실행
if (article.value) {
    checkAndRedirect(article.value);
}

    const { setArticleJsonLd, setBreadcrumbsJsonLd } = useJsonLd();

    watchEffect(() => {
        if (article.value) {
            // CSR 경로 변경 대응
            checkAndRedirect(article.value);

            generateTOC('#article-content');

            const titleWithCategory = article.value.category 
                ? `${article.value.title} - ${article.value.category.name}` 
                : article.value.title;

            // SEO 메타 설명 생성 (metaDescription이 없으면 content에서 추출)
            const fallbackDescription = article.value.metaDescription || article.value.content?.substring(0, 160).replace(/<[^>]*>?/gm, '') || '';

            useSeoMeta({
                title: titleWithCategory,
                description: fallbackDescription,
                ogTitle: titleWithCategory,
                ogImage: article.value.ogImage || `${config.public.siteUrl}/api/og.png?title=${encodeURIComponent(article.value.title)}&description=${encodeURIComponent(fallbackDescription)}&siteName=${encodeURIComponent(config.public.siteName)}`,
                articleAuthor: [article.value.author?.name || config.public.siteName],
            });

            useHead({
                link: [{ rel: 'canonical', href: `${config.public.siteUrl}${article.value.category?.path ? '/' + article.value.category.path + '/' : '/'}${article.value.slug}` }]
            });

            // JSON-LD
            setArticleJsonLd(article.value);
            setBreadcrumbsJsonLd([
                { name: 'Home', path: '/' },
                { name: article.value.category?.name || 'Uncategorized', path: article.value.category?.path || '/' },
                { name: article.value.title, path: route.path }
            ]);

        } else if (page.value) {
            useSeoMeta({
                title: page.value.title,
                description: page.value.seoMeta?.description,
            });
            
            // JSON-LD (Page) - 필요하다면 WebPage 스키마 추가 가능
             setBreadcrumbsJsonLd([
                { name: 'Home', path: '/' },
                { name: page.value.title, path: route.path }
            ]);

        } else if (category.value) {
            useSeoMeta({
                title: category.value?.name,
                description: category.value?.description,
                ogTitle: category.value?.name,
                ogDescription: category.value?.description,
            });

            setBreadcrumbsJsonLd([
                { name: 'Home', path: '/' },
                { name: category.value.name, path: route.path }
            ]);
        }
    });
</script>
