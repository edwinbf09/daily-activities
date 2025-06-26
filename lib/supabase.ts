import { createClient } from "@supabase/supabase-js"

// Valores por defecto para desarrollo/preview
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key"

// Verificar si estamos en modo demo
export const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ActivityData = {
  id: string
  name: string
  description: string | null
  date: string
  amount: number
  category: string
  is_paid: boolean
  created_at: string
  updated_at: string
}
