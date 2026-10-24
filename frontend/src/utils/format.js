// Shared helpers used by several views.

// Format an ISO date as MM/DD/YYYY (in UTC, so the date doesn't shift by timezone)
export function formatDate(date) {
  if (!date) return ''
  const isoDate = new Date(date)
  if (isNaN(isoDate)) return ''
  const year = isoDate.getUTCFullYear()
  const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(isoDate.getUTCDate()).padStart(2, '0')
  return `${month}/${day}/${year}`
}

// The backend replies to successful writes with either a plain string
// ("Client added to event"), an object like { message: 'Already registered' },
// or the saved record. This picks a readable message for a toast.
export function responseMessage(response, fallback) {
  if (typeof response === 'string' && response.trim()) return response
  if (response && typeof response.message === 'string') return response.message
  return fallback
}
