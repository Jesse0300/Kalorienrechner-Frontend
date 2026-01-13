<script setup lang="ts">
import { computed } from "vue";
import type { MealsDayDTO } from "@/types/mealsBackend";
import type { UserGoalData } from "@/types/goals";

const props = defineProps<{
  targetCalories?: number;
  userGoalData?: UserGoalData | null;
  consumedCalories?: number;
  mealsDay?: MealsDayDTO | null;
}>();

const macroConsumed = computed(() => {
  let carbs = 0, fat = 0, protein = 0;

  const meals = props.mealsDay?.meals ?? {};
  Object.values(meals).forEach(summary => {
    summary?.items.forEach(i => {
      carbs += i.carbs;
      fat += i.fat;
      protein += i.protein;
    });
  });

  return {
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    protein: Math.round(protein)
  };
});
</script>
