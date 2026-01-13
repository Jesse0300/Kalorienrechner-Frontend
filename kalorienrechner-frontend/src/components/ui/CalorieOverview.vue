<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <p class="text-gray-900 mb-6">Kalorienübersicht</p>

    <div class="flex items-center justify-center gap-16 mb-8">
      <div class="text-center">
        <div class="text-gray-500 text-sm mb-1">Gegessen</div>
        <div class="text-3xl text-gray-900">{{ consumed }}</div>
        <div class="text-gray-400 text-sm">kcal</div>
      </div>

      <div class="relative w-40 h-40">
        <svg class="w-40 h-40" :style="{ transform: 'rotate(135deg)' }">
          <circle
            cx="80"
            cy="80"
            :r="radius"
            stroke-width="16"
            class="fill-none stroke-gray-100"
            :stroke-dasharray="dashArray"
            stroke-linecap="round"
          />
          <circle
            cx="80"
            cy="80"
            :r="radius"
            stroke-width="16"
            class="fill-none stroke-cyan-500 transition-all duration-500"
            :stroke-dasharray="dashArray"
            :stroke-dashoffset="dashOffset"
            stroke-linecap="round"
          />
        </svg>

        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <div class="text-4xl text-gray-900 mb-1">{{ remaining }}</div>
          <div class="text-gray-500 text-sm">übrig</div>
        </div>
      </div>

      <div class="text-center">
        <div class="text-gray-500 text-sm mb-1">Ziel</div>
        <div class="text-3xl text-gray-900">{{ target }}</div>
        <div class="text-gray-400 text-sm">kcal</div>
      </div>
    </div>

    <div>
      <h3 class="text-gray-900 mb-4">Makronährstoffe</h3>

      <div class="grid grid-cols-3 gap-4">
        <div v-for="m in macroCards" :key="m.key">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="p-1.5 rounded-lg" :class="m.lightColor">
                <div class="w-4 h-4 rounded" :class="m.color"></div>
              </div>
              <span class="text-gray-700 text-sm">{{ m.label }}</span>
            </div>
          </div>

          <div class="text-gray-900 text-sm mb-2">
            {{ m.current }}{{ m.unit }} / {{ m.target }}{{ m.unit }}
          </div>

          <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full transition-all duration-500"
              :class="m.color"
              :style="{ width: `${m.percent}%` }"
            />
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { UserGoalData } from "@/types/goals";
import type { MealsDayDTO } from "@/types/mealsBackend";

const props = defineProps<{
  targetCalories?: number;
  userGoalData?: UserGoalData | null;
  consumedCalories?: number;
  mealsDay?: MealsDayDTO | null;
}>();

const target = computed(() =>
  Math.round(Number(props.targetCalories ?? props.userGoalData?.targetCalories ?? 2000))
);

const consumed = computed(() => Math.round(Number(props.consumedCalories ?? 0)));
const remaining = computed(() => Math.max(0, target.value - consumed.value));

const macroTargets = computed(() => ({
  carbs: Math.round(props.userGoalData?.macros?.carbs ?? 250),
  fat: Math.round(props.userGoalData?.macros?.fat ?? 70),
  protein: Math.round(props.userGoalData?.macros?.protein ?? 150),
}));

const macroConsumed = computed(() => {
  const meals = props.mealsDay?.meals ?? {};
  let carbs = 0;
  let fat = 0;
  let protein = 0;

  for (const summary of Object.values(meals)) {
    const items = summary?.items ?? [];
    for (const item of items) {
      carbs += Number(item.carbs ?? 0);
      fat += Number(item.fat ?? 0);
      protein += Number(item.protein ?? 0);
    }
  }

  return {
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    protein: Math.round(protein),
  };
});

function macroPercent(current: number, targetVal: number) {
  if (!targetVal || targetVal <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((current / targetVal) * 100)));
}

const macroCards = computed(() => [
  {
    key: "carbs",
    label: "Kohlenhydrate",
    unit: "g",
    current: macroConsumed.value.carbs,
    target: macroTargets.value.carbs,
    percent: macroPercent(macroConsumed.value.carbs, macroTargets.value.carbs),
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
  },
  {
    key: "fat",
    label: "Fett",
    unit: "g",
    current: macroConsumed.value.fat,
    target: macroTargets.value.fat,
    percent: macroPercent(macroConsumed.value.fat, macroTargets.value.fat),
    color: "bg-violet-500",
    lightColor: "bg-violet-50",
  },
  {
    key: "protein",
    label: "Eiweiß",
    unit: "g",
    current: macroConsumed.value.protein,
    target: macroTargets.value.protein,
    percent: macroPercent(macroConsumed.value.protein, macroTargets.value.protein),
    color: "bg-cyan-500",
    lightColor: "bg-cyan-50",
  },
]);

const radius = 70;
const circumference = 2 * Math.PI * radius;
const arcLength = (circumference * 270) / 360;

const dashArray = `${arcLength} ${circumference}`;

const dashOffset = computed(() => {
  const t = Math.max(1, target.value);
  const p = Math.max(0, Math.min(1, consumed.value / t));
  return arcLength * (1 - p);
});
</script>
