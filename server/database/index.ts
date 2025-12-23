import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

import { type MySql2Database } from 'drizzle-orm/mysql2';

type DrizzleDB = MySql2Database<typeof schema>;

let pool: mysql.Pool | null = null;
let db: DrizzleDB | null = null;

export async function getDB(): Promise<NonNullable<typeof db>> {
    if (db) return db;

    // Nuxt context or process.env fallback
    const config = globalThis.useRuntimeConfig 
        ? useRuntimeConfig() 
        : {
            dbHost: process.env.DB_HOST,
            dbPort: process.env.DB_PORT || '3306',
            dbUser: process.env.DB_USER,
            dbPassword: process.env.DB_PASSWORD,
            dbName: process.env.DB_NAME,
        };

    pool = mysql.createPool({
        host: config.dbHost,
        port: parseInt(config.dbPort as string),
        user: config.dbUser,
        password: config.dbPassword,
        database: config.dbName,
        charset: 'utf8mb4',
        connectionLimit: 10,
    });

    db = drizzle(pool, { schema, mode: 'default' }) as unknown as DrizzleDB;
    return db;
}

export { schema };
