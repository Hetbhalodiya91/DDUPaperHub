/**
 * migrate.js — Copy the live Render PostgreSQL database into Supabase.
 *
 * Reads:  Render's PostgreSQL (the DB the app is currently using)
 * Writes: Supabase PostgreSQL (the new DB)
 *
 * Usage:
 *   npm install pg
 *   node supabase/migrate.js
 *
 * Env vars:
 *   RENDER_DB_URL     postgres://user:pass@host:port/db   (source)
 *   SUPABASE_DB_URL   postgres://user:pass@host:port/db   (destination)
 *
 * The script is idempotent-ish: it TRUNCATEs the destination tables first so
 * you can re-run it after fixing a problem without creating duplicates.
 */

const { Client } = require('pg');

const SRC = process.env.RENDER_DB_URL;
const DST = process.env.SUPABASE_DB_URL;

if (!SRC || !DST) {
  console.error('Missing env vars. Set RENDER_DB_URL and SUPABASE_DB_URL.');
  process.exit(1);
}

// Tables in FK-safe order (parents before children).
const TABLES = [
  'users',
  'departments',
  'subjects',
  'papers',
  'bookmarks',
  'reports',
  'audit_logs',
];

function quoteIdent(name) {
  return '"' + name.replace(/"/g, '""') + '"';
}

async function main() {
  const src = new Client({ connectionString: SRC });
  const dst = new Client({ connectionString: DST });

  await src.connect();
  await dst.connect();
  console.log('Connected to source (Render) and destination (Supabase).');

  // 1. Truncate destination so re-runs don't duplicate.
  const placeholders = TABLES.map((_, i) => `$${i + 1}`).join(', ');
  await dst.query(
    `TRUNCATE TABLE ${TABLES.map(quoteIdent).join(', ')} RESTART IDENTITY CASCADE`,
    TABLES
  );
  console.log('Truncated destination tables: ' + TABLES.join(', '));

  // 2. Copy each table.
  for (const table of TABLES) {
    const { rows } = await src.query(`SELECT * FROM ${quoteIdent(table)}`);
    if (rows.length === 0) {
      console.log(`[${table}] 0 rows — nothing to copy.`);
      continue;
    }

    const columns = Object.keys(rows[0]);
    const colList = columns.map(quoteIdent).join(', ');
    const valuePlaceholders = rows.map((_, i) =>
      columns.map((_, j) => `$${i * columns.length + j + 1}`).join(', ')
    ).join('), (');
    const allValues = rows.flatMap((r) => columns.map((c) => r[c]));

    const sql = `INSERT INTO ${quoteIdent(table)} (${colList}) VALUES (${valuePlaceholders})`;
    await dst.query(sql, allValues);
    console.log(`[${table}] copied ${rows.length} row(s).`);
  }

  // 3. Verify counts.
  console.log('\n--- Verification ---');
  for (const table of TABLES) {
    const s = (await src.query(`SELECT COUNT(*) AS n FROM ${quoteIdent(table)}`)).rows[0];
    const d = (await dst.query(`SELECT COUNT(*) AS n FROM ${quoteIdent(table)}`)).rows[0];
    const ok = s.n === d.n ? 'OK' : 'MISMATCH';
    console.log(`[${table}] source=${s.n} destination=${d.n}  ${ok}`);
  }

  await src.end();
  await dst.end();
  console.log('\nMigration complete.');
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});