<script setup lang="ts">
import { reactive, ref, computed } from "vue";
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

const MIN_PASSWORD = 6;

function resetError() {
  errorMsg.value = "";
}

function normalizeError(err: any): string {
  // axios error cases
  const data = err?.response?.data;

  if (typeof data === "string") return data;

  if (data && typeof data === "object") {
    // gängige Felder
    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;

    // Spring Validation: { errors: [...] } oder { fieldErrors: ... }
    const maybeErrors = (data.errors ?? data.fieldErrors ?? data.violations) as any;
    if (Array.isArray(maybeErrors) && maybeErrors.length > 0) {
      const first = maybeErrors[0];
      if (typeof first === "string") return first;
      if (typeof first?.message === "string") return first.message;
      if (typeof first?.defaultMessage === "string") return first.defaultMessage;
    }

    // Fallback: JSON statt [object Object]
    try {
      return JSON.stringify(data);
    } catch {
      return "Unbekannter Fehler";
    }
  }

  if (typeof err?.message === "string") return err.message;
  return "Unbekannter Fehler";
}

// ---------- Frontend-Validierung ----------
const emailValid = computed(() => {
  const email = formData.email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
});

const passwordValid = computed(() => formData.password.length >= MIN_PASSWORD);

const nameValid = computed(() => isLogin.value || formData.name.trim().length > 0);

const canSubmit = computed(() => emailValid.value && passwordValid.value && nameValid.value);

async function handleSubmit(e: Event) {
  e.preventDefault();
  resetError();

  // ✅ Validierung VOR Request (damit Button/Tests/UX korrekt sind)
  if (!emailValid.value) {
    errorMsg.value = "Bitte gib eine gültige E-Mail-Adresse ein.";
    return;
  }
  if (!passwordValid.value) {
    errorMsg.value = `Passwort muss mindestens ${MIN_PASSWORD} Zeichen haben.`;
    return;
  }
  if (!nameValid.value) {
    errorMsg.value = "Bitte gib deinen Namen ein.";
    return;
  }

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
    errorMsg.value = normalizeError(err);
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
            @click="
              isLogin = true;
              resetError();
            "
            class="flex-1 py-2 px-4 rounded-md transition-all"
            :class="isLogin ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
          >
            Anmelden
          </button>
          <button
            type="button"
            @click="
              isLogin = false;
              resetError();
            "
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
            <p v-if="formData.name && !nameValid" class="text-xs text-red-600 mt-1">
              Bitte gib deinen Namen ein.
            </p>
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
            <p v-if="formData.email && !emailValid" class="text-xs text-red-600 mt-1">
              Bitte eine gültige E-Mail-Adresse eingeben.
            </p>
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
            <p v-if="formData.password && !passwordValid" class="text-xs text-red-600 mt-1">
              Passwort mindestens {{ MIN_PASSWORD }} Zeichen.
            </p>
          </div>

          <div v-if="errorMsg" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {{ errorMsg }}
          </div>

          <button
            type="submit"
            :disabled="loading || !canSubmit"
            class="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-60"
          >
            {{ loading ? "Bitte warten..." : (isLogin ? "Anmelden" : "Konto erstellen") }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
