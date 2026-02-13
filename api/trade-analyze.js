export default async function handler(req, res) {
  try {
    const { sport, season, week } = req.query;

    if (!sport) {
      return res.status(400).json({ error: "Sport is required" });
    }

    const API_KEY = process.env.CLEARSPORTS_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "Missing ClearSports API key" });
    }

    // =========================
    // Use current year automatically
    // Allow override if ?season= is passed
    // =========================
    const currentYear = new Date().getFullYear();
    const selectedSeason = season || currentYear;

    let url = "";

    // =========================
    // NBA PLAYER STATS
    // =========================
    if (sport === "nba") {
      url = `https://api.clearsportsapi.com/api/v1/nba/player-stats?season=${selectedSeason}`;
    }

    // =========================
    // NFL PLAYER STATS
    // =========================
    else if (sport === "nfl") {
      url = `https://api.clearsportsapi.com/api/v1/nfl/player-stats?season=${selectedSeason}`;
      if (week) {
        url += `&week=${week}`;
      }
    }

    // =========================
    // MLB (Players endpoint available)
    // =========================
    else if (sport === "mlb") {
      url = `https://api.clearsportsapi.com/api/v1/mlb/players`;
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

    const data = await response.json();

    return res.status(200).json({
      success: true,
      sport,
      season: selectedSeason,
      endpoint_called: url,
      data
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
