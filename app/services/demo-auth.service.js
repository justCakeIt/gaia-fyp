"use strict";

const usersService = require("./users.service");
const passwordService = require("./password.service");

function readFlag(name, fallback) {
  const value = process.env[name];
  if (value == null) return fallback;
  return !["0", "false", "no", "off"].includes(String(value).toLowerCase());
}

async function ensureDemoAccount() {
  const enabled = readFlag("AUTH_DEMO_USER_ENABLED", true);
  if (!enabled) return null;

  const email = String(process.env.AUTH_DEMO_USER_EMAIL || "demo@gaia.local")
    .trim()
    .toLowerCase();
  const password = String(process.env.AUTH_DEMO_USER_PASSWORD || "GaiaDemo123!");
  const userName = String(process.env.AUTH_DEMO_USER_NAME || "Gaia Demo User")
    .trim()
    .slice(0, 120);

  if (!email || !password || !userName) {
    throw new Error("demo auth configuration is incomplete");
  }

  const passwordHash = await passwordService.hashPassword(password);
  const existing = await usersService.findUserByEmail(email);

  if (existing) {
    await usersService.updatePasswordHash(existing.userID, passwordHash);
    await usersService.updateUserName(existing.userID, userName);
    return { email, password, created: false };
  }

  await usersService.createLocalUser({
    email,
    passwordHash,
    userName,
  });

  return { email, password, created: true };
}

async function ensureDemoAccountWithRetry(options = {}) {
  const retries = Number.isInteger(options.retries) ? options.retries : 8;
  const delayMs = Number.isInteger(options.delayMs) ? options.delayMs : 1500;

  let lastError = null;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await ensureDemoAccount();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new Error("failed to ensure demo account");
}

module.exports = {
  ensureDemoAccount,
  ensureDemoAccountWithRetry,
};
