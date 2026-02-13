export default async function handler(req, res) {

  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { sport, playerId } = req.query;

    if (!sport || !playerId) {
      return res.status(400).json({ error: "Missing sport or playerId" });
    }

    const apiKey = process.env.CLEARSPORTS_API_KEY;

    const response = await fetch(
      `https://api.clearsportsapi.com/v1/${sport}/players/${playerId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      }
    );

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to fetch player data" });
    }

    const data = await response.json();

    // Simple NFL scoring example
    let fantasyPoints = 0;

    if (sport === "nfl") {
      fantasyPoints =
        (data.passing_yards || 0) * 0.04 +
        (data.passing_tds || 0) * 4 +
        (data.rushing_yards || 0) * 0.1 +
        (data.receptions || 0) * 1;
    }

    res.status(200).json({
      player: data.name,
      sport,
      fantasyPoints,
      rawStats: data
    });

  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
}
