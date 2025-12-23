<template>
    <div class="bg-gray-900 py-16 sm:py-24 lg:py-32">
        <div class="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
            <div class="max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:col-span-7">
                <h2 class="inline sm:block">Want product news and updates?</h2>
                <p class="inline sm:block text-indigo-500">Sign up for our newsletter.</p>
            </div>
            <form @submit.prevent="subscribe" class="w-full max-w-md lg:col-span-5 lg:pt-2">
                <div class="flex gap-x-4">
                    <label for="email-address" class="sr-only">Email address</label>
                    <input
                        v-model="email"
                        id="email-address"
                        name="email"
                        type="email"
                        autocomplete="email"
                        required
                        class="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 placeholder:text-gray-500"
                        placeholder="Enter your email"
                        :disabled="pending"
                    />
                    <button
                        type="submit"
                        :disabled="pending"
                        class="flex-none rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {{ pending ? 'Subscribing...' : 'Subscribe' }}
                    </button>
                </div>
                <p class="mt-4 text-sm leading-6 text-gray-300">
                    We care about your data. Read our
                    <NuxtLink to="/privacy" class="font-semibold text-white hover:text-indigo-400">privacy&nbsp;policy</NuxtLink>.
                </p>
                <!-- Success/Error Messages -->
                <p v-if="successMessage" class="mt-2 text-sm text-green-400">
                    {{ successMessage }}
                </p>
                <p v-if="errorMessage" class="mt-2 text-sm text-red-400">
                    {{ errorMessage }}
                </p>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * 뉴스레터 구독 섹션 (Newsletter Section)
 * Path: app/components/home/NewsletterSection.vue
 * 
 * 설명:
 * 사용자가 이메일을 입력하여 뉴스레터를 구독할 수 있는 섹션입니다.
 * POST /api/newsletter/subscribe 엔드포인트를 호출합니다.
 */

const email = ref('');
const pending = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const subscribe = async () => {
    if (!email.value) return;

    pending.value = true;
    successMessage.value = '';
    errorMessage.value = '';

    try {
        const { data, error } = await useFetch('/api/newsletter/subscribe', {
            method: 'POST',
            body: { email: email.value },
        });

        if (error.value) {
            // API 에러 처리
            throw new Error(error.value.message || 'Subscription failed.');
        }
        
         // 성공 처리
        successMessage.value = 'Thanks for subscribing!';
        email.value = ''; // 입력 필드 초기화
        
        // 3초 후 성공 메시지 사라짐
        setTimeout(() => {
            successMessage.value = '';
        }, 3000);

    } catch (e: any) {
        errorMessage.value = e.message || 'Something went wrong. Please try again.';
    } finally {
        pending.value = false;
    }
};
</script>
