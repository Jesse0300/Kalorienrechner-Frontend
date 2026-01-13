export type BackendMealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
export type FrontendMealType = "breakfast" | "lunch" | "dinner" | "snacks";

export type MealItemDTO = {
  id: number;
  foodId: number | null;
  foodName: string;
  amountGrams: number;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
};

export type MealSummaryDTO = {
  totalCalories: number;
  items: MealItemDTO[];
};

export type MealsDayDTO = {
  date: string; // LocalDate -> "YYYY-MM-DD"
  totalCalories: number;
  meals: Partial<Record<BackendMealType, MealSummaryDTO>>;
};

/**
 * ✅ Wird von fatSecretSearch.vue genutzt:
 * Frontend ("snacks") -> Backend ("SNACK")
 */
export function toBackendMealType(t: FrontendMealType): BackendMealType {
  if (t === "snacks") return "SNACK";
  return t.toUpperCase() as BackendMealType;
}

/**
 * ✅ Wird von fatSecretSearch.vue genutzt:
 * heutiges Datum als YYYY-MM-DD (lokal)
 */
export function todayLocalISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
