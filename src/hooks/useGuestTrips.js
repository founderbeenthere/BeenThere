const STORAGE_KEY = 'beenthere_guest_trips'
const GUEST_LIMIT = 3

function readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeToStorage(trips) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
    return true
  } catch {
    return false // private browsing o storage pieno
  }
}

export function getGuestTrips() {
  return readFromStorage()
}

export function addGuestTrip(trip) {
  const current = readFromStorage()
  if (current.length >= GUEST_LIMIT) {
    return { ok: false, count: current.length, limitReached: true }
  }
  const newTrip = { ...trip, id: trip.id ?? `guest-${Date.now()}` }
  const updated = [...current, newTrip]
  writeToStorage(updated)
  return { ok: true, count: updated.length, limitReached: updated.length >= GUEST_LIMIT }
}

export function clearGuestTrips() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // silent fail
  }
}

export function getGuestCount() {
  return readFromStorage().length
}
