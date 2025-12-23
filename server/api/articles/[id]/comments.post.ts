/**
 * 파일 기능: 댓글 작성 API (회원 + 비회원 통합)
 * 위치: server/api/articles/[id]/comments.post.ts
 * 권한: 댓글 정책에 따라 다름
 * 
 * 데이터 흐름:
 * 1. 글의 댓글 정책 확인
 * 2. 세션 확인 (로그인 여부)
 * 3. 회원이면 userId로 저장, 비회원이면 guest 필드로 저장
 */

import { eq } from 'drizzle-orm';
import { articles, comments, siteSettings } from '~/server/database/schema';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
    const articleId = Number(getRouterParam(event, 'id'));
    const body = await readBody(event);
    const db = await getDB();

    // 1. 글 조회
    const article = await db.query.articles.findFirst({
        where: eq(articles.id, articleId),
    });

    if (!article) {
        throw createError({
            statusCode: 404,
            message: '글을 찾을 수 없습니다.',
        });
    }

    // 2. 댓글 정책 확인
    let policy = article.commentPolicy;
    
    if (policy === 'default') {
        // 사이트 전역 설정 사용
        const settings = await db.query.siteSettings.findFirst({
            where: eq(siteSettings.key, 'comment_policy'),
        });
        policy = settings?.value || 'members_only';
    }

    if (policy === 'disabled') {
        throw createError({
            statusCode: 403,
            message: '이 글은 댓글이 비활성화되었습니다.',
        });
    }

    // 3. 세션 확인
    const session = await getUserSession(event);

    if (session?.id) {
        // 회원 댓글
        await db.insert(comments).values({
            articleId,
            userId: session.id,
            content: body.content,
            isPrivate: body.isPrivate || false,
            parentId: body.parentId || null,
        });
    } else {
        // 비회원 댓글
        if (policy === 'users_only' && !session?.id) { // Changed 'members_only' to 'users_only' and added '&& !session?.id'
            throw createError({
                statusCode: 403,
                message: '회원만 댓글을 작성할 수 있습니다.',
            });
        }

        // 비회원 필드 검증
        if (!body.guestName || !body.guestEmail || !body.guestPassword) {
            throw createError({
                statusCode: 400,
                message: '이름, 이메일, 비밀번호를 입력해주세요.',
            });
        }

        if (body.guestPassword.length < 4) {
            throw createError({
                statusCode: 400,
                message: '비밀번호는 4자 이상이어야 합니다.',
            });
        }

        // 비밀번호 해시화
        const passwordHash = await bcrypt.hash(body.guestPassword, 10);

        await db.insert(comments).values({
            articleId,
            guestName: body.guestName,
            guestEmail: body.guestEmail,
            guestPasswordHash: passwordHash,
            content: body.content,
            isPrivate: body.isPrivate || false,
            parentId: body.parentId || null,
        });
    }

    return {
        success: true,
        message: '댓글이 작성되었습니다.',
    };
});
