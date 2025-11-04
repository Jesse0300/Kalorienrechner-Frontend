<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '@/service/api'
import FoodList from '@/components/FoodList.vue'

type Food = { id?: number; name: string; calories: number }
const foods = ref<Food[]>([])
const loading = ref(false)
const error = ref<string|null>(null)

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await api.get<Food[]>('/foods') // -> GET /api/v1/foods
    foods.value = data
  } catch (e:any) {
    error.value = e?.message ?? 'Laden fehlgeschlagen'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="max-w-2xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Kalorienliste</h1>
    <div v-if="loading">Lade…</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <FoodList v-else :items="foods" />
  </section>
  <form>
    <fieldset disabled>
      <legend>Disabled fieldset example</legend>
      <div class="mb-3">
        <label for="disabledTextInput" class="form-label">Disabled input</label>
        <input type="text" id="disabledTextInput" class="form-control" placeholder="Disabled input">
      </div>
      <div class="mb-3">
        <label for="disabledSelect" class="form-label">Disabled select menu</label>
        <select id="disabledSelect" class="form-select">
          <option>Disabled select</option>
        </select>
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="disabledFieldsetCheck" disabled>
          <label class="form-check-label" for="disabledFieldsetCheck">
            Can’t check this
          </label>
        </div>
      </div>
      <button type="submit" class="btn btn-primary">Submit</button>
    </fieldset>
  </form>
</template>

