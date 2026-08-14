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
      liga: 'Premier League',
      equipas: 'Arsenal vs Chelsea',
      opcoes: [
        { label: 'Vitória Casa (1)', odd: 1.95 },
        { label: 'Empate (X)', odd: 3.50 },
        { label: 'Vitória Fora (2)', odd: 3.80 }
      ]
    },
    {
      liga: 'La Liga',
      equipas: 'Real Madrid vs Barcelona',
      opcoes: [
        { label: 'Vitória Casa (1)', odd: 2.20 },
        { label: 'Empate (X)', odd: 3.40 },
        { label: 'Vitória Fora (2)', odd: 3.10 }
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

    const matches = rawMatches.map((m, index) => {
      const code = m.competition?.code || '';
      const compName = m.competition?.name || '';
      let categoriaLiga = 'Outras Ligas';

      if (code === 'PPL' || compName.includes('Portugal') || compName.includes('Primeira')) {
        categoriaLiga = 'Liga Portugal';
      } else if (code === 'PL' || compName.includes('Premier League')) {
        categoriaLiga = 'Premier League';
      } else if (code === 'PD' || compName.includes('Primera Division') || compName.includes('La Liga')) {
        categoriaLiga = 'La Liga';
      }

      const home = m.homeTeam?.name || 'Casa';
      const away = m.awayTeam?.name || 'Fora';

      return {
        liga: categoriaLiga,
        equipas: `${home} vs ${away}`,
        opcoes: [
          { label: 'Vitória Casa (1)', odd: (1.50 + (index % 5) * 0.2).toFixed(2) },
          { label: 'Empate (X)', odd: (3.10 + (index % 3) * 0.2).toFixed(2) },
          { label: 'Vitória Fora (2)', odd: (2.10 + (index % 4) * 0.3).toFixed(2) }
        ]
      };
    });

    const finalMatches = matches.length > 0 ? matches : defaultMatches;
    return res.status(200).json(finalMatches);
  } catch (error) {
    return res.status(200).json(defaultMatches);
  }
}
