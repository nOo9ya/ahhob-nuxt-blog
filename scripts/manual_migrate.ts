import { getDB } from '../server/database';
import { sql } from 'drizzle-orm';

async function main() {
    const db = await getDB();
    console.log('Starting manual migration...');

    try {
        console.log('Adding "order" column...');
        await db.execute(sql`ALTER TABLE categories ADD COLUMN \`order\` INT DEFAULT 0`);
        console.log('"order" column added successfully.');
    } catch (e: any) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('"order" column already exists.');
        } else {
            console.error('Failed to add "order" column:', e.message);
        }
    }

    try {
        console.log('Adding "path" column...');
        await db.execute(sql`ALTER TABLE categories ADD COLUMN \`path\` VARCHAR(500)`);
        console.log('"path" column added successfully.');
    } catch (e: any) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('"path" column already exists.');
        } else {
            console.error('Failed to add "path" column:', e.message);
        }
    }

    console.log('Manual migration completed.');
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
