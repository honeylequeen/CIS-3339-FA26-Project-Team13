<!-- ErrorState: shown when a list fails to load. Displays the message and a Retry button. -->
<template>
  <div class="rounded shadow-md border-l-8 border-red-700 bg-red-50 p-6" role="alert">
    <h3 class="text-xl font-bold text-red-800 flex items-center gap-2">
      <span class="material-icons" aria-hidden="true">error_outline</span>
      {{ title }}
    </h3>
    <p class="mt-2 text-red-900">{{ message }}</p>
    <button type="button" class="mt-4 bg-red-700 text-white rounded" @click="emit('retry')">
      Retry
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: "Couldn't load data" },
  message: { type: String, required: true }
})

const emit = defineEmits(['retry'])
</script>
