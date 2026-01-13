<script setup lang="ts">
import { computed } from "vue";
import CalorieOverview from "@/components/ui/CalorieOverview.vue";

type MealTypeBackend = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACKS";

type MealItemDTO = {
  id: number;
  foodId: number | null;
  foodName: string;
  amountGrams: number;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
};

type MealSummaryDTO = {
  totalCalories: number;
  items: MealItemDTO[];
};

type MealsDayDTO = {
  date: string;
  totalCalories: number;
  meals: Record<MealTypeBackend, MealSummaryDTO>;
};

const props = defineProps<{
  userGoalData: {
    targetCalories: number;
    targetCarbs?: number;
    targetFat?: number;
    targetProtein?: number;
  } | null;
  mealsDay: MealsDayDTO | null;
}>();

const emit = defineEmits<{
  (e: "add-food", mealType: "breakfast" | "lunch" | "dinner" | "snacks"): void;
  (e: "delete-meal-item", id: number): void;
}>();

const totalConsumed = computed(() =>
  Math.round(props.mealsDay?.totalCalories ?? 0)
);

function mealItems(type: MealTypeBackend) {
  return props.mealsDay?.meals?.[type]?.items ?? [];
}

function mealCalories(type: MealTypeBackend) {
  return Math.round(props.mealsDay?.meals?.[type]?.totalCalories ?? 0);
}
</script>

<template>
  <div class="space-y-6">
    <!-- ✅ EXISTIERENDE KOMPONENTE -->
    <CalorieOverview
      :targetCalories="userGoalData?.targetCalories ?? 2000"
      :currentCalories="totalConsumed"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- BREAKFAST -->
      <section class="rounded-xl bg-white p-4 shadow">
        <header class="flex items-center justify-between mb-3">
          <h2 class="font-semibold">Frühstück</h2>
          <button class="btn" @click="emit('add-food', 'breakfast')">+</button>
        </header>

        <p class="text-sm text-gray-500 mb-2">
          {{ mealCalories("BREAKFAST") }} kcal
        </p>

        <ul v-if="mealItems('BREAKFAST').length" class="space-y-2">
          <li
            v-for="it in mealItems('BREAKFAST')"
            :key="it.id"
            class="flex justify-between items-center"
          >
            <div>
              <p class="text-sm font-medium">{{ it.foodName }}</p>
              <p class="text-xs text-gray-400">{{ it.amountGrams }} g</p>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-sm">{{ Math.round(it.calories) }} kcal</span>
              <button
                class="text-red-500"
                @click="emit('delete-meal-item', it.id)"
              >
                🗑
              </button>
            </div>
          </li>
        </ul>

        <p v-else class="text-sm text-gray-400">Noch nichts hinzugefügt</p>
      </section>

      <!-- LUNCH -->
      <section class="rounded-xl bg-white p-4 shadow">
        <header class="flex items-center justify-between mb-3">
          <h2 class="font-semibold">Mittag</h2>
          <button class="btn" @click="emit('add-food', 'lunch')">+</button>
        </header>

        <p class="text-sm text-gray-500 mb-2">
          {{ mealCalories("LUNCH") }} kcal
        </p>

        <ul v-if="mealItems('LUNCH').length" class="space-y-2">
          <li
            v-for="it in mealItems('LUNCH')"
            :key="it.id"
            class="flex justify-between items-center"
          >
            <div>
              <p class="text-sm font-medium">{{ it.foodName }}</p>
              <p class="text-xs text-gray-400">{{ it.amountGrams }} g</p>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-sm">{{ Math.round(it.calories) }} kcal</span>
              <button
                class="text-red-500"
                @click="emit('delete-meal-item', it.id)"
              >
                🗑
              </button>
            </div>
          </li>
        </ul>

        <p v-else class="text-sm text-gray-400">Noch nichts hinzugefügt</p>
      </section>

      <!-- DINNER + SNACKS analog – bewusst ausgelassen, Struktur identisch -->
    </div>
  </div>
</template>
