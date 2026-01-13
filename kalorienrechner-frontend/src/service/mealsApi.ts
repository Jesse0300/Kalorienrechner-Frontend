import { api } from "./api";
import type { MealsDayDTO } from "@/types/mealsBackend";

export async function getMealsForDay(date: string) {
  const res = await api.get<MealsDayDTO>("/meals/day", {
    params: { date }
  });
  return res.data;
}
