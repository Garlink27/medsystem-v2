import { createClient, type Client } from '@libsql/client';

function isBuildWithoutDatabaseUrl(): boolean {
  const url = process.env.TURSO_DATABASE_URL;
  if (url && url !== 'undefined') return false;
  return (
    process.env.npm_lifecycle_event === 'build' ||
    process.env.NEXT_PHASE === 'phase-production-build'
  );
}

function emptyResultSet() {
  return {
    columns:         [] as string[],
    columnTypes:     [] as string[],
    rows:            [] as Record<string, unknown>[],
    rowsAffected:    0,
    lastInsertRowid: undefined as bigint | undefined,
    toJSON:          () => ({ columns: [], rows: [] }),
  };
}

function buildStubClient(): Client {
  const stub = {
    execute:       async () => emptyResultSet(),
    executeMultiple: async () => [],
    batch:         async () => [],
    migrate:       async () => undefined,
    transaction:   async () => {
      throw new Error('Database not configured during build stub');
    },
    sync:          async () => undefined,
    close:         () => undefined,
    open:          false,
  };
  return stub as unknown as Client;
}

let _db: Client | null = null;

function getClient(): Client {
  if (_db) return _db;

  const url   = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN ?? '';

  if (!url || url === 'undefined') {
    if (isBuildWithoutDatabaseUrl()) {
      _db = buildStubClient();
      return _db;
    }
    throw new Error(
      'TURSO_DATABASE_URL is not set. Add it (and TURSO_AUTH_TOKEN) to .env.local — see .env.local.example.',
    );
  }

  _db = createClient({ url, authToken: token });
  return _db;
}

/** Turso client; durante `next build` sin `.env` devuelve consultas vacías para poder compilar. */
export const db = new Proxy({} as Client, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') return value.bind(client);
    return value;
  },
});
