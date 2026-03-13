import { createClient } from '@libsql/client';

// Set these in .env.local:
//   TURSO_DATABASE_URL=libsql://your-db.turso.io
//   TURSO_AUTH_TOKEN=your-token
export const db = createClient({
  url:       process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
