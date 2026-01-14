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

      <!-- ✅ ADDITIV: Manuelle Einstellung -->
      <div class="mb-6">
        <label class="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            v-model="manualEnabled"
            class="h-4 w-4 rounded border-gray-300"
          />
          <span class="text-gray-700">Kalorien & Makros manuell einstellen</span>
        </label>

        <div
          v-if="manualEnabled"
          class="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 mb-2">Kalorienziel (kcal)</label>
              <!-- ✅ Kalorien werden automatisch aus Makros berechnet -->
              <input
                type="number"
                :value="manualCaloriesComputed"
                readonly
                class="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed focus:outline-none"
              />
              <p class="text-xs text-gray-600 mt-2">
                Wird automatisch berechnet: Protein/Carbs 4 kcal/g, Fett 9 kcal/g
              </p>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-gray-700 mb-2">Protein (g)</label>
                <input
                  type="number"
                  v-model="manualProtein"
                  min="0"
                  step="1"
                  placeholder="150"
                  class="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label class="block text-gray-700 mb-2">Carbs (g)</label>
                <input
                  type="number"
                  v-model="manualCarbs"
                  min="0"
                  step="1"
                  placeholder="250"
                  class="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label class="block text-gray-700 mb-2">Fat (g)</label>
                <input
                  type="number"
                  v-model="manualFat"
                  min="0"
                  step="1"
                  placeholder="70"
                  class="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
                />
              </div>
            </div>
          </div>

          <p v-if="manualError" class="text-sm text-red-600 mt-3">{{ manualError }}</p>
        </div>
      </div>

      <button
        @click="handleCalculate"
        :disabled="!weight || parseFloat(weight) <= 0 || (manualEnabled && !isManualValid)"
        class="w-full px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {{ manualEnabled ? "Ziel speichern" : "Kalorien berechnen" }}
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

      <!-- ✅ ADDITIV: Makros anzeigen -->
      <div class="bg-white rounded-xl p-4 space-y-2 mb-4">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Makros (g):</span>
          <span class="text-gray-900">
            P {{ lastEmittedMacros.protein }} · C {{ lastEmittedMacros.carbs }} · F {{ lastEmittedMacros.fat }}
          </span>
        </div>
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
import { ref, computed, onMounted, watch } from "vue";
import type { UserGoalData, GoalType } from "@/types/goals.ts";

const goalOptions: Array<{
  id: GoalType;
  label: string;
  multiplier: number;
  description: string;
  macroRatio: { protein: number; carbs: number; fat: number };
}> = [
  { id: "lose", label: "Abnehmen", multiplier: 0.8, description: "Moderates Kaloriendefizit", macroRatio: { protein: 0.3, carbs: 0.35, fat: 0.35 } },
  { id: "maintain", label: "Gewicht halten", multiplier: 1.0, description: "Erhaltungskalorien", macroRatio: { protein: 0.2, carbs: 0.45, fat: 0.35 } },
  { id: "gain", label: "Gewicht zunehmen", multiplier: 1.2, description: "Kalorienüberschuss", macroRatio: { protein: 0.15, carbs: 0.55, fat: 0.3 } },
  { id: "muscle", label: "Muskel aufbauen", multiplier: 1.15, description: "Moderater Kalorienüberschuss mit Fokus auf Protein", macroRatio: { protein: 0.25, carbs: 0.45, fat: 0.3 } },
];

const emit = defineEmits<{
  (e: "goal-update", data: UserGoalData): void;
}>();

const weight = ref<string>("");
const goal = ref<GoalType>("maintain");
const calculatedCalories = ref<number | null>(null);

/** ✅ Additiv: manuelle Werte */
const manualEnabled = ref<boolean>(false);
const manualProtein = ref<string>("");
const manualCarbs = ref<string>("");
const manualFat = ref<string>("");

/** ✅ Anzeige / Ergebnis */
const lastEmittedMacros = ref<{ protein: number; carbs: number; fat: number }>({
  protein: 0, carbs: 0, fat: 0,
});

function n(v: string): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

/** ✅ Kalorien automatisch aus Makros */
const manualCaloriesComputed = computed(() => {
  const p = n(manualProtein.value);
  const c = n(manualCarbs.value);
  const f = n(manualFat.value);
  const kcal = p * 4 + c * 4 + f * 9;
  return Math.round(kcal);
});

const manualError = computed(() => {
  const p = n(manualProtein.value);
  const c = n(manualCarbs.value);
  const f = n(manualFat.value);
  if (p < 0 || c < 0 || f < 0) return "Makros dürfen nicht negativ sein.";
  if (p === 0 && c === 0 && f === 0) return "Bitte mindestens ein Makro > 0 eingeben.";
  if (manualCaloriesComputed.value <= 0) return "Kalorien müssen > 0 sein (aus Makros).";
  return "";
});

const isManualValid = computed(() => manualError.value === "");

function persistManualSettings() {
  const settings = {
    manualEnabled: manualEnabled.value,
    manualProtein: manualProtein.value,
    manualCarbs: manualCarbs.value,
    manualFat: manualFat.value,
  };
  localStorage.setItem("userGoalManualSettings", JSON.stringify(settings));
}

function loadManualSettings() {
  try {
    const raw = localStorage.getItem("userGoalManualSettings");
    if (!raw) return;
    const s = JSON.parse(raw);
    manualEnabled.value = !!s.manualEnabled;
    manualProtein.value = String(s.manualProtein ?? "");
    manualCarbs.value = String(s.manualCarbs ?? "");
    manualFat.value = String(s.manualFat ?? "");
  } catch {
    // ignore
  }
}

function handleCalculate() {
  if (!weight.value || parseFloat(weight.value) <= 0) return;

  const weightNum = parseFloat(weight.value);
  const selectedGoal = goalOptions.find((g) => g.id === goal.value);
  if (!selectedGoal) return;

  // ✅ MANUELL: Kalorien kommen aus Makros
  if (manualEnabled.value) {
    if (!isManualValid.value) return;

    const targetCalories = manualCaloriesComputed.value;
    const proteinGrams = Math.round(n(manualProtein.value));
    const carbsGrams = Math.round(n(manualCarbs.value));
    const fatGrams = Math.round(n(manualFat.value));

    calculatedCalories.value = targetCalories;
    lastEmittedMacros.value = { protein: proteinGrams, carbs: carbsGrams, fat: fatGrams };

    const payload: UserGoalData = {
      weight: weightNum,
      goalType: goal.value,
      goalLabel: `${selectedGoal.label} (manuell)`,
      targetCalories,
      macros: { carbs: carbsGrams, fat: fatGrams, protein: proteinGrams },
    };

    persistManualSettings();
    emit("goal-update", payload);
    return;
  }

  // ✅ AUTO: bestehende Logik unverändert
  const base = weightNum * 24;
  const baseWithActivity = base * 1.4;
  const targetCalories = Math.round(baseWithActivity * selectedGoal.multiplier);
  calculatedCalories.value = targetCalories;

  const proteinGrams = Math.round((targetCalories * selectedGoal.macroRatio.protein) / 4);
  const carbsGrams = Math.round((targetCalories * selectedGoal.macroRatio.carbs) / 4);
  const fatGrams = Math.round((targetCalories * selectedGoal.macroRatio.fat) / 9);

  lastEmittedMacros.value = { protein: proteinGrams, carbs: carbsGrams, fat: fatGrams };

  const payload: UserGoalData = {
    weight: weightNum,
    goalType: goal.value,
    goalLabel: selectedGoal.label,
    targetCalories,
    macros: { carbs: carbsGrams, fat: fatGrams, protein: proteinGrams },
  };

  persistManualSettings();
  emit("goal-update", payload);
}

const currentGoal = computed(() => goalOptions.find((g) => g.id === goal.value));
const currentGoalLabel = computed(() => currentGoal.value?.label ?? "");
const currentGoalDescription = computed(() => currentGoal.value?.description ?? "");

const formattedCalories = computed(() => calculatedCalories.value?.toLocaleString("de-DE") ?? 0);

const baseCalories = computed(() =>
  weight.value ? Math.round(parseFloat(weight.value) * 24) : 0
);
const withActivityCalories = computed(() =>
  weight.value ? Math.round(parseFloat(weight.value) * 24 * 1.4) : 0
);

onMounted(loadManualSettings);

watch([manualEnabled, manualProtein, manualCarbs, manualFat], persistManualSettings);
</script>
