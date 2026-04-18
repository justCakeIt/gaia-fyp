export type ConditionMeal = {
  label: "Breakfast" | "Lunch" | "Dinner";
  meal: string;
  notes: string;
};

export type ConditionContent = {
  id: string;
  slug: string;
  title: string;
  aliases: string[];
  supportiveOverview: string;
  disclaimer: string;
  elixir: {
    name: string;
    purpose: string;
    ingredients: string[];
    method: string[];
    safetyNotes: string[];
  };
  dietApproach: {
    name: string;
    summary: string;
    principles: string[];
  };
  oneDayPlan: ConditionMeal[];
  lifestyleTips: string[];
  precautions: string[];
};

export const CONDITION_LIBRARY: ConditionContent[] = [
  {
    id: "fatty-liver",
    slug: "fatty-liver",
    title: "Fatty Liver (MASLD / NAFLD) Support",
    aliases: [
      "fatty liver",
      "fatty liver disease",
      "masld",
      "nafld",
      "nonalcoholic fatty liver disease",
      "metabolic dysfunction associated steatotic liver disease",
      "metabolic associated fatty liver disease",
      "non alcoholic fatty liver disease",
    ],
    supportiveOverview:
      "MASLD/NAFLD means extra fat has built up in the liver. Day-to-day support usually focuses on steady nutrition, movement, sleep, hydration, and reducing metabolic strain. This plan is designed to complement medical care with practical wellness habits.",
    disclaimer:
      "This content is supportive wellness guidance only. It does not diagnose, treat, or cure disease, and it does not replace your clinician's plan. Do not stop medication or change treatment without medical advice.",
    elixir: {
      name: "Ginger Turmeric Citrus Infusion",
      purpose:
        "A caffeine-free supportive drink with warming spices and hydration support.",
      ingredients: [
        "300 ml warm water",
        "1/2 teaspoon turmeric powder",
        "1/2 teaspoon grated fresh ginger",
        "1 pinch black pepper",
        "1 teaspoon lemon juice",
        "Optional: 1 teaspoon chia seeds (soaked)",
      ],
      method: [
        "Warm the water (do not boil).",
        "Whisk in turmeric, ginger, and black pepper.",
        "Rest for 3 to 4 minutes, then add lemon juice.",
        "Sip slowly after breakfast or lunch.",
      ],
      safetyNotes: [
        "Discuss herb use first if you are pregnant, on blood thinners, or have gallbladder disease.",
        "Stop and seek medical advice if you notice intolerance or allergic symptoms.",
      ],
    },
    dietApproach: {
      name: "Mediterranean-style Liver Support Pattern",
      summary:
        "Emphasize fiber-rich plants, lean proteins, unsaturated fats, and steady portions while reducing ultra-processed sugars.",
      principles: [
        "Build meals around vegetables, beans, oats, and whole grains.",
        "Choose fish, poultry, tofu, or legumes for protein.",
        "Use olive oil, nuts, and seeds instead of trans fats.",
        "Limit sugar-sweetened drinks and late-night heavy meals.",
        "Target consistent hydration through the day.",
      ],
    },
    oneDayPlan: [
      {
        label: "Breakfast",
        meal: "Steel-cut oats with berries, chia seeds, and unsweetened yogurt.",
        notes:
          "Provides fiber and protein support for steadier appetite and glycemic response.",
      },
      {
        label: "Lunch",
        meal: "Large mixed salad with chickpeas, quinoa, cucumber, olive oil, and lemon.",
        notes:
          "Supports satiety and micronutrient intake with a high-fiber meal structure.",
      },
      {
        label: "Dinner",
        meal: "Baked salmon (or tofu), roasted broccoli, and a small sweet potato.",
        notes:
          "Balances omega-3-friendly fats, plant fiber, and moderate carbohydrate load.",
      },
    ],
    lifestyleTips: [
      "Aim for 150 minutes per week of moderate movement, including brisk walking.",
      "Prioritize 7 to 9 hours of sleep with a consistent sleep schedule.",
      "Use short stress-regulation routines (breathing, prayer, journaling, gentle yoga).",
      "Track hydration and keep alcohol intake aligned with clinician advice.",
      "Pursue gradual, sustainable weight goals where medically appropriate.",
    ],
    precautions: [
      "Consult a doctor for persistent abdominal pain, jaundice, or severe fatigue.",
      "Seek urgent care for confusion, vomiting blood, black stools, or rapid swelling.",
      "Review all supplements and herbs with your clinician to avoid interactions.",
      "People with diabetes, kidney disease, pregnancy, or complex liver history need individualized medical guidance.",
    ],
  },
];

export function findConditionByQuery(query: string) {
  const normalized = query.trim().toLowerCase();
  return CONDITION_LIBRARY.find((condition) =>
    condition.aliases.some(
      (alias) =>
        alias.includes(normalized) ||
        normalized.includes(alias) ||
        condition.title.toLowerCase().includes(normalized)
    )
  );
}

export function findConditionById(id: string) {
  return CONDITION_LIBRARY.find((condition) => condition.id === id);
}
