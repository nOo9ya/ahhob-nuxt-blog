<template>
    <div class="min-h-screen flex text-gray-900 bg-white">
        <!-- Left Side: Branding / Image (Hidden on mobile) -->
        <div
            class="hidden lg:flex lg:w-1/2 xl:w-5/12 relative bg-gray-900 overflow-hidden"
        >
            <img
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
                alt="Coding Environment"
                class="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <!-- Gradient Overlay -->
            <div
                class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"
            ></div>

            <!-- Content -->
            <div
                class="relative z-10 w-full flex flex-col justify-end p-12 text-white"
            >
                <NuxtLink
                    to="/"
                    class="group flex items-center gap-3 mb-8 w-fit"
                >
                    <div
                        class="h-10 w-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:bg-primary-400 transition-colors"
                    >
                        N
                    </div>
                    <span class="text-2xl font-bold tracking-tight"
                        >Blog</span
                    >
                </NuxtLink>
                <blockquote class="mb-6">
                    <p
                        class="text-xl font-medium leading-relaxed text-gray-200"
                    >
                        "The best place to stay updated with the latest tech
                        trends. It has completely transformed how I consume
                        developer news."
                    </p>
                </blockquote>
                <div class="flex items-center gap-4">
                    <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt=""
                        class="h-10 w-10 rounded-full border-2 border-white/20"
                    />
                    <div>
                        <div class="font-semibold">Alex Chen</div>
                        <div class="text-sm text-gray-400">
                            Senior Software Engineer
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Side: Form Area -->
        <div
            class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full bg-white"
        >
            <div class="mx-auto w-full max-w-sm lg:w-96">
                <!-- Mobile Logo -->
                <div class="lg:hidden mb-10 text-center">
                    <NuxtLink to="/" class="inline-flex items-center gap-2">
                        <div
                            class="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold"
                        >
                            N
                        </div>
                        <span class="text-2xl font-bold text-gray-900"
                            >Blog</span
                        >
                    </NuxtLink>
                </div>

                <slot />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();

// Preload the image slightly or handle meta
useHead({
    titleTemplate: `%s - ${config.public.siteName} Login`,
});
</script>
