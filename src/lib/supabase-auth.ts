import { supabase } from './supabase'

/**
 * Set the user session in Supabase client for RLS
 * This should be called when the user is authenticated
 */
export async function setSupabaseAuth(accessToken: string) {
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: '',
  })
  
  if (error) {
    console.error('Error setting Supabase session:', error)
    return false
  }
  
  return true
}

/**
 * Clear the Supabase session when user logs out
 */
export async function clearSupabaseAuth() {
  await supabase.auth.signOut()
}

/**
 * Create a custom JWT for Supabase RLS using NextAuth user data
 * This is a simplified approach - in production you'd want proper JWT signing
 */
export function createCustomSupabaseJWT(userEmail: string): string {
  // For now, we'll use the email as user_id since that's what we're storing
  // In production, you'd create a proper JWT with proper signing
  return userEmail
}