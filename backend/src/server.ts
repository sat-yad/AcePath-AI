import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import pool from './db/client';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // Check DB connection
    const client = await pool.connect();
    console.log('[DB] Connected to PostgreSQL');
    client.release();

    app.listen(PORT, () => {
      console.log(`[SERVER] AcePath AI Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[SERVER] Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
