<template>
    <div class="bg-white py-24 sm:py-32">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
            <div class="mx-auto max-w-2xl text-center">
                <h2 class="text-base font-semibold leading-7 text-primary-600">
                    Browse by Topic
                </h2>
                <p
                    class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
                >
                    Everything you need to know
                </p>
                <p class="mt-6 text-lg leading-8 text-gray-600">
                    Discover articles carefully curated by topic. Deep dive into
                    specific areas of interest.
                </p>
            </div>
            <div
                class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
            >
                <dl
                    class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3"
                >
                    <NuxtLink
                        v-for="category in categories"
                        :key="category.slug"
                        :to="`/${category.slug}`"
                        class="group flex flex-col items-start"
                    >
                        <div
                            class="rounded-2xl bg-gray-50 p-4 ring-1 ring-inset ring-gray-900/5 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors"
                        >
                            <svg
                                class="h-6 w-6 text-gray-600 group-hover:text-primary-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                                />
                            </svg>
                        </div>
                        <dt
                            class="mt-4 font-semibold text-gray-900 group-hover:text-primary-600 transition-colors"
                        >
                            {{ category.name }}
                        </dt>
                        <dd class="mt-2 leading-7 text-gray-600">
                            {{
                                category.description ||
                                'Explore articles in this specific domain.'
                            }}
                        </dd>
                    </NuxtLink>
                </dl>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * 메인 토픽 그리드 (Home Topic Grid)
 * Path: app/components/home/HomeTopicGrid.vue
 * 
 * 설명:
 * 메인 페이지 중간에 위치하여 주요 카테고리(토픽)들을 그리드 형태로 보여줍니다.
 * 사용자가 관심 있는 주제로 빠르게 이동할 수 있도록 돕습니다.
 * 
 * 데이터:
 * - `/api/categories` API를 호출하여 최상위 카테고리 목록을 가져옵니다.
 */
const { data } = await useFetch('/api/categories');

const categories = computed(() => {
    return data.value ? (data.value as any).categories || data.value : [];
});
</script>
