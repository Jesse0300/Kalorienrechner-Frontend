<template>
  <FoodSearch
    :mealType="mealType"
    v-model:query="q"
    :results="uiResults"
    :loading="loading"
    :error="error"
    :hasSearched="hasSearched"
    :page="page"
    @close="emit('close')"
    @search="runSearch"
    @import="importToDb"
    @preview="preview"
    @add="onAddFromModal"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import FoodSearch from "./ui/FoodSearch.vue";
import { api } from "../service/api";
import type { FoodSearchItem, MealType } from "../types/FoodSearchTypes";
import { toBackendMealType, todayLocalISO } from "../types/mealsBackend";

const props = defineProps<{
  mealType: MealType;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "added"): void; // App/Dashboard kann danach reloaden
}>();

const q = ref("");
const page = ref(0);
const size = 10;

const loading = ref(false);
const error = ref("");
const hasSearched = ref(false);

const rawFoods = ref<any[]>([]);
const importingId = ref<string | number | null>(null);

const mealType = computed(() => props.mealType);

function matchNumber(text: string, re: RegExp): number {
  const m = text.match(re);
  if (!m?.[1]) return 0;
  const v = Number(String(m[1]).replace(",", "."));
  return Number.isFinite(v) ? v : 0;
}

function parseDescription(desc: string) {
  const s = String(desc ?? "");

  // FatSecret liefert oft: "Per 1 serving - Calories: 95kcal | Fat: 0.3g | Carbs: 25.1g | Protein: 0.5g"
  const calories = matchNumber(s, /Calories:\s*([\d.,]+)/i);
  const fat = matchNumber(s, /Fat:\s*([\d.,]+)\s*g/i);
  const carbs = matchNumber(s, /Carbs:\s*([\d.,]+)\s*g/i);
  const protein = matchNumber(s, /Protein:\s*([\d.,]+)\s*g/i);

  return { calories, fat, carbs, protein };
}

/**
 * ✅ Robust: akzeptiert mehrere Backend-Response-Formate
 */
function extractFoods(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.foods)) return data.foods;

  // FatSecret typisch: { foods: { food: [...] } } oder { foods: { food: {...} } }
  const node = data?.foods?.food ?? data?.foods;
  if (Array.isArray(node)) return node;
  if (node && typeof node === "object" && node.food_name) return [node];

  if (Array.isArray(data?.food)) return data.food;
  if (data?.food && typeof data.food === "object") return [data.food];

  return [];
}

function extractBackendError(data: any): string | null {
  const msg =
    data?.message ??
    data?.error?.message ??
    data?.error ??
    data?.errors?.[0]?.message ??
    null;
  return msg ? String(msg) : null;
}

const uiResults = computed<FoodSearchItem[]>(() => {
  return (rawFoods.value ?? []).map((it: any) => {
    const parsed = parseDescription(it?.food_description);
    return {
      id: it?.food_id ?? it?.food_name ?? Math.random(),
      name: it?.food_name ?? "Unbekannt",
      description: it?.food_description ?? "",
      calories: parsed.calories,
      carbs: parsed.carbs,
      fat: parsed.fat,
      protein: parsed.protein,
      raw: it,
    };
  });
});

async function runSearch(newPage: number) {
  const query = q.value.trim();

  if (!query) {
    rawFoods.value = [];
    hasSearched.value = false;
    error.value = "";
    page.value = 0;
    return;
  }

  loading.value = true;
  error.value = "";
  hasSearched.value = true;
  page.value = newPage;

  try {
    const res = await api.get("/fatsecret/search", {
      params: { q: query, page: page.value, size },
    });

    const backendErr = extractBackendError(res.data);
    if (backendErr) {
      error.value = backendErr;
      rawFoods.value = [];
      return;
    }

    rawFoods.value = extractFoods(res.data);
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ??
      e?.response?.data?.error?.message ??
      e?.response?.data?.error ??
      e?.response?.statusText ??
      e?.message ??
      "Unbekannter Fehler";
    error.value = String(msg);
    rawFoods.value = [];
  } finally {
    loading.value = false;
  }
}

function preview(_item: any) {
  // optional – UI bleibt unverändert
}

/**
 * Importiert einen Treffer in die eigene Foods-Tabelle und gibt die neue Food-ID zurück.
 */
async function importToDb(item: any): Promise<number> {
  importingId.value = item?.food_id ?? null;

  const parsed = parseDescription(item?.food_description);
  const payload = {
    name: item?.food_name,
    calories: parsed.calories,
    protein: parsed.protein,
    carbs: parsed.carbs,
    fat: parsed.fat,
    categoryId: null,
  };

  try {
    const res = await api.post("/foods", payload);
    return Number(res.data?.id);
  } finally {
    importingId.value = null;
  }
}

/**
 * ✅ FoodSearch.vue erwartet:
 * payload: { item: any; portion: number; mealType: MealType }
 */
async function onAddFromModal(payload: { item: any; portion: number; mealType: MealType }) {
  try {
    // 1) Food in DB erstellen (oder aus importToDb holen)
    const foodId = await importToDb(payload.item);

    // 2) MealItem hinzufügen (Backend: POST /api/meals/items, fields: date, mealType, foodId, amountGrams)
    await api.post("/meals/items", {
      date: todayLocalISO(),
      mealType: toBackendMealType(payload.mealType),
      foodId,
      amountGrams: Number(payload.portion) > 0 ? Number(payload.portion) : 100, // fallback
    });

    // 3) wichtig: App soll neu laden + Modal schließen
    emit("added");
    emit("close");
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ??
      e?.response?.data?.error ??
      e?.response?.statusText ??
      e?.message ??
      "Unbekannter Fehler";
    alert(`Hinzufügen fehlgeschlagen: ${msg}`);
  }
}
</script>
