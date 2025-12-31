<template>
  <aside class="fixed top-0 left-0 h-full bg-white border-r border-gray-200 w-64 flex flex-col">
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center text-white relative overflow-hidden"
        >
          <span class="font-bold text-lg">N1</span>
          <div class="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full opacity-80" />
        </div>
        <span class="text-gray-900">NutriOne</span>
      </div>
    </div>


    <nav class="p-4 space-y-1 flex-1">
      <button
        v-for="item in navItems"
        :key="item.id"
        @click="handleNavigate(item.id)"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
        :class="
          currentView === item.id
            ? 'bg-cyan-50 text-cyan-700'
            : 'text-gray-600 hover:bg-gray-50'
        "
      >
        <span class="w-5 h-5 flex items-center justify-center">
          {{ item.icon }}
        </span>
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <div class="p-4 border-t border-gray-200">
      <div class="flex items-center gap-3 px-4 py-3">
        <div
          class="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center text-white"
        >
          U
        </div>
        <div>
          <div class="text-gray-900">Benutzer</div>
          <div class="text-gray-500 text-sm">
            <template v-if="userGoalData">
              Ziel:
              {{ userGoalData.targetCalories.toLocaleString("de-DE") }} kcal
              <div class="text-xs text-gray-400">
                {{ userGoalData.goalLabel }} • {{ userGoalData.weight }} kg
              </div>
            </template>
            <template v-else>
              Kein Ziel gesetzt
            </template>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { UserGoalData } from "../types/goals";

type View = "dashboard" | "statistics" | "weight-goal" | "settings";

const props = defineProps<{
  currentView: View;
  userGoalData: UserGoalData | null;
}>();

const emit = defineEmits<{
  (e: "navigate", view: View): void;
}>();

const navItems: Array<{ id: View; icon: string; label: string }> = [
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  { id: "statistics", icon: "📈", label: "Statistiken" },
  { id: "weight-goal", icon: "⚖️", label: "Gewicht & Ziel" },
  { id: "settings", icon: "⚙️", label: "Einstellungen" },
];

function handleNavigate(view: View) {
  emit("navigate", view);
}

const { currentView, userGoalData } = props;
</script>
