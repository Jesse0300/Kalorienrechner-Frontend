<template>
  <div class="fatsecret-search">
    <h2>FatSecret Suche</h2>

    <input
      v-model="searchTerm"
      @keyup.enter="searchFood"
      placeholder="Lebensmittel eingeben..."
    />
    <button @click="searchFood">Suchen</button>

    <div v-if="loading">Suche läuft...</div>
    <div v-if="error" style="color: red">{{ error }}</div>

    <ul v-if="results.length > 0">
      <li v-for="food in results" :key="food.food_id">
        <strong>{{ food.food_name }}</strong><br />
        {{ food.food_description }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

// ⚙️ Basis-URL zu deinem Backend
const API_BASE_URL = "https://webtech-projekt-bjvj.onrender.com";

const searchTerm = ref("");
const results = ref([]);
const loading = ref(false);
const error = ref("");

const searchFood = async () => {
  if (!searchTerm.value.trim()) return;
  loading.value = true;
  error.value = "";

  try {
    const res = await axios.get(
      `${API_BASE_URL}/api/fatsecret/search?q=${encodeURIComponent(searchTerm.value)}`
    );
    results.value = res.data.foods?.food || [];
  } catch (err) {
    error.value = "Fehler beim Abrufen der Daten.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.fatsecret-search {
  margin: 20px;
}
input {
  padding: 8px;
  margin-right: 8px;
}
button {
  padding: 8px 12px;
}
</style>
