/**
 * 내 프로필 정보 수정 (Update My Profile)
 * PUT /api/users/me
 * 경로: server/api/users/me/index.put.ts
 * 권한: User (로그인 필수)
 *
 * 데이터 흐름:
 * 1. 인증 확인 (requireAuth)
 * 2. Request Body 파싱 (name, avatar)
 * 3. 유효성 검사 (이름 필수)
 * 4. 현재 사용자 정보 조회
 * 5. DB 업데이트
 * 6. 결과 반환
 *
 * 참고: users 테이블은 OAuth 전용이므로 비밀번호 변경 불가
 */
import { getDB, schema } from '~/server/database';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    // 1. 인증 확인
    const user = await requireAuth(event);

    // 2. Request Body 파싱
    const body = await readBody(event);
    const { name, avatar, currentPassword, newPassword } = body;

    // 3. 유효성 검사 (이름은 필수)
    if (!name || name.trim() === '') {
        throw createError({
            statusCode: 400,
            statusMessage: '이름은 필수 항목입니다.',
        });
    }

    const db = await getDB();

    // 4. 현재 사용자 정보 조회
    // @ts-ignore
    const currentUser = await db.query.users.findFirst({
        where: eq(schema.users.id, user.userId),
    });

    if (!currentUser) {
        throw createError({
            statusCode: 404,
            statusMessage: '사용자를 찾을 수 없습니다.',
        });
    }

    // 5. 업데이트 데이터 준비
    const updateData: any = {
        name: name.trim(),
        avatar: avatar || null,
    };

    // 참고: users 테이블은 OAuth 전용이므로 비밀번호 변경 기능 없음
    // 비밀번호 변경 요청 시 에러 반환
    if (newPassword || currentPassword) {
        throw createError({
            statusCode: 400,
            statusMessage: 'OAuth 사용자는 비밀번호를 변경할 수 없습니다. 연동된 제공자에서 변경하세요.',
        });
    }

    // 6. DB 업데이트
    try {
        await db
            .update(schema.users)
            .set(updateData)
            .where(eq(schema.users.id, user.userId));

        // 7. 결과 반환
        return {
            success: true,
            message: '프로필이 성공적으로 업데이트되었습니다.',
        };
    } catch (error) {
        console.error('Profile update error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: '프로필 업데이트에 실패했습니다.',
        });
    }
});
