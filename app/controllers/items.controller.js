"use strict";

const itemsService = require("../services/items.service");

function toInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function recipe(req, res, next) {
  try {
    const recipeID = toInt(req.params.id);
    if (!recipeID) {
      return res.status(400).json({ ok: false, error: "invalid recipe id" });
    }
    const data = await itemsService.getRecipeByID(recipeID);
    if (!data) {
      return res.status(404).json({ ok: false, error: "recipe not found" });
    }
    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

async function mixture(req, res, next) {
  try {
    const mixtureID = toInt(req.params.id);
    if (!mixtureID) {
      return res.status(400).json({ ok: false, error: "invalid mixture id" });
    }
    const data = await itemsService.getMixtureByID(mixtureID);
    if (!data) {
      return res.status(404).json({ ok: false, error: "mixture not found" });
    }
    return res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

module.exports = { recipe, mixture };
