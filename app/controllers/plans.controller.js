"use strict";

const plansService = require("../services/plans.service");

function toInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// POST /api/plans
async function create(req, res, next) {
  try {
    const body = req.body || {};

    const userID = toInt(body.userID);
    const conditionID =
      body.conditionID === null || body.conditionID === undefined
        ? null
        : toInt(body.conditionID);

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const items = Array.isArray(body.items) ? body.items : [];

    if (!userID) return res.status(400).json({ ok: false, error: "userID is required" });
    if (!title) return res.status(400).json({ ok: false, error: "title is required" });

    // If provided but invalid (e.g. "abc"), reject
    if (body.conditionID !== null && body.conditionID !== undefined && conditionID === null) {
      return res.status(400).json({
        ok: false,
        error: "conditionID must be a positive integer or null",
      });
    }

    if (!items.length) {
      return res.status(400).json({ ok: false, error: "items must be a non-empty array" });
    }

    const created = await plansService.createPlan({ userID, conditionID, title, items });
    return res.status(201).json({ ok: true, data: created });
  } catch (e) {
    next(e);
  }
}

// GET /api/plans?userID=...
async function list(req, res, next) {
  try {
    const userID = toInt(req.query.userID);
    if (!userID) return res.status(400).json({ ok: false, error: "userID is required" });

    const data = await plansService.listPlans(userID);
    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

// GET /api/plans/:planID
async function getOne(req, res, next) {
  try {
    const planID = toInt(req.params.planID);
    if (!planID) return res.status(400).json({ ok: false, error: "invalid planID" });

    const data = await plansService.getPlan(planID);
    if (!data) return res.status(404).json({ ok: false, error: "plan not found" });

    // If the caller supplies a userID, cross-check ownership
    const requestedUserID = toInt(req.query.userID);
    if (requestedUserID && data.plan.userID !== requestedUserID) {
      return res.status(403).json({ ok: false, error: "access denied" });
    }

    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

// DELETE /api/plans/:planID
async function remove(req, res, next) {
  try {
    const planID = toInt(req.params.planID);
    if (!planID) return res.status(400).json({ ok: false, error: "invalid planID" });

    const userID = toInt(req.query.userID);
    if (!userID) return res.status(400).json({ ok: false, error: "userID is required" });

    const ownerUserID = await plansService.getPlanOwner(planID);
    if (ownerUserID === null) return res.status(404).json({ ok: false, error: "plan not found" });
    if (ownerUserID !== userID) return res.status(403).json({ ok: false, error: "access denied" });

    await plansService.deletePlan(planID);
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

module.exports = { create, list, getOne, remove };