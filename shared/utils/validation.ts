/**
 * 이메일 형식 검증 유틸리티 (Email Validation Utility)
 * 경로: shared/utils/validation.ts
 *
 * 클라이언트(Frontend)와 서버(Backend) 모두에서 사용 가능
 *
 * @param email 검증할 이메일 주소
 * @returns 유효하면 true, 아니면 false
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 비밀번호 강도 검증 옵션 (Password Validation Options)
 */
export interface PasswordValidationOptions {
    /** 최소 길이 (기본값: 8) */
    minLength?: number;
    /** 최대 길이 (기본값: 없음) */
    maxLength?: number;
    /** 숫자 포함 필수 (기본값: false) */
    requireNumbers?: boolean;
    /** 소문자 포함 필수 (기본값: false) */
    requireLowercase?: boolean;
    /** 대문자 포함 필수 (기본값: false) */
    requireUppercase?: boolean;
    /** 특수문자 포함 필수 (기본값: false) */
    requireSpecialChars?: boolean;
}

/**
 * 비밀번호 검증 결과 (Password Validation Result)
 */
export interface PasswordValidationResult {
    /** 전체 검증 성공 여부 */
    isValid: boolean;
    /** 실패한 검증 규칙 목록 */
    errors: string[];
}

/**
 * 비밀번호 강도 검증 (옵션 지원)
 *
 * @param password 검증할 비밀번호
 * @param options 검증 옵션
 * @returns 검증 결과 (isValid, errors)
 *
 * @example
 * // 기본 검증 (길이만)
 * isValidPassword('mypassword');
 * // { isValid: true, errors: [] }
 *
 * // 엄격한 검증
 * isValidPassword('weak', { requireNumbers: true, requireSpecialChars: true });
 * // { isValid: false, errors: ['숫자를 포함해야 합니다.', '특수문자를 포함해야 합니다.'] }
 *
 * // 성공 예시
 * isValidPassword('Strong@123', {
 *     minLength: 8,
 *     requireNumbers: true,
 *     requireUppercase: true,
 *     requireSpecialChars: true
 * });
 * // { isValid: true, errors: [] }
 */
export function isValidPassword(
    password: string,
    options: PasswordValidationOptions = {}
): PasswordValidationResult {
    const {
        minLength = 8,
        maxLength,
        requireNumbers = false,
        requireLowercase = false,
        requireUppercase = false,
        requireSpecialChars = false,
    } = options;

    const errors: string[] = [];

    // 길이 검증
    if (password.length < minLength) {
        errors.push(`비밀번호는 최소 ${minLength}자 이상이어야 합니다.`);
    }

    if (maxLength && password.length > maxLength) {
        errors.push(`비밀번호는 최대 ${maxLength}자 이하여야 합니다.`);
    }

    // 숫자 포함 검증
    if (requireNumbers && !/\d/.test(password)) {
        errors.push('숫자를 포함해야 합니다.');
    }

    // 소문자 포함 검증
    if (requireLowercase && !/[a-z]/.test(password)) {
        errors.push('소문자를 포함해야 합니다.');
    }

    // 대문자 포함 검증
    if (requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('대문자를 포함해야 합니다.');
    }

    // 특수문자 포함 검증
    if (
        requireSpecialChars &&
        !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    ) {
        errors.push('특수문자를 포함해야 합니다.');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * 비밀번호 길이만 검증 (하위 호환 - 간단한 boolean 반환)
 *
 * @param password 검증할 비밀번호
 * @param minLength 최소 길이 (기본값: 8)
 * @returns 유효하면 true, 아니면 false
 *
 * @example
 * isValidPasswordSimple('mypassword'); // true
 * isValidPasswordSimple('short'); // false
 *
 * @deprecated 상세한 검증이 필요하면 isValidPassword() 사용 권장
 */
export function isValidPasswordSimple(
    password: string,
    minLength: number = 8
): boolean {
    return password.length >= minLength;
}

/**
 * Role 값 검증
 *
 * @param role 검증할 role 값
 * @returns 유효하면 true, 아니면 false
 */
export function isValidRole(role: string): boolean {
    const validRoles = ['admin', 'editor', 'writer'];
    return validRoles.includes(role);
}

/**
 * Admin 권한 검증
 *
 * @param role 검증할 role 값
 * @returns Admin이면 true, 아니면 false
 */
export function isAdminRole(role: string): boolean {
    return role === 'admin';
}

/**
 * Editor 이상 권한 검증 (Editor + Admin)
 *
 * @param role 검증할 role 값
 * @returns Editor 또는 Admin이면 true, 아니면 false
 */
export function isEditorOrAbove(role: string): boolean {
    return role === 'editor' || role === 'admin';
}

/**
 * Writer 이상 권한 검증 (Writer + Editor + Admin)
 *
 * @param role 검증할 role 값
 * @returns Writer, Editor, Admin 중 하나면 true, 아니면 false
 */
export function isWriterOrAbove(role: string): boolean {
    return isValidRole(role);
}

// ==========================================
// Merged from validators.ts
// ==========================================

/**
 * URL 형식 검사
 */
export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export interface PasswordStrength {
    score: number; // 0 (Weak) to 4 (Strong)
    label: 'Weak' | 'Fair' | 'Good' | 'Strong';
    color: string;
    width: string;
    feedback: string[];
}

/**
 * 비밀번호 강도 상세 분석 (UI 표시용)
 */
export const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (!password) return { score: 0, label: 'Weak', color: 'bg-gray-200', width: '0%', feedback: [] };

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (password.length < 8) {
        feedback.push('최소 8자 이상이어야 합니다.');
    }
    if (!/[A-Z]/.test(password)) {
        feedback.push('대문자를 포함해야 합니다.');
    }
    if (!/[0-9]/.test(password)) {
        feedback.push('숫자를 포함해야 합니다.');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        feedback.push('특수문자를 포함해야 합니다.');
    }

    let label: PasswordStrength['label'] = 'Weak';
    let color = 'bg-red-500';
    let width = '25%';

    switch (score) {
        case 0:
        case 1:
            label = 'Weak';
            color = 'bg-red-500';
            width = '25%';
            break;
        case 2:
            label = 'Fair';
            color = 'bg-yellow-500';
            width = '50%';
            break;
        case 3:
            label = 'Good';
            color = 'bg-blue-500';
            width = '75%';
            break;
        case 4:
            label = 'Strong';
            color = 'bg-green-500';
            width = '100%';
            break;
    }

    return { score, label, color, width, feedback };
};
