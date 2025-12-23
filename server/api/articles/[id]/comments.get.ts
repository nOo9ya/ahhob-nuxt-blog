/**
 * 파일 기능: 댓글 목록 조회 API
 * 위치: server/api/articles/[id]/comments.get.ts
 * 권한: 누구나
 * 
 * 데이터 흐름:
 * 1. articleId로 모든 댓글 조회 (회원 + 비회원)
 * 2. userId가 있으면 user 정보 포함
 * 3. 비회원 이메일은 마스킹하여 반환
 */

import { eq, asc } from 'drizzle-orm';
import { articles, comments, users } from '~/server/database/schema';

export default defineEventHandler(async (event) => {
    const articleId = Number(getRouterParam(event, 'id'));
    const db = await getDB();

    // 현재 사용자 확인
    const session = await getUserSession(event);
    const isAdmin = session?.userType === 'admin';
    const currentUserId = session?.userId;

    // 댓글 조회 (Explicit Left Join to avoid LATERAL syntax error)
    const commentsList = await db
        .select({
            id: comments.id,
            articleId: comments.articleId,
            userId: comments.userId,
            guestName: comments.guestName,
            guestEmail: comments.guestEmail,
            guestPasswordHash: comments.guestPasswordHash,
            content: comments.content,
            isPrivate: comments.isPrivate,
            parentId: comments.parentId,
            createdAt: comments.createdAt,
            updatedAt: comments.updatedAt,
            user: {
                id: users.id,
                name: users.name,
                avatar: users.avatar,
            },
        })
        .from(comments)
        .leftJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.articleId, articleId))
        .orderBy(asc(comments.createdAt));

    // 응답 형식 변환 및 비공개 댓글 필터링
    const formattedComments = commentsList
        .filter((comment) => {
            // 비공개 댓글 필터링
            if (comment.isPrivate) {
                // 관리자는 모든 비공개 댓글 볼 수 있음
                if (isAdmin) return true;
                
                // 작성자만 자신의 비공개 댓글 볼 수 있음
                if (comment.userId && comment.userId === currentUserId) return true;
                
                // 비회원 댓글은 세션에 저장된 정보로 확인 불가능하므로 숨김
                return false;
            }
            return true;
        })
        .map((comment) => {
        if (comment.userId && comment.user) {
            // 회원 댓글
            return {
                id: comment.id,
                type: 'member',
                author: {
                    id: comment.user.id,
                    name: comment.user.name,
                    avatar: comment.user.avatar,
                },
                content: comment.content,
                isPrivate: comment.isPrivate,
                parentId: comment.parentId,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
            };
        } else {
            // 비회원 댓글
            // 이메일 마스킹 (예: g***@example.com)
            const email = comment.guestEmail || '';
            const [localPart, domain] = email.split('@');
            const maskedEmail = localPart
                ? `${localPart[0]}***@${domain}`
                : '';

            return {
                id: comment.id,
                type: 'guest',
                author: {
                    name: comment.guestName,
                    email: maskedEmail,
                },
                content: comment.content,
                isPrivate: comment.isPrivate,
                parentId: comment.parentId,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
            };
        }
    });

    return {
        comments: formattedComments,
        total: commentsList.length,
    };
});
