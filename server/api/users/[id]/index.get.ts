import { getDB } from '../../../database';
import { admins } from '../../../database/schema';
import { getUserSession } from '../../../utils/session';
import { eq } from 'drizzle-orm';

/**
 * 사용자(관리자/에디터) 상세 조회 API
 * GET /api/users/:id
 *
 * 권한: 관리자 (Admin)
 *
 * 데이터 흐름:
 * 1. 인증 및 관리자 권한 체크
 * 2. Route Parameter에서 ID 검증
 * 3. DB 조회 (admins 테이블, 비밀번호 제외)
 * 4. 결과 반환
 */
export default defineEventHandler(async (event) => {
    // 1. 인증 및 권한 체크
    const user = await getUserSession(event);

    if (!user) {
        throw createError({
            statusCode: 401,
            message: '로그인이 필요합니다.',
        });
    }

    if (user.role !== 'admin') {
        throw createError({
            statusCode: 403,
            message: '관리자 권한이 필요합니다.',
        });
    }

    // 2. ID 검증
    const id = Number(event.context.params?.id);

    if (!id || isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: '잘못된 사용자 ID입니다.',
        });
    }

    const db = await getDB();

    // 3. DB 조회
    // 비밀번호(Hash)는 보안상 절대 반환하지 않습니다.
    const [targetUser] = await db
        .select({
            id: admins.id,
            email: admins.email,
            name: admins.name,
            role: admins.role,
            avatar: admins.avatar,
            bio: admins.bio,
            status: admins.status, // 상태 추가
            createdAt: admins.createdAt,
            updatedAt: admins.updatedAt,
            credentials: admins.credentials,
        })
        .from(admins)
        .where(eq(admins.id, id))
        .limit(1);

    if (!targetUser) {
        throw createError({
            statusCode: 404,
            message: '사용자를 찾을 수 없습니다.',
        });
    }

    // 4. 결과 반환
    return {
        success: true,
        user: targetUser,
    };
});
