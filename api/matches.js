export default async function handler(req, res) {
  // Configurações de CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const API_KEY = process.env.FOOTBALL_DATA_KEY || 'e89eb735584b4ec4a5aca34fa4e91e53';

  try {
    // Pedido filtrado pelos próximos jogos agendados (compatível com o plano grátis)
    const apiRes = await fetch('https://api.football-data.org/v4/matches?status=SCHEDULED', {
      headers: {
        'X-Auth-Token': API_KEY
      }
    });

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ 
        error: `Erro na Football-Data.org: ${apiRes.statusText}` 
      });
    }

    const data = await apiRes.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Erro interno no servidor' });
  }
}
