import type { Config } from 'drizzle-kit';

// Генерация миграций: npx drizzle-kit generate
export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;
