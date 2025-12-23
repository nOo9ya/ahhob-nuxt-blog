import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

export default defineConfig({
    resolve: {
        alias: {
            '~': fileURLToPath(new URL('./', import.meta.url)),
            '@': fileURLToPath(new URL('./', import.meta.url)),
            '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
        },
    },
    test: {
        globals: true,
    },
});
