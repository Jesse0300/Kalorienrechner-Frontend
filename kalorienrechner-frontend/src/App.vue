<template>
  <!-- Wenn nicht eingeloggt: immer Auth anzeigen -->
  <Auth v-if="!isAuthenticated" @auth-success="handleAuthSuccess" />

  <!-- Wenn eingeloggt: normale App -->
  <div v-else class="min-h-screen bg-gray-50">
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
import { onMounted, onUnmounted, ref } from "vue";
import type { UserGoalData } from "./types/goals";
import { getToken, logout } from "./service/auth";

import Auth from "./components/Auth.vue";
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

// Auth Gate
const isAuthenticated = ref(!!getToken());

function handleAuthSuccess() {
  isAuthenticated.value = true;
}

// Wird vom api.ts Response-Interceptor bei 401 ausgelöst
function handleAuthLogoutEvent() {
  logout();
  isAuthenticated.value = false;
  currentView.value = "dashboard";
  showFoodSearch.value = false;
}

onMounted(() => {
  window.addEventListener("auth-logout", handleAuthLogoutEvent);
});

onUnmounted(() => {
  window.removeEventListener("auth-logout", handleAuthLogoutEvent);
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
