import postgres from 'postgres';

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.SUPABASE_DB_URL ||
  '';

export const sql = connectionString ? postgres(connectionString, { max: 5, idle_timeout: 20 }) : null;
export default sql;
