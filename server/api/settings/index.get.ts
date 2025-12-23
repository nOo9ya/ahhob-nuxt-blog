import { getSiteSettings } from '~/server/utils/settings';

// GET /api/settings
export default defineEventHandler(async (event) => {
    // Admin Only
    await requireAdmin(event);

    const settings = await getSiteSettings();
    return settings;
});
