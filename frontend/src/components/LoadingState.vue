<!-- LoadingState: shown while a list is loading. A pulsing placeholder table. -->
<template>
  <div class="shadow-md rounded" role="status" aria-live="polite">
    <div class="bg-gray-50 p-4 text-xl font-bold text-gray-500 flex items-center gap-3">
      <span class="spinner" aria-hidden="true"></span>
      {{ text }}
    </div>
    <div class="divide-y divide-gray-200">
      <div v-for="n in 5" :key="n" class="p-3">
        <div class="h-4 bg-gray-200 rounded animate-pulse" :style="{ width: `${90 - n * 8}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: 'Loading…' }
})
</script>

<style scoped>
.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 3px solid #e5e7eb;
  border-top-color: #b91c1c;
  border-radius: 9999px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
