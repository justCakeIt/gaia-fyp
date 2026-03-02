"use strict";

const express = require("express");

const healthRoutes = require("./health");
const conditionsRoutes = require("./conditions");
const plansRoutes = require("./plans");
const remindersRoutes = require("./reminders");

const router = express.Router();

router.get("/", (req, res) => res.json({ ok: true, api: "up" }));

router.use("/health", healthRoutes);
router.use("/conditions", conditionsRoutes);
router.use("/plans", plansRoutes);
router.use("/reminders", remindersRoutes);

module.exports = router;