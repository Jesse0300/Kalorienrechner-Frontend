<script setup lang="ts">
import { ref, watch } from "vue";
import { api } from "@/service/api";
import type { FoodSearchItem } from "@/types/FoodSearchTypes";
import { toBackendMealType, todayLocalISO } from "@/types/mealsBackend";

const props = defineProps<{
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
}>();

const emit = defineEmits<{
  (e: "added"): void;
  (e: "close"): void;
}>();

const query = ref("");
const results = ref<FoodSearchItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const hasSearched = ref(false);

// 🔁 Suche bei Query-Änderung (mit minimalem Guard)
watch(query, async (val) => {
  const q = val.trim();

  // Nur leeren String blocken – NICHT alles andere
  if (!q) {
    results.value = [];
    hasSearched.value = false;
    return;
  }

  loading.value = true;
  error.value = null;
  hasSearched.value = true;

  try {
    const res = await api.get("/fatsecret/search", {
      params: {
        q,        // wichtig
        query: q // fallback → macht es robust
      },
    });

    // 🔥 DAS ist der entscheidende Fix
    // Backend liefert { foods: [...] }
    results.value = Array.isArray(res.data?.foods)
      ? res.data.foods
      : Array.isArray(res.data)
        ? res.data
        : [];

  } catch (e: any) {
    error.value = "Suche fehlgeschlagen";
    results.value = [];
  } finally {
    loading.value = false;
  }
});

async function addFood(food: FoodSearchItem, grams: number) {
  try {
    await api.post("/meals/items", {
      foodId: food.id,
      amountGrams: grams,
      mealType: toBackendMealType(props.mealType),
      date: todayLocalISO(),
    });

    emit("added");
    emit("close");
  } catch (e) {
    alert("Fehler beim Hinzufügen");
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl p-6 w-full max-w-xl">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg text-gray-900">Lebensmittel suchen</h2>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <input
        v-model="query"
        type="text"
        placeholder="z. B. Eggs, Rice, Chicken…"
        class="w-full border rounded-xl px-4 py-2 mb-4"
      />

      <div v-if="loading" class="text-sm text-gray-400">
        Suche läuft…
      </div>

      <div v-else-if="error" class="text-sm text-red-500">
        {{ error }}
      </div>

      <div v-else-if="hasSearched && results.length === 0" class="text-sm text-gray-400">
        Nichts gefunden
      </div>

      <ul v-else class="space-y-2 max-h-80 overflow-y-auto">
        <li
          v-for="food in results"
          :key="food.id"
          class="flex items-center justify-between border rounded-xl p-3"
        >
          <div>
            <p class="text-sm text-gray-900">{{ food.name }}</p>
            <p class="text-xs text-gray-500">
              {{ food.calories }} kcal / 100 g
            </p>
          </div>

          <button
            class="px-3 py-1 rounded-lg bg-cyan-600 text-white text-sm"
            @click="addFood(food, 100)"
          >
            Hinzufügen
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
