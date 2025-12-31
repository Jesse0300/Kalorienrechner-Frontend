<script setup lang="ts">
import { reactive, ref } from "vue";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-vue-next";

const props = defineProps<{
  onAuthSuccess?: () => void;
}>();

const emit = defineEmits<{
  (e: "auth-success"): void;
}>();

const isLogin = ref(true);
const showPassword = ref(false);

const formData = reactive({
  email: "",
  password: "",
  name: "",
});

function handleSubmit(e: Event) {
  e.preventDefault();
  props.onAuthSuccess?.();
  emit("auth-success");
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
            @click="isLogin = true"
            class="flex-1 py-2 px-4 rounded-md transition-all"
            :class="isLogin ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
          >
            Anmelden
          </button>
          <button
            type="button"
            @click="isLogin = false"
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
                :required="!isLogin"
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

          <div v-if="isLogin" class="flex justify-end">
            <button type="button" class="text-sm text-cyan-600 hover:text-cyan-700 transition-colors">
              Passwort vergessen?
            </button>
          </div>

          <button
            type="submit"
            class="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-lg shadow-cyan-500/30"
          >
            {{ isLogin ? "Anmelden" : "Konto erstellen" }}
          </button>
        </form>

        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-white text-gray-500">oder</span>
          </div>
        </div>

        <div class="space-y-3">
          <button
            type="button"
            class="w-full py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span class="text-gray-700">Mit Google anmelden</span>
          </button>

          <button
            type="button"
            class="w-full py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
            <span class="text-gray-700">Mit Facebook anmelden</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
