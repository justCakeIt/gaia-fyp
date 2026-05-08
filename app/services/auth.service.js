"use strict";

const usersService = require("./users.service");
const passwordService = require("./password.service");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeName(name) {
  return String(name || "").trim().replace(/\s+/g, " ");
}

function validateEmail(email) {
  if (!email) throw new Error("email is required");
  if (email.length > 255) throw new Error("email must be <= 255 chars");
  if (!EMAIL_REGEX.test(email)) throw new Error("email must be valid");
}

function validatePasswordForRegistration(password) {
  if (!password) throw new Error("password is required");
  if (!STRONG_PASSWORD_REGEX.test(password)) {
    throw new Error(
      "password must be 8-72 characters and include upper, lower, and number"
    );
  }
}

async function register({ email, password, name }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedName = normalizeName(name);

  validateEmail(normalizedEmail);
  validatePasswordForRegistration(password);

  if (!normalizedName) throw new Error("name is required");
  if (normalizedName.length > 120) throw new Error("name must be <= 120 chars");

  const existing = await usersService.findUserByEmail(normalizedEmail);
  if (existing) throw new Error("account with this email already exists");

  const passwordHash = await passwordService.hashPassword(password);
  const user = await usersService.createLocalUser({
    email: normalizedEmail,
    passwordHash,
    userName: normalizedName,
  });

  return user;
}

async function login({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  validateEmail(normalizedEmail);
  if (!password) throw new Error("password is required");

  const user = await usersService.findUserByEmail(normalizedEmail);
  if (!user) throw new Error("Invalid credentials");

  const passwordMatch = await passwordService.verifyPassword(
    password,
    user.passwordHash
  );
  if (!passwordMatch) throw new Error("Invalid credentials");

  return {
    userID: user.userID,
    email: user.email,
    userName: user.userName || user.email.split("@")[0],
  };
}

async function syncGoogleUser({ email, name }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedName = normalizeName(name) || "Gaia Member";

  validateEmail(normalizedEmail);
  if (normalizedName.length > 120) throw new Error("name must be <= 120 chars");

  const existing = await usersService.findUserByEmail(normalizedEmail);
  if (existing) {
    if (!existing.userName && normalizedName) {
      await usersService.updateUserName(existing.userID, normalizedName);
    }

    return {
      userID: existing.userID,
      email: existing.email,
      userName: existing.userName || normalizedName,
      created: false,
    };
  }

  const passwordHash = await passwordService.hashOAuthPlaceholder();
  const created = await usersService.createLocalUser({
    email: normalizedEmail,
    passwordHash,
    userName: normalizedName,
  });

  return {
    ...created,
    created: true,
  };
}

module.exports = {
  register,
  login,
  syncGoogleUser,
};
