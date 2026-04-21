const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3000/api";

export type BackendConditionMatch = {
  conditionID: number;
  conditionName: string;
  description: string;
  category: string;
  matchType: string;
  matchedOn: string;
};

export type BackendHerb = {
  herbID: number;
  herbName: string;
  latinName: string | null;
  overview: string | null;
  usageNotes: string | null;
  recommendationLevel: "recommended" | "neutral" | "avoid" | "unknown";
  linkNotes: string | null;
};

export type BackendRecipe = {
  recipeID: number;
  recipeName: string;
  description: string | null;
  prepTime: number | null;
  dietTags: string | null;
  notes: string | null;
  ingredients: string | null;
  instructions: string | null;
  linkNotes: string | null;
};

export type BackendMixture = {
  mixtureID: number;
  mixtureName: string;
  purpose: string;
  instructions: string | null;
};

export type BackendSafetyNote = {
  safetyNoteID: number;
  herbID: number | null;
  mixtureID: number | null;
  warningType: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  instructions: string | null;
};

export type BackendRecommendations = {
  condition: {
    conditionID: number;
    conditionName: string;
    description: string;
    category: string;
  };
  herbs: BackendHerb[];
  recipes: BackendRecipe[];
  mixtures: BackendMixture[];
  safetyNotes: BackendSafetyNote[];
};

export async function matchCondition(
  query: string
): Promise<BackendConditionMatch | null> {
  try {
    const res = await fetch(
      `${API_BASE}/conditions/match?query=${encodeURIComponent(query)}`
    );
    if (!res.ok) return null;
    const payload = await res.json();
    if (!payload.ok || !payload.matched) return null;
    return payload.matched as BackendConditionMatch;
  } catch {
    return null;
  }
}

export async function getRecommendations(
  conditionID: number
): Promise<BackendRecommendations | null> {
  try {
    const res = await fetch(`${API_BASE}/conditions/${conditionID}/recommendations`);
    if (!res.ok) return null;
    const payload = await res.json();
    if (!payload.ok || !payload.data) return null;
    return payload.data as BackendRecommendations;
  } catch {
    return null;
  }
}

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

export async function fetchUserPlans(userID: number): Promise<UserPlan[]> {
  try {
    const res = await fetch(`${API_BASE}/plans?userID=${userID}`);
    if (!res.ok) return [];
    const payload = await res.json();
    if (!payload.ok) return [];
    return payload.data as UserPlan[];
  } catch {
    return [];
  }
}

export async function fetchUserReminders(userID: number): Promise<UserReminder[]> {
  try {
    const res = await fetch(`${API_BASE}/reminders?userID=${userID}`);
    if (!res.ok) return [];
    const payload = await res.json();
    if (!payload.ok) return [];
    return payload.data as UserReminder[];
  } catch {
    return [];
  }
}

export async function deleteReminder(
  reminderID: number
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/reminders/${reminderID}`, {
      method: "DELETE",
    });
    const payload = await res.json();
    if (!res.ok || !payload.ok) {
      return { ok: false, error: payload.error ?? "Failed to delete reminder." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reach the server." };
  }
}

export type PlanItem = {
  itemType: "herb" | "recipe" | "mixture";
  herbID?: number;
  recipeID?: number;
  mixtureID?: number;
  scheduleHint?: string;
};

export type SavePlanPayload = {
  userID: number;
  conditionID: number | null;
  title: string;
  items: PlanItem[];
};

export type SavePlanResult =
  | { ok: true; planID: number }
  | { ok: false; error: string };

export async function savePlan(payload: SavePlanPayload): Promise<SavePlanResult> {
  try {
    const res = await fetch(`${API_BASE}/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error ?? "Failed to save plan." };
    }
    return { ok: true, planID: data.data.planID };
  } catch {
    return { ok: false, error: "Could not reach the server. Check your connection." };
  }
}

export type CreateReminderPayload = {
  userID: number;
  planID: number;
  label: string;
  remindTime: string | null;
  dayOfWeek: string | null;
};

export type CreateReminderResult =
  | { ok: true; reminderID: number }
  | { ok: false; error: string };

export async function createReminder(
  payload: CreateReminderPayload
): Promise<CreateReminderResult> {
  try {
    const res = await fetch(`${API_BASE}/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error ?? "Failed to create reminder." };
    }
    return { ok: true, reminderID: data.data.reminderID };
  } catch {
    return { ok: false, error: "Could not reach the server. Check your connection." };
  }
}
