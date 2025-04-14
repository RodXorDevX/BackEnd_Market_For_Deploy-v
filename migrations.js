const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const migrationSQL = `
  -- Aquí pon tus CREATE TABLE u otras sentencias SQL
  -- Ejemplo básico:
  CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100) UNIQUE
  );
`;

(async () => {
  const client = await pool.connect();
  try {
    await client.query(migrationSQL);
    console.log('✅ Migraciones aplicadas');
  } catch (err) {
    console.error('❌ Error en migraciones:', err);
  } finally {
    client.release();
    pool.end();
  }
})();
