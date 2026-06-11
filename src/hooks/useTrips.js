import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { geoToPercent } from '../utils/geo'

export function useTrips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTrips()
  }, [])

  async function fetchTrips() {
    if (!supabase) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      const mapped = (data ?? []).map(t => {
        const { left, top } = geoToPercent(t.lat, t.lng)
        return { ...t, map_x: left, map_y: top }
      })
      setTrips(mapped)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function withCoords(t) {
    const { left, top } = geoToPercent(t.lat, t.lng)
    return { ...t, map_x: left, map_y: top }
  }

  // Only DB columns — strip computed fields before insert
  function toDbRow({ place_name, visit_date, note, emoji, photo_url, trip_type, lat, lng, user_id }) {
    return { place_name, visit_date, note, emoji, photo_url, trip_type, lat, lng, user_id }
  }

  async function addTrip(trip) {
    if (!supabase) {
      const newTrip = withCoords({ ...trip, id: `local-${Date.now()}` })
      setTrips(prev => [newTrip, ...prev])
      return newTrip
    }
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert([toDbRow(trip)])
        .select()
        .single()
      if (error) throw error
      const newTrip = withCoords(data)
      setTrips(prev => [newTrip, ...prev])
      return newTrip
    } catch (err) {
      console.warn('Supabase non disponibile, salvataggio locale:', err.message)
      const newTrip = withCoords({ ...trip, id: `local-${Date.now()}` })
      setTrips(prev => [newTrip, ...prev])
      return newTrip
    }
  }

  async function deleteTrip(id) {
    if (!supabase) {
      setTrips(prev => prev.filter(t => t.id !== id))
      return
    }
    const { error } = await supabase.from('trips').delete().eq('id', id)
    if (error) throw error
    setTrips(prev => prev.filter(t => t.id !== id))
  }

  return { trips, loading, error, addTrip, deleteTrip, refetch: fetchTrips }
}
