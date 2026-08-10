import { Router } from "express";

const router = Router();

/**
 * GET /v1/geocode/reverse?lat=...&lon=...
 *
 * Server-side proxy to Nominatim's reverse geocoding API.
 * Proxying avoids CORS — Nominatim does not send Access-Control-Allow-Origin
 * headers, so direct browser fetches are blocked.
 */
router.get("/v1/geocode/reverse", async (req, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);

  if (
    isNaN(lat) || isNaN(lon) ||
    lat < -90 || lat > 90 ||
    lon < -180 || lon > 180
  ) {
    res.status(400).json({ error: "Invalid lat/lon parameters" });
    return;
  }

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

  try {
    const upstream = await fetch(url, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "TreasureTots/1.0 (contact@treasuretots.in)",
      },
    });

    if (!upstream.ok) {
      res
        .status(502)
        .json({ error: `Nominatim returned HTTP ${upstream.status}` });
      return;
    }

    const data = await upstream.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Failed to reach geocoding service" });
  }
});

export default router;
