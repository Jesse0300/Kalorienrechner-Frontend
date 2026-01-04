<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
    <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-gray-900">Lebensmittel hinzufügen</h2>
          <button
            type="button"
            @click="emit('close')"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Schließen"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="relative mb-4">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Lebensmittel suchen... (ENG)"
            :value="query"
            @input="onQueryInput"
            @keyup.enter="emit('search', 0)"
            class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            @click="filter = 'all'"
            class="px-3 py-1.5 rounded-full text-sm transition-colors"
            :class="filter === 'all' ? 'bg-cyan-50 text-cyan-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            Alle
          </button>

          <button
            type="button"
            @click="filter = 'favorites'"
            class="px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors"
            :class="filter === 'favorites' ? 'bg-cyan-50 text-cyan-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            <Star class="w-4 h-4" />
            Favoriten
          </button>

          <button
            type="button"
            @click="filter = 'recent'"
            class="px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors"
            :class="filter === 'recent' ? 'bg-cyan-50 text-cyan-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            <Clock class="w-4 h-4" />
            Zuletzt
          </button>

          <div class="ml-auto flex items-center gap-2">
            <button
              type="button"
              @click="emit('search', 0)"
              class="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors disabled:opacity-60"
              :disabled="loading || !query.trim()"
            >
              {{ loading ? "Suche…" : "Suchen" }}
            </button>
          </div>
        </div>

        <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="loading" class="text-gray-500">Lade Ergebnisse…</div>

        <div v-else-if="!loading && filteredFoods.length === 0 && hasSearched" class="text-gray-500">
          Keine Ergebnisse gefunden. Versuch es doch mal mit Englischen Lebensmitteln!
        </div>

        <div v-else class="space-y-3">
          <button
            v-for="food in filteredFoods"
            :key="String(food.id)"
            type="button"
            @click="selectedId = food.id"
            class="w-full text-left p-4 rounded-lg border transition-all"
            :class="selectedId === food.id ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 hover:border-gray-300 bg-white'"
          >
            <div class="flex items-start justify-between mb-2">
              <div>
                <div class="text-gray-900 mb-1 flex items-center gap-2">
                  {{ food.name }}
                  <Star v-if="food.isFavorite" class="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
                <div class="text-gray-500 text-sm">{{ food.description || "—" }}</div>
              </div>
              <div class="text-gray-900 whitespace-nowrap">
                {{ num(food.calories) }} kcal
              </div>
            </div>

            <div class="flex gap-2 mt-3">
              <div class="flex-1">
                <div class="h-1.5 bg-amber-200 rounded-full overflow-hidden">
                  <div class="h-full bg-amber-500" :style="{ width: barPct(food.carbs) }" />
                </div>
                <div class="text-xs text-gray-500 mt-1">K: {{ num(food.carbs) }}g</div>
              </div>

              <div class="flex-1">
                <div class="h-1.5 bg-red-200 rounded-full overflow-hidden">
                  <div class="h-full bg-red-500" :style="{ width: barPct(food.fat) }" />
                </div>
                <div class="text-xs text-gray-500 mt-1">F: {{ num(food.fat) }}g</div>
              </div>

              <div class="flex-1">
                <div class="h-1.5 bg-blue-200 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500" :style="{ width: barPct(food.protein) }" />
                </div>
                <div class="text-xs text-gray-500 mt-1">P: {{ num(food.protein) }}g</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div v-if="selectedFood" class="p-6 border-t border-gray-200 bg-gray-50">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm mb-2">Menge (g)</label>
          <input
            type="number"
            v-model="portion"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <button
          type="button"
          @click="emit('add', { item: selectedFood.raw ?? selectedFood, portion: Number(portion || 0), mealType })"
          class="w-full px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          Zu {{ mealLabels[mealType] || mealType }} hinzufügen
        </button>
      </div>

      <!-- Pagination: page ist 0-basiert, UI zeigt 1-basiert -->
      <div
        v-if="hasSearched"
        class="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600"
      >
        <button
          type="button"
          class="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
          :disabled="loading || page <= 0"
          @click="emit('search', page - 1)"
        >
          ← Zurück
        </button>
        <span>Seite {{ page + 1 }}</span>
        <button
          type="button"
          class="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
          :disabled="loading"
          @click="emit('search', page + 1)"
        >
          Weiter →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { X, Search, Star, Clock } from "lucide-vue-next";
import type { MealType } from "../../types/FoodSearchTypes";

type Filter = "all" | "favorites" | "recent";

export type FoodSearchItem = {
  id: string | number;
  name: string;
  description?: string;
  calories?: number | null;
  carbs?: number | null;
  fat?: number | null;
  protein?: number | null;
  isFavorite?: boolean;
  isRecent?: boolean;
  raw?: any;
};

const props = defineProps<{
  mealType: MealType;
  query: string;
  results: FoodSearchItem[];
  loading: boolean;
  error: string;
  hasSearched: boolean;
  page: number; // 0-basiert
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "search", page: number): void;
  (e: "import", item: any): void;
  (e: "preview", item: any): void;
  (e: "add", payload: { item: any; portion: number; mealType: MealType }): void;
  (e: "update:query", value: string): void;
}>();

const filter = ref<Filter>("all");
const selectedId = ref<string | number | null>(null);
const portion = ref("100");

const mealLabels: Record<string, string> = {
  breakfast: "Frühstück",
  lunch: "Mittagessen",
  dinner: "Abendessen",
  snacks: "Snacks",
};

function onQueryInput(e: Event) {
  emit("update:query", (e.target as HTMLInputElement).value);
}

const filteredFoods = computed(() => {
  const q = props.query?.toLowerCase().trim() ?? "";
  const list = props.results ?? [];

  // Falls FatSecret-Results keine Flags haben: Filter soll NICHT alles leeren
  const anyFavorite = list.some((f: any) => !!f?.isFavorite);
  const anyRecent = list.some((f: any) => !!f?.isRecent);

  return list.filter((food: any) => {
    const matchesSearch = !q || (food.name ?? "").toLowerCase().includes(q);

    const matchesFilter =
      filter.value === "all" ||
      (filter.value === "favorites" && (!anyFavorite || !!food.isFavorite)) ||
      (filter.value === "recent" && (!anyRecent || !!food.isRecent));

    return matchesSearch && matchesFilter;
  });
});

const selectedFood = computed(() => {
  if (selectedId.value == null) return null;
  return (props.results ?? []).find((x) => x.id === selectedId.value) ?? null;
});

function num(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function barPct(v: any) {
  const n = Math.max(0, Math.min(100, num(v)));
  return `${n}%`;
}
</script>
