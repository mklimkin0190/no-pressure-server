import Fastify from 'fastify';
import { Pool } from 'pg';
import { registerBPReadingRoutes } from './routes/bpReadings';
import dotenv from 'dotenv';
dotenv.config();

const app = Fastify();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.get('/', async (_, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    return { rows: result.rows };
  } catch (err) {
    console.error(err);
    return res.status(500).send('Database error');
  }
});

registerBPReadingRoutes(app, pool);

app.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
