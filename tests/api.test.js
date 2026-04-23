"use strict";

/**
 * G.A.I.A. Backend Integration Tests
 *
 * Prerequisites: Docker must be running with the MySQL container up.
 *   docker compose up -d
 *
 * Run with: npm test
 *
 * Tests run in sequence (--runInBand) because later suites depend on
 * state created by earlier ones (userID → planID → reminderID).
 * The afterAll block cleans up all test-created rows in FK-safe order.
 */

require("dotenv").config();

const request = require("supertest");
const app = require("../app/app");
const db = require("../app/services/db");

// Unique email per run — prevents "already exists" failure on repeated runs
const TEST_EMAIL = `test_${Date.now()}@gaia.test`;
const TEST_PASSWORD = "TestUser123!";
const TEST_NAME = "Test Gaia User";

// Shared state written by earlier tests, read by later ones
let testUserID = null;
let testConditionID = null;
let testPlanID = null;
let testReminderID = null;
let testDeletePlanID = null; // created in F, deleted by the deletion test

// ─────────────────────────────────────────────────────────────
// A. Health / API basics
// ─────────────────────────────────────────────────────────────
describe("A. Health endpoints", () => {
  test("GET /api returns ok", async () => {
    const res = await request(app).get("/api");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.api).toBe("up");
  });

  test("GET /api/health returns ok with DB up", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.db).toBe("up");
  });
});

// ─────────────────────────────────────────────────────────────
// B. Conditions
// ─────────────────────────────────────────────────────────────
describe("B. Conditions endpoints", () => {
  test("GET /api/conditions?query=fatty liver returns results", async () => {
    const res = await request(app).get(
      "/api/conditions?query=fatty%20liver"
    );
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty("conditionID");
    expect(res.body.data[0]).toHaveProperty("conditionName");
  });

  test("GET /api/conditions?query= (empty) returns a default list", async () => {
    const res = await request(app).get("/api/conditions");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("GET /api/conditions/match?query=fatty liver matches MASLD condition", async () => {
    const res = await request(app).get(
      "/api/conditions/match?query=fatty%20liver"
    );
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.matched).toBeTruthy();
    expect(res.body.matched.conditionID).toBeGreaterThan(0);
    expect(res.body.matched.conditionName).toMatch(/fatty liver/i);

    // Capture for downstream tests
    testConditionID = res.body.matched.conditionID;
  });

  test("GET /api/conditions/match?query=nafld also matches MASLD via synonym", async () => {
    const res = await request(app).get(
      "/api/conditions/match?query=nafld"
    );
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.matched).toBeTruthy();
    expect(res.body.matched.conditionID).toBe(testConditionID);
  });

  test("GET /api/conditions/match with no query returns 400", async () => {
    const res = await request(app).get("/api/conditions/match");
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test("GET /api/conditions/:id/recommendations returns expected shape", async () => {
    expect(testConditionID).toBeGreaterThan(0);
    const res = await request(app).get(
      `/api/conditions/${testConditionID}/recommendations`
    );
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveProperty("condition");
    expect(res.body.data).toHaveProperty("herbs");
    expect(res.body.data).toHaveProperty("recipes");
    expect(res.body.data).toHaveProperty("mixtures");
    expect(res.body.data).toHaveProperty("safetyNotes");
    expect(Array.isArray(res.body.data.herbs)).toBe(true);
    expect(Array.isArray(res.body.data.recipes)).toBe(true);
    expect(Array.isArray(res.body.data.mixtures)).toBe(true);
    expect(Array.isArray(res.body.data.safetyNotes)).toBe(true);
  });

  test("GET /api/conditions/999999/recommendations returns 404", async () => {
    const res = await request(app).get(
      "/api/conditions/999999/recommendations"
    );
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// C. Auth
// ─────────────────────────────────────────────────────────────
describe("C. Auth endpoints", () => {
  test("POST /api/auth/register creates a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD, name: TEST_NAME });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.userID).toBeGreaterThan(0);
    expect(res.body.data.email).toBe(TEST_EMAIL);

    testUserID = res.body.data.userID;
  });

  test("POST /api/auth/register rejects a duplicate email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD, name: TEST_NAME });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test("POST /api/auth/register rejects a weak password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: `weak_${Date.now()}@gaia.test`, password: "weak", name: "Weak User" });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test("POST /api/auth/login succeeds with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.userID).toBe(testUserID);
    expect(res.body.data.email).toBe(TEST_EMAIL);
    expect(res.body.data).toHaveProperty("userName");
  });

  test("POST /api/auth/login returns 401 for wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_EMAIL, password: "WrongPass99!" });
    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  test("POST /api/auth/login returns 400 for missing email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: TEST_PASSWORD });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// D. Plans
// ─────────────────────────────────────────────────────────────
describe("D. Plans endpoints", () => {
  test("POST /api/plans creates a plan using MASLD recommendations", async () => {
    expect(testUserID).toBeGreaterThan(0);
    expect(testConditionID).toBeGreaterThan(0);

    // Fetch real DB item IDs from recommendations so plan items are valid
    const recsRes = await request(app).get(
      `/api/conditions/${testConditionID}/recommendations`
    );
    expect(recsRes.status).toBe(200);
    const { herbs, recipes, mixtures } = recsRes.body.data;

    const items = [];
    if (herbs.length > 0) items.push({ itemType: "herb", herbID: herbs[0].herbID });
    if (recipes.length > 0) items.push({ itemType: "recipe", recipeID: recipes[0].recipeID });
    if (mixtures.length > 0) items.push({ itemType: "mixture", mixtureID: mixtures[0].mixtureID });
    expect(items.length).toBeGreaterThan(0);

    const res = await request(app)
      .post("/api/plans")
      .send({
        userID: testUserID,
        conditionID: testConditionID,
        title: "Test MASLD Wellness Plan",
        items,
      });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.planID).toBeGreaterThan(0);

    testPlanID = res.body.data.planID;
  });

  test("POST /api/plans returns 400 when items is empty", async () => {
    const res = await request(app)
      .post("/api/plans")
      .send({
        userID: testUserID,
        conditionID: testConditionID,
        title: "No items plan",
        items: [],
      });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test("POST /api/plans returns 400 when title is missing", async () => {
    const res = await request(app)
      .post("/api/plans")
      .send({ userID: testUserID, items: [{ itemType: "herb", herbID: 1 }] });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test("GET /api/plans?userID=... returns the test user's plans", async () => {
    const res = await request(app).get(`/api/plans?userID=${testUserID}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((p) => p.planID === testPlanID)).toBe(true);
  });

  test("GET /api/plans?userID= missing returns 400", async () => {
    const res = await request(app).get("/api/plans");
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test("GET /api/plans/:planID returns plan with items and safety notes", async () => {
    const res = await request(app).get(
      `/api/plans/${testPlanID}?userID=${testUserID}`
    );
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.plan.planID).toBe(testPlanID);
    expect(res.body.data.plan.userID).toBe(testUserID);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data.safetyNotes)).toBe(true);
  });

  test("GET /api/plans/:planID with wrong userID returns 403", async () => {
    const res = await request(app).get(
      `/api/plans/${testPlanID}?userID=999999`
    );
    expect(res.status).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  test("GET /api/plans/999999 returns 404", async () => {
    const res = await request(app).get("/api/plans/999999");
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// E. Reminders
// ─────────────────────────────────────────────────────────────
describe("E. Reminders endpoints", () => {
  test("POST /api/reminders creates a reminder linked to the test plan", async () => {
    expect(testUserID).toBeGreaterThan(0);
    expect(testPlanID).toBeGreaterThan(0);

    const res = await request(app)
      .post("/api/reminders")
      .send({
        userID: testUserID,
        planID: testPlanID,
        label: "Morning wellness check",
        remindTime: "08:00:00",
        dayOfWeek: "Daily",
      });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.reminderID).toBeGreaterThan(0);

    testReminderID = res.body.data.reminderID;
  });

  test("POST /api/reminders returns 403 when planID belongs to a different user", async () => {
    const res = await request(app)
      .post("/api/reminders")
      .send({
        userID: 999999,
        planID: testPlanID,
        label: "Ownership violation attempt",
        remindTime: "09:00:00",
        dayOfWeek: "Daily",
      });
    expect(res.status).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  test("POST /api/reminders returns 404 for a non-existent planID", async () => {
    const res = await request(app)
      .post("/api/reminders")
      .send({
        userID: testUserID,
        planID: 999999,
        label: "No such plan",
        remindTime: "10:00:00",
        dayOfWeek: "Daily",
      });
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
  });

  test("POST /api/reminders returns 400 when label is missing", async () => {
    const res = await request(app)
      .post("/api/reminders")
      .send({ userID: testUserID, planID: testPlanID });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test("GET /api/reminders?userID=... returns the test user's reminders", async () => {
    const res = await request(app).get(
      `/api/reminders?userID=${testUserID}`
    );
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((r) => r.reminderID === testReminderID)).toBe(true);
    // Joined plan title should be present
    const found = res.body.data.find((r) => r.reminderID === testReminderID);
    expect(found).toHaveProperty("planTitle");
  });

  test("DELETE /api/reminders/:id with wrong userID returns 403", async () => {
    const res = await request(app).delete(
      `/api/reminders/${testReminderID}?userID=999999`
    );
    expect(res.status).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  test("DELETE /api/reminders/:id without userID returns 400", async () => {
    const res = await request(app).delete(
      `/api/reminders/${testReminderID}`
    );
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test("DELETE /api/reminders/:id removes the reminder", async () => {
    const res = await request(app).delete(
      `/api/reminders/${testReminderID}?userID=${testUserID}`
    );
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    testReminderID = null;
  });

  test("DELETE /api/reminders/999999 returns 404 for non-existent reminder", async () => {
    const res = await request(app).delete(
      `/api/reminders/999999?userID=${testUserID}`
    );
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// F. Plan deletion
// ─────────────────────────────────────────────────────────────
describe("F. Plan deletion", () => {
  test("setup: creates a throwaway plan for deletion testing", async () => {
    expect(testUserID).toBeGreaterThan(0);
    expect(testConditionID).toBeGreaterThan(0);

    const recsRes = await request(app).get(
      `/api/conditions/${testConditionID}/recommendations`
    );
    expect(recsRes.status).toBe(200);
    const { herbs } = recsRes.body.data;
    expect(herbs.length).toBeGreaterThan(0);

    const res = await request(app)
      .post("/api/plans")
      .send({
        userID: testUserID,
        conditionID: testConditionID,
        title: "Deletion Test Plan",
        items: [{ itemType: "herb", herbID: herbs[0].herbID }],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.planID).toBeGreaterThan(0);
    testDeletePlanID = res.body.data.planID;
  });

  test("DELETE /api/plans/:planID without userID returns 400", async () => {
    expect(testDeletePlanID).toBeGreaterThan(0);
    const res = await request(app).delete(`/api/plans/${testDeletePlanID}`);
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test("DELETE /api/plans/:planID with wrong userID returns 403", async () => {
    expect(testDeletePlanID).toBeGreaterThan(0);
    const res = await request(app).delete(
      `/api/plans/${testDeletePlanID}?userID=999999`
    );
    expect(res.status).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  test("DELETE /api/plans/999999 returns 404", async () => {
    const res = await request(app).delete(
      `/api/plans/999999?userID=${testUserID}`
    );
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
  });

  test("DELETE /api/plans/:planID removes the plan", async () => {
    expect(testDeletePlanID).toBeGreaterThan(0);
    const res = await request(app).delete(
      `/api/plans/${testDeletePlanID}?userID=${testUserID}`
    );
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    testDeletePlanID = null;
  });

  test("GET /api/plans/:planID after deletion returns 404", async () => {
    // testDeletePlanID was just deleted; use a known-absent ID instead
    const res = await request(app).get("/api/plans/999998");
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// Cleanup — runs after all tests in FK-safe deletion order
// ─────────────────────────────────────────────────────────────
afterAll(async () => {
  try {
    // Reminders first (FK → Plans, Users)
    if (testReminderID) {
      await db.query("DELETE FROM Reminders WHERE reminderID = ?", [testReminderID]);
    }
    // Deletion-test plan failsafe (normally already gone after F tests)
    if (testDeletePlanID) {
      await db.query("DELETE FROM PlanItems WHERE planID = ?", [testDeletePlanID]);
      await db.query("DELETE FROM Plans WHERE planID = ?", [testDeletePlanID]);
    }
    // PlanItems before Plans (FK → Plans)
    if (testPlanID) {
      await db.query("DELETE FROM PlanItems WHERE planID = ?", [testPlanID]);
      await db.query("DELETE FROM Plans WHERE planID = ?", [testPlanID]);
    }
    // Users last (Plans.userID FK)
    if (testUserID) {
      await db.query("DELETE FROM Users WHERE userID = ?", [testUserID]);
    }
  } catch (err) {
    console.warn("Test cleanup warning:", err.message);
  } finally {
    // Close the pool so Jest can exit cleanly
    await db.pool.end();
  }
});
