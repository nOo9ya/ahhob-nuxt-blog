export default defineNuxtRouteMiddleware((to, from) => {
    console.log('[Middleware:admin] Running for path:', to.path);
    const { loggedIn, user } = useUserSession();
    console.log('[Middleware:admin] Check:', { loggedIn: loggedIn.value, user: user.value });
    
    if (!loggedIn.value) {
        console.log('[Middleware:admin] Redirecting to Login (Not Logged In)');
        return navigateTo('/login');
    }

    const allowedRoles = ['admin', 'editor', 'writer'];
    if (!user.value || !allowedRoles.includes(user.value.role)) {
        return navigateTo('/');
    }
});
