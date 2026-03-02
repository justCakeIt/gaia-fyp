"use strict";

const express = require("express");
const router = express.Router();

const remindersController = require("../controllers/reminders.controller");

// POST /api/reminders
router.post("/", remindersController.create);

// GET /api/reminders?userID=...
router.get("/", remindersController.list);

module.exports = router;