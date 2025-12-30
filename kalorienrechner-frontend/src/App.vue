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
import { ref } from "vue";
import type { UserGoalData } from "./types/goals";

import Sidebar from "./components/Sidebar.vue";
import Dashboard from "./components/Dashboard.vue";
import Statistics from "./components/Statistics.vue";
import WeightGoal from "./components/WeightGoal.vue";
import Settings from "./components/Settings.vue";
import FatSecretSearch from "./components/ui/fatSecretSearch.vue";

type View = "dashboard" | "statistics" | "weight-goal" | "settings";
type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

const currentView = ref<View>("dashboard");
const showFoodSearch = ref(false);
const selectedMealType = ref<MealType>("breakfast");
const userGoalData = ref<UserGoalData | null>(null);

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
