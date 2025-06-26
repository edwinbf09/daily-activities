export interface ActivityData {
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
