<template>
  <div class="p-8 max-w-7xl mx-auto">
    <div class="mb-6">
      <h1 class="text-gray-900 mb-1">Statistiken</h1>
      <p class="text-gray-500">Deine Fortschritte im Überblick</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2 text-gray-600 mb-2">
          <span>📅</span>
          <span>Durchschn. Kalorien (7 Tage)</span>
        </div>

        <div class="text-3xl text-gray-900 mb-1">
          {{ avgCalories }} kcal
        </div>

        <div
          class="flex items-center gap-1 text-sm"
          :class="diffPercent >= 0 ? 'text-green-600' : 'text-red-600'"
        >
          <span>{{ diffPercent >= 0 ? "📉" : "📈" }}</span>
          <span>
            {{ Math.abs(diffPercent) }}% {{ diffPercent >= 0 ? "unter" : "über" }} Ziel
            <span class="text-gray-500">(Ziel: {{ targetCalories }} kcal)</span>
          </span>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center gap-4">
          <div
            class="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center"
          >
            <span class="text-white text-2xl">🔥</span>
          </div>
          <div>
            <div class="text-gray-600 text-sm mb-1">Aktuelle Streak</div>
            <div class="text-3xl text-gray-900">{{ streakDays }} Tage</div>
            <div class="text-green-600 text-sm">In Folge getrackt!</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 class="text-gray-900 mb-2">Kalorien (letzte 7 Tage)</h2>

      <div v-if="loading" class="text-gray-500 text-sm">Lade Daten…</div>
      <div v-else-if="error" class="text-red-600 text-sm">{{ error }}</div>

      <div v-else class="space-y-2">
        <div
          v-for="d in last7Days"
          :key="d.date"
          class="flex items-center justify-between p-3 rounded-lg border border-gray-100"
        >
          <div class="text-gray-700">
            {{ formatDate(d.date) }}
          </div>

          <div class="flex items-center gap-3">
            <div class="text-gray-500 text-sm">
              {{ d.calories }} / {{ targetCalories }} kcal
            </div>

            <div class="w-40 h-2 bg-gray-100 rounded overflow-hidden">
              <div
                class="h-full bg-cyan-500"
                :style="{ width: barPct(d.calories, targetCalories) }"
              />
            </div>
          </div>
        </div>

        <div v-if="last7Days.length === 0" class="text-gray-500 text-sm">
          Keine Daten vorhanden.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { api } from "../../service/api";
import type { MealsDayDTO } from "../../types/meals";
import type { UserGoalData } from "../../types/goals";

type DayRow = { date: string; calories: number };

const loading = ref(false);
const error = ref("");
const last7Days = ref<DayRow[]>([]);

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function lastNDates(n: number) {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(isoDate(d));
  }
  return out; // [today, yesterday, ...]
}

function readGoalFromLocalStorage(): UserGoalData | null {
  try {
    const raw = localStorage.getItem("userGoalData");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const targetCalories = computed(() => {
  return readGoalFromLocalStorage()?.targetCalories ?? 2000;
});

async function loadLast7Days() {
  loading.value = true;
  error.value = "";

  try {
    const dates = lastNDates(7);

    // sequenziell (stabil & einfach)
    const rows: DayRow[] = [];
    for (const date of dates) {
      const res = await api.get<MealsDayDTO>("/meals/day", {
        params: { date },
      });
      const total = Math.round(Number(res.data?.totalCalories ?? 0));
      rows.push({ date, calories: total });
    }

    last7Days.value = rows;
  } catch (e: any) {
    error.value =
      e?.response?.data?.message ??
      e?.response?.statusText ??
      e?.message ??
      "Fehler beim Laden der Statistik";
  } finally {
    loading.value = false;
  }
}

const avgCalories = computed(() => {
  if (last7Days.value.length === 0) return 0;
  const sum = last7Days.value.reduce((s, d) => s + d.calories, 0);
  return Math.round(sum / last7Days.value.length);
});

// positiv = unter Ziel, negativ = über Ziel
const diffPercent = computed(() => {
  const target = targetCalories.value || 2000;
  if (!target) return 0;
  const diff = target - avgCalories.value;
  return Math.round((diff / target) * 100);
});

// Streak: wie viele Tage ab heute rückwärts "getrackt" (calories > 0)
const streakDays = computed(() => {
  let streak = 0;
  for (const d of last7Days.value) {
    if (d.calories > 0) streak++;
    else break;
  }
  return streak;
});

function formatDate(iso: string) {
  // iso: YYYY-MM-DD
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.`;
}

function barPct(value: number, target: number) {
  const t = Math.max(1, target);
  const pct = Math.max(0, Math.min(100, Math.round((value / t) * 100)));
  return `${pct}%`;
}

onMounted(() => {
  loadLast7Days();
});
</script>
