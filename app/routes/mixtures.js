"use strict";

const express = require("express");
const router = express.Router();
const itemsController = require("../controllers/items.controller");

// GET /api/mixtures/:id
router.get("/:id", itemsController.mixture);

module.exports = router;
