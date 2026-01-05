<template>
  <Auth v-if="!isAuthed" @auth-success="onAuthSuccess" />

  <div v-else class="min-h-screen bg-gray-50">
    <Sidebar
      :current-view="currentView"
      :user-goal-data="userGoalData"
      :current-user-label="currentUserLabel"
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
      :mealType="selectedMealType"
      @close="showFoodSearch = false"
      @added="handleFoodAdded"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import type { UserGoalData } from "./types/goals";
import type { MealsDayDTO } from "./types/mealsBackend";
import { api } from "./service/api";
import { getToken, getCurrentUserLabel, clearToken } from "./service/auth";

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
const currentUserLabel = ref<string | null>(getCurrentUserLabel());

function onAuthSuccess() {
  isAuthed.value = true;
  currentUserLabel.value = getCurrentUserLabel();
  currentView.value = "dashboard";
  loadMealsForToday();
}

function onAuthLogout() {
  clearToken();
  isAuthed.value = false;
  currentUserLabel.value = null;
  showFoodSearch.value = false;
  currentView.value = "dashboard";
}

const currentView = ref<View>("dashboard");
const showFoodSearch = ref(false);
const selectedMealType = ref<MealType>("breakfast");

const userGoalData = ref<UserGoalData | null>(null);
const mealsDay = ref<MealsDayDTO | null>(null);

function isoDate(d: Date) {
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

async function handleFoodAdded() {
  await loadMealsForToday();
  showFoodSearch.value = false;
}

onMounted(() => {
  isAuthed.value = !!getToken();
  currentUserLabel.value = getCurrentUserLabel();

  window.addEventListener("auth-logout", onAuthLogout);

  if (isAuthed.value) loadMealsForToday();
});

onUnmounted(() => {
  window.removeEventListener("auth-logout", onAuthLogout);
});
</script>
