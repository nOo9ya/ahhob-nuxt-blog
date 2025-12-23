import { fileURLToPath } from 'url';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    future: {
        compatibilityVersion: 4,
    },
    devtools: { enabled: true },
    modules: [
        '@nuxtjs/tailwindcss',
        '@pinia/nuxt',
        '@vueuse/nuxt',
        '@nuxt/image',
        '@nuxtjs/color-mode',
        'nuxt-security',
    ],
    security: {
        csrf: {
            methodsToAllow: ['GET', 'HEAD', 'OPTIONS'], // 필터링할 메서드 정의
            errorResponseMessage: 'CSRF 토큰이 유효하지 않습니다.',
        },
        rateLimiter: {
            tokensPerInterval: 100,
            interval: 60000,
            headers: false,
        },
        headers: {
            contentSecurityPolicy: {
                'img-src': ["'self'", 'data:', 'https:'],
                'script-src': [
                    "'self'",
                    "'strict-dynamic'", // Nonce 기반 실행 권장
                ],
                // inline-style은 Nuxt/Tailwind 특성상 유지하되 nonce 지원
            },
            crossOriginEmbedderPolicy: 'credentialless',
            xFrameOptions: 'DENY',
        },
        nonce: true, // CSP Nonce 지원 활성화
    } as any,
    routeRules: {
        // 파일 업로드 API는 CSRF 체크에서 제외 (multipart/form-data 호환성)
        '/api/upload/**': {
            csurf: false,
        },
    },
    image: {
        quality: 80,
        format: ['webp'],
        screens: {
            xs: 320,
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280,
            xxl: 1536,
        },
    },
    devServer: {
        host: '0.0.0.0',
        port: 3000,
    },

    alias: {
        '@': fileURLToPath(new URL('./app', import.meta.url)),
        '~': fileURLToPath(new URL('./', import.meta.url)),
    },

    runtimeConfig: {
        // Server-side
        dbHost: process.env.DB_HOST,
        dbPort: process.env.DB_PORT,
        dbUser: process.env.DB_USER,
        dbPassword: process.env.DB_PASSWORD,
        dbName: process.env.DB_NAME,
        sessionSecret: process.env.SESSION_SECRET,

        // Public
        public: {
            siteName: process.env.NUXT_PUBLIC_SITE_NAME || '블로그',
            siteDescription:
                process.env.NUXT_PUBLIC_SITE_DESCRIPTION ||
                '최신 뉴스 및 기술 블로그',
            siteUrl:
                process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            siteType: process.env.NUXT_PUBLIC_SITE_TYPE || 'Person', // Organization or Person
            siteLogo: process.env.NUXT_PUBLIC_SITE_LOGO || '/logo.png',
            twitterSite: process.env.NUXT_PUBLIC_TWITTER_SITE || '@blog',
        },
    },
    vite: {
        server: {
            watch: {
                usePolling: true,
            },
            hmr: {
                port: 3000,
                clientPort: 3000,
            },
        },
    },
    nitro: {
        compressPublicAssets: true,
        externals: {
            external: ['sharp'],
        },
    },
    app: {
        head: {
            link: [
                // Google Fonts preconnect 제거 (로컬 Pretendard 폰트 사용)
            ],
        },
    },
    css: [
        // Pretendard 로컬 폰트 (@font-face 정의)
        '~/assets/css/fonts.css',
    ],
});