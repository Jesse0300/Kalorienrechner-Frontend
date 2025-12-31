export type GoalType = "lose" | "maintain" | "gain" | "muscle";

export interface UserGoalData {
  weight: number;
  goalType: GoalType;
  goalLabel: string;
  targetCalories: number;
  macros: {
    carbs: number;
    fat: number;
    protein: number;
  };
}
