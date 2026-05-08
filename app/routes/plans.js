"use strict";

const express = require("express");
const router = express.Router();

const plansController = require("../controllers/plans.controller");

// POST /api/plans
router.post("/", plansController.create);

// GET /api/plans?userID=...
router.get("/", plansController.list);

// GET /api/plans/:planID
router.get("/:planID", plansController.getOne);

// DELETE /api/plans/:planID
router.delete("/:planID", plansController.remove);

module.exports = router;