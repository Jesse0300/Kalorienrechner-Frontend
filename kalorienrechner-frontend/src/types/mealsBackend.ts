export type BackendMealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
export type FrontendMealType = "breakfast" | "lunch" | "dinner" | "snacks";

export type MealItemDTO = {
  id: number;
  foodId: number;
  foodName: string;
  amountGrams: number;
  calories: number;
};

export type MealSummaryDTO = {
  totalCalories: number;
  items: MealItemDTO[];
};

export type MealsDayDTO = {
  date: string; // "YYYY-MM-DD" oder ISO vom Backend (LocalDate)
  totalCalories: number;
  meals: Partial<Record<BackendMealType, MealSummaryDTO>>;
};

export function toBackendMealType(t: FrontendMealType): BackendMealType {
  if (t === "snacks") return "SNACK";
  return t.toUpperCase() as BackendMealType;
}

export function todayLocalISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
