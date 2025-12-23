import { updateSiteSettings } from '~/server/utils/settings';

// PUT /api/settings
export default defineEventHandler(async (event) => {
    // Admin Only
    await requireAdmin(event);

    const body = await readBody(event);
    
    // Validation could be added here
    
    await updateSiteSettings(body);

    return { success: true };
});
