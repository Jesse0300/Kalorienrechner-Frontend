<template>
  <div class="topbar">
    <img src="/src/assets/logo.svg" alt="Logo" class="logo" />
    <span class="brand">FatSecret - Kalorientracker</span>
  </div>

  <div class="page">
    <header class="header">
      <h1>FatSecret Suche</h1>
      <p class="sub">Finde Lebensmittel und importiere sie direkt in deine Kalorien-Datenbank</p>
    </header>

    <section class="searchbar">
      <input
        v-model="q"
        @keyup.enter="runSearch(1)"
        class="input"
        type="text"
        placeholder="z. B. Apple, Banana, Chicken breast …"
      />
      <button class="btn" :disabled="loading" @click="runSearch(1)">
        {{ loading ? "Suche…" : "Suchen" }}
      </button>
    </section>

    <section v-if="error" class="alert error">{{ error }}</section>

    <section v-if="!loading && results.length === 0 && hasSearched" class="empty">
      Keine Ergebnisse gefunden. Versuche es erneut mit englischen Begriffen (Banana, Rice, Milk …)
    </section>

    <section v-if="loading" class="loading">
      <div class="spinner"></div>
      <div>Lade Ergebnisse…</div>
    </section>

    <section v-if="results.length" class="grid">
      <article v-for="item in results" :key="item.food_id" class="card">
        <div class="title">{{ item.food_name }}</div>
        <div class="desc">{{ item.food_description ?? "—" }}</div>
        <div class="actions">
          <button class="btn ghost" @click="preview(item)">Details</button>
          <button class="btn primary" @click="importToDb(item)" :disabled="importingId===item.food_id">
            {{ importingId===item.food_id ? "Übernehme…" : "Übernehmen" }}
          </button>
        </div>
      </article>
    </section>

    <footer v-if="results.length" class="pager">
      <button class="btn ghost" :disabled="page<=1 || loading" @click="runSearch(page-1)">← Zurück</button>
      <span>Seite {{ page }}</span>
      <button class="btn ghost" :disabled="loading" @click="runSearch(page+1)">Weiter →</button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";

interface FSFood {
  food_id: string | number;
  food_name: string;
  food_description?: string;
}
interface FSFoods {
  food?: FSFood[] | FSFood;
}
interface FSError {
  code?: number;
  message?: string;
}
interface FSSearchResponse {
  foods?: FSFoods;
  error?: FSError;
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const q = ref("");
const page = ref(1);
const size = 10;
const results = ref<FSFood[]>([]);
const loading = ref(false);
const error = ref("");
const hasSearched = ref(false);
const importingId = ref<string | number | null>(null);

function toArray<T>(x: T | T[] | undefined): T[] {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}

function parseDescription(desc: string | undefined) {
  const s = desc ?? "";
  const num = (m: RegExpMatchArray | null): number | null =>
    m?.[1] ? Number(m[1].replace(",", ".")) : null;
  return {
    calories: num(s.match(/Calories:\s*([\d.,]+)/i)),
    carbs:    num(s.match(/Carbs:\s*([\d.,]+)/i)),
    protein:  num(s.match(/Protein:\s*([\d.,]+)/i)),
    fat:      num(s.match(/Fat:\s*([\d.,]+)/i)),
  };
}

async function runSearch(targetPage = 1) {
  if (!q.value.trim()) return;
  loading.value = true;
  hasSearched.value = true;
  error.value = "";
  page.value = targetPage;

  try {
    const res = await axios.get<FSSearchResponse>(`${API_BASE}/api/fatsecret/search`, {
      params: { q: q.value.trim(), page: page.value, size }
    });
    const apiError = res.data?.error?.message;
    if (apiError) throw new Error(apiError);

    const foods = res.data?.foods;
    results.value = toArray<FSFood>(foods?.food as FSFood[] | FSFood | undefined);
  } catch (e: any) {
    const msg =
      e?.response?.data?.error?.message ??
      e?.response?.statusText ??
      e?.message ??
      "Unbekannter Fehler";
    error.value = `Fehler: ${msg}`;
    results.value = [];
  } finally {
    loading.value = false;
  }
}

function preview(item: FSFood) {
  const parsed = parseDescription(item.food_description);
  alert(
    `${item.food_name}\n\n${item.food_description ?? "—"}\n\n` +
    `→ Für 100 g erkannt:\n` +
    `kcal: ${parsed.calories ?? "?"}, KH: ${parsed.carbs ?? "?"} g, ` +
    `Protein: ${parsed.protein ?? "?"} g, Fett: ${parsed.fat ?? "?"} g`
  );
}

async function importToDb(item: FSFood) {
  importingId.value = item.food_id;
  const parsed = parseDescription(item.food_description);
  const payload = {
    name: item.food_name,
    calories: parsed.calories,
    carbs: parsed.carbs,
    protein: parsed.protein,
    fat: parsed.fat,
    categoryId: null
  };

  try {
    await axios.post(`${API_BASE}/api/foods`, payload, {
      headers: { "Content-Type": "application/json" }
    });
    alert(`„${item.food_name}“ wurde gespeichert ✅`);
  } catch (e:any) {
    const msg = e?.response?.data?.message ?? e?.response?.statusText ?? e?.message ?? "Unbekannter Fehler";
    alert(`Speichern fehlgeschlagen: ${msg}`);
  } finally {
    importingId.value = null;
  }
}
</script>

<style>
:root {
  --bg: #eaeaea;
  --surface: #eaeaea;
  --surface-2: #000000;
  --searchbutton: #8ea5c2;
  --text: #0e1a2b;
  --muted: #b9c3cf;
  --addbutton: #8ea5c2;
  --boxborderdetails: #ffffff;
  --primary-light: #FFFFFF;
  --danger: #ff8080;
  --shadow: rgba(80, 80, 80, 0.78);
}

.page {
  min-height: 50vh;
  background: var(--bg);
  color: var(--text);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  gap: 1.6rem;
  padding: 1.6rem;
  box-sizing: border-box;

  padding-top: 100px;
}

.header { text-align: center; }
.header h1 { margin: 0; font-size: 2rem; font-weight: 700; color: var(--primary-light); }
.sub { color: var(--muted); margin-top: 0.5rem; }

.searchbar {
  display: flex;
  gap: 0.6rem;
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  justify-content: center;
  justify-self: center;
}
.input {
  flex: 1; padding: 0.8rem 1rem; font-size: 1rem;
  background: var(--surface);
  border: 1px solid var(--surface-2);
  border-radius: 0.7rem; color: var(--text);
  outline: none; transition: 0.2s;
}
.input:focus {
  border-color: var(--boxborderdetails);
  box-shadow: 0 0 0 2px rgba(0,230,255,0.25);
}

.btn {
  padding: 0.75rem 1.1rem; border-radius: 0.6rem;
  border: 1px solid var(--surface-2);
  background: var(--searchbutton); color: var(--text);
  cursor: pointer; font-weight: 600;
  transition: 0.2s;
}
.btn:disabled { opacity: 0.6; cursor: default; }
.btn.primary {
  background: var(--addbutton);
  color: #000;
  border-color: transparent;
  font-weight: 700;
}
.btn.primary:hover:not(:disabled) {
  background: var(--primary-light);
}
.btn.ghost {
  background: transparent;
  border-color: var(--boxborderdetails);
  color: var(--primary-light);
}
.btn.ghost:hover {
  background: rgba(0,230,255,0.15);
}

.alert.error {
  color: var(--danger);
  background: #2b1c1c;
  border: 1px solid #4a2929;
  padding: 0.7rem 1rem;
  border-radius: 0.6rem;
  width: min(680px, 95%);
  text-align: center;
}

.loading { display: grid; gap: 0.7rem; place-items: center; color: var(--muted); }
.spinner {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 3px solid #333;
  border-top-color: var(--addbutton);
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg) } }

.empty { color: var(--muted); text-align: center; }

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  width: min(700px, 75%);
  margin: 0 auto;
}
.card {
  background: var(--surface);
  border: 1px solid var(--surface-2);
  border-radius: 0.9rem;
  padding: 1rem;
  display: grid;
  gap: 0.5rem;
  box-shadow: 0 0 5px var(--shadow);
  transition: 0.2s;
}
.card:hover { border-color: var(--primary-light); transform: translateY(-2px); }

.title { font-weight: 600; font-size: 1.05rem; color: var(--primary-light); }
.desc { color: var(--muted); font-size: 0.9rem; min-height: 38px; }
.actions { display: flex; gap: 0.6rem; justify-content: flex-end; }

.pager {
  display: flex; gap: 1rem;
  align-items: center; color: var(--muted);
  margin-top: 1.2rem;
}
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 64px;

  display: flex;
  align-items: center;
  gap: 0.75rem;

  background: #165FBAFF;
  backdrop-filter: blur(6px);
  border-bottom: 1px solid #d0d0d0;
  padding: 0 2rem;
  box-sizing: border-box;

  z-index: 1000;
}
.logo {
  height: 36px;
  width: auto;
}
.brand {
  font-weight: 700;
  font-size: 1.1rem;
  color: #FFFFFF;
}
</style>
