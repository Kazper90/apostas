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

  // Lista base de jogos com todos os campos possíveis
  const defaultList = [
    { id: 1, liga: 'Liga Portugal', ligaCategory: 'Liga Portugal', league: 'Liga Portugal', home: 'Benfica', away: 'Porto', homeTeam: 'Benfica', awayTeam: 'Porto', data: '15/08/2026', hora: '20:30', odds: { home: '2.10', draw: '3.20', away: '3.40', 1: '2.10', X: '3.20', 2: '3.40' } },
    { id: 2, liga: 'Liga Portugal', ligaCategory: 'Liga Portugal', league: 'Liga Portugal', home: 'Sporting', away: 'Braga', homeTeam: 'Sporting', awayTeam: 'Braga', data: '16/08/2026', hora: '18:00', odds: { home: '1.75', draw: '3.60', away: '4.50', 1: '1.75', X: '3.60', 2: '4.50' } },
    { id: 3, liga: 'Premier League', ligaCategory: 'Premier League', league: 'Premier League', home: 'Arsenal', away: 'Chelsea', homeTeam: 'Arsenal', awayTeam: 'Chelsea', data: '15/08/2026', hora: '17:30', odds: { home: '1.95', draw: '3.50', away: '3.80', 1: '1.95', X: '3.50', 2: '3.80' } },
    { id: 4, liga: 'La Liga', ligaCategory: 'La Liga', league: 'La Liga', home: 'Real Madrid', away: 'Barcelona', homeTeam: 'Real Madrid', awayTeam: 'Barcelona', data: '16/08/2026', hora: '21:00', odds: { home: '2.20', draw: '3.40', away: '3.10', 1: '2.20', X: '3.40', 2: '3.10' } }
  ];

  try {
    const apiRes = await fetch('https://api.football-data.org/v4/matches?status=SCHEDULED', {
      headers: { 'X-Auth-Token': API_KEY }
    });

    let matches = [];

    if (apiRes.ok) {
      const data = await apiRes.json();
      const rawMatches = data.matches || [];

      matches = rawMatches.map((m, index) => {
        const code = m.competition?.code || '';
        let ligaCat = 'Outras Ligas';
        
        if (code === 'PPL') ligaCat = 'Liga Portugal';
        else if (code === 'PL') ligaCat = 'Premier League';
        else if (code === 'PD') ligaCat = 'La Liga';

        return {
          id: m.id || index + 1,
          liga: m.competition?.name || 'Futebol Internacional',
          ligaCategory: ligaCat,
          league: m.competition?.name || 'Futebol Internacional',
          home: m.homeTeam?.name || 'Equipa Casa',
          away: m.awayTeam?.name || 'Equipa Fora',
          homeTeam: m.homeTeam?.name || 'Equipa Casa',
          awayTeam: m.awayTeam?.name || 'Equipa Fora',
          data: m.utcDate ? new Date(m.utcDate).toLocaleDateString('pt-PT') : 'Hoje',
          hora: m.utcDate ? new Date(m.utcDate).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '20:00',
          odds: {
            home: (1.50 + (index % 5) * 0.22).toFixed(2),
            draw: (3.10 + (index % 3) * 0.25).toFixed(2),
            away: (2.10 + (index % 4) * 0.35).toFixed(2),
            1: (1.50 + (index % 5) * 0.22).toFixed(2),
            X: (3.10 + (index % 3) * 0.25).toFixed(2),
            2: (2.10 + (index % 4) * 0.35).toFixed(2)
          }
        };
      });
    }

    const finalArray = matches.length > 0 ? matches : defaultList;

    // Resposta em OBJETO cobrindo todas as chaves onde o front-end pode procurar o array
    return res.status(200).json({
      matches: finalArray,
      jogos: finalArray,
      data: finalArray,
      games: finalArray,
      items: finalArray
    });
  } catch (error) {
    return res.status(200).json({
      matches: defaultList,
      jogos: defaultList,
      data: defaultList,
      games: defaultList,
      items: defaultList
    });
  }
}
