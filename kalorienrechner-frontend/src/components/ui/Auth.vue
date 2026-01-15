<script setup lang="ts">
import { reactive, ref } from "vue";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-vue-next";
import { login, register } from "@/service/auth";

const emit = defineEmits<{
  (e: "auth-success"): void;
}>();

const isLogin = ref(true);
const showPassword = ref(false);
const loading = ref(false);
const errorMsg = ref("");

const formData = reactive({
  email: "",
  password: "",
  name: "",
});

function resetError() {
  errorMsg.value = "";
}

/**
 * ✅ Macht aus allen möglichen Backend/Network-Fehlern eine sinnvolle Nachricht
 * - String → direkt
 * - Objekt → bevorzugt message/error/detail, sonst JSON stringify
 * - Array/Validation → zusammenfassen
 */
function extractErrorMessage(err: any): string {
  const data = err?.response?.data;

  // Axios Network-Error / ohne response
  if (!data) {
    return (
      err?.message ??
      err?.response?.statusText ??
      "Unbekannter Fehler"
    );
  }

  // Backend gibt string zurück
  if (typeof data === "string") return data;

  // Backend gibt Objekt zurück
  if (typeof data === "object") {
    // typische Felder
    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;
    if (typeof data.detail === "string") return data.detail;

    // Bean Validation / Field Errors (häufig: errors: [...])
    if (Array.isArray((data as any).errors)) {
      const list = (data as any).errors
        .map((e: any) => {
          if (typeof e === "string") return e;
          if (e?.defaultMessage) return e.defaultMessage;
          if (e?.message) return e.message;
          if (e?.field && e?.defaultMessage) return `${e.field}: ${e.defaultMessage}`;
          return null;
        })
        .filter(Boolean);
      if (list.length > 0) return list.join(" • ");
    }

    // Fallback: Objekt als JSON anzeigen (statt [object Object])
    try {
      return JSON.stringify(data);
    } catch {
      return "Unbekannter Fehler";
    }
  }

  // alles andere
  return String(data);
}

async function handleSubmit(e: Event) {
  e.preventDefault();
  resetError();
  loading.value = true;

  try {
    if (isLogin.value) {
      await login({ login: formData.email.trim(), password: formData.password });
    } else {
      await register({
        username: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
    }

    emit("auth-success");
  } catch (err: any) {
    errorMsg.value = extractErrorMessage(err);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 flex items-center justify-center p-6"
  >
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl mb-4 shadow-lg"
        >
          <span class="text-white text-2xl">🥗</span>
        </div>
        <h1 class="text-gray-900 mb-2">NutriOne</h1>
        <p class="text-gray-600">Dein persönlicher Kalorien-Tracker</p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            @click="isLogin = true; resetError()"
            class="flex-1 py-2 px-4 rounded-md transition-all"
            :class="isLogin ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
          >
            Anmelden
          </button>
          <button
            type="button"
            @click="isLogin = false; resetError()"
            class="flex-1 py-2 px-4 rounded-md transition-all"
            :class="!isLogin ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
          >
            Registrieren
          </button>
        </div>

        <form @submit="handleSubmit" class="space-y-4">
          <div v-if="!isLogin">
            <label class="block text-gray-700 text-sm mb-2">Name</label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Dein Name"
                v-model="formData.name"
                class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label class="block text-gray-700 text-sm mb-2">E-Mail</label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="deine@email.de"
                v-model="formData.email"
                class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label class="block text-gray-700 text-sm mb-2">Passwort</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                v-model="formData.password"
                class="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <EyeOff v-if="showPassword" class="w-5 h-5" />
                <Eye v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            v-if="errorMsg"
            class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {{ errorMsg }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-60"
          >
            {{ loading ? "Bitte warten..." : (isLogin ? "Anmelden" : "Konto erstellen") }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
