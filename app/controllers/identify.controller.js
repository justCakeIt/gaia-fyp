"use strict";

// Demo mode: ingredient identification is a showcase feature.
// No external API key is required — the frontend returns the demo result
// client-side, but this endpoint remains available for direct API access.
async function identify(req, res, next) {
  try {
    const { imageBase64 } = req.body ?? {};

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({ ok: false, error: "imageBase64 is required" });
    }

    return res.json({
      ok: true,
      data: {
        configured: true,
        name: "Milk Thistle",
        latinName: "Silybum marianum",
        confidence: "high",
        description:
          "A hepatoprotective herb traditionally associated with liver support. Rich in silymarin — a flavonoid complex with antioxidant properties, commonly included in MASLD wellness protocols.",
        caution:
          "Demo mode — this is a simulated example result.",
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { identify };
