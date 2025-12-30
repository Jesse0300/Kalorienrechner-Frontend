<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h2 class="text-gray-900 mb-6">Kalorienübersicht</h2>

    <div class="flex items-center justify-center gap-16 mb-8">
      <div class="text-center">
        <div class="text-gray-500 text-sm mb-1">Gegessen</div>
        <div class="text-3xl text-gray-900">{{ consumed }}</div>
        <div class="text-gray-400 text-sm">kcal</div>
      </div>

      <div class="relative w-40 h-40">
        <svg
          class="w-40 h-40"
          :style="{ transform: 'rotate(135deg)' }"
        >
          <circle
            cx="80"
            cy="80"
            :r="radius"
            stroke="currentColor"
            stroke-width="16"
            fill="none"
            class="text-gray-100"
            :stroke-dasharray="`${arcLength} ${circumference}`"
            stroke-linecap="round"
          />
          <circle
            cx="80"
            cy="80"
            :r="radius"
            stroke="currentColor"
            stroke-width="16"
            fill="none"
            class="text-green-500 transition-all duration-500"
            :stroke-dasharray="`${arcLength} ${circumference}`"
            :stroke-dashoffset="progressDashoffset"
            stroke-linecap="round"
          />
        </svg>

        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <div class="text-4xl text-gray-900 mb-1">
            {{ remaining }}
          </div>
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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="macro in macros"
          :key="macro.name"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <div
                class="p-1.5 rounded-lg"
                :class="macro.lightColor"
              >

                <span class="text-base">
                  {{ macro.icon }}
                </span>
              </div>
              <span class="text-gray-700 text-sm">
                {{ macro.name }}
              </span>
            </div>
          </div>

          <div class="text-gray-900 text-sm mb-2">
            {{ macro.current }}{{ macro.unit }} /
            {{ macro.target }}{{ macro.unit }}
          </div>

          <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full transition-all duration-500"
              :class="macro.color"
              :style="{ width: `${Math.min(macro.percentage, 100)}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { UserGoalData } from "../types/goals";

const props = defineProps<{
  targetCalories?: number;
  userGoalData?: UserGoalData | null;
}>();

const consumed = 0;
const target = computed(() => props.targetCalories ?? 2000);
const remaining = computed(() => target.value - consumed);
const consumedPercent = computed(() =>
  target.value > 0 ? (consumed / target.value) * 100 : 0
);


const radius = 70;
const circumference = 2 * Math.PI * radius;
const arcLength = (circumference * 270) / 360;
const progressDashoffset = computed(
  () => arcLength * (1 - consumedPercent.value / 100)
);


const macros = computed(() => {
  const carbsTarget = props.userGoalData?.macros.carbs ?? 250;
  const fatTarget = props.userGoalData?.macros.fat ?? 67;
  const proteinTarget = props.userGoalData?.macros.protein ?? 150;

  const base = [
    {
      name: "Kohlenhydrate",
      icon: "🌾",
      current: 0,
      target: carbsTarget,
      unit: "g",
      color: "bg-amber-500",
      lightColor: "bg-amber-50",
    },
    {
      name: "Fett",
      icon: "💧",
      current: 0,
      target: fatTarget,
      unit: "g",
      color: "bg-violet-500",
      lightColor: "bg-violet-50",
    },
    {
      name: "Eiweiß",
      icon: "💪",
      current: 0,
      target: proteinTarget,
      unit: "g",
      color: "bg-cyan-500",
      lightColor: "bg-cyan-50",
    },
  ];

  return base.map((m) => ({
    ...m,
    percentage: m.target > 0 ? (m.current / m.target) * 100 : 0,
  }));
});
</script>
