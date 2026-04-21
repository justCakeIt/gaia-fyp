"use strict";

const remindersService = require("../services/reminders.service");

function toInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// POST /api/reminders
async function create(req, res, next) {
  try {
    const body = req.body || {};
    const userID = toInt(body.userID);
    const planID = toInt(body.planID);

    const label = typeof body.label === "string" ? body.label.trim() : "";
    const remindTime = body.remindTime ?? null; // 'HH:MM:SS' or 'HH:MM'
    const dayOfWeek = typeof body.dayOfWeek === "string" ? body.dayOfWeek.trim() : null;
    const enabled = body.enabled === undefined || body.enabled === null ? 1 : body.enabled ? 1 : 0;

    if (!userID) return res.status(400).json({ ok: false, error: "userID is required" });
    if (!planID) return res.status(400).json({ ok: false, error: "planID is required" });
    if (!label) return res.status(400).json({ ok: false, error: "label is required" });

    const created = await remindersService.createReminder({
      userID,
      planID,
      label,
      remindTime,
      dayOfWeek,
      enabled,
    });

    return res.status(201).json({ ok: true, data: created });
  } catch (e) {
    next(e);
  }
}

// GET /api/reminders?userID=...
async function list(req, res, next) {
  try {
    const userID = toInt(req.query.userID);
    if (!userID) return res.status(400).json({ ok: false, error: "userID is required" });

    const data = await remindersService.listReminders(userID);
    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

// DELETE /api/reminders/:id
async function remove(req, res, next) {
  try {
    const reminderID = toInt(req.params.id);
    if (!reminderID) {
      return res.status(400).json({ ok: false, error: "invalid reminderID" });
    }
    const deleted = await remindersService.deleteReminder(reminderID);
    if (!deleted) {
      return res.status(404).json({ ok: false, error: "reminder not found" });
    }
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

module.exports = { create, list, remove };