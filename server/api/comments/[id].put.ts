/**
 * 파일 기능: 댓글 수정 API
 * 위치: server/api/comments/[id].put.ts
 * 권한: 작성자만 (회원은 세션, 비회원은 비밀번호)
 */

import { eq } from 'drizzle-orm';
import { comments } from '~/server/database/schema';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
    const commentId = Number(getRouterParam(event, 'id'));
    const body = await readBody(event);
    const db = await getDB();

    // 댓글 조회
    const comment = await db.query.comments.findFirst({
        where: eq(comments.id, commentId),
    });

    if (!comment) {
        throw createError({
            statusCode: 404,
            message: '댓글을 찾을 수 없습니다.',
        });
    }

    // 권한 확인
    const session = await getUserSession(event);

    if (comment.userId) {
        // 회원 댓글 - 세션 확인
        if (!session || session.userId !== comment.userId) {
            throw createError({
                statusCode: 403,
                message: '댓글을 수정할 권한이 없습니다.',
            });
        }
    } else {
        // 비회원 댓글 - 비밀번호 확인
        if (!body.guestPassword) {
            throw createError({
                statusCode: 400,
                message: '비밀번호를 입력해주세요.',
            });
        }

        const isValid = await bcrypt.compare(
            body.guestPassword,
            comment.guestPasswordHash || ''
        );

        if (!isValid) {
            throw createError({
                statusCode: 403,
                message: '비밀번호가 일치하지 않습니다.',
            });
        }
    }

    // 댓글 수정
    await db
        .update(comments)
        .set({
            content: body.content,
            isPrivate: body.isPrivate !== undefined ? body.isPrivate : comment.isPrivate,
            updatedAt: new Date(),
        })
        .where(eq(comments.id, commentId));

    return {
        success: true,
        message: '댓글이 수정되었습니다.',
    };
});
