import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || '';
export const sql = connectionString ? postgres(connectionString) : null;
export default sql;
