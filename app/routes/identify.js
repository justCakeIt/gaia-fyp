"use strict";

const express = require("express");
const router = express.Router();
const identifyController = require("../controllers/identify.controller");

// POST /api/identify-ingredient
router.post("/", identifyController.identify);

module.exports = router;
