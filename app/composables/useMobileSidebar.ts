export const useMobileSidebar = () => {
    // 사이드바 열림 상태
    const isOpen = useState('mobileSidebarOpen', () => false);

    // 현재 페이지에 사이드바가 존재하는지 여부 (헤더 버튼 표시용)
    const showButton = useState('mobileSidebarExists', () => false);

    // 사이드바 등록 (페이지 컴포넌트에서 호출)
    const register = () => {
        showButton.value = true;
    };

    // 사이드바 해제
    const unregister = () => {
        showButton.value = false;
        isOpen.value = false;
    };

    // 토글
    const toggle = () => {
        isOpen.value = !isOpen.value;
    };

    const open = () => (isOpen.value = true);
    const close = () => (isOpen.value = false);

    return {
        isOpen,
        showButton,
        register,
        unregister,
        toggle,
        open,
        close,
    };
};
