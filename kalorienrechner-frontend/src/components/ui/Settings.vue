<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-gray-900 mb-2">Einstellungen</h1>
      <p class="text-gray-600">
        Verwalte deine App-Einstellungen und Präferenzen
      </p>
    </div>

    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
      <div class="flex items-center gap-3 mb-6">
        <div
          class="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl"
        >
          U
        </div>
        <div>
          <h2 class="text-gray-900">Benutzer-Information</h2>
          <p class="text-sm text-gray-600">Deine Account-Details</p>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
          <span class="w-5 h-5 text-gray-500 mt-0.5">👤</span>
          <div class="flex-1">
            <div class="text-sm text-gray-600 mb-1">Name</div>
            <div class="text-gray-900">Benutzer (Mock - fehlende DB Einbindung)</div>
          </div>
        </div>

        <div class="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
          <span class="w-5 h-5 text-gray-500 mt-0.5">✉️</span>
          <div class="flex-1">
            <div class="text-sm text-gray-600 mb-1">E-Mail</div>
            <div class="text-gray-900">benutzer@example.com</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
      <div class="flex items-center gap-3 mb-6">
        <span class="text-gray-700 text-xl">⚙️</span>
        <div>
          <h2 class="text-gray-900">App-Einstellungen</h2>
          <p class="text-sm text-gray-600">
            Passe die App an deine Bedürfnisse an
          </p>
        </div>
      </div>

      <div class="space-y-4">
        <div
          class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <span class="w-5 h-5 text-gray-500">🎨</span>
            <div>
              <div class="text-gray-900">Dunkler Modus</div>
              <div class="text-sm text-gray-600">Aktiviere das dunkle Design (WIP) </div>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer" disabled />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"
            ></div>
          </label>
        </div>
      </div>
    </div>

    <div class="p-4 bg-blue-50 rounded-xl border border-blue-100">
      <p class="text-sm text-gray-700">
        <span class="font-semibold">Hinweis:</span> Momentan keine richtige Login Logik.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
