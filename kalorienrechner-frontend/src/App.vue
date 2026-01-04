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
        @goal-update="handleGoalUpdate"
      />

      <Settings v-else-if="currentView === 'settings'" />
    </main>

    <FatSecretSearch
      v-if="showFoodSearch"
      :meal-type="selectedMealType"
      @close="showFoodSearch = false"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { UserGoalData } from "./types/goals";
import type { MealsDayDTO } from "./types/meals";
import { api } from "./service/api";

import Sidebar from "./components/ui/Sidebar.vue";
import Dashboard from "./components/ui/Dashboard.vue";
import Statistics from "./components/ui/Statistics.vue";
import WeightGoal from "./components/ui/WeightGoal.vue";
import Settings from "./components/ui/Settings.vue";
import FatSecretSearch from "./components/fatSecretSearch.vue";

type View = "dashboard" | "statistics" | "weight-goal" | "settings";
type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

const currentView = ref<View>("dashboard");
const showFoodSearch = ref(false);
const selectedMealType = ref<MealType>("breakfast");

const userGoalData = ref<UserGoalData | null>(null);

// NEU: muss an Dashboard übergeben werden
const mealsDay = ref<MealsDayDTO | null>(null);

function isoDate(d: Date) {
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

async function loadMealsForToday() {
  try {
    const res = await api.get<MealsDayDTO>("/meals/day", {
      params: { date: isoDate(new Date()) },
    });
    mealsDay.value = res.data;
  } catch {
    // Falls Backend (noch) nicht erreichbar oder Endpoint nicht fertig:
    mealsDay.value = null;
  }
}

onMounted(() => {
  // Wenn du das (noch) nicht willst, kannst du diese Zeile auch erstmal auskommentieren.
  loadMealsForToday();
});

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
</script>
