export default async function handler(req, res) {
  // Configurações de CORS para não bloquear o front-end
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

  // Chave da API (Substitui pela tua chave do The Odds API ou Football-Data se usares)
  const API_KEY = process.env.ODDS_API_KEY || 'SUA_CHAVE_AQUI';

  try {
    // Exemplo chamando a The Odds API (Premier League / Soccer)
    const apiRes = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=${API_KEY}&regions=eu&markets=h2h`
    );

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: `Erro na API externa: ${apiRes.statusText}` });
    }

    const data = await apiRes.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Erro interno no servidor' });
  }
}
