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
      />
    </div>

    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 class="text-gray-900 mb-4">Heutige Mahlzeiten</h2>

      <!-- Frühstück -->
      <section class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-gray-900">Frühstück</h3>
            <p class="text-gray-500 text-sm">
              {{ mealConsumed("BREAKFAST") }} / {{ mealTargets.breakfast }} kcal
            </p>
          </div>
          <button
            class="px-4 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 transition"
            @click="emit('add-food', 'breakfast')"
          >
            Hinzufügen
          </button>
        </div>

        <ul v-if="mealItems('BREAKFAST').length" class="mt-3 space-y-2">
          <li
            v-for="it in mealItems('BREAKFAST')"
            :key="it.id"
            class="flex items-center justify-between rounded-xl border border-gray-100 p-3"
          >
            <div class="min-w-0">
              <p class="text-gray-900 text-sm truncate">{{ it.foodName }}</p>
              <p class="text-gray-500 text-xs">{{ it.amountGrams }} g</p>
            </div>
            <div class="text-gray-900 text-sm whitespace-nowrap">
              {{ Math.round(it.calories) }} kcal
            </div>
          </li>
        </ul>
        <p v-else class="mt-3 text-gray-400 text-sm">Noch nichts hinzugefügt.</p>
      </section>

      <!-- Mittag -->
      <section class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-gray-900">Mittagessen</h3>
            <p class="text-gray-500 text-sm">
              {{ mealConsumed("LUNCH") }} / {{ mealTargets.lunch }} kcal
            </p>
          </div>
          <button
            class="px-4 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 transition"
            @click="emit('add-food', 'lunch')"
          >
            Hinzufügen
          </button>
        </div>

        <ul v-if="mealItems('LUNCH').length" class="mt-3 space-y-2">
          <li
            v-for="it in mealItems('LUNCH')"
            :key="it.id"
            class="flex items-center justify-between rounded-xl border border-gray-100 p-3"
          >
            <div class="min-w-0">
              <p class="text-gray-900 text-sm truncate">{{ it.foodName }}</p>
              <p class="text-gray-500 text-xs">{{ it.amountGrams }} g</p>
            </div>
            <div class="text-gray-900 text-sm whitespace-nowrap">
              {{ Math.round(it.calories) }} kcal
            </div>
          </li>
        </ul>
        <p v-else class="mt-3 text-gray-400 text-sm">Noch nichts hinzugefügt.</p>
      </section>

      <!-- Abend -->
      <section class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-gray-900">Abendessen</h3>
            <p class="text-gray-500 text-sm">
              {{ mealConsumed("DINNER") }} / {{ mealTargets.dinner }} kcal
            </p>
          </div>
          <button
            class="px-4 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 transition"
            @click="emit('add-food', 'dinner')"
          >
            Hinzufügen
          </button>
        </div>

        <ul v-if="mealItems('DINNER').length" class="mt-3 space-y-2">
          <li
            v-for="it in mealItems('DINNER')"
            :key="it.id"
            class="flex items-center justify-between rounded-xl border border-gray-100 p-3"
          >
            <div class="min-w-0">
              <p class="text-gray-900 text-sm truncate">{{ it.foodName }}</p>
              <p class="text-gray-500 text-xs">{{ it.amountGrams }} g</p>
            </div>
            <div class="text-gray-900 text-sm whitespace-nowrap">
              {{ Math.round(it.calories) }} kcal
            </div>
          </li>
        </ul>
        <p v-else class="mt-3 text-gray-400 text-sm">Noch nichts hinzugefügt.</p>
      </section>

      <!-- Snacks -->
      <section>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-gray-900">Snacks</h3>
            <p class="text-gray-500 text-sm">
              {{ mealConsumed("SNACK") }} / {{ mealTargets.snacks }} kcal
            </p>
          </div>
          <button
            class="px-4 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 transition"
            @click="emit('add-food', 'snacks')"
          >
            Hinzufügen
          </button>
        </div>

        <ul v-if="mealItems('SNACK').length" class="mt-3 space-y-2">
          <li
            v-for="it in mealItems('SNACK')"
            :key="it.id"
            class="flex items-center justify-between rounded-xl border border-gray-100 p-3"
          >
            <div class="min-w-0">
              <p class="text-gray-900 text-sm truncate">{{ it.foodName }}</p>
              <p class="text-gray-500 text-xs">{{ it.amountGrams }} g</p>
            </div>
            <div class="text-gray-900 text-sm whitespace-nowrap">
              {{ Math.round(it.calories) }} kcal
            </div>
          </li>
        </ul>
        <p v-else class="mt-3 text-gray-400 text-sm">Noch nichts hinzugefügt.</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import CalorieOverview from "./CalorieOverview.vue";
import type { UserGoalData } from "../../types/goals";
import type { MealsDayDTO, BackendMealType } from "../../types/mealsBackend";

const props = defineProps<{
  userGoalData: UserGoalData | null;
  mealsDay: MealsDayDTO | null;
}>();

const emit = defineEmits<{
  (e: "add-food", mealType: "breakfast" | "lunch" | "dinner" | "snacks"): void;
}>();

const formattedDate = computed(() => {
  const d = new Date();
  return d.toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
});

const totalConsumed = computed(() => Math.round(Number(props.mealsDay?.totalCalories ?? 0)));

function mealItems(key: BackendMealType) {
  return props.mealsDay?.meals?.[key]?.items ?? [];
}

function mealConsumed(key: BackendMealType) {
  const v = props.mealsDay?.meals?.[key]?.totalCalories ?? 0;
  return Math.round(Number(v) || 0);
}

// Zielaufteilung (wie in deinem bisherigen Ansatz)
const mealTargets = computed(() => {
  const target = props.userGoalData?.targetCalories ?? 2000;
  return {
    breakfast: Math.round(target * 0.25),
    lunch: Math.round(target * 0.3),
    dinner: Math.round(target * 0.35),
    snacks: Math.round(target * 0.1),
  };
});
</script>
