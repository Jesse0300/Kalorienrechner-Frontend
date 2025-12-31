<template>
  <div class="p-8 max-w-7xl mx-auto">
    <div class="mb-6">
      <h1 class="text-gray-900 mb-1">Heute</h1>
      <p class="text-gray-500">{{ formattedDate }}</p>
    </div>

    <div class="mb-6">
      <CalorieOverview
        :targetCalories="userGoalData?.targetCalories"
        :userGoalData="userGoalData"
      />
    </div>

    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
      <h2 class="text-gray-900 mb-4">Heutige Mahlzeiten</h2>

      <div class="space-y-4">
        <div>
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-gray-700">Frühstück</h3>
            <button
              @click="emit('add-food', 'breakfast')"
              class="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 transition-colors"
            >
              <span class="text-lg">＋</span>
              <span class="text-sm">Hinzufügen</span>
            </button>
          </div>
          <p class="text-gray-500 text-sm">
            0 / {{ mealCalories.breakfast }} kcal
          </p>
        </div>

        <div class="border-t border-gray-100 pt-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-gray-700">Mittagessen</h3>
            <button
              @click="emit('add-food', 'lunch')"
              class="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 transition-colors"
            >
              <span class="text-lg">＋</span>
              <span class="text-sm">Hinzufügen</span>
            </button>
          </div>
          <p class="text-gray-500 text-sm">
            0 / {{ mealCalories.lunch }} kcal
          </p>
        </div>

        <div class="border-t border-gray-100 pt-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-gray-700">Abendessen</h3>
            <button
              @click="emit('add-food', 'dinner')"
              class="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 transition-colors"
            >
              <span class="text-lg">＋</span>
              <span class="text-sm">Hinzufügen</span>
            </button>
          </div>
          <p class="text-gray-500 text-sm">
            0 / {{ mealCalories.dinner }} kcal
          </p>
        </div>

        <div class="border-t border-gray-100 pt-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-gray-700">Snacks</h3>
            <button
              @click="emit('add-food', 'snacks')"
              class="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 transition-colors"
            >
              <span class="text-lg">＋</span>
              <span class="text-sm">Hinzufügen</span>
            </button>
          </div>
          <p class="text-gray-500 text-sm">
            0 / {{ mealCalories.snacks }} kcal
          </p>
        </div>
      </div>
    </div>

    <StreakCard />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { UserGoalData } from "../../types/goals.ts"; // Mmt. ungenutzt
import CalorieOverview from "./CalorieOverview.vue";
import StreakCard from "./StreakCard.vue";

type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

const props = defineProps<{
  userGoalData: UserGoalData | null;
}>();

const emit = defineEmits<{
  (e: "add-food", mealType: MealType): void;
}>();

const today = new Date();

const formattedDate = computed(() =>
  new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(today)
);

const targetCalories = computed(
  () => props.userGoalData?.targetCalories ?? 2000
);

const mealCalories = computed(() => ({
  breakfast: Math.round(targetCalories.value * 0.25),
  lunch: Math.round(targetCalories.value * 0.35),
  dinner: Math.round(targetCalories.value * 0.3),
  snacks: Math.round(targetCalories.value * 0.1),
}));

const mealCaloriesValue = mealCalories;
</script>

<script lang="ts">
export default {
  computed: {
    mealCalories() {
      return (this as any).mealCaloriesValue;
    },
  },
};
</script>
