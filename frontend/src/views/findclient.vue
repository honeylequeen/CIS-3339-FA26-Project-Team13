<!-- This view displays a list of clients. The user can search for clients, and click on a client to redirect to another component to view that client's information -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Find Client
      </h1>
    </div>
    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <!--Search Client By selection-->
        <h2 class="text-2xl font-bold">Search Client By</h2>
        <!-- Displays Client Name search field -->
        <div class="flex flex-col">
          <select
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="searchBy">
            <option value="Client Name">Client Name</option>
            <option value="Client Number">Client Number</option>
          </select>
        </div>
        <!--Input box for searching by Client First Name-->
        <div class="flex flex-col" v-if="searchBy === 'Client Name'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="firstName" v-on:keyup.enter="handleSubmitForm" placeholder="Enter first name" />
          </label>
        </div>
        <!--Input box for searching by Client Last Name-->
        <div class="flex flex-col" v-if="searchBy === 'Client Name'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="lastName" v-on:keyup.enter="handleSubmitForm" placeholder="Enter last name" />
          </label>
        </div>
        <!-- Displays Client Number search field -->
        <div class="flex flex-col" v-if="searchBy === 'Client Number'">
          <input
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="text" v-model="phoneNumber" v-on:keyup.enter="handleSubmitForm"
            placeholder="Enter Client Phone Number" />
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
          <!--Search Client button-->
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="button">
            Search Client
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Clients</h2>
        <h3 class="italic">Click table row to view client details</h3>
      </div>
      <!--List of Clients: loading, error, or the table (which shows "No results" when empty)-->
      <div class="flex flex-col col-span-2 mb-10">
        <LoadingState v-if="loading" text="Loading clients…" />
        <ErrorState v-else-if="error" title="Couldn't load clients" :message="error" @retry="execute" />
        <DataTable
          v-else
          :columns="columns"
          :rows="clients || []"
          :empty-text="activeQuery ? 'No clients match your search.' : 'No clients have been added yet.'"
          @row-click="openClient"
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
import { getClients, searchClients } from '../api/api'

const router = useRouter()

// Search fields
const searchBy = ref('')
const firstName = ref('')
const lastName = ref('')
const phoneNumber = ref('')

// null = show all clients, otherwise the search query that was last submitted
const activeQuery = ref(null)

// One useApi call that either lists all clients or runs the active search
const {
  data: clients,
  loading,
  error,
  execute
} = useApi(() => (activeQuery.value ? searchClients(activeQuery.value) : getClients()))

// Columns for the shared DataTable
const columns = [
  { label: 'Name', field: 'lastName', render: (client) => `${client.firstName} ${client.lastName}` },
  { label: 'Phone number', field: 'phoneNumber.primary' },
  { label: 'City', field: 'address.city' }
]

// Clear the search and load every client (also runs when the page opens)
function loadData() {
  searchBy.value = ''
  firstName.value = ''
  lastName.value = ''
  phoneNumber.value = ''
  activeQuery.value = null
  execute()
}

// Runs the search the user typed in
function handleSubmitForm() {
  if (searchBy.value === 'Client Name' && (firstName.value || lastName.value)) {
    activeQuery.value = { searchBy: 'name', firstName: firstName.value, lastName: lastName.value }
    execute()
  } else if (searchBy.value === 'Client Number' && phoneNumber.value) {
    activeQuery.value = { searchBy: 'number', phoneNumber: phoneNumber.value }
    execute()
  }
}

function openClient(client) {
  router.push({ name: 'clientdetails', params: { id: client._id } })
}

// Load the full list when the page opens
onMounted(loadData)
</script>
