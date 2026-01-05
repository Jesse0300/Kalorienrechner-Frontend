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
  (e: "added"): void; // ✅ wichtig: signalisiert App.vue -> neu laden
}>();

const q = ref("");
const page = ref(0);
const size = 10;

const loading = ref(false);
const error = ref("");
const hasSearched = ref(false);

const rawFoods = ref<any[]>([]);
const importingId = ref<string | number | null>(null);

function matchNumber(text: string, re: RegExp): number {
  const m = text.match(re);
  if (!m?.[1]) return 0;
  const v = Number(String(m[1]).replace(",", "."));
  return Number.isFinite(v) ? v : 0;
}

function parseDescription(desc: string | undefined | null) {
  const s = String(desc ?? "");
  const calories = matchNumber(s, /Calories:\s*([\d.,]+)/i);
  const fat = matchNumber(s, /(?:Total\s*)?Fat:\s*([\d.,]+)/i);
  const carbs = matchNumber(s, /(?:Total\s*)?(?:Carbs?|Carbohydrates?):\s*([\d.,]+)/i);
  const protein = matchNumber(s, /(?:Protein|Proteins):\s*([\d.,]+)/i);

  return { calories, fat, carbs, protein };
}

const mealType = computed(() => props.mealType);

const uiResults = computed<FoodSearchItem[]>(() => {
  return rawFoods.value.map((it: any) => {
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
  if (!query) return;

  loading.value = true;
  error.value = "";
  hasSearched.value = true;
  page.value = newPage;

  try {
    const res = await api.get("/fatsecret/search", {
      params: { q: query, page: page.value, size },
    });

    const foodsNode = res.data?.foods;
    const list = foodsNode?.food;

    if (Array.isArray(list)) rawFoods.value = list;
    else if (list && typeof list === "object") rawFoods.value = [list];
    else rawFoods.value = [];
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ??
      e?.response?.statusText ??
      e?.message ??
      "Unbekannter Fehler";
    error.value = msg;
  } finally {
    loading.value = false;
  }
}

function preview(_item: any) {
  // optional
}

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

async function onAddFromModal(payload: { item: any; portion: number; mealType: MealType }) {
  try {
    // 1) Food speichern
    const foodId = await importToDb(payload.item);

    // 2) MealItem speichern
    await api.post("/meals/items", {
      date: todayLocalISO(),
      mealType: toBackendMealType(payload.mealType as any),
      foodId,
      amountGrams: Number(payload.portion || 0),
    });

    // ✅ 3) wichtig: App soll neu laden
    emit("added");
    emit("close");
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ??
      e?.response?.statusText ??
      e?.message ??
      "Unbekannter Fehler";
    alert(`Hinzufügen fehlgeschlagen: ${msg}`);
  }
}
</script>
