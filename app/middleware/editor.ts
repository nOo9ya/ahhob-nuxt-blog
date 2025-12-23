import { defineNuxtRouteMiddleware, navigateTo, abortNavigation, useUserSession } from '#imports';

export default defineNuxtRouteMiddleware((to, from) => {
    const { user, loggedIn } = useUserSession();

    if (!loggedIn.value) {
        return navigateTo({
            path: '/login',
            query: { redirect: to.fullPath }
        });
    }

    // Role check: admin or editor allowed
    if (user.value?.role !== 'admin' && user.value?.role !== 'editor') {
        return abortNavigation({
            statusCode: 403,
            message: '접근 권한이 없습니다.'
        });
    }
});
