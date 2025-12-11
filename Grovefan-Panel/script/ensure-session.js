import pg from "pg";
const { Client } = pg;

async function main() {
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        sid varchar PRIMARY KEY,
        sess json NOT NULL,
        expire timestamp(6) NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_session_expire ON "session" ("expire");
    `);

    await client.end();
    console.log("✅ session table ensured");
  } catch (err) {
    console.error("❌ error ensuring session table:", err.message || err);
    process.exit(1);
  }
}

main();
