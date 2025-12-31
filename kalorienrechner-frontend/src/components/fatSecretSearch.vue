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
import axios from "axios";
import FoodSearch from "./ui/FoodSearch.vue";

const props = defineProps<{
  mealType: MealType;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const q = ref("");
const page = ref(1);
const size = 10;

const results = ref<any[]>([]);
const loading = ref(false);
const error = ref("");
const hasSearched = ref(false);
const importingId = ref<string | number | null>(null);

function toArray<T>(x: T | T[] | undefined): T[] {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}

function parseDescription(desc: string | undefined) {
  const s = desc ?? "";
  const num = (m: RegExpMatchArray | null): number | null =>
    m?.[1] ? Number(m[1].replace(",", ".")) : null;

  return {
    calories: num(s.match(/Calories:\s*([\d.,]+)/i)),
    carbs: num(s.match(/Carbs:\s*([\d.,]+)/i)),
    protein: num(s.match(/Protein:\s*([\d.,]+)/i)),
    fat: num(s.match(/Fat:\s*([\d.,]+)/i)),
  };
}

async function runSearch(targetPage = 1) {
  if (!q.value.trim()) return;
  loading.value = true;
  hasSearched.value = true;
  error.value = "";
  page.value = targetPage;

  try {
    const res = await axios.get(`${API_BASE}/api/fatsecret/search`, {
      params: { q: q.value.trim(), page: page.value, size },
    });

    if (res.data?.error?.message) throw new Error(res.data.error.message);

    // Obj oder Arr
    const foods = res.data?.foods?.food ?? res.data?.foods ?? [];
    results.value = toArray<any>(foods);
  } catch (e: any) {
    const msg =
      e?.response?.data?.error?.message ??
      e?.response?.statusText ??
      e?.message ??
      "Unbekannter Fehler";
    error.value = `Fehler: ${msg}`;
    results.value = [];
  } finally {
    loading.value = false;
  }
}

function preview(item: any) {
  const parsed = parseDescription(item?.food_description);
  alert(
    `${item?.food_name ?? "—"}\n\n${item?.food_description ?? "—"}\n\n` +
    `→ Für 100 g erkannt:\n` +
    `kcal: ${parsed.calories ?? "?"}, KH: ${parsed.carbs ?? "?"} g, ` +
    `Protein: ${parsed.protein ?? "?"} g, Fett: ${parsed.fat ?? "?"} g`
  );
}

async function importToDb(item: any) {
  importingId.value = item?.food_id ?? null;

  const parsed = parseDescription(item?.food_description);
  const payload = {
    name: item?.food_name,
    calories: parsed.calories,
    carbs: parsed.carbs,
    protein: parsed.protein,
    fat: parsed.fat,
    categoryId: null,
  };

  try {
    await axios.post(`${API_BASE}/api/foods`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    alert(`„${item?.food_name ?? "Lebensmittel"}“ wurde gespeichert ✅`);
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ??
      e?.response?.statusText ??
      e?.message ??
      "Unbekannter Fehler";
    alert(`Speichern fehlgeschlagen: ${msg}`);
  } finally {
    importingId.value = null;
  }
}

import type { FoodSearchItem, MealType } from "@/types/FoodSearchTypes";

const uiResults = computed<FoodSearchItem[]>(() => {
  return (results.value ?? []).map((it: any) => {
    const parsed = parseDescription(it?.food_description);
    return {
      id: it?.food_id,
      name: it?.food_name ?? "—",
      description: it?.food_description ?? "—",
      calories: parsed.calories ?? 0,
      carbs: parsed.carbs ?? 0,
      fat: parsed.fat ?? 0,
      protein: parsed.protein ?? 0,
      isFavorite: false,
      raw: it,
    };
  });
});

// Mahlzeiten speichern sich momentan nur in DB, zukünftig auch im Dashboard
// POST / Endpoints Entities in Backend einfügen für Kompatiblität
function onAddFromModal(payload: { item: any; portion: number; mealType: string }) {
  importToDb(payload.item);
  emit("close");
}


</script>
