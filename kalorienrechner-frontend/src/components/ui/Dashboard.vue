<template>
  <div class="p-8 max-w-7xl mx-auto">
    <div class="flex items-start justify-between gap-6">
      <div>
        <h1 class="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p class="text-gray-500 mt-1">{{ formattedDate }}</p>
      </div>

      <!-- Falls du oben schon Tagesfortschritt etc. hast: bleibt wie bei dir -->
      <div class="flex gap-4">
        <DailyProgress
          v-if="userGoalData"
          :targetCalories="userGoalData.targetCalories ?? 2000"
          :consumedCalories="totalConsumed"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <!-- BREAKFAST -->
      <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Frühstück</h2>
          <button
            class="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-gray-800"
            @click="emit('add-food', 'breakfast')"
          >
            Hinzufügen
          </button>
        </div>

        <p class="text-gray-500 text-sm mt-2">
          {{ mealConsumed('BREAKFAST') }} kcal
        </p>

        <ul v-if="mealItems('BREAKFAST').length" class="mt-3 space-y-2">
          <li
            v-for="it in mealItems('BREAKFAST')"
            :key="it.id"
            class="flex items-center justify-between rounded-xl border border-gray-100 p-3"
          >
            <div class="min-w-0">
              <p class="text-gray-900 text-sm truncate">{{ it.foodName }}</p>
              <p class="text-gray-500 text-xs">{{ Math.round(it.amountGrams) }} g</p>
            </div>

            <div class="flex items-center gap-3">
              <div class="text-gray-900 text-sm whitespace-nowrap">
                {{ Math.round(it.calories) }} kcal
              </div>

              <!-- ✅ NEU: Löschen -->
              <button
                type="button"
                class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
                title="Löschen"
                @click="emit('delete-meal-item', it.id)"
              >
                🗑️
              </button>
            </div>
          </li>
        </ul>

        <p v-else class="mt-3 text-gray-400 text-sm">Noch nichts hinzugefügt.</p>
      </section>

      <!-- LUNCH -->
      <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Mittag</h2>
          <button
            class="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-gray-800"
            @click="emit('add-food', 'lunch')"
          >
            Hinzufügen
          </button>
        </div>

        <p class="text-gray-500 text-sm mt-2">
          {{ mealConsumed('LUNCH') }} kcal
        </p>

        <ul v-if="mealItems('LUNCH').length" class="mt-3 space-y-2">
          <li
            v-for="it in mealItems('LUNCH')"
            :key="it.id"
            class="flex items-center justify-between rounded-xl border border-gray-100 p-3"
          >
            <div class="min-w-0">
              <p class="text-gray-900 text-sm truncate">{{ it.foodName }}</p>
              <p class="text-gray-500 text-xs">{{ Math.round(it.amountGrams) }} g</p>
            </div>

            <div class="flex items-center gap-3">
              <div class="text-gray-900 text-sm whitespace-nowrap">
                {{ Math.round(it.calories) }} kcal
              </div>

              <!-- ✅ NEU: Löschen -->
              <button
                type="button"
                class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
                title="Löschen"
                @click="emit('delete-meal-item', it.id)"
              >
                🗑️
              </button>
            </div>
          </li>
        </ul>

        <p v-else class="mt-3 text-gray-400 text-sm">Noch nichts hinzugefügt.</p>
      </section>

      <!-- DINNER -->
      <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Abend</h2>
          <button
            class="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-gray-800"
            @click="emit('add-food', 'dinner')"
          >
            Hinzufügen
          </button>
        </div>

        <p class="text-gray-500 text-sm mt-2">
          {{ mealConsumed('DINNER') }} kcal
        </p>

        <ul v-if="mealItems('DINNER').length" class="mt-3 space-y-2">
          <li
            v-for="it in mealItems('DINNER')"
            :key="it.id"
            class="flex items-center justify-between rounded-xl border border-gray-100 p-3"
          >
            <div class="min-w-0">
              <p class="text-gray-900 text-sm truncate">{{ it.foodName }}</p>
              <p class="text-gray-500 text-xs">{{ Math.round(it.amountGrams) }} g</p>
            </div>

            <div class="flex items-center gap-3">
              <div class="text-gray-900 text-sm whitespace-nowrap">
                {{ Math.round(it.calories) }} kcal
              </div>

              <!-- ✅ NEU: Löschen -->
              <button
                type="button"
                class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
                title="Löschen"
                @click="emit('delete-meal-item', it.id)"
              >
                🗑️
              </button>
            </div>
          </li>
        </ul>

        <p v-else class="mt-3 text-gray-400 text-sm">Noch nichts hinzugefügt.</p>
      </section>

      <!-- SNACKS -->
      <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Snacks</h2>
          <button
            class="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-gray-800"
            @click="emit('add-food', 'snacks')"
          >
            Hinzufügen
          </button>
        </div>

        <p class="text-gray-500 text-sm mt-2">
          {{ mealConsumed('SNACKS') }} kcal
        </p>

        <ul v-if="mealItems('SNACKS').length" class="mt-3 space-y-2">
          <li
            v-for="it in mealItems('SNACKS')"
            :key="it.id"
            class="flex items-center justify-between rounded-xl border border-gray-100 p-3"
          >
            <div class="min-w-0">
              <p class="text-gray-900 text-sm truncate">{{ it.foodName }}</p>
              <p class="text-gray-500 text-xs">{{ Math.round(it.amountGrams) }} g</p>
            </div>

            <div class="flex items-center gap-3">
              <div class="text-gray-900 text-sm whitespace-nowrap">
                {{ Math.round(it.calories) }} kcal
              </div>

              <!-- ✅ NEU: Löschen -->
              <button
                type="button"
                class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
                title="Löschen"
                @click="emit('delete-meal-item', it.id)"
              >
                🗑️
              </button>
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
import DailyProgress from "@/components/ui/DailyProgress.vue";

type MealTypeBackend = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACKS";

type MealItemDTO = {
  id: number;
  foodId: number | null;
  foodName: string;
  amountGrams: number;
  calories: number;
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
  userGoalData: any;
  mealsDay: MealsDayDTO | null;
}>();

const emit = defineEmits<{
  (e: "add-food", mealType: "breakfast" | "lunch" | "dinner" | "snacks"): void;
  (e: "delete-meal-item", id: number): void;
}>();

const formattedDate = computed(() => {
  const d = new Date();
  return d.toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
});

const totalConsumed = computed(() => Math.round(Number(props.mealsDay?.totalCalories ?? 0)));

function mealItems(key: MealTypeBackend) {
  return props.mealsDay?.meals?.[key]?.items ?? [];
}

function mealConsumed(key: MealTypeBackend) {
  const v = props.mealsDay?.meals?.[key]?.totalCalories ?? 0;
  return Math.round(Number(v) || 0);
}
</script>
