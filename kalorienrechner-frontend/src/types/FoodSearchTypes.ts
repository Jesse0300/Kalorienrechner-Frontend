export type FoodSearchItem = {
  id: string | number;
  name: string;
  description: string;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
  isFavorite?: boolean;
  raw?: any;
};

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";
