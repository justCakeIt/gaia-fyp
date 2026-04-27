"use strict";

const express = require("express");

const healthRoutes = require("./health");
const conditionsRoutes = require("./conditions");
const plansRoutes = require("./plans");
const remindersRoutes = require("./reminders");
const authRoutes = require("./auth");
const identifyRoutes = require("./identify");
const recipesRoutes = require("./recipes");
const mixturesRoutes = require("./mixtures");

const router = express.Router();

router.get("/", (req, res) => res.json({ ok: true, api: "up" }));

router.use("/health", healthRoutes);
router.use("/conditions", conditionsRoutes);
router.use("/plans", plansRoutes);
router.use("/reminders", remindersRoutes);
router.use("/auth", authRoutes);
router.use("/identify-ingredient", identifyRoutes);
router.use("/recipes", recipesRoutes);
router.use("/mixtures", mixturesRoutes);

module.exports = router;
