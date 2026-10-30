<!-- This is the home view - which shows a dashboard -->
<template>
  <main>
    <div>
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Dashboard
      </h1>
      <br />
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div class="ml-10"></div>
        <div class="flex flex-col col-span-2">
          <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
              Events Attendance
          </h1>
      
          <LoadingState v-if="attendanceLoading" text="Loading event attendance…" />
          <ErrorState
            v-else-if="attendanceError"
            title="Couldn't load attendance"
            :message="attendanceError"
            @retry="loadAttendance"
          />
          <div v-else-if="!recentEvents.length" class="flex justify-center mt-10">
            No events found.
          </div>
          <table v-else class="min-w-full shadow-md rounded">
            <thead class="bg-gray-50 text-xl">
              <tr class="p-4 text-left">
                <th class="p-4 text-left">Event Name</th>
                <th class="p-4 text-left">Event Date</th>
                <th class="p-4 text-left">Number of Attendees</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300"> 
              <tr
                @click="editEvent(event._id)"
                v-for="event in recentEvents"
                :key="event._id"
              >
                <td class="p-2 text-left">{{ event.name }}</td>
                <td class="p-2 text-left">{{ formatDate(event.date) }}</td>
                <td class="p-2 text-left">{{ event.attendees.length }}</td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="recentEvents.length && !attendanceLoading && !attendanceError">
            <AttendanceChart :label="attendanceLabels" :chart-data="attendanceChartData" />
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div class="ml-10"></div>
        <div class="flex flex-col col-span-2">
          <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
              Clients by Zip Code
          </h1>
          
          <LoadingState v-if="zipLoading" text="Loading clients by ZIP code…" />
          <ErrorState
            v-else-if="zipError"
            title="Couldn't load clients by ZIP code"
            :message="zipError"
            @retry="loadZipData"
          />
          <div v-else-if="!zips.length" class="flex justify-center mt-10">No clients found.</div>
          <table v-else class="min-w-full shadow-md rounded">
            <thead class="bg-gray-50 text-xl">
              <tr class="p-4 text-left">
                <th class="p-4 text-left">Zip Number</th>
                <th class="p-4 text-left">Client Count</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <tr
                v-for="zip in zips"
                :key="zip._id"
              >
                <td class="p-2 text-left">{{ zip._id }}</td>
                <td class="p-2 text-left">{{ zip.count }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="zips.length && !zipLoading && !zipError" class="flex justify-center mt-10">
            <ZipChart :label="zipLabels" :chart-data="zipChartData" />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AttendanceChart from '../components/barChart.vue'
import ZipChart from '../components/donutZipChart.vue'
import LoadingState from '../components/LoadingState.vue'
import ErrorState from '../components/ErrorState.vue'
import { useApi } from '../composables/useApi'
import { getAttendance, getClientsByZipCode } from '../api/api'
import { formatDate } from '../utils/format'

const router = useRouter()

const {
  data: attendance,
  loading: attendanceLoading,
  error: attendanceError,
  execute: loadAttendance
} = useApi(getAttendance)

const {
  data: zipData,
  loading: zipLoading,
  error: zipError,
  execute: loadZipData
} = useApi(getClientsByZipCode)

const recentEvents = computed(() => attendance.value || [])
const attendanceLabels = computed(() =>
  recentEvents.value.map((item) => `${item.name} (${formatDate(item.date)})`)
)
const attendanceChartData = computed(() => recentEvents.value.map((item) => item.attendees.length))

const zips = computed(() => zipData.value || [])
const zipLabels = computed(() => zips.value.map((item) => item._id))
const zipChartData = computed(() => zips.value.map((item) => item.count))

// Clicking an event row opens that event
function editEvent(id) {
  router.push({ name: 'eventdetails', params: { id } })
}

onMounted(() => {
  loadAttendance()
  loadZipData()
})
</script>
