"use strict";

const conditionsService = require("../services/conditions.service");

function toInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// GET /api/conditions?query=...
async function search(req, res, next) {
  try {
    const query = String(req.query.query || "").trim();
    const data = await conditionsService.searchConditions(query);
    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

// GET /api/conditions/match?query=...
async function match(req, res, next) {
  try {
    const query = String(req.query.query || "").trim();
    if (!query) {
      return res.status(400).json({ ok: false, error: "query is required" });
    }

    const matched = await conditionsService.matchCondition(query);
    return res.json({ ok: true, matched }); // matched can be null
  } catch (e) {
    next(e);
  }
}

// GET /api/conditions/:id/recommendations
async function recommendations(req, res, next) {
  try {
    const conditionID = toInt(req.params.id);
    if (!conditionID) {
      return res.status(400).json({ ok: false, error: "invalid condition id" });
    }

    const data = await conditionsService.getRecommendations(conditionID);

    if (!data) {
      return res.status(404).json({ ok: false, error: "condition not found" });
    }

    console.log(`[recommendations] condition ${conditionID} ("${data.condition.conditionName}") — herbs:${data.herbs.length} recipes:${data.recipes.length} mixtures:${data.mixtures.length} safety:${data.safetyNotes.length}`);

    return res.json({ ok: true, data });
  } catch (err) {
    console.error("RECOMMENDATIONS ERROR:", err);
    next(err);
  }
}

module.exports = { search, match, recommendations };