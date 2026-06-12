import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  // undefined = loading, null = no session, object = session
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    if (!supabase) { setSession(null); return }

    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithEmail(email) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return {
    user:    session?.user ?? null,
    loading: session === undefined,
    signInWithEmail,
    signOut,
  }
}
