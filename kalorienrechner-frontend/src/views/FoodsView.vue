<script setup lang="ts">
import { ref } from 'vue'
import FoodList from '@/components/FoodList.vue'
import type { Food } from '@/components/FoodList.vue'

const foods = ref<Food[]>([
  { id: 1, name: 'Apfel', calories: 52 },
  { id: 2, name: 'Banane', calories: 89 },
  { id: 3, name: 'Haferflocken', calories: 379 },
])
</script>

<template>
  <section class="max-w-2xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Kalorienliste</h1>
    <FoodList :items="foods" />
  </section>
</template>
