<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h2 class="text-gray-900 mb-6">Streak &amp; Gewohnheiten</h2>

    <div
      class="flex items-center gap-4 mb-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl"
    >
      <div
        class="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center"
      >
        <span class="text-3xl">🔥</span>
      </div>
      <div>
        <div class="text-3xl text-gray-900 mb-1">
          {{ streakDays }} Tage
        </div>
        <div class="text-gray-600">In Folge getrackt</div>
      </div>
    </div>

    <div class="mb-6">
      <div class="text-gray-600 text-sm mb-3">Letzte 7 Tage</div>
      <div class="flex gap-2">
        <div
          v-for="(tracked, i) in last7Days"
          :key="i"
          class="flex-1 h-12 rounded-lg flex items-center justify-center"
          :class="
            tracked
              ? 'bg-cyan-100 text-cyan-700'
              : 'bg-gray-100 text-gray-400'
          "
        >
          <div
            v-if="tracked"
            class="w-3 h-3 bg-cyan-500 rounded-full"
          />
          <div
            v-else
            class="w-3 h-3 border-2 border-gray-300 rounded-full"
          />
        </div>
      </div>
      <div class="flex justify-between text-gray-400 text-xs mt-2">
        <span>Mo</span>
        <span>Di</span>
        <span>Mi</span>
        <span>Do</span>
        <span>Fr</span>
        <span>Sa</span>
        <span>So</span>
      </div>
    </div>

    <div
      class="flex items-center gap-3 p-3 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg"
    >
      <div
        class="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg flex items-center justify-center"
      >
        <span class="text-lg">🏆</span>
      </div>
      <div>
        <div class="text-gray-900">Wochenmeister</div>
        <div class="text-gray-600 text-sm">0 Tage in Folge!</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const streakDays = 0; // Mock da fehlende Backend Einbindung
const last7Days = [false, false, false, false, false, false, false];
</script>
