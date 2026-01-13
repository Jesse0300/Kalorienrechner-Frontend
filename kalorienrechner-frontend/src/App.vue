<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Sidebar from "@/components/ui/Sidebar.vue";
import Dashboard from "@/components/ui/Dashboard.vue";
import Statistics from "@/views/Statistics.vue";
import WeightGoal from "@/views/WeightGoal.vue";

import FoodSearch from "@/components/ui/FoodSearch.vue";

import { api } from "@/service/api";

type View = "dashboard" | "statistics" | "weight-goal";
type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

const currentView = ref<View>("dashboard");

const showFoodSearch = ref(false);
const selectedMealType = ref<MealType>("breakfast");

const userGoalData = ref<any | null>(null);
const mealsDay = ref<any | null>(null);

const isAuthed = computed(() => !!localStorage.getItem("jwt"));

async function loadGoal() {
  try {
    const { data } = await api.get("/goals/me");
    userGoalData.value = data;
  } catch {
    userGoalData.value = null;
  }
}

async function loadMealsForToday() {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const { data } = await api.get(`/meals/day?date=${today}`);
    mealsDay.value = data;
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

async function handleDeleteMealItem(id: number) {
  try {
    await api.delete(`/meals/items/${id}`);
    await loadMealsForToday();
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ??
      e?.response?.statusText ??
      e?.message ??
      "Löschen fehlgeschlagen";
    alert(msg);
  }
}

function handleFoodAdded() {
  showFoodSearch.value = false;
  loadMealsForToday();
}

onMounted(async () => {
  if (isAuthed.value) {
    await loadGoal();
    await loadMealsForToday();
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Sidebar v-if="isAuthed" @navigate="handleNavigate" />

    <main class="ml-64 px-8 py-8">
      <Dashboard
        v-if="currentView === 'dashboard'"
        :user-goal-data="userGoalData"
        :meals-day="mealsDay"
        @add-food="handleAddFood"
        @delete-meal-item="handleDeleteMealItem"
      />

      <Statistics v-else-if="currentView === 'statistics'" />

      <WeightGoal v-else-if="currentView === 'weight-goal'" />
    </main>

    <!-- ✅ WICHTIG: FoodSearch.vue statt FoodSearchModal.vue -->
    <FoodSearch
      v-if="showFoodSearch"
      :meal-type="selectedMealType"
      @close="showFoodSearch = false"
      @added="handleFoodAdded"
    />
  </div>
</template>
