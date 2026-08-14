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

  // Jogos de fallback estruturados exatamente como o teu renderJogos() espera (com .equipas e .opcoes)
  const defaultMatches = [
    {
      liga: 'Liga Portugal',
      equipas: 'Benfica vs Porto',
      opcoes: [
        { label: 'Vitória Casa (1)', odd: 2.10 },
        { label: 'Empate (X)', odd: 3.20 },
        { label: 'Vitória Fora (2)', odd: 3.40 }
      ]
    },
    {
      liga: 'Liga Portugal',
      equipas: 'Sporting vs Braga',
      opcoes: [
        { label: 'Vitória Casa (1)', odd: 1.75 },
        { label: 'Empate (X)', odd: 3.60 },
        { label: 'Vitória Fora (2)', odd: 4.50 }
      ]
    },
    {
      liga: 'Premier League',
      equipas: 'Arsenal vs Chelsea',
      opcoes: [
        { label: 'Vitória Casa (1)', odd: 1.95 },
        { label: 'Empate (X)', odd: 3.50 },
        { label: 'Vitória Fora (2)', odd: 3.80 }
      ]
    }
  ];

  try {
    const apiRes = await fetch('https://api.football-data.org/v4/matches?status=SCHEDULED', {
      headers: { 'X-Auth-Token': API_KEY }
    });

    if (!apiRes.ok) {
      return res.status(200).json(defaultMatches);
    }

    const data = await apiRes.json();
    const rawMatches = data.matches || [];

    const matches = rawMatches.map((m) => {
      const home = m.homeTeam?.name || 'Casa';
      const away = m.awayTeam?.name || 'Fora';
      return {
        liga: m.competition?.name || 'Outras Ligas',
        equipas: `${home} vs ${away}`,
        opcoes: [
          { label: 'Vitória Casa (1)', odd: 1.90 },
          { label: 'Empate (X)', odd: 3.40 },
          { label: 'Vitória Fora (2)', odd: 3.10 }
        ]
      };
    });

    const finalMatches = matches.length > 0 ? matches : defaultMatches;
    return res.status(200).json(finalMatches);
  } catch (error) {
    return res.status(200).json(defaultMatches);
  }
}
