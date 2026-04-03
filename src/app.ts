import Fastify from 'fastify';
import { Pool } from 'pg';

const app = Fastify();

require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    return { rows: result.rows };
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.listen({ port: 3000 });
