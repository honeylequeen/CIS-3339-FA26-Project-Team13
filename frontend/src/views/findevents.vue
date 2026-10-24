<!-- This view displays a list of events. Users can search for events, and click on an event to be redirected to another component to view that event's details -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        List of Events
      </h1>
    </div>
    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Search Event By</h2>
        <!-- Displays Event Name or Event Date selection -->
        <div class="flex flex-col">
          <select
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="searchBy">
            <option value="Event Name">Event Name</option>
            <option value="Event Date">Event Date</option>
          </select>
        </div>
        <!--Displays event name search field-->
        <div class="flex flex-col" v-if="searchBy === 'Event Name'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="name" v-on:keyup.enter="handleSubmitForm" placeholder="Enter event name" />
          </label>
        </div>
        <!-- Displays event date search field -->
        <div class="flex flex-col" v-if="searchBy === 'Event Date'">
          <input
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="date" v-model="eventDate" v-on:keyup.enter="handleSubmitForm" />
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div></div>
        <!--Clear Search button-->
        <div class="mt-5 grid-cols-2">
          <button class="mr-10 border border-red-700 bg-white text-red-700 rounded" @click="loadData" type="button">
            Clear Search
          </button>
          <!--Search Event button-->
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="button">
            Search Event
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />
    <!-- Display Found Data -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Events</h2>
        <h3 class="italic">Click table row to view event details</h3>
      </div>
      <!--List of Events: loading, error, or the table (which shows "No results" when empty)-->
      <div class="flex flex-col col-span-2 mb-10">
        <LoadingState v-if="loading" text="Loading events…" />
        <ErrorState v-else-if="error" title="Couldn't load events" :message="error" @retry="execute" />
        <DataTable
          v-else
          :columns="columns"
          :rows="events || []"
          :empty-text="activeQuery ? 'No events match your search.' : 'No events have been created yet.'"
          @row-click="openEvent"
        />
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '../components/DataTable.vue'
import LoadingState from '../components/LoadingState.vue'
import ErrorState from '../components/ErrorState.vue'
import { useApi } from '../composables/useApi'
import { getEvents, searchEvents } from '../api/api'
import { formatDate } from '../utils/format'

const router = useRouter()

// Search fields
const searchBy = ref(null)
const name = ref(null)
const eventDate = ref(null)

// null = show all events, otherwise the search query that was last submitted
const activeQuery = ref(null)

const {
  data: events,
  loading,
  error,
  execute
} = useApi(() => (activeQuery.value ? searchEvents(activeQuery.value) : getEvents()))

// Columns for the shared DataTable. Dates sort correctly because the raw value is an ISO date.
const columns = [
  { label: 'Event Name', field: 'name' },
  { label: 'Event Date', field: 'date', render: (event) => formatDate(event.date) },
  { label: 'Event Address', field: 'address.line1' }
]

// Clear the search and load every event (also runs when the page opens)
function loadData() {
  searchBy.value = null
  name.value = null
  eventDate.value = null
  activeQuery.value = null
  execute()
}

// Runs the search the user typed in
function handleSubmitForm() {
  if (searchBy.value === 'Event Name' && name.value) {
    activeQuery.value = { searchBy: 'name', name: name.value }
    execute()
  } else if (searchBy.value === 'Event Date' && eventDate.value) {
    const formattedDate = new Date(eventDate.value).toISOString().substring(0, 10)
    activeQuery.value = { searchBy: 'date', eventDate: formattedDate }
    execute()
  }
}

function openEvent(event) {
  router.push({ name: 'eventdetails', params: { id: event._id } })
}

// Load the full list when the page opens
onMounted(loadData)
</script>
