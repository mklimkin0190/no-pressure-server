import { FastifyRequest, FastifyReply } from 'fastify';
import { Pool } from 'pg';
import { BPReadingRequestBody, BPReadingRequestParams } from '../types';
import { getSession } from '../lib/session';

export const createHandlers = (pool: Pool) => ({
  getAll: async (req: FastifyRequest, res: FastifyReply) => {
    const session = getSession(req);
    if (!session?.user) {
      return res.status(401).send('Unauthorized');
    }
    try {
      const result = await pool.query('SELECT * FROM bp_readings WHERE user_id = $1 ORDER BY time DESC', [session.user.id]);
      return { readings: result.rows };
    } catch (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
  },
  getById: async (req: FastifyRequest<{ Params: BPReadingRequestParams }>, res: FastifyReply) => {
    const session = getSession(req);
    if (!session?.user) {
      return res.status(401).send('Unauthorized');
    }
    const { id } = req.params;
    try {
      const result = await pool.query(
        'SELECT * FROM bp_readings WHERE id = $1 AND user_id = $2',
        [id, session.user.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).send('Reading not found');
      }
      return { reading: result.rows[0] };
    } catch (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
  },
  create: async (req: FastifyRequest<{ Body: BPReadingRequestBody }>, res: FastifyReply) => {
    const session = getSession(req);
    if (!session?.user) {
      return res.status(401).send('Unauthorized');
    }
    const { sys, dia, time } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO bp_readings (sys, dia, time, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [sys, dia, time ? new Date(time) : new Date(), session.user.id]
      );
      return { reading: result.rows[0] };
    } catch (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }

  },
  update: async (req: FastifyRequest<{ Params: BPReadingRequestParams; Body: BPReadingRequestBody }>, res: FastifyReply) => {
    const session = getSession(req);
    if (!session?.user) {
      return res.status(401).send('Unauthorized');
    }
    const { sys, dia, time } = req.body;
    const { id } = req.params;
    try {
      const result = await pool.query(
        'UPDATE bp_readings SET sys = $1, dia = $2, time = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
        [sys, dia, time ? new Date(time) : new Date(), id, session.user.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).send('Reading not found');
      }
      return { reading: result.rows[0] };
    } catch (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
  },
  delete: async (req: FastifyRequest<{ Params: BPReadingRequestParams }>, res: FastifyReply) => {
    const session = getSession(req);
    if (!session?.user) {
      return res.status(401).send('Unauthorized');
    }
    const { id } = req.params;
    try {
      const result = await pool.query(
        'DELETE FROM bp_readings WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, session.user.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).send('Reading not found');
      }
      return { message: 'Reading deleted' };
    } catch (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
  },
});
