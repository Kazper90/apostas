export default async function handler(req, res) {
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
    const apiRes = await fetch('https://api.football-data.org/v4/matches?status=SCHEDULED', {
      headers: { 'X-Auth-Token': API_KEY }
    });

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: `Erro na API: ${apiRes.statusText}` });
    }

    const data = await apiRes.json();
    
    // Mapeia e formata os jogos recebidos para o formato que o index.html precisa
    const matchesFormatados = (data.matches || []).slice(0, 15).map((m, index) => {
      return {
        id: m.id || index + 1,
        liga: m.competition?.name || "Liga Principal",
        ligaCode: m.competition?.code || "OUTRAS",
        home: m.homeTeam?.name || "Equipa Casa",
        away: m.awayTeam?.name || "Equipa Fora",
        data: m.utcDate ? new Date(m.utcDate).toLocaleDateString('pt-PT') : 'Hoje',
        hora: m.utcDate ? new Date(m.utcDate).toLocaleTimeString('pt-PT', {hour: '2-digit', minute:'2-digit'}) : '20:00',
        odds: {
          home: (1.50 + (index % 5) * 0.25).toFixed(2),
          draw: (3.10 + (index % 3) * 0.20).toFixed(2),
          away: (2.10 + (index % 4) * 0.30).toFixed(2)
        }
      };
    });

    return res.status(200).json(matchesFormatados);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Erro interno no servidor' });
  }
}
