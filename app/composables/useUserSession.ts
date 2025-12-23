/**
 * 사용자 세션 관리 Composable
 * app/composables/useUserSession.ts
 *
 * 기능:
 * 1. 로그인 상태(`loggedIn`)와 사용자 정보(`user`)를 전역 상태로 관리 (useState)
 * 2. `fetch`: 서버로부터 현재 사용자 정보를 가져옴 (/api/auth/me)
 * 3. `clear`: 세션 정보를 초기화 (로그아웃 시 사용)
 */
export const useUserSession = () => {
    // useState를 사용하여 서버/클라이언트 간 상태 공유 및 전역 상태 관리
    const user = useState<any | null>('user', () => null);
    
    const loggedIn = computed(() => !!user.value);

    /**
     * 사용자 정보 가져오기 (SSR/CSR 모두 사용 가능)
     */
    const fetch = async () => {
        try {
            const headers = useRequestHeaders(['cookie']);
            const data = await $fetch<{ user: any }>('/api/auth/me', { headers });
            user.value = data?.user || null;
        } catch (e) {
            user.value = null;
        }
    };

    /**
     * 세션 초기화 (로그아웃)
     */
    const clear = async () => {
        await $fetch('/api/auth/logout', { method: 'POST' });
        user.value = null;
        // 로그인 페이지로 이동하거나 처리는 호출 측에서 담당
    };

    return {
        user,
        loggedIn,
        fetch,
        clear,
    };
};
