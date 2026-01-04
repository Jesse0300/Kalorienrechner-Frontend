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
            r="60"
            stroke-width="14"
            class="fill-none stroke-gray-100"
          />
          <circle
            cx="80"
            cy="80"
            r="60"
            stroke-width="14"
            class="fill-none stroke-cyan-500"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            stroke-linecap="round"
          />
        </svg>

        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <div class="text-gray-900 text-2xl">{{ percent }}%</div>
          <div class="text-gray-500 text-sm">vom Ziel</div>
        </div>
      </div>

      <div class="text-center">
        <div class="text-gray-500 text-sm mb-1">Übrig</div>
        <div class="text-3xl text-gray-900">{{ remaining }}</div>
        <div class="text-gray-400 text-sm">kcal</div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="rounded-xl border border-gray-100 p-4">
        <div class="text-gray-500 text-sm">Ziel</div>
        <div class="text-gray-900 text-xl">{{ target }}</div>
        <div class="text-gray-400 text-xs">kcal</div>
      </div>

      <div class="rounded-xl border border-gray-100 p-4">
        <div class="text-gray-500 text-sm">Kohlenhydrate</div>
        <div class="text-gray-900 text-xl">{{ macros.carbs }}</div>
        <div class="text-gray-400 text-xs">g Ziel</div>
      </div>

      <div class="rounded-xl border border-gray-100 p-4">
        <div class="text-gray-500 text-sm">Eiweiß</div>
        <div class="text-gray-900 text-xl">{{ macros.protein }}</div>
        <div class="text-gray-400 text-xs">g Ziel</div>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-1">
      <div class="rounded-xl border border-gray-100 p-4">
        <div class="text-gray-500 text-sm">Fett</div>
        <div class="text-gray-900 text-xl">{{ macros.fat }}</div>
        <div class="text-gray-400 text-xs">g Ziel</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { UserGoalData } from "../../types/goals";

const props = defineProps<{
  targetCalories?: number;
  userGoalData?: UserGoalData | null;
  consumedCalories?: number;
}>();

const target = computed(() => Math.round(Number(props.targetCalories ?? props.userGoalData?.targetCalories ?? 2000)));
const consumed = computed(() => Math.round(Number(props.consumedCalories ?? 0)));
const remaining = computed(() => Math.max(0, target.value - consumed.value));
const percent = computed(() => {
  if (target.value <= 0) return 0;
  return Math.min(999, Math.round((consumed.value / target.value) * 100));
});

const macros = computed(() => ({
  carbs: Math.round(props.userGoalData?.macros?.carbs ?? 250),
  fat: Math.round(props.userGoalData?.macros?.fat ?? 70),
  protein: Math.round(props.userGoalData?.macros?.protein ?? 150),
}));

const radius = 60;
const circumference = 2 * Math.PI * radius;
const dashOffset = computed(() => {
  const p = Math.max(0, Math.min(1, consumed.value / Math.max(1, target.value)));
  return circumference * (1 - p);
});
</script>
