"use strict";

const express = require("express");
const router = express.Router();
const itemsController = require("../controllers/items.controller");

// GET /api/recipes/:id
router.get("/:id", itemsController.recipe);

module.exports = router;
