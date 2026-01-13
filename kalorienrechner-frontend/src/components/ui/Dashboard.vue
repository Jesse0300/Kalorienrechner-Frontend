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
        :consumedCalories="totalConsumed"
        :meals-day="mealsDay"
      />
    </div>

    <!-- Rest bleibt wie bei dir (Heutige Mahlzeiten) -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 class="text-gray-900 mb-4">Heutige Mahlzeiten</h2>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import CalorieOverview from "@/components/ui/CalorieOverview.vue";
import type { UserGoalData } from "@/types/goals";
import type { MealsDayDTO } from "@/types/mealsBackend";

const props = defineProps<{
  userGoalData: UserGoalData | null;
  mealsDay: MealsDayDTO | null;
}>();

const formattedDate = computed(() => {
  const d = new Date();
  return d.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const totalConsumed = computed(() =>
  Math.round(Number(props.mealsDay?.totalCalories ?? 0))
);
</script>
