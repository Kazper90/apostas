export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const API_KEY = process.env.FOOTBALL_DATA_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'Chave de API não configurada.' });
  }

  const headers = { 'X-Auth-Token': API_KEY };

  async function getTeamForm(teamId) {
    try {
      const response = await fetch(`https://api.football-data.org/v4/teams/${teamId}/matches?status=FINISHED&limit=5`, { headers });
      const data = await response.json();

      if (!data.matches) return ["E", "E", "E", "E", "E"];

      return data.matches.map(m => {
        const isHome = m.homeTeam.id === teamId;
        const homeScore = m.score.fullTime.home;
        const awayScore = m.score.fullTime.away;

        if (homeScore === awayScore) return "E";
        if (isHome) return homeScore > awayScore ? "V" : "D";
        return awayScore > homeScore ? "V" : "D";
      });
    } catch (e) {
      return ["E", "E", "E", "E", "E"];
    }
  }

  try {
    const responsePPL = await fetch('https://api.football-data.org/v4/competitions/PPL/matches?status=SCHEDULED', { headers });
    const dataPPL = await responsePPL.json();

    const matchesList = dataPPL.matches ? dataPPL.matches.slice(0, 5) : [];

    const formattedMatches = await Promise.all(matchesList.map(async (m, index) => {
      const [hForm, aForm] = await Promise.all([
        getTeamForm(m.homeTeam.id),
        getTeamForm(m.awayTeam.id)
      ]);

      return {
        id: m.id || index + 1,
        liga: "Portugal",
        equipas: `${m.homeTeam.shortName || m.homeTeam.name} vs ${m.awayTeam.shortName || m.awayTeam.name}`,
        homeTeam: m.homeTeam.shortName || m.homeTeam.name,
        awayTeam: m.awayTeam.shortName || m.awayTeam.name,
        hForm: hForm.length ? hForm : ["V", "E", "V", "D", "V"],
        aForm: aForm.length ? aForm : ["D", "E", "V", "E", "D"],
        opcoes: [
          { label: `Vitória ${m.homeTeam.shortName || 'Casa'} (1)`, odd: 1.85 },
          { label: "Ambas Marcam (Sim)", odd: 1.75 },
          { label: "Over 2.5 Golos", odd: 1.80 }
        ]
      };
    }));

    res.status(200).json(formattedMatches);

  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar dados em tempo real', details: error.message });
  }
}
