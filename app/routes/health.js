"use strict";

const express = require("express");
const db = require("../services/db");

const router = express.Router();

// GET /api/health
router.get("/", async (req, res) => {
  try {
    await db.ping();
    res.json({ ok: true, db: "up" });
  } catch (e) {
    res.status(500).json({ ok: false, db: "down", error: e.message });
  }
});

module.exports = router;