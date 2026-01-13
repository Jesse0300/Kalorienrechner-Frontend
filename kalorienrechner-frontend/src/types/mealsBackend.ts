export type BackendMealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

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
  date: string;
  totalCalories: number;
  meals: Partial<Record<BackendMealType, MealSummaryDTO>>;
};
