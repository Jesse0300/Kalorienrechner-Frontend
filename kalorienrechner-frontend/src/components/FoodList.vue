<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../service/api";

const foods = ref<any[]>([]);

onMounted(async () => {
  const response = await api.get("/foods");
  foods.value = response.data;
});
</script>

<template>
  <div>
    <h2>Lebensmittel</h2>
    <ul>
      <li v-for="f in foods" :key="f.id">
        {{ f.name }} — {{ f.calories }} kcal/100g
      </li>
    </ul>
  </div>
</template>

