export default defineNuxtPlugin(async () => {
    const { fetch, loggedIn } = useUserSession();
    // Fetch session on startup (Server or Client)
    // useState handles hydration, but we double check to be sure
    await fetch();
});
