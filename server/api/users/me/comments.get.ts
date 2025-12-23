/**
 * 내 댓글 목록 조회 (Get My Comments)
 * GET /api/users/me/comments
 * 경로: server/api/users/me/comments.get.ts
 * 권한: User (로그인 필수)
 *
 * 데이터 흐름:
 * 1. 인증 확인 (requireAuth)
 * 2. 쿼리 파라미터 파싱 (page, limit)
 * 3. DB 조회 (내가 작성한 댓글, 관련 기사 정보 포함)
 * 4. 결과 반환 (페이지네이션)
 */
import { getDB, schema } from '~/server/database';
import { eq, desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    // 1. 인증 확인
    const user = await requireAuth(event);

    // 2. 쿼리 파라미터 파싱
    const query = getQuery(event);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;

    const db = await getDB();

    // 3. DB 조회 (내가 작성한 댓글, 관련 기사 정보 포함)
    // @ts-ignore
    const myComments = await db.query.comments.findMany({
        where: eq(schema.comments.userId, user.userId),
        with: {
            article: {
                columns: {
                    id: true,
                    title: true,
                    slug: true,
                },
                with: {
                    category: {
                        columns: {
                            slug: true,
                        }
                    }
                }
            },
        },
        orderBy: [desc(schema.comments.createdAt)],
        limit: limit,
        offset: offset,
    });

    // 4. 결과 반환 (페이지네이션)
    return {
        success: true,
        data: myComments,
        page,
        limit,
    };
});
