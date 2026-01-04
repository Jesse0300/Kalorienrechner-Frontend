<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
    <div class="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden">
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">Lebensmittel hinzufügen</h2>
            <p class="text-sm text-gray-500 mt-1">
              Für: <span class="font-medium">{{ mealLabels[mealType] }}</span>
            </p>
          </div>
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
            :value="query"
            type="text"
            placeholder="Lebensmittel suchen…"
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
              class="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors"
            >
              Suchen
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
        <!-- left: list -->
        <div class="p-6 border-r border-gray-100 max-h-[70vh] overflow-auto">
          <div v-if="loading" class="text-gray-500">Suche läuft…</div>
          <div v-else-if="error" class="text-red-600">{{ error }}</div>
          <div v-else-if="hasSearched && filteredFoods.length === 0" class="text-gray-500">
            Keine Ergebnisse.
          </div>

          <ul v-else class="space-y-2">
            <li
              v-for="food in filteredFoods"
              :key="food.id"
              @click="selectedId = food.id"
              class="p-3 rounded-lg border cursor-pointer transition-colors"
              :class="selectedId === food.id ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 hover:bg-gray-50'"
            >
              <div class="font-medium text-gray-900">{{ food.name }}</div>
              <div v-if="food.description" class="text-xs text-gray-500 mt-1 line-clamp-2">
                {{ food.description }}
              </div>

              <div class="text-xs text-gray-600 mt-2 flex gap-3">
                <span>{{ food.calories ?? "?" }} kcal</span>
                <span v-if="food.carbs != null">KH {{ food.carbs }}</span>
                <span v-if="food.protein != null">P {{ food.protein }}</span>
                <span v-if="food.fat != null">F {{ food.fat }}</span>
              </div>
            </li>
          </ul>

          <div v-if="hasSearched" class="flex items-center justify-between mt-4">
            <button
              class="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              :disabled="page <= 0 || loading"
              @click="emit('search', page - 1)"
            >
              Zurück
            </button>

            <div class="text-sm text-gray-600">Seite {{ page + 1 }}</div>

            <button
              class="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              :disabled="loading"
              @click="emit('search', page + 1)"
            >
              Weiter
            </button>
          </div>
        </div>

        <!-- right: details -->
        <div class="p-6 max-h-[70vh] overflow-auto">
          <div v-if="!selectedFood" class="text-gray-500">
            Wähle links ein Lebensmittel aus.
          </div>

          <div v-else>
            <h3 class="text-lg font-semibold text-gray-900">{{ selectedFood.name }}</h3>
            <p v-ifড়="selectedFood.description" class="text-sm text-gray-600 mt-1">
              {{ selectedFood.description }}
            </p>

            <div class="mt-4 flex items-center gap-2">
              <label class="text-sm text-gray-600">Portion (g):</label>
              <input
                v-model="portion"
                type="number"
                min="1"
                class="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div class="mt-5 space-y-3">
              <div class="text-sm text-gray-700">
                <div class="flex justify-between">
                  <span>Kalorien</span>
                  <span class="font-medium">{{ scaled(selectedFood.calories) }} kcal</span>
                </div>
              </div>

              <div class="text-sm text-gray-700">
                <div class="flex justify-between">
                  <span>Kohlenhydrate</span>
                  <span class="font-medium">{{ scaled(selectedFood.carbs) }} g</span>
                </div>
                <div class="h-2 bg-gray-100 rounded mt-1 overflow-hidden">
                  <div class="h-full bg-cyan-500" :style="{ width: barPct(scaled(selectedFood.carbs)) }"></div>
                </div>
              </div>

              <div class="text-sm text-gray-700">
                <div class="flex justify-between">
                  <span>Protein</span>
                  <span class="font-medium">{{ scaled(selectedFood.protein) }} g</span>
                </div>
                <div class="h-2 bg-gray-100 rounded mt-1 overflow-hidden">
                  <div class="h-full bg-cyan-500" :style="{ width: barPct(scaled(selectedFood.protein)) }"></div>
                </div>
              </div>

              <div class="text-sm text-gray-700">
                <div class="flex justify-between">
                  <span>Fett</span>
                  <span class="font-medium">{{ scaled(selectedFood.fat) }} g</span>
                </div>
                <div class="h-2 bg-gray-100 rounded mt-1 overflow-hidden">
                  <div class="h-full bg-cyan-500" :style="{ width: barPct(scaled(selectedFood.fat)) }"></div>
                </div>
              </div>
            </div>

            <div class="mt-6 flex gap-2">
              <button
                type="button"
                class="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                @click="emit('preview', selectedFood)"
              >
                Vorschau
              </button>

              <button
                type="button"
                class="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700"
                @click="emit('import', selectedFood)"
              >
                In DB importieren
              </button>

              <button
                type="button"
                class="ml-auto px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black"
                @click="emit('add', { item: selectedFood, grams: Number(portion) || 100 })"
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { X, Search, Star, Clock } from "lucide-vue-next";

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
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
  query: string;
  results: FoodSearchItem[];
  loading: boolean;
  error: string;
  hasSearched: boolean;
  page: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "search", page: number): void;
  (e: "import", item: FoodSearchItem): void;
  (e: "preview", item: FoodSearchItem): void;
  (e: "add", payload: { item: FoodSearchItem; grams: number }): void;
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

  // FatSecret / externe Quellen liefern i.d.R. keine isFavorite/isRecent Flags.
  // Damit die Filter-Buttons nicht „zufällig“ alles leeren, verhalten sie sich
  // wie "Alle", solange es keine entsprechenden Flags gibt.
  const anyFavorite = list.some((f: any) => !!f?.isFavorite);
  const anyRecent = list.some((f: any) => !!f?.isRecent);

  return list.filter((food: any) => {
    const matchesSearch = !q || String(food.name ?? "").toLowerCase().includes(q);

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

function scaled(v: any) {
  const grams = Math.max(1, Number(portion.value) || 100);
  return Math.round(num(v) * (grams / 100) * 10) / 10;
}

function barPct(v: any) {
  const n = Math.max(0, Math.min(100, num(v)));
  return `${n}%`;
}
</script>
