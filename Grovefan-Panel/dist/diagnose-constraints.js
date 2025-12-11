// Grovefan-Panel/script/diagnose-constraints.js
// Prints constraints that reference a column named "id" so we can see which table/PK is blocking Drizzle.
//
// This script uses DATABASE_URL environment variable. It prints JSON to stdout so you can copy it from Render logs.

import pg from "pg";
const { Client } = pg;

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error(JSON.stringify({ error: "DATABASE_URL not set" }));
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // safe for hosted DBs which require SSL
  });

  try {
    await client.connect();

    // Query constraints that include a column named 'id'
    const q = `
      SELECT
        nsp.nspname AS schema,
        cls.relname AS table_name,
        att.attname AS column_name,
        con.conname AS constraint_name,
        con.contype AS constraint_type,
        pg_get_constraintdef(con.oid) AS definition
      FROM pg_constraint con
      JOIN pg_class cls ON cls.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = cls.relnamespace
      LEFT JOIN pg_attribute att ON att.attrelid = cls.oid AND att.attnum = ANY(con.conkey)
      WHERE att.attname = 'id'
      ORDER BY schema, table_name;
    `;

    const res = await client.query(q);

    const rows = res.rows.map(r => ({
      schema: r.schema,
      table: r.table_name,
      column: r.column_name,
      constraint: r.constraint_name,
      constraint_type: r.constraint_type,
      definition: r.definition
    }));

    console.log("=== DIAGNOSE-CONSTRAINTS-START ===");
    console.log(JSON.stringify({ found: rows }, null, 2));
    console.log("=== DIAGNOSE-CONSTRAINTS-END ===");

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error("=== DIAGNOSE-CONSTRAINTS-ERROR ===");
    console.error(JSON.stringify({ error: String(err) }, null, 2));
    console.error("=== DIAGNOSE-CONSTRAINTS-END ===");
    try { await client.end(); } catch {}
    process.exit(1);
  }
}

run();
