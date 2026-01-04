<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div class="mb-6">
      <h1 class="text-gray-900 mb-1">Einstellungen</h1>
      <p class="text-gray-500">Verwalte dein Konto und deine App-Einstellungen.</p>
    </div>

    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 class="text-gray-900 mb-4">Konto</h2>

      <div class="flex items-center justify-between rounded-xl border border-gray-100 p-4">
        <div>
          <p class="text-gray-900">Abmelden</p>
          <p class="text-gray-500 text-sm">
            Du wirst ausgeloggt und zurück zum Login weitergeleitet.
          </p>
        </div>

        <button
          class="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { logout } from "../../service/auth";

function handleLogout() {
  logout();
  // App.vue hört auf dieses Event und setzt isAuthenticated=false
  window.dispatchEvent(new Event("auth-logout"));
}
</script>
