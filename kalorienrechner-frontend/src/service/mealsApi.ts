import { api } from "./api";
import type { MealsDayDTO, BackendMealType } from "@/types/mealsBackend";

export async function getMealsDay(dateISO: string): Promise<MealsDayDTO> {
  const res = await api.get("/meals/day", { params: { date: dateISO } });
  return res.data;
}

export async function addMealItem(payload: {
  date: string;
  mealType: BackendMealType;
  foodId: number;
  amountGrams: number;
}): Promise<void> {
  await api.post("/meals/items", payload);
}
