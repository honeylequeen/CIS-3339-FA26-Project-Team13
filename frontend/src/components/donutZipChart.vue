<template>
  <div class="w-1/2">
    <canvas class="p-10" ref="zipChart"></canvas>
  </div>
</template>

<script setup>
// Migrated from the Options API (props + mounted) to <script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

// props: {} is now defineProps()
const props = defineProps({
  label: { type: Array, default: () => [] },
  chartData: { type: Array, default: () => [] }
})

// this.$refs.zipChart is now a template ref
const zipChart = ref(null)

// Not a ref on purpose, Chart.js doesn't work well when Vue makes it reactive
let chart = null

// mounted() is now onMounted(), and the useless "await" before new Chart() is gone
onMounted(() => {
  chart = new Chart(zipChart.value, {
    type: 'doughnut',
    data: {
      labels: [...props.label],
      datasets: [{ borderWidth: 1, data: [...props.chartData] }]
    },
    options: {
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Clients by Zip Code' }
      },
      responsive: true,
      maintainAspectRatio: true
    }
  })
})

// Update the chart when the props change
watch(
  () => [props.label, props.chartData],
  () => {
    if (!chart) return
    chart.data.labels = [...props.label]
    chart.data.datasets[0].data = [...props.chartData]
    chart.update()
  },
  { deep: true }
)

// Destroy the chart when leaving the page
onBeforeUnmount(() => {
  if (chart) chart.destroy()
})
</script>
