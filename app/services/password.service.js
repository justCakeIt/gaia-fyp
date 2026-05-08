"use strict";

const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const SALT_ROUNDS = 12;

async function hashPassword(plainText) {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

async function verifyPassword(plainText, hash) {
  return bcrypt.compare(plainText, hash);
}

async function hashOAuthPlaceholder() {
  const randomSecret = crypto.randomBytes(24).toString("hex");
  return bcrypt.hash(randomSecret, SALT_ROUNDS);
}

module.exports = {
  hashPassword,
  verifyPassword,
  hashOAuthPlaceholder,
};
