<!-- This view allows a user to view/update a specific client's information. -->
<template>
  <main>
    <!--Header-->
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
      Client Details
    </h1>
    <p v-if="!isEditor" class="text-center text-gray-500 mt-2">View only. Only editors can make changes.</p>
    <div v-if="loadError" class="px-10 mt-10">
      <ErrorState title="Couldn't load this client" :message="loadError" @retry="loadData" />
    </div>
    <div class="px-10 py-20">
      <fieldset :disabled="!isEditor">
      <!-- grid container -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Personal Details</h2>
        <!-- First Name input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">First Name</span>
            <span style="color: #ff0000">*</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder v-model="client.firstName" />
          </label>
          <!-- Validation error messages -->
          <span v-if="v$.client.firstName.$error" class="text-red-500">
            First Name is required
          </span>
        </div>

        <!-- Middle name input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Middle Name</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder v-model="client.middleName" />
          </label>
        </div>

        <!-- Last Name input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Last Name</span>
            <span style="color: #ff0000">*</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder v-model="client.lastName" />
          </label>
          <!-- Validation error messages -->
          <span v-if="v$.client.lastName.$error" class="text-red-500">
            Last Name is required
          </span>
        </div>
        <div></div>
        <!-- Email input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Email</span>
            <input type="email"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="client.email" />
          </label>
          <!-- Validation error messages -->
          <span v-if="v$.client.email.$error" class="text-red-500">
            Valid Email is required
          </span>
        </div>
        <!-- Phone number input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Phone Number</span>
            <span style="color: #ff0000">*</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              pattern="^[0-9]{3}[0-9]{3}[0-9]{4}$" v-model="client.phoneNumber.primary" />
          </label>
          <!-- Validation error messages -->
          <span v-if="v$.client.phoneNumber.primary.$error" class="text-red-500">
            <span v-if="v$.client.phoneNumber.primary.required.$invalid">Phone Number is required</span>
            <span
              v-else-if="!v$.client.phoneNumber.primary.required.$invalid && v$.client.phoneNumber.primary.numeric.$invalid">
              Phone Number must contain only digits
            </span>
            <span
              v-else-if="!v$.client.phoneNumber.primary.required.$invalid && !v$.client.phoneNumber.primary.numeric.$invalid && (v$.client.phoneNumber.primary.minLength.$invalid || v$.client.phoneNumber.primary.maxLength.$invalid)">
              Phone Number must be exactly 10 digits
            </span>
          </span>
        </div>
        <!-- Alternative phone number input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Alternative Phone Number</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              pattern="[0-9]{3}[0-9]{3}[0-9]{4}" v-model="client.phoneNumber.alternate" />
          </label>
        </div>
      </div>

      <!-- grid container -->
      <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Address Details</h2>
        <!-- Address 1 input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Address Line 1</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="client.address.line1" />
          </label>
        </div>
        <!-- Address 2 input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Address Line 2</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="client.address.line2" />
          </label>
        </div>
        <!-- City input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">City</span>
            <span style="color: #ff0000">*</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="client.address.city" />
          </label>
          <!-- Validation error messages -->
          <span v-if="v$.client.address.city.$error" class="text-red-500">
            City is required
          </span>
        </div>
        <div></div>
        <!-- County input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">County</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="client.address.county" />
          </label>
        </div>
        <!-- Zip code input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Zip Code</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="client.address.zip" />
          </label>
        </div>
        <div></div>
      </div>

      </fieldset>

      <!-- grid container -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div class="flex justify-between mt-10 mr-20"></div>
        <!--Update Client submit button-->
        <div class="flex justify-between mt-10 mr-20">
          <button @click="submitUpdateClient" type="submit" class="bg-green-700 disabled:opacity-50 text-white rounded"
            v-if="isEditor">
            Update Client
          </button>
        </div>
        <!--Delete Client button-->
        <div class="flex justify-between mt-10 mr-20">
          <button @click="submitDeleteClient" type="submit" class="bg-red-700 disabled:opacity-50 text-white rounded"
            v-if="isEditor">
            Delete Client
          </button>
        </div>
        <!--Go back button-->
        <div class="flex justify-between mt-10 mr-20">
          <button type="reset" class="border border-red-700 bg-white text-red-700 rounded" @click="router.back()">
            Go back
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />

    <!-- Client Event Information -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mr-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">Events for Client</h2>
        <h3 class="italic">Click table row to view event details</h3>
      </div>
      <div class="flex flex-col col-span-2">
        <table class="min-w-full shadow-md rounded">
          <thead class="bg-gray-50 text-xl">
            <tr>
              <th class="p-4 text-left">Event Name</th>
              <th class="p-4 text-left">Date</th>
              <th class="p-4"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr @click="$router.push({ name: 'eventdetails', params: { id: event._id } })" 
            v-for="event in clientEvents" :key="event._id" class="cursor-pointer" 
              :class="{ 'hoverRow': hoverId === event._id }" @mouseenter="hoverId = event._id" @mouseleave="hoverId = null">
              <td class="p-2 text-left">{{ event.name }}</td>
              <td class="p-2 text-left">{{ formatDate(event.date) }}</td>
              <td class="p-2 text-right">
                <span class="remove-btn-wrapper">
                  <span class="remove-btn text-gray-400 cursor-pointer"
                    @click.stop="removeClientFromEvent(client._id, event._id)" v-if="isEditor && hoverId === event._id">X</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col" v-if="isEditor">
        <!--MultiSelect to add client to events-->
        <VueMultiselect
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
          v-model="eventsSelected" :options="eventsFiltered" :custom-label="nameWithDate" :multiple="true"
          :close-on-select="true" placeholder="Select Events to be added" label="date" track-by="name" />
        <div class="flex justify-between">
          <!--button to add client to events-->
          <button @click="addClientToEvent" type="submit" class="mt-5 bg-red-700 disabled:opacity-50 text-white rounded"
            :disabled="eventsSelected.length === 0">
            Add Client to Selected Events
          </button>
        </div>
      </div>

    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useVuelidate from '@vuelidate/core'
import { required, email, numeric, minLength, maxLength } from '@vuelidate/validators'
import VueMultiselect from 'vue-multiselect'
import { useToast } from 'vue-toastification'
import { useLoggedInUserStore } from '../store/loggedInUser'
import ErrorState from '../components/ErrorState.vue'
import {
  getClientById,
  getClientEvents,
  getNonClientEvents,
  registerAttendee,
  deregisterAttendee,
  updateClient,
  deleteClientbyId
} from '../api/api'
import { formatDate, responseMessage } from '../utils/format'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const user = useLoggedInUserStore()

// Only editors can change data. Viewers see a read-only page.
const isEditor = computed(() => user.role === 'editor')

// Empty client shape, so the form never breaks if the server leaves a field out
const emptyClient = () => ({
  firstName: null,
  middleName: null,
  lastName: null,
  email: null,
  phoneNumber: { primary: null, alternate: null },
  address: { line1: null, line2: null, city: null, county: null, zip: null }
})

const client = ref(emptyClient())
// Events the client is registered for
const clientEvents = ref([])
// Events the client is NOT registered for (options in the multiselect)
const eventsFiltered = ref([])
// Events the user picked in the multiselect
const eventsSelected = ref([])
// ID of the table row the mouse is over (for highlighting and the remove "X")
const hoverId = ref(null)
// Message shown if the page couldn't load (e.g. 404 Not Found)
const loadError = ref(null)

const rules = {
  client: {
    firstName: { required },
    lastName: { required },
    email: { required, email },
    phoneNumber: {
      primary: {
        required,
        numeric,
        minLength: minLength(10),
        maxLength: maxLength(10)
      }
    },
    address: {
      city: { required }
    }
  }
}
const v$ = useVuelidate(rules, { client })

// Load the client, their events, and the events they could still join
async function loadData() {
  loadError.value = null
  try {
    const [clientResponse, clientEventsResponse, nonClientEventsResponse] = await Promise.all([
      getClientById(route.params.id),
      getClientEvents(route.params.id),
      getNonClientEvents(route.params.id)
    ])
    const empty = emptyClient()
    client.value = {
      ...empty,
      ...clientResponse,
      phoneNumber: { ...empty.phoneNumber, ...clientResponse.phoneNumber },
      address: { ...empty.address, ...clientResponse.address }
    }
    clientEvents.value = clientEventsResponse
    eventsFiltered.value = nonClientEventsResponse
  } catch (error) {
    loadError.value = error.message
  }
}

// Refresh both event lists after registering or removing
async function refreshEvents() {
  try {
    const [registered, notRegistered] = await Promise.all([
      getClientEvents(route.params.id),
      getNonClientEvents(route.params.id)
    ])
    clientEvents.value = registered
    eventsFiltered.value = notRegistered
  } catch (error) {
    toast.error(error.message)
  }
}

// B1: the backend answers 200 with { message: 'Already registered' } or
// { message: 'Not registered' } when nothing changed. Show those as info, not success.
function showRegistrationResult(response, successText) {
  const message = response?.message
  if (message === 'Already registered' || message === 'Not registered') {
    toast.info(message)
  } else {
    toast.success(responseMessage(response, successText))
  }
}

// Custom label for the multiselect options
function nameWithDate({ name, date }) {
  return `${name} (${formatDate(date)})`
}

// Remove the client from one event
async function removeClientFromEvent(clientId, eventId) {
  try {
    const response = await deregisterAttendee(eventId, clientId)
    showRegistrationResult(response, 'Client removed from event')
  } catch (error) {
    toast.error(error.message)
  }
  await refreshEvents()
}

// Register the client for every event picked in the multiselect
async function addClientToEvent() {
  const selected = eventsSelected.value
  const results = await Promise.allSettled(
    selected.map((event) => registerAttendee(event._id, client.value._id))
  )
  results.forEach((result, index) => {
    const eventName = selected[index].name
    if (result.status === 'fulfilled') {
      showRegistrationResult(result.value, `Registered for ${eventName}`)
    } else {
      toast.error(`${eventName}: ${result.reason.message}`)
    }
  })
  eventsSelected.value = []
  await refreshEvents()
}

// Save changes to the client
async function submitUpdateClient() {
  const isValid = await v$.value.$validate()
  if (!isValid) return

  try {
    const response = await updateClient(route.params.id, client.value)
    toast.success(responseMessage(response, 'Client updated'))
    router.push('/findclient')
  } catch (error) {
    toast.error(error.message)
  }
}

// Delete the client
async function submitDeleteClient() {
  try {
    const response = await deleteClientbyId(route.params.id)
    toast.success(responseMessage(response, 'Client deleted'))
    router.push('/findclient')
  } catch (error) {
    toast.error(error.message)
  }
}

onMounted(loadData)
</script>

<!--Style for multiselect-->
<style src="vue-multiselect/dist/vue-multiselect.css"></style>

<style scoped>
.remove-btn-wrapper {
  display: inline-block;
  position: relative;
}

.remove-btn:hover {
  color: black;
}
</style>
