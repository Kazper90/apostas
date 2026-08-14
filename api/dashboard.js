const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const banca = await pool.query('SELECT * FROM challenge_banca ORDER BY id DESC LIMIT 1');
      const apostas = await pool.query('SELECT * FROM apostas ORDER BY data_jogo DESC');

      res.status(200).json({
        banca: banca.rows[0],
        apostas: apostas.rows
      });
    } catch (err) {
      res.status(500).json({ error: 'Erro de ligação à base de dados' });
    }
  }
}
