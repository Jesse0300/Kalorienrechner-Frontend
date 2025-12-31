<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-gray-900 mb-2">Gewicht & Ziel</h1>
      <p class="text-gray-600">
        Gib dein Gewicht und dein Ziel ein, um deinen täglichen Kalorienbedarf zu
        berechnen.
      </p>
    </div>

    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-gray-700 mb-2">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-gray-500">⚖️</span>
              <span>Aktuelles Gewicht</span>
            </div>
          </label>
          <div class="relative">
            <input
              type="number"
              v-model="weight"
              placeholder="75"
              min="0"
              step="0.1"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <span
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >kg</span
            >
          </div>
        </div>

        <div>
          <label class="block text-gray-700 mb-2">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-gray-500">🎯</span>
              <span>Dein Ziel</span>
            </div>
          </label>
          <select
            v-model="goal"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
          >
            <option v-for="option in goalOptions" :key="option.id" :value="option.id">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <button
        @click="handleCalculate"
        :disabled="!weight || parseFloat(weight) <= 0"
        class="w-full px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Kalorien berechnen
      </button>
    </div>

    <div
      v-if="calculatedCalories !== null"
      class="bg-gradient-to-br from-cyan-50 to-slate-50 rounded-2xl p-6 border border-cyan-100"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-gray-900">Dein täglicher Kalorienbedarf</h2>
        <div class="px-3 py-1 bg-white rounded-full text-sm text-gray-600">
          {{ currentGoalLabel }}
        </div>
      </div>

      <div class="mb-4">
        <div class="text-5xl font-bold text-cyan-600 mb-2">
          {{ formattedCalories }}
          <span class="text-2xl text-gray-600 ml-2">kcal</span>
        </div>
        <p class="text-gray-600">
          {{ currentGoalDescription }}
        </p>
      </div>

      <div class="bg-white rounded-xl p-4 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Gewicht:</span>
          <span class="text-gray-900">{{ weight }} kg</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Grundumsatz (geschätzt):</span>
          <span class="text-gray-900">{{ baseCalories }} kcal</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Mit Aktivität (Faktor 1.4):</span>
          <span class="text-gray-900">{{ withActivityCalories }} kcal</span>
        </div>
      </div>
    </div>

    <div class="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
      <p class="text-sm text-gray-700">
        <span class="font-semibold">Hinweis:</span> Diese Berechnung basiert auf
        einer vereinfachten Formel und dient als Richtwert. Für eine genauere
        Berechnung sollten weitere Faktoren wie Alter, Geschlecht, Größe und
        Aktivitätslevel berücksichtigt werden.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { UserGoalData, GoalType } from "../../types/goals.ts";

const goalOptions: Array<{
  id: GoalType;
  label: string;
  multiplier: number;
  description: string;
  macroRatio: { protein: number; carbs: number; fat: number };
}> = [
  {
    id: "lose",
    label: "Abnehmen",
    multiplier: 0.8,
    description: "Moderates Kaloriendefizit",
    macroRatio: { protein: 0.3, carbs: 0.35, fat: 0.35 },
  },
  {
    id: "maintain",
    label: "Gewicht halten",
    multiplier: 1.0,
    description: "Erhaltungskalorien",
    macroRatio: { protein: 0.2, carbs: 0.45, fat: 0.35 },
  },
  {
    id: "gain",
    label: "Gewicht zunehmen",
    multiplier: 1.2,
    description: "Kalorienüberschuss",
    macroRatio: { protein: 0.15, carbs: 0.55, fat: 0.3 },
  },
  {
    id: "muscle",
    label: "Muskel aufbauen",
    multiplier: 1.15,
    description: "Moderater Kalorienüberschuss mit Fokus auf Protein",
    macroRatio: { protein: 0.25, carbs: 0.45, fat: 0.3 },
  },
];

const emit = defineEmits<{
  (e: "goal-update", data: UserGoalData): void;
}>();

const weight = ref<string>("");
const goal = ref<GoalType>("maintain");
const calculatedCalories = ref<number | null>(null);

function handleCalculate() {
  if (!weight.value || parseFloat(weight.value) <= 0) return;

  const weightNum = parseFloat(weight.value);
  const selectedGoal = goalOptions.find((g) => g.id === goal.value);
  if (!selectedGoal) return;

  const base = weightNum * 24; // Grundumsatz
  const baseWithActivity = base * 1.4;
  const targetCalories = Math.round(baseWithActivity * selectedGoal.multiplier);
  calculatedCalories.value = targetCalories;

  const proteinGrams = Math.round(
    (targetCalories * selectedGoal.macroRatio.protein) / 4
  );
  const carbsGrams = Math.round(
    (targetCalories * selectedGoal.macroRatio.carbs) / 4
  );
  const fatGrams = Math.round(
    (targetCalories * selectedGoal.macroRatio.fat) / 9
  );

  const payload: UserGoalData = {
    weight: weightNum,
    goalType: goal.value,
    goalLabel: selectedGoal.label,
    targetCalories,
    macros: {
      carbs: carbsGrams,
      fat: fatGrams,
      protein: proteinGrams,
    },
  };

  emit("goal-update", payload);
}

const currentGoal = computed(() =>
  goalOptions.find((g) => g.id === goal.value)
);
const currentGoalLabel = computed(() => currentGoal.value?.label ?? "");
const currentGoalDescription = computed(
  () => currentGoal.value?.description ?? ""
);

const formattedCalories = computed(() =>
  calculatedCalories.value?.toLocaleString("de-DE") ?? 0
);

const baseCalories = computed(() =>
  weight.value ? Math.round(parseFloat(weight.value) * 24) : 0
);
const withActivityCalories = computed(() =>
  weight.value ? Math.round(parseFloat(weight.value) * 24 * 1.4) : 0
);
</script>
