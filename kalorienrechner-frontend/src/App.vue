<template>
  <div class="min-h-screen bg-gray-50">
    <Sidebar
      :current-view="currentView"
      :user-goal-data="userGoalData"
      @navigate="handleNavigate"
    />

    <main class="ml-64 px-8 py-8">
      <Dashboard
        v-if="currentView === 'dashboard'"
        :user-goal-data="userGoalData"
        :meals-day="mealsDay"
        @add-food="handleAddFood"
      />

      <Statistics v-else-if="currentView === 'statistics'" />

      <WeightGoal
        v-else-if="currentView === 'weight-goal'"
        :user-goal-data="userGoalData"
        @update="handleGoalUpdate"
      />

      <Settings v-else-if="currentView === 'settings'" />
    </main>

    <FatSecretSearch
      v-if="showFoodSearch"
      :meal-type="selectedMealType"
      @close="showFoodSearch = false"
      @added="loadMeals"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Sidebar from "./components/ui/Sidebar.vue";
import Dashboard from "./components/ui/Dashboard.vue";
import Statistics from "./components/ui/Statistics.vue";
import WeightGoal from "./components/ui/WeightGoal.vue";
import Settings from "./components/ui/Settings.vue";
import FatSecretSearch from "./components/fatSecretSearch.vue";

import type { MealType } from "./types/FoodSearchTypes";
import type { UserGoalData } from "./types/goals";
import type { MealsDayDTO } from "./types/mealsBackend";
import { todayLocalISO } from "./types/mealsBackend";
import { getMealsDay } from "./service/mealsApi";

type View = "dashboard" | "statistics" | "weight-goal" | "settings";

const currentView = ref<View>("dashboard");
const showFoodSearch = ref(false);
const selectedMealType = ref<MealType>("breakfast");
const userGoalData = ref<UserGoalData | null>(null);

// Tagesdaten vom Backend: /api/meals/day
const mealsDay = ref<MealsDayDTO | null>(null);

function handleNavigate(view: View) {
  currentView.value = view;
}

function handleAddFood(mealType: MealType) {
  selectedMealType.value = mealType;
  showFoodSearch.value = true;
}

function handleGoalUpdate(data: UserGoalData) {
  userGoalData.value = data;
}

async function loadMeals() {
  mealsDay.value = await getMealsDay(todayLocalISO());
}

onMounted(() => {
  loadMeals();
});
</script>
