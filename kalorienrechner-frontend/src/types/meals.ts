export interface MealItemDTO {
  id: number;
  foodId: number;
  name: string;
  amountGrams: number;
  calories: number;
  carbs?: number;
  fat?: number;
  protein?: number;
}

export interface MealSummaryDTO {
  totalCalories: number;
  items: MealItemDTO[];
}

/**
 * Backend liefert aktuell ein DTO mit:
 * - date
 * - totalCalories
 * - meals (Map/Record je MealType)
 *
 * Wir tippen meals absichtlich flexibel als Record<string,...>,
 * damit es unabhängig davon funktioniert, ob die Keys "BREAKFAST" oder "breakfast" heißen.
 */
export interface MealsDayDTO {
  date: string;
  totalCalories: number;
  meals: Record<string, MealSummaryDTO>;
}
