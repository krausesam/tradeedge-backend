export default async function handler(req, res) {
  try {
    const { sport, season, week, team_id } = req.query;

    if (!sport) {
      return res.status(400).json({ error: "Sport is required" });
    }

    const API_KEY = process.env.CLEARSPORTS_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "Missing ClearSports API key" });
    }

    const currentYear = new Date().getFullYear();
    const selectedSeason = season || currentYear;

    let url = "";

    // ================= NBA =================
    if (sport === "nba") {
      url = `https://api.clearsportsapi.com/api/v1/nba/player-stats?season=${selectedSeason}`;
    }

    // ================= NFL =================
    else if (sport === "nfl") {
      url = `https://api.clearsportsapi.com/api/v1/nfl/player-stats?season=${selectedSeason}`;
      if (week) {
        url += `&week=${week}`;
      }
    }

    // ================= MLB =================
    else if (sport === "mlb") {
      url = `https://api.clearsportsapi.com/api/v1/mlb/players`;

      // Add team filter if provided
      if (team_id) {
        url += `?team_id=${team_id}`;
      }
    }

    else {
      return res.status(400).json({ error: "Unsupported sport" });
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: "ClearSports API error",
        status: response.status,
        details: errorText,
        endpoint_called: url
      });
    }

    const raw = await response.json();

    // 🔥 Normalize player array
    let players = [];

    if (sport === "nba") {
      players = raw.data?.basketball_player_stats || [];
    }

    if (sport === "nfl") {
      players = raw.data?.football_player_stats || [];
    }

    if (sport === "mlb") {
      players = raw.data?.baseball_players || raw.data?.players || [];
    }

    return res.status(200).json({
      success: true,
      sport,
      season: sport === "mlb" ? null : selectedSeason,
      players,
      total_players: players.length
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
