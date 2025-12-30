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
        <div class="text-3xl text-gray-900 mb-1">{{ avgCalories }}</div>
        <div class="flex items-center gap-1 text-green-600 text-sm">
          <span>📉</span>
          <span>5% unter Ziel</span>
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
      <p class="text-gray-500 text-sm">
        Das Diagramm wird später mit einer Vue-Chart-Library umgesetzt. Aktuell liegen
        noch keine Trackingdaten vor.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const last7DaysCalories: Array<{ day: string; calories: number; target: number }> = [];

const avgCalories =
  last7DaysCalories.length > 0
    ? Math.round(
      last7DaysCalories.reduce((sum, d) => sum + d.calories, 0) /
      last7DaysCalories.length
    )
    : 0;

const streakDays = 0;
</script>
