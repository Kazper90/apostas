const { Pool } = require('pg');
const axios = require('axios');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // Segurança: só aceita pedidos se vierem com uma chave secreta que tu defines
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    // 1. Busca apostas que ainda estão 'EM JOGO' e que têm um api_id
    const apostas = await pool.query("SELECT * FROM apostas WHERE estado = 'EM JOGO' AND api_id IS NOT NULL");
    
    for (let aposta of apostas.rows) {
      // 2. Consulta a API de Futebol (Exemplo com API-Football)
      const response = await axios.get(`https://v3.football.api-sports.io/fixtures?id=${aposta.api_id}`, {
        headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY }
      });

      const match = response.data.response[0];
      if (match.fixture.status.short === 'FT') { // FT = Full Time (Jogo terminado)
        const homeGoals = match.goals.home;
        const awayGoals = match.goals.away;
        
        // Lógica simples: Define aqui como vais validar a vitória
        // Nota: Isto depende da tua "selecao" (1, X, 2). Precisarias de uma lógica mais avançada aqui.
        const resultado = (homeGoals > awayGoals) ? '1' : (homeGoals === awayGoals ? 'X' : '2');
        const estadoFinal = (aposta.selecao === resultado) ? 'GANHA' : 'PERDIDA';

        await pool.query("UPDATE apostas SET estado = $1 WHERE id = $2", [estadoFinal, aposta.id]);
      }
    }
    res.status(200).json({ message: 'Sincronização concluída' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
