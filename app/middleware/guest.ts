import { defineNuxtRouteMiddleware, navigateTo, useUserSession } from '#imports';

export default defineNuxtRouteMiddleware((to, from) => {
    const { loggedIn } = useUserSession();

    if (loggedIn.value) {
        return navigateTo('/');
    }
});
