import { useState } from '#imports';

/**
 * 토스트 알림 관리 Composable
 * 
 * 기능:
 * - 전역 토스트 상태 관리 (useState 사용)
 * - 알림 추가/자동 삭제
 */

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

export const useToast = () => {
    // 전역 상태로 토스트 목록 관리
    const toasts = useState<Toast[]>('toasts', () => []);

    const remove = (id: string) => {
        toasts.value = toasts.value.filter(t => t.id !== id);
    };

    const add = (
        message: string, 
        type: Toast['type'] = 'info', 
        duration: number = 3000
    ) => {
        const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        toasts.value.push({ id, message, type, duration });

        if (duration > 0) {
            setTimeout(() => {
                remove(id);
            }, duration);
        }
        
        return id;
    };

    const success = (msg: string, duration?: number) => add(msg, 'success', duration);
    const error = (msg: string, duration?: number) => add(msg, 'error', duration);
    const info = (msg: string, duration?: number) => add(msg, 'info', duration);
    const warning = (msg: string, duration?: number) => add(msg, 'warning', duration);

    return {
        toasts,
        add,
        remove,
        success,
        error,
        info,
        warning
    };
};
