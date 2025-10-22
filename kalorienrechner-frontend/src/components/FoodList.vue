<script setup lang="ts">
export interface Food { id?: number; name: string; calories: number }
const props = defineProps<{ items: Food[] }>()
</script>

<template>
  <div v-if="!items?.length" class="text-gray-500 italic">Keine Einträge vorhanden.</div>
  <ul v-else class="divide-y">
    <li v-for="f in items" :key="f.id ?? f.name" class="py-2 flex justify-between">
      <span>{{ f.name }}</span>
      <span>{{ f.calories }} kcal/100g</span>
    </li>
  </ul>
</template>

