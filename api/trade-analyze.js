export default async function handler(req, res) {
  const { sport, season, week, player_id, game_id, team_id } = req.query;

  // Validate required fields
  if (!sport || !season) {
    return res.status(400).json({
      error: "Missing required parameters",
      message: "You must provide at least sport and season",
      example:
        "/api/trade-analyze?sport=nfl&season=2024&week=1",
    });
  }

  try {
    // Build base endpoint dynamically
    let url = `https://api.clearsportsapi.com/api/v1/${sport}/player-stats?season=${season}`;

    // NFL uses week
    if (week) {
      url += `&week=${week}`;
    }

    if (player_id) {
      url += `&player_id=${player_id}`;
    }

    if (game_id) {
      url += `&game_id=${game_id}`;
    }

    if (team_id) {
      url += `&team_id=${team_id}`;
    }

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
        endpoint_called: url,
      });
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      sport: sport,
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
