const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  try {
    const bancaResult = await pool.query('SELECT * FROM challenge_banca ORDER BY id DESC LIMIT 1');
    const apostasResult = await pool.query('SELECT * FROM apostas ORDER BY data_jogo DESC');
    
    const apostas = apostasResult.rows;
    
    let totalStaked = 0;
    let totalReturn = 0;
    let wins = 0;
    let finishedCount = 0;

    apostas.forEach(aposta => {
      if (aposta.estado === 'GANHA' || aposta.estado === 'PERDIDA') {
        finishedCount++;
        totalStaked += Number(aposta.stake);
        if (aposta.estado === 'GANHA') {
          wins++;
          totalReturn += Number(aposta.odd) * Number(aposta.stake);
        }
      }
    });

    const winRate = finishedCount > 0 ? ((wins / finishedCount) * 100).toFixed(1) : 0;
    const profit = totalReturn - totalStaked;
    const roi = totalStaked > 0 ? ((profit / totalStaked) * 100).toFixed(1) : 0;

    res.status(200).json({
      banca: bancaResult.rows[0] || null,
      apostas: apostas,
      stats: {
        winRate,
        roi,
        wins,
        losses: finishedCount - wins,
        totalFinished: finishedCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
