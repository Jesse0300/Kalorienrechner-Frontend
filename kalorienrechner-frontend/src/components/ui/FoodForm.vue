<script setup lang="ts">
import { computed, ref } from "vue";
import { api } from "@/service/api.ts";

const food = ref({
  name: "",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
});

const saving = ref(false);
const error = ref<string | null>(null);

const nameOk = computed(() => food.value.name.trim().length > 0);
const numbersOk = computed(() => {
  const { calories, protein, carbs, fat } = food.value;
  return calories >= 0 && protein >= 0 && carbs >= 0 && fat >= 0;
});

const canSave = computed(() => nameOk.value && numbersOk.value && !saving.value);

async function save() {
  error.value = null;
  if (!canSave.value) {
    error.value = !nameOk.value
      ? "Name darf nicht leer sein."
      : "Kalorien und Makros dürfen nicht negativ sein.";
    return;
  }

  try {
    saving.value = true;
    await api.post("/foods", {
      name: food.value.name.trim(),
      calories: Number(food.value.calories) || 0,
      protein: Number(food.value.protein) || 0,
      carbs: Number(food.value.carbs) || 0,
      fat: Number(food.value.fat) || 0,
    });
    alert("Gespeichert!");
    // optional: Form reset (additiv)
    food.value = { name: "", calories: 0, protein: 0, carbs: 0, fat: 0 };
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ??
      e?.response?.data?.error ??
      e?.response?.statusText ??
      e?.message ??
      "Speichern fehlgeschlagen";
    error.value = String(msg);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div>
    <h2>Neues Lebensmittel</h2>

    <input v-model="food.name" placeholder="Name" />
    <input v-model.number="food.calories" placeholder="Kalorien" min="0" />
    <input v-model.number="food.protein" placeholder="Protein" min="0" />
    <input v-model.number="food.carbs" placeholder="Kohlenhydrate" min="0" />
    <input v-model.number="food.fat" placeholder="Fett" min="0" />

    <button @click="save" :disabled="!canSave">
      {{ saving ? "Speichere…" : "Speichern" }}
    </button>

    <!-- ✅ Additiv: Fehlermeldung -->
    <p v-if="error" style="color: #dc2626; margin-top: 8px">
      {{ error }}
    </p>
  </div>
</template>
