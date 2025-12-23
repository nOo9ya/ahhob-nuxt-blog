import { eq, desc, asc } from 'drizzle-orm';
import { comments } from '~/server/database/schema';
import { getDB } from '~/server/utils/db'; // Correct import

export default defineEventHandler(async (event) => {
    const articleId = getRouterParam(event, 'id');

    if (!articleId) {
        throw createError({
            statusCode: 400,
            message: 'Article ID is required',
        });
    }

    const db = await getDB(); // Get DB instance

    // 1. 해당 기사의 모든 댓글 조회 (작성자 정보 포함)
    // @ts-ignore - drizzle-orm type definitions might be tricky with relational queries sometimes
    const allComments = await db.query.comments.findMany({
        where: eq(comments.articleId, parseInt(articleId)),
        with: {
            author: {
                columns: {
                    id: true,
                    name: true,
                    avatar: true,
                    role: true,
                },
            },
        },
        orderBy: [asc(comments.createdAt)], // 시간순 정렬
    });

    // 2. 계층형 구조로 변환
    const commentMap = new Map();
    const roots: any[] = [];

    // 일단 모든 댓글을 맵에 저장하고 children 배열 초기화
    allComments.forEach((c: any) => {
        c.children = [];
        commentMap.set(c.id, c);
    });

    // 부모-자식 관계 연결
    allComments.forEach((c: any) => {
        if (c.parentId) {
            const parent = commentMap.get(c.parentId);
            if (parent) {
                parent.children.push(c);
            } else {
                // 부모가 없으면(삭제됨 등) 루트로 취급하거나 고아로 처리
                roots.push(c);
            }
        } else {
            roots.push(c);
        }
    });

    return {
        comments: roots,
        total: allComments.length,
    };
});
