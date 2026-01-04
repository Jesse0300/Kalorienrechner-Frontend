<template>
  <Auth v-if="!isAuthed" @auth-success="onAuthSuccess" />

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
import { onMounted, onUnmounted, ref } from "vue";
import type { UserGoalData } from "./types/goals";
import type { MealsDayDTO } from "./types/meals";
import { api } from "./service/api";
import { getToken } from "./service/auth";

import Auth from "./components/ui/Auth.vue";
import Sidebar from "./components/ui/Sidebar.vue";
import Dashboard from "./components/ui/Dashboard.vue";
import Statistics from "./components/ui/Statistics.vue";
import WeightGoal from "./components/ui/WeightGoal.vue";
import Settings from "./components/ui/Settings.vue";
import FatSecretSearch from "./components/fatSecretSearch.vue";

type View = "dashboard" | "statistics" | "weight-goal" | "settings";
type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

const isAuthed = ref(!!getToken());

function onAuthSuccess() {
  // Token wurde im Auth-Flow gespeichert (localStorage jwt)
  isAuthed.value = true;

  // Optional: nach Login direkt Dashboard
  currentView.value = "dashboard";

  // Optional: Tagesdaten laden
  loadMealsForToday();
}

function onAuthLogout() {
  isAuthed.value = false;
  showFoodSearch.value = false;
  currentView.value = "dashboard";
}

const currentView = ref<View>("dashboard");
const showFoodSearch = ref(false);
const selectedMealType = ref<MealType>("breakfast");

const userGoalData = ref<UserGoalData | null>(null);

// muss an Dashboard übergeben werden
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
    mealsDay.value = null;
  }
}

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

onMounted(() => {
  // Falls Token schon vorhanden (z.B. nach Refresh), bleib eingeloggt
  isAuthed.value = !!getToken();

  // Logout-Event kommt aus axios interceptor (service/api.ts) bei 401
  window.addEventListener("auth-logout", onAuthLogout);

  // Nur laden, wenn eingeloggt
  if (isAuthed.value) loadMealsForToday();
});

onUnmounted(() => {
  window.removeEventListener("auth-logout", onAuthLogout);
});
</script>
