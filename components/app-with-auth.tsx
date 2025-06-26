"use client"

import { useAuth } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"
import DailyActivitiesApp from "@/daily-activities-app"
import { Loader2 } from "lucide-react"

export function AppWithAuth() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return <DailyActivitiesApp />
}
