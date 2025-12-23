export default defineEventHandler(async (event) => {
    const db = await getDB();
    const usersList = await db.query.users.findMany();
    const adminsList = await db.query.admins.findMany();
    return { users: usersList, admins: adminsList };
});
