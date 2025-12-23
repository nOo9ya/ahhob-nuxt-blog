import { createError, readBody } from 'h3';
import { eq, or } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { getDB } from '../../database';
import { admins } from '../../database/schema';
import { isValidEmail, isValidPassword } from '../../../shared/utils/validation';
import { getSiteSettings } from '../../utils/settings';

/**
 * 회원가입 API (관리자/에디터 등 Email 계정 생성)
 * POST /api/auth/register
 *
 * 권한: 없음 (누구나 접근 가능)
 *
 * 기능:
 * - 신규 관리자/에디터 계정 등록 (기본 Role: 'writer')
 * - 기본 Status: 'pending' (관리자 승인 필요)
 * - 이미 존재하는 이메일 체크 (admins 테이블)
 */
export default defineEventHandler(async (event) => {
    // 0. 사이트 회원가입 허용 여부 체크
    const settings = await getSiteSettings();
    if (!settings.allow_registration) {
        throw createError({
            statusCode: 403,
            message: '현재 신규 회원가입이 제한되어 있습니다. 관리자에게 문의하세요.',
        });
    }

    const body = await readBody(event);
    const { email, password, name, bio } = body;

    // 1. 입력값 검증
    if (!email || !password || !name) {
        throw createError({
            statusCode: 400,
            message: '필수 입력값이 누락되었습니다. (이메일, 비밀번호, 이름)',
        });
    }

    if (!isValidEmail(email)) {
        throw createError({
            statusCode: 400,
            message: '유효하지 않은 이메일 형식입니다.',
        });
    }

    // 비밀번호 강도 검증 (숫자/특수문자 필수)
    const pwValidation = isValidPassword(password, {
        requireNumbers: true,
        requireSpecialChars: true,
        minLength: 8
    });

    if (!pwValidation.isValid) {
        throw createError({
            statusCode: 400,
            message: `비밀번호가 보안 규칙을 만족하지 않습니다: ${pwValidation.errors.join(', ')}`,
        });
    }

    const db = await getDB();

    // 2. 이메일 중복 확인 (admins 테이블)
    const [existingUser] = await db
        .select()
        .from(admins)
        .where(eq(admins.email, email))
        .limit(1);

    if (existingUser) {
        throw createError({
            statusCode: 409,
            message: '이미 가입된 이메일입니다.',
        });
    }

    // 3. 비밀번호 해싱
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. 사용자 생성 (Status: pending)
    await db.insert(admins).values({
        email,
        passwordHash,
        name,
        role: 'writer', // 기본 권한
        status: 'pending', // 승인 대기
        bio: bio || null,
        credentials: null,
    });

    // 5. 응답 반환 (자동 로그인 안 함)
    setResponseStatus(event, 201);
    return {
        success: true,
        message: '회원가입이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.',
    };
});
