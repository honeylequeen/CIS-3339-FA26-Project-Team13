<template>
  <div>
    <canvas class="p-10" ref="attendanceChart"></canvas>
  </div>
</template>

<script setup>
// Migrated from the Options API (props + mounted) to <script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables, Colors } from 'chart.js'

Chart.register(...registerables, Colors)

// props: {} is now defineProps()
const props = defineProps({
  label: { type: Array, default: () => [] },
  chartData: { type: Array, default: () => [] }
})

// this.$refs.attendanceChart is now a template ref
const attendanceChart = ref(null)

// Not a ref on purpose, Chart.js doesn't work well when Vue makes it reactive
let chart = null

// mounted() is now onMounted()
// Removed the "await" that was in front of new Chart(), it wasn't doing anything
onMounted(() => {
  chart = new Chart(attendanceChart.value, {
    type: 'bar',
    data: {
      labels: [...props.label],
      datasets: [{ borderWidth: 1, data: [...props.chartData] }]
    },
    options: {
      scales: {
        y: { ticks: { stepSize: 1 } },
        // was "gridLines", which is the old Chart.js v2 name. v4 uses "grid"
        x: { grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Attendance Chart' }
      },
      responsive: true,
      maintainAspectRatio: true
    }
  })
})

// Update the chart when the props change (before, it only drew once)
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

// Destroy the chart when leaving the page so old charts don't pile up
onBeforeUnmount(() => {
  if (chart) chart.destroy()
})
</script>

