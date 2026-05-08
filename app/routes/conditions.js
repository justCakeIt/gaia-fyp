"use strict";

const express = require("express");
const router = express.Router();

const conditionsController = require("../controllers/conditions.controller");

// GET /api/conditions?query=...
router.get("/", conditionsController.search);

// GET /api/conditions/match?query=...
router.get("/match", conditionsController.match);

// GET /api/conditions/:id/recommendations
router.get("/:id/recommendations", conditionsController.recommendations);

module.exports = router;