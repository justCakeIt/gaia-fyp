console.log("API FILE LOADED");

// =====================================================
// API BASE RESOLUTION (STABLE + ENV FIRST + DYNAMIC)
// =====================================================

function getApiBase(): string {
  // allow manual override if explicitly set
  if (process.env.NEXT_PUBLIC_API_BASE) {
    return process.env.NEXT_PUBLIC_API_BASE;
  }

  // dynamic resolution (works for localhost, LAN, hotspot)
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3000/api`;
  }

  // fallback (SSR)
  return "http://localhost:3000/api";
}

const API_BASE = getApiBase();

// =====================================================
// SAFE FETCH WRAPPER
// =====================================================

async function safeFetch(url: string, options: RequestInit = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    return res;
  } catch (err) {
    console.error("Network error:", url, err);

    return new Response(
      JSON.stringify({ ok: false, error: "Network error" }),
      { status: 500 }
    );
  }
}

// =====================================================
// TYPES
// =====================================================

export type UserPlan = {
  planID: number;
  userID: number;
  conditionID: number | null;
  title: string;
};

export type UserReminder = {
  reminderID: number;
  userID: number;
  planID: number | null;
  label: string;
  remindTime: string | null;
  dayOfWeek: string | null;
  enabled: number;
  planTitle: string | null;
};

export type BackendConditionMatch = {
  conditionID: number;
  conditionName: string;
  description: string;
  category?: string;
};

export type BackendRecommendations = {
  condition: {
    conditionID: number;
    conditionName: string;
    description: string;
    category: string;
  };
  herbs: any[];
  recipes: any[];
  mixtures: any[];
  safetyNotes: any[];
  disclaimer: string;
};

// =====================================================
// CONDITION MATCH
// =====================================================

export async function matchCondition(query: string): Promise<BackendConditionMatch | null> {
  const res = await safeFetch(
    `${API_BASE}/conditions/match?query=${encodeURIComponent(query)}`
  );

  if (!res.ok) return null;

  const data = await res.json();

  if (!data?.ok || !data?.matched) return null;

  return data.matched;
}

// =====================================================
// RECOMMENDATIONS
// =====================================================

export async function getRecommendations(
  conditionID: number
): Promise<BackendRecommendations | null> {
  const res = await safeFetch(
    `${API_BASE}/conditions/${conditionID}/recommendations`
  );

  if (!res.ok) return null;

  const data = await res.json();

  if (!data?.ok || !data?.data) return null;

  return data.data;
}

// =====================================================
// INGREDIENT IDENTIFIER
// =====================================================

export type IdentifyResultData = {
  name: string;
  latinName: string;
  confidence: number;
  description: string;
  caution?: string;
};

export async function identifyIngredient(
  payload: { image?: string; name?: string }
): Promise<IdentifyResultData | null> {
  const res = await safeFetch(`${API_BASE}/identify-ingredient`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) return null;

  const data = await res.json();

  if (!data?.ok || !data?.data) return null;

  return data.data;
}

// =====================================================
// MIXTURE DETAIL
// =====================================================

export type BackendMixtureHerb = {
  herbID: number;
  herbName: string;
  latinName: string;
  amount?: string;
  unit?: string;
  role?: string;
};

export type BackendMixtureSafetyNote = {
  noteID: number;
  content: string;
  severity: "low" | "medium" | "high" | "critical";
};

export type BackendMixtureDetail = {
  mixtureID: number;
  mixtureName: string;
  purpose: string;
  instructions: string;
  dosage?: string;
  herbs: BackendMixtureHerb[];
  safetyNotes: BackendMixtureSafetyNote[];
};

export async function getMixture(
  mixtureID: number
): Promise<BackendMixtureDetail | null> {
  console.log("GET MIXTURE CALLED");

  const res = await safeFetch(`${API_BASE}/mixtures/${mixtureID}`);

  if (!res.ok) return null;

  const data = await res.json();

  if (!data?.ok || !data?.data) return null;

  return data.data;
}

// =====================================================
// RECIPE DETAIL
// =====================================================

export type BackendRecipeDetail = {
  recipeID: number;
  recipeName: string;
  ingredients: string;
  instructions: string;
  prepTime?: string;
  dietTags?: string;
};

export async function getRecipe(
  recipeID: number
): Promise<BackendRecipeDetail | null> {
  const res = await safeFetch(`${API_BASE}/recipes/${recipeID}`);

  if (!res.ok) return null;

  const data = await res.json();

  if (!data?.ok || !data?.data) return null;

  return data.data;
}

// =====================================================
// USER DATA
// =====================================================

export async function fetchUserPlans(userID: number): Promise<UserPlan[]> {
  const res = await safeFetch(`${API_BASE}/plans?userID=${userID}`);
  if (!res.ok) return [];

  const data = await res.json();
  return data?.data ?? [];
}

export async function fetchUserReminders(userID: number): Promise<UserReminder[]> {
  const res = await safeFetch(`${API_BASE}/reminders?userID=${userID}`);
  if (!res.ok) return [];

  const data = await res.json();
  return data?.data ?? [];
}

// =====================================================
// SAVE PLAN
// =====================================================

export async function savePlan(payload: any) {
  const res = await safeFetch(`${API_BASE}/plans`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.ok) {
    return { ok: false, error: data.error };
  }

  return {
    ok: true,
    planID: data.data?.planID,
  };
}

// =====================================================
// CREATE REMINDER
// =====================================================

export async function createReminder(payload: any) {
  const res = await safeFetch(`${API_BASE}/reminders`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.ok) {
    return { ok: false, error: data.error };
  }

  return {
    ok: true,
    reminderID: data.data?.reminderID,
  };
}

// =====================================================
// DELETE
// =====================================================

export async function deletePlan(planID: number, userID: number) {
  const res = await safeFetch(
    `${API_BASE}/plans/${planID}?userID=${userID}`,
    { method: "DELETE" }
  );

  return await res.json();
}

export async function deleteReminder(reminderID: number, userID: number) {
  const res = await safeFetch(
    `${API_BASE}/reminders/${reminderID}?userID=${userID}`,
    { method: "DELETE" }
  );

  return await res.json();
}