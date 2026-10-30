// This file contains all API calls to the API endpoints.
// Error handling lives in ONE place: the response interceptor below. Every failed
// request is turned into an Error with a short, human-readable `message` (and the
// HTTP `status`, if there was one), so components never translate errors themselves.
import axios from 'axios'

// The backend URL comes from VITE_ROOT_API (frontend/.env locally, or the host's
// environment variables when deployed). It is baked in when `npm run build` runs.
if (!import.meta.env.VITE_ROOT_API) {
  console.warn('VITE_ROOT_API is not set, so API calls will fail. See frontend/README.md.')
}

// Create HTTP client with the base URL, and specify that the data sent in the request body is JSON
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_ROOT_API,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ---------------------------------------------------------------------------
// Auth header helpers
// ---------------------------------------------------------------------------

// If user logs in successfully, this sets the "Authorization: Bearer <token>" header on apiClient
export function setAuthHeader(token) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// When user logs out, this removes the Authorization header from apiClient
export function removeAuthHeader() {
  delete apiClient.defaults.headers.common['Authorization']
}

// ---------------------------------------------------------------------------
// Centralized error handling
// ---------------------------------------------------------------------------

// Fallback messages when the server doesn't send anything useful
const DEFAULT_MESSAGES = {
  400: 'The request was invalid.',
  401: 'Your session has expired. Please log in again.',
  403: "You don't have permission to do that.",
  404: 'The requested record was not found.',
  500: 'Something went wrong on the server.'
}

// Pull a readable message out of whatever the server sent back.
// The backend currently sends plain strings ("Event not found"), { message },
// { error } (after B2), or express-validator style { errors: [{ msg }] }.
function messageFromResponseBody(body) {
  if (!body) return null
  if (typeof body === 'string') {
    // Some routes send a JSON string inside the body
    try {
      return messageFromResponseBody(JSON.parse(body))
    } catch {
      return body
    }
  }
  if (Array.isArray(body.errors) && body.errors.length) return body.errors[0].msg
  if (typeof body.error === 'string') return body.error
  if (typeof body.message === 'string') return messageFromResponseBody(body.message)
  return null
}

// On a 401: clear the stored token, the auth header, and the Pinia session, then go to /login.
// The store and router are imported lazily to avoid a circular import
// (the store imports this file, and the router imports the store).
async function handleUnauthorized() {
  localStorage.removeItem('authToken')
  removeAuthHeader()

  const [{ useLoggedInUserStore }, { default: router }] = await Promise.all([
    import('../store/loggedInUser'),
    import('../router')
  ])
  useLoggedInUserStore().$patch({ name: '', role: '', isLoggedIn: false })
  if (router.currentRoute.value.path !== '/login') {
    router.push('/login')
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message
    let status = null

    if (!error.response) {
      // The request never got a response: server down, no network, CORS blocked, etc.
      message = 'Unable to reach the server'
    } else {
      status = error.response.status
      message =
        messageFromResponseBody(error.response.data) ||
        DEFAULT_MESSAGES[status] ||
        DEFAULT_MESSAGES[500]

      // A bad login also comes back as an error, but it shouldn't trigger a logout redirect
      const isLoginRequest = error.config?.url?.includes('/users/login')
      if (status === 401 && !isLoginRequest) {
        handleUnauthorized()
      }
    }

    const apiError = new Error(message)
    apiError.status = status
    return Promise.reject(apiError)
  }
)

// ---------------------------------------------------------------------------
// Login related API calls
// ---------------------------------------------------------------------------

// API call to log the user in
export async function loginUser(username, password) {
  const response = await apiClient.post('/users/login', { username, password })
  const token = response.data.token
  localStorage.setItem('authToken', token)
  setAuthHeader(token)
  return token
}

// API call to log the user out
export function logoutUser() {
  localStorage.removeItem('authToken')
  removeAuthHeader()
}

// ---------------------------------------------------------------------------
// Org related API calls
// ---------------------------------------------------------------------------

// API call to get org name
export async function getOrgName() {
  const response = await apiClient.get('/org')
  return response.data
}

// ---------------------------------------------------------------------------
// Events related API calls
// ---------------------------------------------------------------------------

// API call to get all events for org
export const getEvents = async () => {
  const response = await apiClient.get('/events/')
  return response.data
}

// API call to GET single event by ID
export const getEventById = async (id) => {
  const response = await apiClient.get(`/events/id/${id}`)
  return response.data
}

// API call to GET events based on search query
export const searchEvents = async (query) => {
  const params = {}
  if (query.searchBy === 'name') {
    params.searchBy = query.searchBy
    params.name = query.name || ''
  } else if (query.searchBy === 'date') {
    params.searchBy = 'date'
    params.eventDate = query.eventDate || ''
  }
  const response = await apiClient.get('/events/search', { params })
  return response.data
}

// API call to GET events for which a client is signed up
export const getClientEvents = async (id) => {
  const response = await apiClient.get(`/events/client/${id}`)
  return response.data
}

// API call to GET events for which a client is not signed up
export const getNonClientEvents = async (id) => {
  const response = await apiClient.get(`/events/client/${id}/not-registered`)
  return response.data
}

// API call to GET all attendees for an event
export const getEventAttendees = async (id) => {
  const response = await apiClient.get(`/events/attendees/${id}`)
  return response.data
}

// API call to GET all events for a given service
export const getEventsByServiceId = async (id) => {
  const response = await apiClient.get(`/events/service/${id}`)
  return response.data
}

// API call to POST new event
export const createEvent = async (eventData) => {
  const response = await apiClient.post('/events/', eventData)
  return response.data
}

// API call to PUT update event
export const updateEvent = async (id, eventData) => {
  const response = await apiClient.put(`/events/update/${id}`, eventData)
  return response.data
}

// API call to PUT add attendee to event.
// Per B1 the backend answers with the created record, or { message: 'Already registered' }.
export const registerAttendee = async (eventId, clientId) => {
  const response = await apiClient.put(
    '/events/register',
    {},
    { params: { event: eventId, client: clientId } }
  )
  return response.data
}

// API call to PUT remove attendee from event.
// Per B1 the backend answers with the removed record, or { message: 'Not registered' }.
export const deregisterAttendee = async (eventId, clientId) => {
  const response = await apiClient.put(
    '/events/deregister',
    {},
    { params: { event: eventId, client: clientId } }
  )
  return response.data
}

// API call to DELETE event by ID
export const deleteEvent = async (id) => {
  const response = await apiClient.delete(`/events/${id}`)
  return response.data
}

// API call to get events for last two month for dashboard
export const getAttendance = async () => {
  const response = await apiClient.get('/events/attendance')
  return response.data
}

// ---------------------------------------------------------------------------
// Clients related API calls
// ---------------------------------------------------------------------------

// API call to GET all clients for org
export const getClients = async () => {
  const response = await apiClient.get('/clients')
  return response.data
}

// API call to GET single client by ID
export const getClientById = async (id) => {
  const response = await apiClient.get(`/clients/id/${id}`)
  return response.data
}

// API call to GET entries based on search query
export const searchClients = async (query) => {
  const params = {}
  if (query.searchBy === 'name') {
    params.searchBy = query.searchBy
    params.firstName = query.firstName || ''
    params.lastName = query.lastName || ''
  } else if (query.searchBy === 'number') {
    params.searchBy = query.searchBy
    params.phoneNumber = query.phoneNumber || ''
  }
  const response = await apiClient.get('/clients/search', { params })
  return response.data
}

// API call to POST new client
export const createClient = async (newClient) => {
  const response = await apiClient.post('/clients', newClient)
  return response.data
}

// API call to PUT update client
export const updateClient = async (id, updatedClient) => {
  const response = await apiClient.put(`/clients/update/${id}`, updatedClient)
  return response.data
}

// API call to delete client
export const deleteClientbyId = async (id) => {
  const response = await apiClient.delete(`/clients/${id}`)
  return response.data
}

// API call to get clients by zip code for dashboard
export const getClientsByZipCode = async () => {
  const response = await apiClient.get('/clients/byzip')
  return response.data
}

// ---------------------------------------------------------------------------
// Services related API calls
// ---------------------------------------------------------------------------

// API call to get all services for org
export const getServices = async () => {
  const response = await apiClient.get('/services/')
  return response.data
}

// API call to GET single service by ID
export const getServiceById = async (id) => {
  const response = await apiClient.get(`/services/id/${id}`)
  return response.data
}

// API call to GET services based on search query
export const searchServices = async (query) => {
  const params = { searchBy: query.searchBy }
  if (query.searchBy === 'name') {
    params.name = query.name || ''
  } else if (query.searchBy === 'description') {
    params.description = query.description
  }
  const response = await apiClient.get('/services/search', { params })
  return response.data
}

// API call to POST new service
export const createService = async (newService) => {
  const response = await apiClient.post('/services', newService)
  return response.data
}

// API call to PUT update service
export const updateService = async (id, updatedService) => {
  const response = await apiClient.put(`/services/update/${id}`, updatedService)
  return response.data
}

// API call to DELETE service by ID
export const deleteService = async (id) => {
  const response = await apiClient.delete(`/services/${id}`)
  return response.data
}
