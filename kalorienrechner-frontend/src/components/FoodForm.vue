<script setup lang="ts">
import { ref } from "vue";
import { api } from "../service/api";

const food = ref({
  name: "",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
});

async function save() {
  await api.post("/foods", food.value);
  alert("Gespeichert!");
}
</script>

<template>
  <div>
    <h2>Neues Lebensmittel</h2>
    <input v-model="food.name" placeholder="Name" />
    <input v-model.number="food.calories" placeholder="Kalorien" />
    <input v-model.number="food.protein" placeholder="Protein" />
    <input v-model.number="food.carbs" placeholder="Kohlenhydrate" />
    <input v-model.number="food.fat" placeholder="Fett" />
    <button @click="save">Speichern</button>
  </div>
</template>
