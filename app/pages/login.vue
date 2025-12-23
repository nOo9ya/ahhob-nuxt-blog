<template>
    <div>
        <div>
            <h2
                class="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900"
            >
                Welcome back
            </h2>
            <p class="mt-2 text-sm leading-6 text-gray-500">
                Please enter your details to sign in.
            </p>
        </div>

        <div class="mt-10">
            <form class="space-y-6" @submit.prevent="handleLogin">
                <div>
                    <label
                        for="email"
                        class="block text-sm font-medium leading-6 text-gray-900"
                        >Email address</label
                    >
                    <div class="mt-2 relative">
                        <input
                            id="email"
                            v-model="form.email"
                            name="email"
                            type="email"
                            autocomplete="email"
                            required
                            class="block w-full rounded-lg border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3 transition-shadow"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div>
                    <div class="flex items-center justify-between">
                        <label
                            for="password"
                            class="block text-sm font-medium leading-6 text-gray-900"
                            >Password</label
                        >
                        <div class="text-sm">
                            <a
                                href="#"
                                class="font-semibold text-primary-600 hover:text-primary-500"
                                >Forgot password?</a
                            >
                        </div>
                    </div>
                    <div class="mt-2">
                        <input
                            id="password"
                            v-model="form.password"
                            name="password"
                            type="password"
                            autocomplete="current-password"
                            required
                            class="block w-full rounded-lg border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3 transition-shadow"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div>
                    <p v-if="errorMsg" class="text-red-500 text-sm mb-4">
                        {{ errorMsg }}
                    </p>
                    <button
                        type="submit"
                        :disabled="loading"
                        class="flex w-full justify-center rounded-lg bg-primary-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <svg
                            v-if="loading"
                            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                class="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="4"
                            ></circle>
                            <path
                                class="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        {{ loading ? 'Signing in...' : 'Sign in' }}
                    </button>
                </div>
            </form>

            <!-- 소셜 로그인 구분선 -->
            <div v-if="enabledProviders.length > 0" class="mt-10">
                <div class="relative">
                    <div class="absolute inset-0 flex items-center" aria-hidden="true">
                        <div class="w-full border-t border-gray-200"></div>
                    </div>
                    <div class="relative flex justify-center text-sm font-medium leading-6">
                        <span class="bg-white px-6 text-gray-900">Or continue with</span>
                    </div>
                </div>

                <!-- 소셜 로그인 버튼 (활성화된 것만 표시) -->
                <div class="mt-6 grid gap-3" :class="`grid-cols-${Math.min(enabledProviders.length, 5)}`">
                    <!-- Google -->
                    <a
                        v-if="enabledProviders.includes('google')"
                        href="/api/auth/oauth/google"
                        class="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-2 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all"
                        title="Google로 로그인"
                    >
                        <svg class="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                    </a>

                    <!-- Naver -->
                    <a
                        v-if="enabledProviders.includes('naver')"
                        href="/api/auth/oauth/naver"
                        class="flex w-full items-center justify-center gap-2 rounded-lg bg-[#03C75A] px-2 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#02b350] transition-all"
                        title="네이버로 로그인"
                    >
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
                        </svg>
                    </a>

                    <!-- Kakao -->
                    <a
                        v-if="enabledProviders.includes('kakao')"
                        href="/api/auth/oauth/kakao"
                        class="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] px-2 py-2.5 text-sm font-semibold text-[#000000] shadow-sm hover:bg-[#f5dc00] transition-all"
                        title="카카오로 로그인"
                    >
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
                        </svg>
                    </a>

                    <!-- Apple -->
                    <a
                        v-if="enabledProviders.includes('apple')"
                        href="/api/auth/oauth/apple"
                        class="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-2 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-all"
                        title="Apple로 로그인"
                    >
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>
                    </a>

                    <!-- Microsoft -->
                    <a
                        v-if="enabledProviders.includes('microsoft')"
                        href="/api/auth/oauth/microsoft"
                        class="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-2 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all"
                        title="Microsoft로 로그인"
                    >
                        <svg class="h-5 w-5" viewBox="0 0 24 24">
                            <path fill="#f25022" d="M0 0h11.377v11.372H0z"/>
                            <path fill="#00a4ef" d="M12.623 0H24v11.372H12.623z"/>
                            <path fill="#7fba00" d="M0 12.628h11.377V24H0z"/>
                            <path fill="#ffb900" d="M12.623 12.628H24V24H12.623z"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'auth', // or default if you want header/footer
    middleware: ['guest'],
});

const form = reactive({
    email: '',
    password: '',
});

const errorMsg = ref('');
const loading = ref(false);

// 활성화된 OAuth 프로바이더 조회
const { data: settings } = await useFetch('/api/public/settings');
const enabledProviders = computed(() => settings.value?.enabledOAuthProviders || []);

const { fetch: fetchUserSession } = useUserSession();

const handleLogin = async () => {
    loading.value = true;
    errorMsg.value = '';

    try {
        await $fetch('/api/auth/login', {
            method: 'POST',
            body: form,
        });
        // 세션 상태 갱신
        await fetchUserSession();
        
        // Success -> Redirect to Admin Dashboard
        await navigateTo('/admin', { external: true });
    } catch (e: any) {
        errorMsg.value =
            e.data?.message || 'Login failed. Please check your credentials.';
    } finally {
        loading.value = false;
    }
};


</script>
