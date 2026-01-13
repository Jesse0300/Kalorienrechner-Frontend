<script setup lang="ts">
import { computed } from "vue";
import CalorieOverview from "@/components/ui/CalorieOverview.vue";
import type { UserGoalData } from "@/types/goals";
import type { MealsDayDTO, BackendMealType } from "@/types/mealsBackend";

const props = defineProps<{
  userGoalData: UserGoalData | null;
  mealsDay: MealsDayDTO | null;
}>();

const emit = defineEmits<{
  (e: "add-food", mealType: "breakfast" | "lunch" | "dinner" | "snacks"): void;
  (e: "delete-meal-item", id: number): void;
}>();

const formattedDate = computed(() => {
  const d = new Date();
  return d.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const totalConsumed = computed(() =>
  Math.round(Number(props.mealsDay?.totalCalories ?? 0))
);

function mealItems(type: BackendMealType) {
  return props.mealsDay?.meals?.[type]?.items ?? [];
}

function mealCalories(type: BackendMealType) {
  return Math.round(
    Number(props.mealsDay?.meals?.[type]?.totalCalories ?? 0)
  );
}
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto space-y-8">
    <!-- HEADER -->
    <div>
      <h1 class="text-gray-900 mb-1">Heute</h1>
      <p class="text-gray-500">{{ formattedDate }}</p>
    </div>

    <!-- ✅ KALORIEN + MAKROS -->
    <CalorieOverview
      :targetCalories="userGoalData?.targetCalories"
      :userGoalData="userGoalData"
      :consumedCalories="totalConsumed"
      :meals-day="mealsDay"
    />

    <!-- HEUTIGE MAHLZEITEN -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 class="text-gray-900 mb-6">Heutige Mahlzeiten</h2>

      <!-- FRÜHSTÜCK -->
      <section class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <div>
            <h3 class="text-gray-900">Frühstück</h3>
            <p class="text-gray-500 text-sm">
              {{ mealCalories("BREAKFAST") }} kcal
            </p>
          </div>
          <button
            class="px-4 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700"
            @click="emit('add-food', 'breakfast')"
          >
            Hinzufügen
          </button>
        </div>

        <ul v-if="mealItems('BREAKFAST').length" class="space-y-2">
          <li
            v-for="it in mealItems('BREAKFAST')"
            :key="it.id"
            class="flex items-center justify-between rounded-xl border border-gray-100 p-3"
          >
            <div>
              <p class="text-sm text-gray-900">{{ it.foodName }}</p>
              <p class="text-xs text-gray-500">{{ it.amountGrams }} g</p>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-900">
                {{ Math.round(it.calories) }} kcal
              </span>
              <button
                class="text-gray-500 hover:text-red-600"
                title="Löschen"
                @click="emit('delete-meal-item', it.id)"
              >
                🗑
              </button>
            </div>
          </li>
        </ul>

        <p v-else class="text-sm text-gray-400">Noch nichts hinzugefügt</p>
      </section>

      <!-- MITTAG -->
      <section class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <div>
            <h3 class="text-gray-900">Mittag</h3>
            <p class="text-gray-500 text-sm">
              {{ mealCalories("LUNCH") }} kcal
            </p>
          </div>
          <button
            class="px-4 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700"
            @click="emit('add-food', 'lunch')"
          >
            Hinzufügen
          </button>
        </div>

        <ul v-if="mealItems('LUNCH').length" class="space-y-2">
          <li
            v-for="it in mealItems('LUNCH')"
            :key="it.id"
            class="flex items-center justify-between rounded-xl border border-gray-100 p-3"
          >
            <div>
              <p class="text-sm text-gray-900">{{ it.foodName }}</p>
              <p class="text-xs text-gray-500">{{ it.amountGrams }} g</p>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-900">
                {{ Math.round(it.calories) }} kcal
              </span>
              <button
                class="text-gray-500 hover:text-red-600"
                @click="emit('delete-meal-item', it.id)"
              >
                🗑
              </button>
            </div>
          </li>
        </ul>

        <p v-else class="text-sm text-gray-400">Noch nichts hinzugefügt</p>
      </section>

      <!-- ABEND + SNACKS kannst du exakt analog ergänzen -->
    </div>
  </div>
</template>
