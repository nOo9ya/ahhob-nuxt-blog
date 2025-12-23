<template>
    <NuxtLayout>
        <NuxtPage />
        <UiToastContainer />
    </NuxtLayout>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const { siteName, siteDescription, twitterSite } = config.public;

// 앱 초기화 시 사용자 세션 정보 가져오기
// const { fetch: fetchUserSession } = useUserSession();
// await fetchUserSession(); // Move to plugin

// 전역 SEO 기본값 설정
useSeoMeta({
    titleTemplate: (title) => (title ? `${title} - ${siteName}` : siteName),
    description: siteDescription,
    ogSiteName: siteName,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterSite: twitterSite,
});


useHead({
    htmlAttrs: { lang: 'ko' },
});

// Google AdSense Auto Ads Script Injection
const { data: globalSettings } = await useFetch('/api/admin/settings', {
    key: 'site-settings-global',
    transform: (res: any) => res
});

const adsenseClientId = computed(() => globalSettings.value?.adsense_client_id);

const headScripts = computed(() => {
    if (adsenseClientId.value) {
        return [
            {
                src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId.value}`,
                async: true,
                crossorigin: 'anonymous' as const,
                key: 'adsense-auto-ads',
            }
        ];
    }
    return [];
});

useHead({
    script: headScripts
});

// 검색엔진 소유자 확인 메타 태그 (Search Engine Verification)
const { data: seoVerification } = await useFetch('/api/settings/seo', {
    key: 'seo-verification',
    lazy: true,
    server: true, // SSR에서 미리 로드
});

// 동적 메타 태그 생성 (값이 있는 경우만 추가)
const verificationMeta = computed(() => {
    const meta: Array<{ name: string; content: string }> = [];

    if (seoVerification.value?.naver) {
        meta.push({
            name: 'naver-site-verification',
            content: seoVerification.value.naver,
        });
    }

    if (seoVerification.value?.google) {
        meta.push({
            name: 'google-site-verification',
            content: seoVerification.value.google,
        });
    }

    if (seoVerification.value?.bing) {
        meta.push({
            name: 'msvalidate.01',
            content: seoVerification.value.bing,
        });
    }

    return meta;
});

// 검색엔진 소유자 확인 메타 태그 삽입
useHead({
    meta: verificationMeta,
});
</script>
