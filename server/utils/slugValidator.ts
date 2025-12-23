/**
 * 기능: 페이지 및 카테고리의 URL 슬러그(Slug) 유효성 검증
 * 경로: server/utils/slugValidator.ts
 * 권한: 서버 내부 유틸리티
 * 데이터 흐름: API 요청 -> 유효성 검증 -> DB 조회 (Pages/Categories) -> 결과 반환
 */

import { RESERVED_SLUGS } from '../../shared/utils/constants';
import { SLUG_REGEX } from '../../shared/utils/slug';
// generateSlug import 필요 시 shared/utils/slug 사용 권장
import { getDB, schema } from '../database';
import { eq, ne, and, sql } from 'drizzle-orm';

interface SlugValidationResult {
    isValid: boolean;
    message?: string;
}

export type SlugType = 'page' | 'category' | 'article' | 'tag';

/**
 * 슬러그 유효성 및 중복 검증 함수 (validateSlugAvailability)
 *
 * 기능: 페이지, 카테고리, 기사, 태그의 슬러그에 대해 형식 유효성과 DB 내 중복 여부를 검증합니다.
 *
 * 데이터 흐름:
 * 1. 형식 검사 (Regex: 영문 소문자, 숫자, 한글, @, 하이픈)
 * 2. 예약어 검사 (시스템 예약어 충돌 방지)
 * 3. 타입별 중복 검사 (DB 조회)
 *    - page: Category와 충돌 체크 + Page 내 중복 체크 (자신 제외)
 *    - category: Page와 충돌 체크 + Category 내 중복 체크 (자신 제외)
 *    - article: Article 내 중복 체크 (자신 제외)
 *    - tag: Tag 내 중복 체크 (자신 제외)
 * 4. 검증 결과(SlugValidationResult) 반환
 *
 * @param slug 검증할 슬러그 문자열
 * @param type 슬러그 타입 ('page' | 'category' | 'article' | 'tag')
 * @param currentId (선택) 수정 시 현재 항목의 ID (자신과의 중복 체크 제외용)
 */
export async function validateSlugAvailability(
    slug: string,
    type: SlugType,
    currentId?: number
): Promise<SlugValidationResult> {
    // 1. Format Check
    if (!SLUG_REGEX.test(slug)) {
        return {
            isValid: false,
            message:
                '슬러그는 영문 소문자, 숫자, 한글, @, 하이픈(-)만 사용할 수 있습니다.',
        };
    }

    // 2. Reserved Word Check
    if (RESERVED_SLUGS.includes(slug as any)) {
        return {
            isValid: false,
            message: `'${slug}'은(는) 사용할 수 없는 시스템 예약어입니다.`,
        };
    }

    const db = await getDB();

    // 3. Collision Check
    switch (type) {
        case 'page': {
            // Check Categories Collision
            const existingCategory = await db.query.categories.findFirst({
                where: eq(schema.categories.slug, slug),
            });
            if (existingCategory) {
                return {
                    isValid: false,
                    message: `'${slug}'은(는) 이미 카테고리로 사용 중입니다.`,
                };
            }

            // Check Pages Collision (Self-Exclusion)
            const whereClause = currentId
                ? and(
                      eq(schema.pages.slug, slug),
                      ne(schema.pages.id, currentId)
                  )
                : eq(schema.pages.slug, slug);

            const existingPage = await db.query.pages.findFirst({
                where: whereClause,
            });
            if (existingPage) {
                return {
                    isValid: false,
                    message: `'${slug}'은(는) 이미 다른 페이지에서 사용 중입니다.`,
                };
            }
            break;
        }

        case 'category': {
            // Check Pages Collision
            const existingPage = await db.query.pages.findFirst({
                where: eq(schema.pages.slug, slug),
            });
            if (existingPage) {
                return {
                    isValid: false,
                    message: `'${slug}'은(는) 이미 정적 페이지로 사용 중입니다.`,
                };
            }

            // Check Categories Collision (Self-Exclusion)
            const whereClause = currentId
                ? and(
                      eq(schema.categories.slug, slug),
                      ne(schema.categories.id, currentId)
                  )
                : eq(schema.categories.slug, slug);

            const existingCategory = await db.query.categories.findFirst({
                where: whereClause,
            });
            if (existingCategory) {
                return {
                    isValid: false,
                    message: `'${slug}'은(는) 이미 다른 카테고리에서 사용 중입니다.`,
                };
            }
            break;
        }

        case 'article': {
            // Check Articles Collision (Self-Exclusion)
            const whereClause = currentId
                ? and(
                      eq(schema.articles.slug, slug),
                      ne(schema.articles.id, currentId)
                  )
                : eq(schema.articles.slug, slug);

            const existingArticle = await db.query.articles.findFirst({
                where: whereClause,
            });
            if (existingArticle) {
                return {
                    isValid: false,
                    message: `'${slug}'은(는) 이미 다른 기사에서 사용 중입니다.`,
                };
            }
            break;
        }

        case 'tag': {
            // Check Tags Collision (Self-Exclusion)
            const whereClause = currentId
                ? and(eq(schema.tags.slug, slug), ne(schema.tags.id, currentId))
                : eq(schema.tags.slug, slug);

            const existingTag = await db.query.tags.findFirst({
                where: whereClause,
            });
            if (existingTag) {
                return {
                    isValid: false,
                    message: `'${slug}'은(는) 이미 다른 태그에서 사용 중입니다.`,
                };
            }
            break;
        }
    }

    return { isValid: true };
}
