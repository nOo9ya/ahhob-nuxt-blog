<template>
    <div>
        <div>
            <h2
                class="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900"
            >
                Create an account
            </h2>
            <p class="mt-2 text-sm leading-6 text-gray-500">
                Join us to share your thoughts and ideas.
            </p>
        </div>

        <div class="mt-10">
            <form class="space-y-6" @submit.prevent="handleRegister">
                <!-- Name -->
                <div>
                    <label
                        for="name"
                        class="block text-sm font-medium leading-6 text-gray-900"
                        >Full Name</label
                    >
                    <div class="mt-2">
                        <input
                            id="name"
                            v-model="form.name"
                            name="name"
                            type="text"
                            autocomplete="name"
                            required
                            class="block w-full rounded-lg border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                <!-- Email -->
                <div>
                    <label
                        for="email"
                        class="block text-sm font-medium leading-6 text-gray-900"
                        >Email address</label
                    >
                    <div class="mt-2">
                        <input
                            id="email"
                            v-model="form.email"
                            name="email"
                            type="email"
                            autocomplete="email"
                            required
                            class="block w-full rounded-lg border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <!-- Password -->
                <div>
                    <label
                        for="password"
                        class="block text-sm font-medium leading-6 text-gray-900"
                        >Password</label
                    >
                    <div class="mt-2 relative">
                        <input
                            id="password"
                            v-model="form.password"
                            name="password"
                            type="password"
                            required
                            class="block w-full rounded-lg border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <!-- Password Strength Meter -->
                    <div v-if="form.password" class="mt-3 space-y-2">
                        <div class="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                class="h-full transition-all duration-300 ease-out" 
                                :class="currStrength.color"
                                :style="{ width: currStrength.width }"
                            ></div>
                        </div>
                        <p class="text-xs text-gray-500 flex justify-between">
                            <span>Strength: <span class="font-medium" :class="textColor(currStrength.label)">{{ currStrength.label }}</span></span>
                            <span v-if="currStrength.score < 4" class="text-gray-400">Min 8 chars, 1 number, 1 special</span>
                        </p>
                        <ul v-if="currStrength.score < 3" class="text-xs text-red-500 list-disc list-inside">
                            <li v-for="(feedback, idx) in currStrength.feedback" :key="idx">{{ feedback }}</li>
                        </ul>
                    </div>
                </div>

                <!-- Confirm Password -->
                <div>
                    <label
                        for="confirmPassword"
                        class="block text-sm font-medium leading-6 text-gray-900"
                        >Confirm Password</label
                    >
                    <div class="mt-2">
                        <input
                            id="confirmPassword"
                            v-model="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            class="block w-full rounded-lg border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                            :class="{ 'ring-red-300 focus:ring-red-500': passwordMismatch }"
                        />
                    </div>
                    <p v-if="passwordMismatch" class="mt-1 text-xs text-red-500">
                        Passwords do not match.
                    </p>
                </div>

                <!-- Action Button -->
                <div>
                    <p v-if="errorMsg" class="text-red-500 text-sm mb-4">
                        {{ errorMsg }}
                    </p>
                    <button
                        type="submit"
                        :disabled="loading || currStrength.score < 2 || passwordMismatch"
                        class="flex w-full justify-center rounded-lg bg-primary-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <svg
                            v-if="loading"
                            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {{ loading ? 'Creating account...' : 'Sign up' }}
                    </button>
                </div>
            </form>

            <div class="mt-10 text-center text-sm text-gray-500">
                Already a member?
                {{ ' ' }}
                <NuxtLink
                    to="/login"
                    class="font-semibold leading-6 text-primary-600 hover:text-primary-500"
                >
                    Sign in
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { checkPasswordStrength } from '~/shared/utils/validation';

const form = reactive({
    name: '',
    email: '',
    password: '',
});
const confirmPassword = ref('');
const loading = ref(false);
const errorMsg = ref('');

const passwordMismatch = computed(() => {
    return !!(form.password && confirmPassword.value && form.password !== confirmPassword.value);
});

const currStrength = computed(() => checkPasswordStrength(form.password));

const textColor = (label: string) => {
    switch (label) {
        case 'Weak': return 'text-red-600';
        case 'Fair': return 'text-yellow-600';
        case 'Good': return 'text-blue-600';
        case 'Strong': return 'text-green-600';
        default: return 'text-gray-600';
    }
};

const handleRegister = async () => {
    if (passwordMismatch.value || currStrength.value.score < 2) return;

    loading.value = true;
    errorMsg.value = '';

    try {
        await $fetch('/api/auth/register', {
            method: 'POST',
            body: form,
        });
        
        // 회원가입 성공 시 로그인 페이지로 이동하거나 자동 로그인 처리
        // 여기서는 로그인 페이지로 이동하며 안내 메시지 (실제로는 Toast 권장)
        await navigateTo('/login?registered=true');
    } catch (e: any) {
        errorMsg.value = e.data?.message || 'Registration failed. Please try again.';
    } finally {
        loading.value = false;
    }
};

definePageMeta({
    layout: 'auth',
    middleware: ['guest'],
});
</script>
