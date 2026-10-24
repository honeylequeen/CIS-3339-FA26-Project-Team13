// useApi: a small composable that tracks the state of one async API call.
//
//   const { data, loading, error, execute } = useApi(() => api.getClients())
//
// - loading: true while the request is in flight, false otherwise
// - data:    the result on success; stays null until the first success
// - error:   a short human-readable string on failure, null otherwise
// - execute: runs the call (on mount, after a search, or as a retry)
//
// The error text comes from the Axios interceptor in src/api/api.js, so this
// composable never has to translate errors itself.
import { ref } from 'vue'

export function useApi(apiCall) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Each call gets a number. If an older request finishes after a newer one
  // (e.g. a slow "load all" after a fast search), its result is ignored so
  // stale rows never replace fresh ones.
  let latestCall = 0

  async function execute() {
    const callId = ++latestCall
    loading.value = true
    error.value = null

    try {
      const result = await apiCall()
      if (callId === latestCall) data.value = result
    } catch (err) {
      if (callId === latestCall) {
        error.value = err?.message || 'Something went wrong'
      }
    } finally {
      if (callId === latestCall) loading.value = false
    }

    return data.value
  }

  return { data, loading, error, execute }
}
