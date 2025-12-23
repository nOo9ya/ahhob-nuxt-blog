import { getDB } from '../../../database';
import { tags } from '../../../database/schema';
import { eq, or } from 'drizzle-orm';
import { createError } from 'h3';

export default defineEventHandler(async (event) => {
    const idOrSlug = event.context.params?.id;

    if (!idOrSlug) {
        throw createError({
            statusCode: 400,
            message: 'Tag ID or Slug is required',
        });
    }

    const db = await getDB();

    // ID(숫자)인지 Slug(문자열)인지 판별
    // 단순히 숫자로만 구성되어 있으면 ID로 간주, 그렇지 않으면 Slug로 간주
    const isId = /^\d+$/.test(idOrSlug);

    const tag = await db.query.tags.findFirst({
        where: isId ? eq(tags.id, parseInt(idOrSlug)) : eq(tags.slug, idOrSlug),
    });

    if (!tag) {
        throw createError({
            statusCode: 404,
            message: 'Tag not found',
        });
    }

    return {
        success: true,
        data: tag,
    };
});
