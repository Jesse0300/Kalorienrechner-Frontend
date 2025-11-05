<template>
  <div class="page">
    <header class="header">
      <h1>Kalorienrechner · FatSecret Suche</h1>
      <p class="sub">Suche nach Lebensmitteln und übernehme Nährwerte in deine DB</p>
    </header>

    <section class="searchbar">
      <input
        v-model="q"
        @keyup.enter="runSearch(1)"
        class="input"
        type="text"
        autocomplete="off"
        placeholder="z. B. apple, banana, chicken breast …"
      />
      <button class="btn" :disabled="loading" @click="runSearch(1)">
        {{ loading ? "Suche…" : "Suchen" }}
      </button>
    </section>

    <section v-if="error" class="alert error">
      {{ error }}
    </section>

    <section v-if="!loading && results.length === 0 && hasSearched" class="empty">
      Keine Ergebnisse gefunden. Probiere englische Begriffe (banana, rice, milk …)
    </section>

    <section v-if="loading" class="loading">
      <div class="spinner"></div>
      <div>Lade Ergebnisse…</div>
    </section>

    <section v-if="results.length" class="grid">
      <article v-for="item in results" :key="item.food_id" class="card">
        <div class="title">{{ item.food_name }}</div>
        <div class="desc">{{ item.food_description }}</div>

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

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const q = ref("");
const page = ref(1);
const size = 10;

const results = ref<any[]>([]);
const loading = ref(false);
const error = ref("");
const hasSearched = ref(false);
const importingId = ref<string | number | null>(null);

async function runSearch(targetPage = 1) {
  if (!q.value.trim()) return;
  loading.value = true;
  error.value = "";
  hasSearched.value = true;
  page.value = targetPage;

  try {
    const res = await axios.get(`${API_BASE}/api/fatsecret/search`, {
      params: { q: q.value.trim(), page: page.value, size },
    });

    // FatSecret-Error sauber anzeigen
    if (res.data?.error?.message) {
      throw new Error(res.data.error.message);
    }

    results.value = res.data?.foods?.food || res.data?.foods || res.data || [];
  } catch (e:any) {
    const msg =
      e?.response?.data?.error?.message ||
      e?.response?.statusText ||
      e?.message ||
      "Unbekannter Fehler";
    error.value = `Fehler: ${msg}`;
    results.value = [];
  } finally {
    loading.value = false;
  }
}

// Mini-Parser: aus "Per 100g - Calories: 52kcal | Carbs: 14g | Protein: 0.3g | Fat: 0.2g"
// kcal/Carbs/Protein/Fat herausziehen (robust gegen fehlende Werte)
function parseDescription(desc: string) {
  const toNum = (m: RegExpMatchArray | null) =>
    m ? Number(m[1].replace(",", ".")) : null;

  return {
    calories: toNum(desc.match(/Calories:\s*([\d.,]+)/i)),
    carbs:    toNum(desc.match(/Carbs:\s*([\d.,]+)/i)),
    protein:  toNum(desc.match(/Protein:\s*([\d.,]+)/i)),
    fat:      toNum(desc.match(/Fat:\s*([\d.,]+)/i)),
  };
}

function preview(item: any) {
  const parsed = parseDescription(item.food_description || "");
  alert(
    `${item.food_name}\n\n` +
    `${item.food_description || "—"}\n\n` +
    `→ Für 100g erkannt:\n` +
    `kcal: ${parsed.calories ?? "?"}, KH: ${parsed.carbs ?? "?"} g, ` +
    `Protein: ${parsed.protein ?? "?"} g, Fett: ${parsed.fat ?? "?"} g`
  );
}

// POST an dein Backend (FoodController#create)
async function importToDb(item: any) {
  importingId.value = item.food_id;
  error.value = "";

  const parsed = parseDescription(item.food_description || "");
  const payload = {
    name: item.food_name,
    calories: parsed.calories,
    carbs: parsed.carbs,
    protein: parsed.protein,
    fat: parsed.fat,
    categoryId: null, // optional: wähle Kategorie im UI
  };

  try {
    await axios.post(`${API_BASE}/api/foods`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    alert(`„${item.food_name}“ wurde gespeichert ✅`);
  } catch (e:any) {
    const msg =
      e?.response?.data?.message ||
      e?.response?.statusText ||
      e?.message ||
      "Unbekannter Fehler";
    alert(`Speichern fehlgeschlagen: ${msg}`);
  } finally {
    importingId.value = null;
  }
}
</script>

<style scoped>
:root {
  --bg: #0f1215;
  --surface: #181c20;
  --surface-2: #20262c;
  --text: #e8eef3;
  --muted: #a9b4be;
  --primary: #6ae3ff;
  --danger: #ff6a6a;
  --shadow: rgba(0,0,0,0.35);
}

.page {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  padding: 32px 16px 64px;
  display: grid;
  gap: 20px;
  place-items: center;
}

.header { text-align: center; }
.header h1 { margin: 0; font-size: 28px; letter-spacing: .3px; }
.sub { color: var(--muted); margin-top: 6px; }

.searchbar {
  display: flex; gap: 10px; width: min(680px, 95%); justify-content: center;
}
.input {
  flex: 1; padding: 12px 14px; font-size: 16px;
  background: var(--surface); border: 1px solid var(--surface-2);
  border-radius: 10px; color: var(--text); outline: none;
  box-shadow: 0 8px 20px var(--shadow) inset;
}
.input:focus { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(106,227,255,.2); }

.btn {
  padding: 12px 16px; border-radius: 10px; border: 1px solid var(--surface-2);
  background: var(--surface-2); color: var(--text); cursor: pointer;
}
.btn:disabled { opacity: .6; cursor: default; }
.btn.primary { background: var(--primary); color: #051015; border-color: transparent; font-weight: 600; }
.btn.ghost { background: transparent; }

.alert.error {
  color: var(--danger);
  background: #2a1517; border: 1px solid #472528;
  padding: 10px 12px; border-radius: 10px; width: min(680px, 95%);
}

.loading { display: grid; gap: 12px; place-items: center; color: var(--muted); }
.spinner {
  width: 26px; height: 26px; border-radius: 50%;
  border: 3px solid #334; border-top-color: var(--primary);
  animation: spin .9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg) } }

.empty { color: var(--muted); }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px; width: min(980px, 95%);
}
.card {
  background: var(--surface); border: 1px solid var(--surface-2);
  border-radius: 14px; padding: 14px; display: grid; gap: 10px;
  box-shadow: 0 10px 24px var(--shadow);
}
.title { font-weight: 600; }
.desc { color: var(--muted); font-size: 14px; min-height: 38px; }
.actions { display: flex; gap: 8px; justify-content: flex-end; }

.pager { display: flex; gap: 14px; align-items: center; color: var(--muted); }
</style>
