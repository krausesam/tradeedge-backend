export default async function handler(req, res) {
  const { season, week, player_id, game_id, team_id } = req.query;

  // Require at least season + week to prevent empty calls
  if (!season || !week) {
    return res.status(400).json({
      error: "Missing required parameters",
      message: "You must provide at least season and week",
      example:
        "/api/trade-analyze?season=2024&week=1",
    });
  }

  try {
    const url = `https://api.clearsportsapi.com/api/v1/nfl/player-stats?season=${season}&week=${week}${
      player_id ? `&player_id=${player_id}` : ""
    }${game_id ? `&game_id=${game_id}` : ""}${
      team_id ? `&team_id=${team_id}` : ""
    }`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.CLEARSPORTS_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: "ClearSports API error",
        status: response.status,
        details: errorText,
      });
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      endpoint_called: url,
      data: data,
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
}
