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

defineProps<{
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

function parseMacros(desc: string) {
  const calories = matchNumber(desc, /Calories:\s*([\d.,]+)/i);
  const fat = matchNumber(desc, /Fat:\s*([\d.,]+)\s*g/i);
  const carbs = matchNumber(desc, /Carbs:\s*([\d.,]+)\s*g/i);
  const protein = matchNumber(desc, /Protein:\s*([\d.,]+)\s*g/i);
  return { calories, fat, carbs, protein };
}

const uiResults = computed<FoodSearchItem[]>(() => {
  const list = rawFoods.value ?? [];
  return list.map((it: any) => {
    const desc = String(it?.food_description ?? "");
    const parsed = parseMacros(desc);

    return {
      id: it?.food_id ?? it?.id ?? it?.name,
      name: it?.food_name ?? it?.name ?? "Unbekannt",
      description: desc,
      calories: parsed.calories,
      carbs: parsed.carbs,
      fat: parsed.fat,
      protein: parsed.protein,
      raw: it,
    };
  });
});

/**
 * ✅ Robust: akzeptiert mehrere Backend-Response-Formate
 */
function extractFoods(data: any): any[] {
  // Backend kann direkt Array liefern
  if (Array.isArray(data)) return data;

  // { foods: [...] }
  if (Array.isArray(data?.foods)) return data.foods;

  // FatSecret typisch: { foods: { food: [...] } } oder { foods: { food: {...} } }
  const node = data?.foods?.food ?? data?.foods;
  if (Array.isArray(node)) return node;
  if (node && typeof node === "object" && node.food && Array.isArray(node.food)) return node.food;
  if (node && typeof node === "object" && !Array.isArray(node) && node.food_name) return [node];

  // fallback: { food: [...] }
  if (Array.isArray(data?.food)) return data.food;
  if (data?.food && typeof data.food === "object") return [data.food];

  return [];
}

function extractBackendError(data: any): string | null {
  // mögliche Formate:
  // { error: "..."} | { message: "..."} | { error: { message: "..." } }
  const msg =
    data?.message ??
    data?.error?.message ??
    data?.error ??
    data?.errors?.[0]?.message ??
    null;

  return msg ? String(msg) : null;
}

async function runSearch(newPage: number) {
  const query = q.value.trim();

  // Leere Suche: state resetten
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
      params: {
        q: query,
        page: page.value,
        size,
      },
    });

    // Falls Backend zwar 200 liefert, aber Fehlerobjekt zurückgibt
    const backendErr = extractBackendError(res.data);
    if (backendErr) {
      error.value = backendErr;
      rawFoods.value = [];
      return;
    }

    rawFoods.value = extractFoods(res.data);
    // wenn leer -> UI zeigt "Nichts gefunden" (error bleibt leer)
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

/**
 * Importiert einen FatSecret Treffer in die eigene DB
 * (falls du das Backend dafür hast – sonst bleibt es harmless)
 */
async function importToDb(item: FoodSearchItem) {
  const id = item?.raw?.food_id ?? item?.id;
  if (!id) return;

  importingId.value = id;

  try {
    // optional: falls du irgendwann ein Backend-Import-Endpoint hast
    // await api.post("/fatsecret/import", { foodId: id });

    // aktuell: wir speichern nur lokal in unserer Food Tabelle
    // du hast FoodCreateDTO -> wir nehmen Name+Macros
    await api.post("/foods", {
      name: item.name,
      calories: item.calories ?? 0,
      carbs: item.carbs ?? 0,
      fat: item.fat ?? 0,
      protein: item.protein ?? 0,
    });

    emit("added");
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ??
      e?.response?.data?.error ??
      e?.response?.statusText ??
      e?.message ??
      "Unbekannter Fehler";
    error.value = `Import fehlgeschlagen: ${msg}`;
  } finally {
    importingId.value = null;
  }
}

function preview(_item: FoodSearchItem) {
  // UI handled preview (Modal etc.) – nichts am Layout ändern
}

async function onAddFromModal(item: FoodSearchItem) {
  try {
    // ✅ AddMealItemRequest: mealType + date + foodId ODER name/macros (je nach Backend)
    // Wir nehmen hier den sicheren Weg: erst Food in DB, dann MealItem hinzufügen.
    const createFoodRes = await api.post("/foods", {
      name: item.name,
      calories: item.calories ?? 0,
      carbs: item.carbs ?? 0,
      fat: item.fat ?? 0,
      protein: item.protein ?? 0,
    });

    const foodId = createFoodRes?.data?.id;
    if (!foodId) throw new Error("Food konnte nicht erstellt werden (id fehlt).");

    await api.post("/meals/add-item", {
      foodId,
      mealType: toBackendMealType(item.mealType),
      date: todayLocalISO(),
      quantity: 1,
    });

    // ✅ wichtig: App soll neu laden
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
