<!-- This view shows a list of services. Users can search for services and click on a service to be redirected to another component that displays the service's details -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Find Services
      </h1>
    </div>
    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Search Service By</h2>
        <!-- Displays Service Name and Description selection -->
        <div class="flex flex-col">
          <select
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="searchBy">
            <option value="Service Name">Service Name</option>
            <option value="Service Description">Service Description</option>
          </select>
        </div>
        <!--Display service name search field-->
        <div class="flex flex-col" v-if="searchBy === 'Service Name'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="name" v-on:keyup.enter="handleSubmitForm" placeholder="Enter service name" />
          </label>
        </div>
        <!--Display service description search field-->
        <div class="flex flex-col" v-if="searchBy === 'Service Description'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="description" v-on:keyup.enter="handleSubmitForm" placeholder="Enter service description" />
          </label>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div></div>
        <div class="mt-5 grid-cols-2">
          <!--Clear Search button-->
          <button class="mr-10 border border-red-700 bg-white text-red-700 rounded" @click="loadData" type="button">
            Clear Search
          </button>
          <!--Search Service button-->
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="button">
            Search Service
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />
    <!-- Display Found Data -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Services</h2>
        <h3 class="italic">Click table row to view service details</h3>
      </div>
      <!--List of Services: loading, error, or the table (which shows "No results" when empty)-->
      <div class="flex flex-col col-span-2 mb-10">
        <LoadingState v-if="loading" text="Loading services…" />
        <ErrorState v-else-if="error" title="Couldn't load services" :message="error" @retry="execute" />
        <DataTable
          v-else
          :columns="columns"
          :rows="services || []"
          :empty-text="activeQuery ? 'No services match your search.' : 'No services have been created yet.'"
          @row-click="openService"
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
import { getServices, searchServices } from '../api/api'

const router = useRouter()

// Search fields
const searchBy = ref('')
const name = ref('')
const description = ref('')

// null = show all services, otherwise the search query that was last submitted
const activeQuery = ref(null)

const {
  data: services,
  loading,
  error,
  execute
} = useApi(() => (activeQuery.value ? searchServices(activeQuery.value) : getServices()))

// Columns for the shared DataTable
const columns = [
  { label: 'Service Name', field: 'name', headerClass: 'w-1/4', cellClass: 'p-4' },
  { label: 'Service Description', field: 'description', headerClass: 'w-3/4', cellClass: 'p-4 text-sm' }
]

// Clear the search and load every service (also runs when the page opens)
function loadData() {
  searchBy.value = ''
  name.value = ''
  description.value = ''
  activeQuery.value = null
  execute()
}

// Runs the search the user typed in
function handleSubmitForm() {
  if (searchBy.value === 'Service Name' && name.value) {
    activeQuery.value = { searchBy: 'name', name: name.value }
    execute()
  } else if (searchBy.value === 'Service Description' && description.value) {
    activeQuery.value = { searchBy: 'description', description: description.value }
    execute()
  }
}

function openService(service) {
  router.push({ name: 'servicedetails', params: { id: service._id } })
}

// Load the full list when the page opens
onMounted(loadData)
</script>
