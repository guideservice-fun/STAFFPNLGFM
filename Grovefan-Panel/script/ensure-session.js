cd Grovefan-Panel \
&& npm install \
&& cat > ensure-session.js <<'JS'
const { Client } = require('pg');
(async () => {
  try {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
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
    console.log('✅ session table ensured');
  } catch (e) {
    console.error('❌ ensure-session failed:', e);
    process.exit(1);
  }
})();
JS
&& node ensure-session.js \
&& npx drizzle-kit push \
&& npm run build \
&& mkdir -p dist \
&& touch dist/table.sql
